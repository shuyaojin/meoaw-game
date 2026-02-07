import React, { useState } from 'react';
import { PLATFORMS } from '../data/mockGames';
import { 
  Search, Heart, Sparkles, Gamepad2, Cat, Check,
  Zap, Compass, Crown, Brain, Hammer, Trophy, Flag, Coffee, Ghost,
  BookOpen, Globe, Users, Eye, Skull, Cloud, Lightbulb,
  Tag, Gift, ThumbsUp, TrendingUp, Feather
} from 'lucide-react';
import InteractiveCatMaid from './InteractiveCatMaid';

const TAG_OPTIONS = [
  { id: 'Action', label: '动作', icon: Zap },
  { id: 'Adventure', label: '冒险', icon: Compass },
  { id: 'RPG', label: '角色扮演', icon: Crown },
  { id: 'Strategy', label: '策略', icon: Brain },
  { id: 'Simulation', label: '模拟', icon: Hammer },
  { id: 'Sports', label: '体育', icon: Trophy },
  { id: 'Racing', label: '竞速', icon: Flag },
  { id: 'Casual', label: '休闲', icon: Coffee },
  { id: 'Horror', label: '恐怖', icon: Ghost }
];

const EXPECTATION_OPTIONS = [
  { id: 'Story', label: '剧情丰富', icon: BookOpen },
  { id: 'Open World', label: '开放世界', icon: Globe },
  { id: 'Multiplayer', label: '多人联机', icon: Users },
  { id: 'Graphics', label: '画面精美', icon: Eye },
  { id: 'Hardcore', label: '高难度', icon: Skull },
  { id: 'Relaxing', label: '轻松解压', icon: Cloud },
  { id: 'Indie', label: '独立精品', icon: Lightbulb }
];

const DEMAND_OPTIONS = [
  { id: 'Sale', label: '正在打折', icon: Tag },
  { id: 'Free', label: '免费游玩', icon: Gift },
  { id: 'Positive', label: '好评如潮', icon: ThumbsUp },
  { id: 'Trending', label: '近期热门', icon: TrendingUp },
  { id: 'Low Spec', label: '低配畅玩', icon: Feather }
];

export default function CatInputForm({ onSearch, onChatToggle }) {
  const [formData, setFormData] = useState({
    platform: 'PC',
    tags: [],
    expectations: [],
    demand: []
  });

  const toggleSelection = (field, value) => {
    setFormData(prev => {
      const current = prev[field];
      const newArray = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [field]: newArray };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({
      platform: formData.platform,
      tags: formData.tags.join(' '),
      expectations: formData.expectations.join(' '),
      demand: formData.demand.join(' ')
    });
  };

  const renderSelectionGroup = (options, field, variant = 'default') => (
    <div className={`grid gap-2 ${variant === 'primary' ? 'grid-cols-3' : 'grid-cols-3 md:grid-cols-4'}`}>
      {options.map((opt) => {
        const isSelected = formData[field].includes(opt.id);
        const Icon = opt.icon;
        
        // Base classes
        let btnClasses = "rounded-lg border transition-all flex items-center justify-center gap-1.5 ";
        
        // Variant sizing
        if (variant === 'primary') {
          btnClasses += "py-3 px-2 md:px-4 text-sm md:text-base font-medium shadow-sm hover:scale-[1.02] ";
        } else {
          btnClasses += "py-2 px-1 md:px-3 text-xs md:text-sm ";
        }

        // Selection State
        if (isSelected) {
          btnClasses += variant === 'primary' 
            ? 'bg-cat-accent text-white border-cat-accent ring-2 ring-cat-pink/30 scale-105 ' 
            : 'bg-cat-pink/80 text-white border-cat-pink shadow-md transform scale-105 ';
        } else {
          btnClasses += variant === 'primary'
            ? 'bg-white border-gray-200 text-gray-700 hover:border-cat-pink hover:bg-cat-pink/5 '
            : 'bg-white/80 border-gray-100 text-gray-500 hover:border-cat-pink/30 hover:bg-cat-pink/5 ';
        }

        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => toggleSelection(field, opt.id)}
            className={btnClasses}
          >
            {Icon && <Icon size={variant === 'primary' ? 18 : 14} className={isSelected ? 'text-white' : 'text-cat-pink/70'} />}
            {opt.label}
            {isSelected && <Check size={variant === 'primary' ? 16 : 12} className="ml-0.5" />}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="relative max-w-2xl mx-auto transform hover:scale-[1.01] transition-all duration-300">
      {/* Cat Ears */}
      <div className="hidden md:block absolute -top-12 left-10 w-24 h-24 bg-white border-4 border-cat-pink rounded-tl-[2rem] transform rotate-12 z-0"></div>
      <div className="hidden md:block absolute -top-12 right-10 w-24 h-24 bg-white border-4 border-cat-pink rounded-tr-[2rem] transform -rotate-12 z-0"></div>
      
      <div className="relative z-10 bg-white/90 backdrop-blur-sm p-4 md:p-8 rounded-3xl shadow-xl border-4 border-cat-pink">
        <div className="flex flex-col md:flex-row items-center justify-center mb-6 md:mb-8 gap-4 md:gap-0">
          <InteractiveCatMaid onChatToggle={onChatToggle} />
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
            <label className="block text-cat-dark font-bold flex items-center gap-2 text-xl md:text-2xl">
              <Heart className="w-6 h-6 md:w-8 md:h-8 text-cat-accent animate-pulse" />
              2. 您的属性标签是？ (Genres)
            </label>
            {renderSelectionGroup(TAG_OPTIONS, 'tags', 'primary')}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Expectations */}
            <div className="space-y-2 opacity-90 hover:opacity-100 transition-opacity">
              <label className="block text-gray-500 font-medium flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-cat-pink" />
                3. 对游戏的期待喵？
              </label>
              {renderSelectionGroup(EXPECTATION_OPTIONS, 'expectations', 'secondary')}
            </div>

            {/* Current Demand */}
            <div className="space-y-2 opacity-90 hover:opacity-100 transition-opacity">
              <label className="block text-gray-500 font-medium flex items-center gap-2 text-sm">
                <Search className="w-4 h-4 text-cat-pink" />
                4. 特别需求
              </label>
              {renderSelectionGroup(DEMAND_OPTIONS, 'demand', 'secondary')}
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
