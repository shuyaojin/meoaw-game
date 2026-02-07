/**
 * SCRIPT TO FETCH STEAM GAMES
 * 
 * Usage: node scripts/fetch_steam_games.js
 * 
 * NOTE: This script fetches data from SteamSpy and Steam Store API.
 * 
 * IMPORTANT: 
 * The Steam Store API (store.steampowered.com/api/appdetails) is strictly rate-limited 
 * and often BLOCKS requests from cloud server IPs (like AWS, GCP, Azure, etc.).
 * 
 * If you run this script and see 403 or 400 errors, it means your IP is blocked.
 * Please run this script on your LOCAL machine (residential IP) to update the library.
 */

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = path.join(__dirname, '../src/data/games.json');

// Steam APIs
const STEAMSPY_TOP_100 = 'https://steamspy.com/api.php?request=top100forever';
const STEAM_APP_DETAILS = 'https://store.steampowered.com/api/appdetails';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchTopGames() {
  console.log('Fetching Top 100 games from SteamSpy...');
  try {
    const { data } = await axios.get(STEAMSPY_TOP_100, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json'
      }
    });
    const games = Object.values(data);
    console.log(`Found ${games.length} games.`);
    return games;
  } catch (error) {
    console.error('Error fetching from SteamSpy:', error.message);
    return [];
  }
}

async function fetchGameDetails(appIds) {
  // Steam Store API allows comma separated appids
  const CHUNK_SIZE = 5; 
  const detailedGames = {};

  for (let i = 0; i < appIds.length; i += CHUNK_SIZE) {
    const chunk = appIds.slice(i, i + CHUNK_SIZE);
    const idsStr = chunk.join(',');
    console.log(`Fetching details for games ${i + 1} to ${Math.min(i + CHUNK_SIZE, appIds.length)}...`);
    
    try {
      // filters=basic,price_overview,genres,categories reduces payload and might help with rate limits
      const url = `${STEAM_APP_DETAILS}?appids=${idsStr}&filters=basic,price_overview,genres,categories`;
      
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      Object.assign(detailedGames, data);
    } catch (error) {
      console.error(`Error fetching details for chunk ${idsStr}:`, error.message);
    }

    // Polite delay to respect rate limits (1.5s is usually safe for residential IPs)
    await sleep(1500);
  }

  return detailedGames;
}

function transformData(steamSpyData, steamDetailsData) {
  const transformed = [];

  for (const spyGame of steamSpyData) {
    const appId = spyGame.appid;
    const details = steamDetailsData[appId];

    if (!details || !details.success) {
      continue;
    }

    const d = details.data;

    // Skip if not a game (e.g. dlc, hardware)
    if (d.type !== 'game') continue;

    // Calculate rating
    const totalVotes = spyGame.positive + spyGame.negative;
    const rating = totalVotes > 0 ? (spyGame.positive / totalVotes * 10).toFixed(1) : 0;

    // Platforms
    const platforms = [];
    if (d.platforms?.windows) platforms.push('PC');
    if (d.platforms?.mac) platforms.push('Mac');
    if (d.platforms?.linux) platforms.push('Linux');

    // Price
    let basePrice = 0;
    let discount = 0;

    if (d.is_free) {
      basePrice = 0;
    } else if (d.price_overview) {
      basePrice = d.price_overview.initial / 100;
      discount = d.price_overview.discount_percent / 100;
    }

    // Tags (Genres + Categories)
    const tags = [];
    if (d.genres) tags.push(...d.genres.map(g => g.description));
    if (d.categories) {
      const relevantCats = ['Single-player', 'Multi-player', 'Co-op', 'PvP', 'Online PvP'];
      tags.push(...d.categories.filter(c => relevantCats.includes(c.description)).map(c => c.description));
    }
    const uniqueTags = [...new Set(tags)];

    transformed.push({
      id: appId,
      title: d.name,
      platforms: platforms.length > 0 ? platforms : ['PC'],
      basePrice: Number(basePrice.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      rating: Number(rating),
      dau: spyGame.ccu,
      tags: uniqueTags,
      cover: d.header_image
    });
  }

  return transformed;
}

async function main() {
  // 1. Get Top List
  const spyGames = await fetchTopGames();
  if (spyGames.length === 0) {
    console.error("Failed to fetch game list. Please check your internet connection or try again later.");
    return;
  }

  // 2. Extract IDs (Fetch top 50 to avoid long wait times)
  const topGames = spyGames.slice(0, 50);
  const appIds = topGames.map(g => g.appid);

  // 3. Fetch Details
  const detailsData = await fetchGameDetails(appIds);

  // 4. Transform
  const finalData = transformData(topGames, detailsData);

  console.log(`Successfully processed ${finalData.length} games.`);

  // 5. Save
  if (finalData.length > 0) {
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(finalData, null, 2));
    console.log(`Saved to ${OUTPUT_FILE}`);
  } else {
    console.warn("No game data processed. Did not overwrite existing file.");
  }
}

main();
