import React from 'react';
import { Star, TrendingUp, DollarSign } from 'lucide-react';

export default function GameCard({ game }) {
  const finalPrice = game.basePrice * (1 - game.discount);
  const isDiscounted = game.discount > 0;

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 group">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={game.cover} 
          alt={game.title} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-duration-500"
        />
        {isDiscounted && (
          <div className="absolute top-2 right-2 bg-red-500 text-white font-bold px-3 py-1 rounded-full text-sm animate-bounce">
            -{Math.round(game.discount * 100)}% OFF
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex gap-2">
            {game.platforms.map(p => (
              <span key={p} className="text-xs bg-white/20 backdrop-blur-md text-white px-2 py-0.5 rounded-md">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2 truncate" title={game.title}>{game.title}</h3>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-yellow-500 font-bold">
            <Star className="w-4 h-4 fill-current" />
            {game.rating}
          </div>
          <div className="text-right">
            {isDiscounted ? (
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-400 line-through">${game.basePrice}</span>
                <span className="text-red-500 font-bold text-lg">${finalPrice.toFixed(2)}</span>
              </div>
            ) : (
              <span className="text-gray-700 font-bold text-lg">${game.basePrice}</span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {game.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs bg-cat-pink/20 text-cat-dark px-2 py-1 rounded-full">
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 border-t pt-2">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            DAU: {(game.dau / 1000).toFixed(1)}k
          </span>
          <span className="text-cat-accent font-medium cursor-pointer hover:underline flex items-center gap-1">
            查看详情 喵 <span className="text-lg">🐾</span>
          </span>
        </div>
      </div>
    </div>
  );
}
