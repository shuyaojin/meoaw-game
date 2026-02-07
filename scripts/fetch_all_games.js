/**
 * ULTIMATE STEAM GAME SCRAPER
 * 
 * This script fetches ALL games from Steam (~150,000+ entries).
 * Because of the volume and rate limits, this process takes a long time (hours/days).
 * 
 * Features:
 * 1. Fetches the complete App List from Steam.
 * 2. Iterates through apps in batches.
 * 3. Saves progress incrementally to 'steam_games_full.jsonl' (append-only).
 * 4. Resumes from where it left off if interrupted.
 * 5. Handles rate limits automatically.
 * 
 * Usage:
 * node scripts/fetch_all_games.js
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../src/data');
const OUTPUT_FILE = path.join(DATA_DIR, 'steam_games_full.jsonl');
const PROGRESS_FILE = path.join(DATA_DIR, 'scraper_progress.json');

// APIs
const STEAM_APPLIST = 'https://raw.githubusercontent.com/dgibbs64/SteamCMD-AppID-List/master/steamcmd_appid.json';
const STEAM_APP_DETAILS = 'https://store.steampowered.com/api/appdetails';

// Configuration
const BATCH_SIZE = 1; // Request details for 1 game at a time (safer)
const DELAY_MS = 1500; // 1.5s delay to respect Steam rate limit (200 req/5min)

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to append line to JSONL
function appendRecord(record) {
  fs.appendFileSync(OUTPUT_FILE, JSON.stringify(record) + '\n');
}

// Helper to save progress
function saveProgress(lastIndex, total) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ lastIndex, total, timestamp: Date.now() }));
}

// Helper to load progress
function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  }
  return { lastIndex: 0, total: 0 };
}

async function fetchAppList() {
  console.log('Fetching complete App List from Steam...');
  try {
    const { data } = await axios.get(STEAM_APPLIST, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    return data.applist.apps;
  } catch (error) {
    console.error('Failed to fetch App List:', error.message);
    return [];
  }
}

async function fetchBatchDetails(apps) {
  const appIds = apps.map(app => app.appid);
  const idsStr = appIds.join(',');
  let retries = 0;
  
  while (retries < 5) {
    try {
      const url = `${STEAM_APP_DETAILS}?appids=${idsStr}`;
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000
      });
      return data;
    } catch (error) {
      if (error.response && error.response.status === 429) {
        console.warn(`Rate limit hit! Waiting 60s... (Retry ${retries + 1}/5)`);
        await sleep(60000);
        retries++;
      } else {
        // For other errors (400, 403, 500), just log and skip to avoid getting stuck
        console.error(`Error fetching batch ${idsStr}:`, error.message);
        return null;
      }
    }
  }
  return null; // Give up after retries
}

function processGameData(details, appId) {
  if (!details || !details.success) return null;
  const d = details.data;
  
  // Filter: Must be a game
  if (d.type !== 'game') return null;

  // Filter: Must have a name and not be empty
  if (!d.name) return null;

  // Extract relevant fields
  const platforms = [];
  if (d.platforms?.windows) platforms.push('PC');
  if (d.platforms?.mac) platforms.push('Mac');
  if (d.platforms?.linux) platforms.push('Linux');

  let basePrice = 0;
  let discount = 0;
  if (d.is_free) {
    basePrice = 0;
  } else if (d.price_overview) {
    basePrice = d.price_overview.initial / 100;
    discount = d.price_overview.discount_percent / 100;
  }

  const tags = [];
  if (d.genres) tags.push(...d.genres.map(g => g.description));
  if (d.categories) {
    const relevantCats = ['Single-player', 'Multi-player', 'Co-op', 'PvP', 'Online PvP'];
    tags.push(...d.categories.filter(c => relevantCats.includes(c.description)).map(c => c.description));
  }

  return {
    id: d.steam_appid,
    title: d.name,
    platforms: platforms.length > 0 ? platforms : ['PC'],
    basePrice: Number(basePrice.toFixed(2)),
    discount: Number(discount.toFixed(2)),
    rating: d.metacritic ? d.metacritic.score / 10 : 0, // Convert 96 to 9.6
    tags: [...new Set(tags)],
    cover: d.header_image,
    release_date: d.release_date?.date || ''
  };
}

async function main() {
  console.log('--- ULTIMATE STEAM SCRAPER ---');
  
  // 1. Load or Fetch App List
  let allApps = await fetchAppList();
  if (allApps.length === 0) return;

  // Filter out invalid IDs
  allApps = allApps.filter(app => app.appid > 0);
  console.log(`Total apps found: ${allApps.length}`);

  // 2. Load Progress
  const progress = loadProgress();
  let currentIndex = progress.lastIndex;
  
  console.log(`Resuming from index: ${currentIndex}`);

  // 3. Iterate
  while (currentIndex < allApps.length) {
    const batch = allApps.slice(currentIndex, currentIndex + BATCH_SIZE);
    
    // Fetch details
    const detailsMap = await fetchBatchDetails(batch);

    if (detailsMap) {
      const savedGames = [];
      for (const app of batch) {
        const details = detailsMap[app.appid.toString()];
        const record = processGameData(details, app.appid);
        
        if (record) {
          appendRecord(record);
          savedGames.push(record);
        }
      }

      // Log success for visibility
      if (savedGames.length > 0) {
        const gameNames = savedGames.map(g => g.title).join(', ');
        console.log(`[${new Date().toLocaleTimeString()}] Saved: ${gameNames}`);
      }
    }

    // Update progress
    currentIndex += BATCH_SIZE;
    saveProgress(currentIndex, allApps.length);

    // Estimate time remaining (log every 100 items)
    if (currentIndex % 100 === 0) {
        const percent = ((currentIndex / allApps.length) * 100).toFixed(2);
        console.log(`Progress: ${percent}% (${currentIndex}/${allApps.length})`);
    }

    // Polite Delay
    await sleep(DELAY_MS);
  }

  console.log('Scraping Complete!');
}

main();
