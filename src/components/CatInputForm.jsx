import React, { useState } from 'react';
import { PLATFORMS } from '../data/mockGames';
import { Search, Heart, Sparkles, Gamepad2, Cat } from 'lucide-react';
import InteractiveCatMaid from './InteractiveCatMaid';

export default function CatInputForm({ onSearch }) {
  const [formData, setFormData] = useState({
    platform: 'PC',
    tags: '',
    expectations: '',
    demand: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(formData);
  };

  return (
    <div className="relative max-w-2xl mx-auto transform hover:scale-[1.01] transition-all duration-300">
      {/* Cat Ears */}
      <div className="hidden md:block absolute -top-12 left-10 w-24 h-24 bg-white border-4 border-cat-pink rounded-tl-[2rem] transform rotate-12 z-0"></div>
      <div className="hidden md:block absolute -top-12 right-10 w-24 h-24 bg-white border-4 border-cat-pink rounded-tr-[2rem] transform -rotate-12 z-0"></div>
      
      <div className="relative z-10 bg-white/90 backdrop-blur-sm p-4 md:p-8 rounded-3xl shadow-xl border-4 border-cat-pink">
        <div className="flex flex-col md:flex-row items-center justify-center mb-6 md:mb-8 gap-4 md:gap-0">
          <InteractiveCatMaid />
          <h2 className="text-xl md:text-3xl font-bold text-cat-accent text-center md:text-left">
            主人，想玩什么游戏喵？
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* Platform Selection */}
          <div className="space-y-2">
            <label className="block text-cat-dark font-bold flex items-center gap-2 text-sm md:text-base">
              <Gamepad2 className="w-4 h-4 md:w-5 md:h-5 text-cat-pink" />
              1. 选择您的平台喵 (Platform)
            </label>
            <div className="grid grid-cols-3 gap-2 md:flex md:gap-4 justify-center">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, platform: p.id })}
                  className={`py-2 md:py-3 px-2 md:px-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1
                    ${formData.platform === p.id 
                      ? 'border-cat-accent bg-cat-pink/20 text-cat-accent shadow-md scale-105' 
                      : 'border-gray-200 hover:border-cat-pink/50 text-gray-600'}`}
                >
                  <span className="text-lg md:text-2xl">{p.icon}</span>
                  <span className="text-xs md:font-medium">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Personal Tags */}
          <div className="space-y-2">
            <label className="block text-cat-dark font-bold flex items-center gap-2 text-sm md:text-base">
              <Heart className="w-4 h-4 md:w-5 md:h-5 text-cat-pink" />
              2. 您的属性标签是？ (Personal Tags)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="例如：休闲, 硬核, 二次元..."
                className="w-full px-3 md:px-4 py-2 md:py-3 pl-9 md:pl-10 rounded-xl border-2 border-cat-pink/30 focus:border-cat-accent focus:ring-4 focus:ring-cat-pink/20 outline-none transition-all placeholder-gray-400 text-sm md:text-base"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg md:text-xl">🐾</span>
            </div>
          </div>

          {/* Expectations */}
          <div className="space-y-2">
            <label className="block text-cat-dark font-bold flex items-center gap-2 text-sm md:text-base">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-cat-pink" />
              3. 对游戏的期待喵？ (Expectations)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="例如：开放世界, 剧情丰富..."
                className="w-full px-3 md:px-4 py-2 md:py-3 pl-9 md:pl-10 rounded-xl border-2 border-cat-pink/30 focus:border-cat-accent focus:ring-4 focus:ring-cat-pink/20 outline-none transition-all placeholder-gray-400 text-sm md:text-base"
                value={formData.expectations}
                onChange={(e) => setFormData({ ...formData, expectations: e.target.value })}
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg md:text-xl">🐱</span>
            </div>
          </div>

          {/* Current Demand */}
          <div className="space-y-2">
            <label className="block text-cat-dark font-bold flex items-center gap-2 text-sm md:text-base">
              <Search className="w-4 h-4 md:w-5 md:h-5 text-cat-pink" />
              4. 当前有什么特别需求吗？ (Current Demand)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="例如：打折, 便宜, 热门..."
                className="w-full px-3 md:px-4 py-2 md:py-3 pl-9 md:pl-10 rounded-xl border-2 border-cat-pink/30 focus:border-cat-accent focus:ring-4 focus:ring-cat-pink/20 outline-none transition-all placeholder-gray-400 text-sm md:text-base"
                value={formData.demand}
                onChange={(e) => setFormData({ ...formData, demand: e.target.value })}
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg md:text-xl">✨</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-cat-accent hover:bg-red-400 text-white font-bold py-3 md:py-4 rounded-xl shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2 text-base md:text-lg"
          >
            <Cat className="w-5 h-5 md:w-6 md:h-6" />
            开始为您寻找游戏喵！
          </button>
        </form>
      </div>
    </div>
  );
}
