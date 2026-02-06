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
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border-4 border-cat-pink max-w-2xl mx-auto transform hover:scale-[1.01] transition-all duration-300">
      <div className="flex items-center justify-center mb-8">
        <InteractiveCatMaid />
        <h2 className="text-3xl font-bold text-cat-accent">
          主人，想玩什么游戏喵？
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Platform Selection */}
        <div className="space-y-2">
          <label className="block text-cat-dark font-bold flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-cat-pink" />
            1. 选择您的平台喵 (Platform)
          </label>
          <div className="flex gap-4 justify-center">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setFormData({ ...formData, platform: p.id })}
                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1
                  ${formData.platform === p.id 
                    ? 'border-cat-accent bg-cat-pink/20 text-cat-accent shadow-md scale-105' 
                    : 'border-gray-200 hover:border-cat-pink/50 text-gray-600'}`}
              >
                <span className="text-2xl">{p.icon}</span>
                <span className="font-medium">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Personal Tags */}
        <div className="space-y-2">
          <label className="block text-cat-dark font-bold flex items-center gap-2">
            <Heart className="w-5 h-5 text-cat-pink" />
            2. 您的属性标签是？ (Personal Tags)
          </label>
          <input
            type="text"
            placeholder="例如：休闲, 硬核, 二次元, 策略..."
            className="w-full px-4 py-3 rounded-xl border-2 border-cat-pink/30 focus:border-cat-accent focus:ring-4 focus:ring-cat-pink/20 outline-none transition-all placeholder-gray-400"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          />
        </div>

        {/* Expectations */}
        <div className="space-y-2">
          <label className="block text-cat-dark font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cat-pink" />
            3. 对游戏的期待喵？ (Expectations)
          </label>
          <input
            type="text"
            placeholder="例如：开放世界, 剧情丰富, 画质好..."
            className="w-full px-4 py-3 rounded-xl border-2 border-cat-pink/30 focus:border-cat-accent focus:ring-4 focus:ring-cat-pink/20 outline-none transition-all placeholder-gray-400"
            value={formData.expectations}
            onChange={(e) => setFormData({ ...formData, expectations: e.target.value })}
          />
        </div>

        {/* Current Demand */}
        <div className="space-y-2">
          <label className="block text-cat-dark font-bold flex items-center gap-2">
            <Search className="w-5 h-5 text-cat-pink" />
            4. 当前有什么特别需求吗？ (Current Demand)
          </label>
          <input
            type="text"
            placeholder="例如：打折, 便宜, 热门, 联机..."
            className="w-full px-4 py-3 rounded-xl border-2 border-cat-pink/30 focus:border-cat-accent focus:ring-4 focus:ring-cat-pink/20 outline-none transition-all placeholder-gray-400"
            value={formData.demand}
            onChange={(e) => setFormData({ ...formData, demand: e.target.value })}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-cat-accent hover:bg-red-400 text-white font-bold py-4 rounded-xl shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2 text-lg"
        >
          <Cat className="w-6 h-6" />
          开始为您寻找游戏喵！
        </button>
      </form>
    </div>
  );
}
