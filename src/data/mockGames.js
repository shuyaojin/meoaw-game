import gamesData from './games.json';

const MAX_VALID_PRICE = 10000;
const TAG_KEYWORDS = {
  Horror: ['horror', 'survival horror', '恐怖', '惊悚', 'gore', 'blood', 'zombie', 'ghost', 'dark'],
  Racing: ['racing', 'drift', 'driver', 'kart', 'speed', 'moto', 'car', '竞速', '赛车'],
  Sports: ['sport', 'soccer', 'football', 'basketball', 'hockey', 'tennis', 'golf', 'skate', '体育'],
  Simulation: ['simulation', 'simulator', 'sim', 'flight', 'train', 'bus', 'farm', '模拟'],
  Strategy: ['strategy', 'rts', 'tbs', 'tower defense', 'card', 'turn-based', 'grand strategy', '策略'],
  RPG: ['rpg', 'role-playing', 'role playing', 'jrpg', 'dungeon', '角色扮演'],
  Action: ['action', 'shooter', 'fps', 'fight', 'combat', 'hack and slash', 'battle', '动作', '射击'],
  Adventure: ['adventure', 'quest', 'exploration', 'puzzle', 'visual novel', '冒险'],
  Casual: ['casual', 'puzzle', 'hidden object', 'match 3', 'card', 'board', '休闲']
};

const hasValidPrice = (price) => Number.isFinite(price) && price >= 0 && price <= MAX_VALID_PRICE;

const normalizePrice = (price) => {
  if (!Number.isFinite(price)) return null;
  if (price < 0) return null;
  if (price > MAX_VALID_PRICE) {
    if (price % 1000 === 0) return price / 1000;
    return null;
  }
  return price;
};

const normalizeDiscount = (discount) => {
  if (!Number.isFinite(discount)) return 0;
  if (discount < 0 || discount > 1) return 0;
  return Number(discount.toFixed(2));
};

const deriveTags = (game) => {
  const baseTags = Array.isArray(game.tags) ? game.tags : [];
  const combinedText = `${game.title || ''} ${baseTags.join(' ')}`.toLowerCase();
  const tagSet = new Set(baseTags);
  Object.entries(TAG_KEYWORDS).forEach(([tag, keywords]) => {
    if (keywords.some(keyword => combinedText.includes(keyword))) {
      tagSet.add(tag);
    }
  });
  return [...tagSet];
};

const normalizeGame = (game) => {
  if (!game || !Number.isFinite(game.id)) return null;
  const basePrice = normalizePrice(game.basePrice);
  const discount = normalizeDiscount(game.discount);
  return {
    ...game,
    title: game.title || '',
    platforms: Array.isArray(game.platforms) && game.platforms.length > 0 ? game.platforms : ['PC'],
    basePrice,
    discount,
    rating: Number.isFinite(game.rating) ? game.rating : 0,
    dau: Number.isFinite(game.dau) ? game.dau : 0,
    tags: deriveTags(game),
    cover: game.cover || ''
  };
};

const gameQualityScore = (game) => {
  let score = 0;
  if (game.cover) score += 1;
  if (hasValidPrice(game.basePrice)) score += 2;
  if (game.tags.length > 0) score += 1;
  if (game.rating > 0) score += 1;
  return score;
};

const dedupeGames = (items) => {
  const map = new Map();
  items.forEach((raw) => {
    const game = normalizeGame(raw);
    if (!game) return;
    const existing = map.get(game.id);
    if (!existing) {
      map.set(game.id, game);
      return;
    }
    if (gameQualityScore(game) >= gameQualityScore(existing)) {
      map.set(game.id, game);
    }
  });
  return Array.from(map.values());
};

export const GAMES = dedupeGames(gamesData);

export const PLATFORMS = [
  { id: 'PC', label: 'PC (Steam)', icon: '💻' },
  { id: 'Mac', label: 'Mac (Steam)', icon: '🍎' },
  { id: 'Linux', label: 'Linux (Steam)', icon: '🐧' }
];
