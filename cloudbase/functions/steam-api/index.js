import cloudbase from '@cloudbase/node-sdk';

const app = cloudbase.init({ env: process.env.CLOUDBASE_ENV_ID });
const db = app.database();
const _ = db.command;

const toArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value)
    .split(/[,\s]+/)
    .map(v => v.trim())
    .filter(Boolean);
};

const parseNumber = (value, fallback) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const parseQuery = (event) => {
  return event?.queryStringParameters || event?.query || {};
};

const buildDemandQuery = (demandIds) => {
  const conditions = [];
  demandIds.forEach((demand) => {
    if (demand === 'Sale') conditions.push({ discount: _.gt(0) });
    if (demand === 'Free') conditions.push({ basePrice: 0 });
    if (demand === 'Positive') conditions.push({ rating: _.gte(8.5) });
    if (demand === 'Trending') conditions.push({ dau: _.gte(5000) });
  });
  if (conditions.length === 0) return {};
  return _.and(conditions);
};

const computeMatchScore = (game, keyword, tags, expectations) => {
  const text = `${game.title || ''} ${(game.tags || []).join(' ')}`.toLowerCase();
  let score = 0;
  if (keyword && text.includes(keyword.toLowerCase())) score += 8;
  tags.forEach(tag => {
    if (text.includes(tag.toLowerCase())) score += 6;
  });
  expectations.forEach(exp => {
    if (text.includes(exp.toLowerCase())) score += 4;
  });
  if (game.discount > 0) score += 2;
  return score;
};

export async function main(event) {
  const query = parseQuery(event);
  const page = Math.max(1, parseNumber(query.page, 1));
  const size = Math.min(100, Math.max(1, parseNumber(query.size, 24)));
  const platform = query.platform;
  const tags = toArray(query.tags);
  const expectations = toArray(query.expectations);
  const demandIds = toArray(query.demand);
  const keyword = query.keyword ? String(query.keyword).trim() : '';
  const sort = query.sort || 'rating';

  const collection = db.collection('steam_games');
  let where = {};

  if (platform) {
    where.platforms = platform;
  }

  if (tags.length > 0) {
    where.tags = _.in(tags);
  }

  if (keyword) {
    where.searchText = db.RegExp({ regexp: keyword, options: 'i' });
  }

  const demandQuery = buildDemandQuery(demandIds);
  if (Object.keys(demandQuery).length > 0) {
    where = _.and([where, demandQuery]);
  }

  const [listResult, countResult] = await Promise.all([
    collection
      .where(where)
      .skip((page - 1) * size)
      .limit(size)
      .get(),
    collection.where(where).count()
  ]);

  const items = (listResult.data || []).map((game) => {
    const matchScore = computeMatchScore(game, keyword, tags, expectations);
    return { ...game, matchScore };
  });

  if (sort === 'price_asc') {
    items.sort((a, b) => (a.basePrice * (1 - a.discount)) - (b.basePrice * (1 - b.discount)));
  } else if (sort === 'price_desc') {
    items.sort((a, b) => (b.basePrice * (1 - b.discount)) - (a.basePrice * (1 - a.discount)));
  } else if (sort === 'dau') {
    items.sort((a, b) => (b.dau || 0) - (a.dau || 0));
  } else {
    items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  const payload = {
    code: 0,
    data: {
      items,
      total: countResult.total || 0,
      page,
      size
    }
  };

  if (event?.requestContext || event?.httpMethod) {
    return {
      statusCode: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'access-control-allow-origin': '*'
      },
      body: JSON.stringify(payload)
    };
  }

  return payload;
}
