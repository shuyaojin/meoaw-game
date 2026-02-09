
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATA_DIR = path.join(__dirname, '../src/data');
const OUTPUT_FILE = path.join(DATA_DIR, 'games.json');
const MAX_RUNTIME_MS = 25 * 60 * 1000;
const BATCH_SIZE = 3;
const DELAY_MS = 1500;

const STEAM_APPLIST_URL = 'https://api.steampowered.com/ISteamApps/GetAppList/v2/';
const STEAM_APPLIST_FALLBACK = 'https://raw.githubusercontent.com/dgibbs64/SteamCMD-AppID-List/master/steamcmd_appid.json';

const START_TIME = Date.now();

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Node.js/SteamScraper' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function loadDatabase() {
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
    } catch {
      return [];
    }
  }
  return [];
}

function normalizeGame(record) {
  if (!record) return null;
  const price = Number.isFinite(record.basePrice) ? record.basePrice : 0;
  const discount = Number.isFinite(record.discount) ? Math.max(0, Math.min(1, record.discount)) : 0;
  const platforms = Array.isArray(record.platforms) && record.platforms.length ? record.platforms : ['PC'];
  const tags = Array.isArray(record.tags) ? [...new Set(record.tags)] : [];
  return {
    id: record.id,
    title: record.title || '',
    platforms,
    basePrice: Number(price.toFixed(2)),
    discount: Number(discount.toFixed(2)),
    rating: Number.isFinite(record.rating) ? Number(record.rating.toFixed(1)) : 0,
    dau: Number.isFinite(record.dau) ? record.dau : 0,
    tags,
    cover: record.cover || '',
    release_date: record.release_date || ''
  };
}

function better(a, b) {
  let sa = 0, sb = 0;
  if (a.cover) sa++; if (b.cover) sb++;
  if (a.basePrice !== undefined) sa += 2; if (b.basePrice !== undefined) sb += 2;
  if ((a.tags || []).length) sa++; if ((b.tags || []).length) sb++;
  if (a.rating) sa++; if (b.rating) sb++;
  return sa >= sb;
}

async function fetchGameDetails(appid) {
  try {
    const url = `https://store.steampowered.com/api/appdetails?appids=${appid}&cc=cn&l=schinese`;
    const data = await httpGet(url);
    if (data && data[appid] && data[appid].success) {
      const game = data[appid].data;
      if (game.type === 'game') {
        const platforms = [];
        if (game.platforms?.windows) platforms.push('PC');
        if (game.platforms?.mac) platforms.push('Mac');
        if (game.platforms?.linux) platforms.push('Linux');
        const basePrice = game.is_free ? 0 : (game.price_overview ? game.price_overview.initial / 100 : 0);
        const discount = game.price_overview ? (game.price_overview.discount_percent / 100) : 0;
        const tags = [];
        if (game.genres) tags.push(...game.genres.map(g => g.description));
        if (game.categories) {
          const relevant = ['Single-player', 'Multi-player', 'Co-op', 'PvP', 'Online PvP'];
          tags.push(...game.categories.filter(c => relevant.includes(c.description)).map(c => c.description));
        }
        return normalizeGame({
          id: game.steam_appid,
          title: game.name,
          platforms,
          basePrice,
          discount,
          rating: game.metacritic ? game.metacritic.score / 10 : 0,
          tags,
          cover: game.header_image,
          release_date: game.release_date?.date || '',
          dau: 0
        });
      }
    }
  } catch {
  }
  return null;
}

async function main() {
  console.log('Starting Steam Sync (cloud/CI)...');
  let db = loadDatabase();
  const map = new Map(db.map(g => [g.id, g]));
  console.log(`Loaded ${db.length} existing games.`);

  let appList = [];
  try {
    const data = await httpGet(STEAM_APPLIST_URL);
    appList = data.applist.apps;
  } catch {
    try {
      const data = await httpGet(STEAM_APPLIST_FALLBACK);
      appList = data.applist.apps;
    } catch {
      console.error('Failed to fetch App List');
      process.exit(1);
    }
  }
  console.log(`App list size: ${appList.length}`);

  appList.sort((a, b) => b.appid - a.appid);

  let processed = 0;
  for (let i = 0; i < appList.length; i += BATCH_SIZE) {
    if (Date.now() - START_TIME > MAX_RUNTIME_MS) break;
    const batch = appList.slice(i, i + BATCH_SIZE);
    for (const app of batch) {
      const details = await fetchGameDetails(app.appid);
      if (details) {
        const prev = map.get(details.id);
        if (!prev || better(details, prev)) {
          map.set(details.id, details);
          processed++;
          console.log(`Saved: ${details.title}`);
        }
      }
      await sleep(DELAY_MS);
    }
  }

  db = Array.from(map.values());
  db.sort((a, b) => b.rating - a.rating);

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(db, null, 2));
  console.log(`Saved ${db.length} games. Processed ${processed}. Done.`);
}

main();
