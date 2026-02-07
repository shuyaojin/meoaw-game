
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../src/data');
const INPUT_FILE = path.join(DATA_DIR, 'steam_games_full.jsonl');
const OUTPUT_FILE = path.join(DATA_DIR, 'games.json');

const TAG_KEYWORDS = {
  'Horror': ['horror', 'zombie', 'scary', 'ghost', 'undead', 'survival horror', 'vampire', 'gore'],
  'Racing': ['racing', 'drift', 'driver', 'kart', 'speed', 'moto', 'car'],
  'Sports': ['sport', 'soccer', 'football', 'basketball', 'hockey', 'tennis', 'golf', 'manager', 'skate'],
  'Simulation': ['simulation', 'simulator', 'sim', 'flight', 'train', 'bus', 'farm'],
  'Strategy': ['strategy', 'rts', 'tbs', 'tower defense', 'card', 'turn-based', 'grand strategy'],
  'RPG': ['rpg', 'role-playing', 'role playing', 'jrpg', 'dungeon'],
  'Action': ['action', 'shooter', 'fps', 'fight', 'combat', 'hack and slash', 'battle'],
  'Adventure': ['adventure', 'quest', 'exploration', 'puzzle', 'visual novel'],
  'Casual': ['casual', 'puzzle', 'hidden object', 'match 3', 'card', 'board']
};

function enhanceTags(game) {
  const combinedText = (game.title + ' ' + game.tags.join(' ')).toLowerCase();
  const newTags = new Set(game.tags);

  for (const [category, keywords] of Object.entries(TAG_KEYWORDS)) {
    if (keywords.some(k => combinedText.includes(k))) {
      newTags.add(category);
    }
  }

  return [...newTags];
}

function main() {
  console.log('--- UPDATING GAME LIBRARY ---');
  
  if (!fs.existsSync(INPUT_FILE)) {
    console.error('Error: steam_games_full.jsonl not found. Run fetch_all_games.js first.');
    return;
  }

  const fileStream = fs.readFileSync(INPUT_FILE, 'utf-8');
  const lines = fileStream.split('\n').filter(line => line.trim());
  
  const games = [];
  const tagCounts = {};

  console.log(`Processing ${lines.length} games...`);

  lines.forEach(line => {
    try {
      const game = JSON.parse(line);
      // Enhance tags
      game.tags = enhanceTags(game);
      
      // Count tags for verification
      game.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });

      games.push(game);
    } catch (e) {
      // Ignore bad lines
    }
  });

  // Sort by rating (desc) to show best games first by default
  games.sort((a, b) => b.rating - a.rating);

  // Write to games.json
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(games, null, 2));
  
  console.log(`Successfully wrote ${games.length} games to games.json`);
  console.log('--- Tag Statistics ---');
  Object.keys(TAG_KEYWORDS).forEach(tag => {
    console.log(`${tag}: ${tagCounts[tag] || 0}`);
  });
}

main();
