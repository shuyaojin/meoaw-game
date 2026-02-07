
const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const DATA_DIR = path.join(__dirname, '../src/data');
const OUTPUT_FILE = path.join(DATA_DIR, 'steam_games.json'); // Main database
const TEMP_FILE = path.join(DATA_DIR, 'steam_games_temp.json');
const MAX_RUNTIME_MS = 25 * 60 * 1000; // Run for max 25 minutes to be safe with CI limits
const BATCH_SIZE = 1;
const DELAY_MS = 1500;

const STEAM_APPLIST_URL = 'https://api.steampowered.com/ISteamApps/GetAppList/v2/';
// Fallback source if official API fails
const STEAM_APPLIST_FALLBACK = 'https://raw.githubusercontent.com/dgibbs64/SteamCMD-AppID-List/master/steamcmd_appid.json';

const START_TIME = Date.now();

// Helper: Sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: HTTP Get
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

// Helper: Load existing database
function loadDatabase() {
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
    } catch (e) {
      console.error("Error reading existing DB, starting fresh.");
      return [];
    }
  }
  return [];
}

// Helper: Fetch Game Details
async function fetchGameDetails(appid) {
  try {
    // Request Chinese region for pricing
    const url = `https://store.steampowered.com/api/appdetails?appids=${appid}&cc=cn&l=schinese`;
    const data = await httpGet(url);
    
    if (data && data[appid] && data[appid].success) {
      const game = data[appid].data;
      if (game.type === 'game') {
        return {
          id: game.steam_appid,
          title: game.name,
          price: game.price_overview ? (game.price_overview.final / 100) : 0,
          originalPrice: game.price_overview ? (game.price_overview.initial / 100) : 0,
          discount: game.price_overview ? game.price_overview.discount_percent : 0,
          currency: 'CNY',
          image: game.header_image,
          tags: game.genres ? game.genres.map(g => g.description) : [],
          description: game.short_description,
          releaseDate: game.release_date ? game.release_date.date : '',
          rating: 0, // Steam API doesn't give simple rating, would need another source
          platforms: [
            game.platforms.windows ? 'PC' : null,
            game.platforms.mac ? 'Mac' : null,
            game.platforms.linux ? 'Linux' : null
          ].filter(Boolean),
          lastUpdated: Date.now()
        };
      }
    }
  } catch (e) {
    // Ignore 404s or other errors
  }
  return null;
}

async function main() {
  console.log('🚀 Starting Steam Sync...');
  
  // 1. Load Local DB
  let db = loadDatabase();
  const existingIds = new Set(db.map(g => g.id));
  console.log(`📂 Loaded ${db.length} existing games.`);

  // 2. Fetch App List
  console.log('📡 Fetching latest App List from Steam...');
  let appList = [];
  try {
    const data = await httpGet(STEAM_APPLIST_URL);
    appList = data.applist.apps;
  } catch (e) {
    console.log('⚠️ Primary API failed, trying fallback...');
    try {
      const data = await httpGet(STEAM_APPLIST_FALLBACK);
      appList = data.applist.apps;
    } catch (e2) {
      console.error('❌ Failed to fetch App List.');
      process.exit(1);
    }
  }
  
  console.log(`📝 Found ${appList.length} total apps on Steam.`);

  // 3. Identify New Games
  // Filter out apps that are definitely not games (names with "server", "tool", etc if desired, but for now just ID check)
  const newApps = appList.filter(app => !existingIds.has(app.appid));
  console.log(`🆕 Found ${newApps.length} potential new games to check.`);

  // 4. Processing Loop
  // Strategy: 
  // - 70% of time: Fetch NEW games
  // - 30% of time: Update OLD games (randomly selected to slowly rotate updates)
  
  let newGamesAdded = 0;
  let oldGamesUpdated = 0;
  
  // Shuffle new apps to get a random sample if we can't finish all
  // Actually, better to process in order of ID (usually higher ID = newer game)
  newApps.sort((a, b) => b.appid - a.appid); 

  // Process New Games
  for (const app of newApps) {
    if (Date.now() - START_TIME > MAX_RUNTIME_MS) break;

    const details = await fetchGameDetails(app.appid);
    if (details) {
      db.push(details);
      newGamesAdded++;
      console.log(`[NEW] Added: ${details.title}`);
    }
    await sleep(DELAY_MS);
  }

  // Update Existing Games (Random subset)
  // Only if we have time left
  if (Date.now() - START_TIME < MAX_RUNTIME_MS) {
    console.log('🔄 Updating existing game prices...');
    // Shuffle DB to update random games
    const gamesToUpdate = [...db].sort(() => 0.5 - Math.random());
    
    for (const game of gamesToUpdate) {
      if (Date.now() - START_TIME > MAX_RUNTIME_MS) break;
      
      // Skip if updated recently (e.g. within 24 hours)
      if (game.lastUpdated && (Date.now() - game.lastUpdated < 24 * 60 * 60 * 1000)) continue;

      const details = await fetchGameDetails(game.id);
      if (details) {
        // Update fields
        Object.assign(game, details);
        oldGamesUpdated++;
        console.log(`[UPD] Updated: ${game.title}`);
      }
      await sleep(DELAY_MS);
    }
  }

  // 5. Save
  console.log(`💾 Saving database... (+${newGamesAdded} new, ${oldGamesUpdated} updated)`);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(db, null, 2));
  console.log('✅ Done.');
}

main();
