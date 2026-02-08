import gamesData from './games.json';

const MAX_VALID_PRICE = 10000;

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
    tags: Array.isArray(game.tags) ? game.tags : [],
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
  { id: 'PC', label: 'PC (Steam/Epic)', icon: '💻' },
  { id: 'NS', label: 'Nintendo Switch', icon: '🎮' },
  { id: 'PS', label: 'PlayStation', icon: '🕹️' }
];
