import React, { useEffect, useMemo, useState } from 'react';
import { Star, TrendingUp, DollarSign, ImageOff } from 'lucide-react';

const priceCache = new Map();

const buildSteamPrice = (data) => {
  if (!data) return null;
  if (data.is_free) {
    return {
      status: 'ok',
      isFree: true,
      finalFormatted: '免费',
      initialFormatted: null,
      discountPercent: 0
    };
  }
  if (!data.price_overview) {
    return {
      status: 'ok',
      isFree: false,
      finalFormatted: '暂无价格',
      initialFormatted: null,
      discountPercent: 0
    };
  }
  return {
    status: 'ok',
    isFree: false,
    finalFormatted: data.price_overview.final_formatted || `¥${(data.price_overview.final / 100).toFixed(2)}`,
    initialFormatted: data.price_overview.initial_formatted || `¥${(data.price_overview.initial / 100).toFixed(2)}`,
    discountPercent: data.price_overview.discount_percent || 0
  };
};

export default function GameCard({ game }) {
  const finalPrice = game.basePrice * (1 - game.discount);
  const isDiscounted = game.discount > 0;
  const [imgError, setImgError] = useState(false);
  const [steamPrice, setSteamPrice] = useState(null);
  const steamUrl = useMemo(() => `https://store.steampowered.com/app/${game.id}/`, [game.id]);

  useEffect(() => {
    let active = true;
    const cached = priceCache.get(game.id);
    if (cached) {
      setSteamPrice(cached);
      return () => {
        active = false;
      };
    }

    const endpoint = `https://store.steampowered.com/api/appdetails?appids=${game.id}&cc=cn&l=zh_cn`;
    fetch(endpoint)
      .then(res => res.json())
      .then(payload => {
        const entry = payload?.[game.id];
        const price = entry?.success ? buildSteamPrice(entry.data) : null;
        const next = price || { status: 'error' };
        priceCache.set(game.id, next);
        if (active) setSteamPrice(next);
      })
      .catch(() => {
        const next = { status: 'error' };
        priceCache.set(game.id, next);
        if (active) setSteamPrice(next);
      });

    return () => {
      active = false;
    };
  }, [game.id]);

  const localPrice = {
    status: 'local',
    isFree: false,
    finalFormatted: `¥${finalPrice.toFixed(2)}`,
    initialFormatted: `¥${game.basePrice}`,
    discountPercent: Math.round(game.discount * 100)
  };
  const priceSource = steamPrice?.status === 'ok' ? steamPrice : localPrice;
  const showDiscount = priceSource.discountPercent > 0 && priceSource.initialFormatted && priceSource.finalFormatted;
  const showSteamBadge = priceSource.status === 'ok';

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 group">
      <div className="relative h-40 md:h-48 overflow-hidden bg-gray-100">
        {!imgError ? (
          <img 
            src={game.cover || 'https://placehold.co/600x400/ffb7b2/ffffff?text=No+Image'} 
            alt={game.title} 
            className="w-full h-full object-cover transform group-hover:scale-110 transition-duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-cat-pink/10">
            <ImageOff size={32} />
            <span className="text-xs mt-2">暂无图片</span>
          </div>
        )}
        {priceSource.discountPercent > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm animate-bounce">
            -{priceSource.discountPercent}% OFF
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 md:p-4">
          <div className="flex gap-2">
            {game.platforms.map(p => (
              <span key={p} className="text-[10px] md:text-xs bg-white/20 backdrop-blur-md text-white px-2 py-0.5 rounded-md">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-3 md:p-4">
        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2 truncate" title={game.title}>{game.title}</h3>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm md:text-base">
            <Star className="w-3 h-3 md:w-4 md:h-4 fill-current" />
            {game.rating}
          </div>
          <div className="text-right">
            {showDiscount ? (
              <div className="flex flex-col items-end">
                <span className="text-[10px] md:text-xs text-gray-400 line-through">{priceSource.initialFormatted}</span>
                <span className="text-red-500 font-bold text-base md:text-lg">{priceSource.finalFormatted}</span>
              </div>
            ) : (
              <span className="text-gray-700 font-bold text-base md:text-lg">{priceSource.finalFormatted}</span>
            )}
            {showSteamBadge && (
              <div className="text-[10px] md:text-xs text-cat-accent font-medium mt-0.5">Steam 实时</div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1 md:gap-2 mb-3">
          {game.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] md:text-xs bg-cat-pink/20 text-cat-dark px-1.5 py-0.5 md:px-2 md:py-1 rounded-full">
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-[10px] md:text-xs text-gray-400 border-t pt-2">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            DAU: {(game.dau / 1000).toFixed(1)}k
          </span>
          <a
            href={steamUrl}
            target="_blank"
            rel="noreferrer"
            className="text-cat-accent font-medium hover:underline flex items-center gap-1"
          >
            查看详情 喵 <span className="text-base md:text-lg">🐾</span>
          </a>
        </div>
      </div>
    </div>
  );
}
