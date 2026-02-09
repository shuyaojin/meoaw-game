import cloudbase from '@cloudbase/node-sdk';
import https from 'https';

const app = cloudbase.init({ env: process.env.CLOUDBASE_ENV_ID });
const db = app.database();

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const httpGet = (url) => new Promise((resolve, reject) => {
  https.get(url, { headers: { 'User-Agent': 'CloudBase/SteamSync' } }, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(e);
      }
    });
  }).on('error', reject);
});

const STEAM_APPLIST_URL = 'https://api.steampowered.com/ISteamApps/GetAppList/v2/';

function normalize(game) {
  if (!game) return null;
  const platforms = [];
  if (game.platforms?.windows) platforms.push('PC');
  if (game.platforms?.mac) platforms.push('Mac');
  if (game.platforms?.linux) platforms.push('Linux');
  const tags = [];
  if (game.genres) tags.push(...game.genres.map(g => g.description));
  if (game.categories) {
    const relevant = ['Single-player', 'Multi-player', 'Co-op', 'PvP', 'Online PvP'];
    tags.push(...game.categories.filter(c => relevant.includes(c.description)).map(c => c.description));
  }
  const basePrice = game.is_free ? 0 : (game.price_overview ? game.price_overview.initial / 100 : 0);
  const discount = game.price_overview ? (game.price_overview.discount_percent / 100) : 0;
  const searchText = `${game.name} ${tags.join(' ')}`.toLowerCase();
  return {
    id: game.steam_appid,
    title: game.name,
    platforms,
    basePrice,
    discount,
    rating: game.metacritic ? game.metacritic.score / 10 : 0,
    tags: [...new Set(tags)],
    cover: game.header_image,
    release_date: game.release_date?.date || '',
    dau: 0,
    searchText,
    updatedAt: Date.now()
  };
}

async function fetchDetails(appid) {
  try {
    const url = `https://store.steampowered.com/api/appdetails?appids=${appid}&cc=cn&l=schinese`;
    const data = await httpGet(url);
    const entry = data?.[appid];
    if (entry?.success && entry.data?.type === 'game') {
      return normalize(entry.data);
    }
  } catch {}
  return null;
}

export async function main() {
  const appListData = await httpGet(STEAM_APPLIST_URL);
  const apps = (appListData?.applist?.apps || []).filter(a => a.appid > 0);
  apps.sort((a, b) => b.appid - a.appid);

  const batchSize = Number(process.env.SYNC_BATCH_SIZE || 5);
  const maxRuntimeMs = Number(process.env.MAX_RUNTIME_MS || 20 * 60 * 1000);
  const delayMs = Number(process.env.SYNC_DELAY_MS || 1500);
  const startTime = Date.now();

  for (let i = 0; i < apps.length; i += batchSize) {
    if (Date.now() - startTime > maxRuntimeMs) break;
    const batch = apps.slice(i, i + batchSize);
    const details = await Promise.all(batch.map(a => fetchDetails(a.appid)));
    const valid = details.filter(Boolean);
    for (const g of valid) {
      await db.collection('steam_games').doc(String(g.id)).set({ data: g });
    }
    await sleep(delayMs);
  }
  return { code: 0 };
}
