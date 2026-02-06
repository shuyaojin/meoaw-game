import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

const INTERACTIONS = [
  { action: 'wiggle', text: '喵呜？(Nya?)' },
  { action: 'pop', text: '主人好！(Master!)' },
  { action: 'tilt', text: '想玩游戏吗？' },
  { action: 'bounce', text: '摸摸头～ (Pat!)' },
  { action: 'spin', text: '转圈圈～ (Spin!)' },
  { action: 'zoom', text: '靠近一点喵～' },
  { action: 'wiggle', text: '蹭蹭～ (Rub rub)' },
  { action: 'pop', text: '要吃小鱼干吗？' },
  { action: 'tilt', text: '一直陪着你喵～' },
  { action: 'bounce', text: '好开心喵！' },
];

export default function InteractiveCatMaid() {
  const [interaction, setInteraction] = useState({ action: 'idle', text: '' });
  const [isHovered, setIsHovered] = useState(false);

  const avatarUrl = "/cat-maid.jpg";

  const handleMouseEnter = () => {
    setIsHovered(true);
    triggerRandomInteraction();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setInteraction({ action: 'idle', text: '' });
  };

  const triggerRandomInteraction = () => {
    const random = INTERACTIONS[Math.floor(Math.random() * INTERACTIONS.length)];
    setInteraction(random);
  };

  // 持续悬停时偶尔切换动作
  useEffect(() => {
    let interval;
    if (isHovered) {
      interval = setInterval(() => {
        if (Math.random() > 0.7) { // 30% chance to switch
            triggerRandomInteraction();
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isHovered]);

  const getAnimationClass = () => {
    switch (interaction.action) {
      case 'wiggle': return 'animate-wiggle';
      case 'pop': return 'animate-pop';
      case 'tilt': return 'animate-tilt';
      case 'bounce': return 'animate-bounce';
      case 'spin': return 'animate-spin';
      case 'zoom': return 'scale-110 transition-transform duration-300';
      default: return 'animate-float'; // Idle animation
    }
  };

  return (
    <div 
      className="relative group cursor-pointer mr-4"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={triggerRandomInteraction}
    >
      {/* 对话气泡 */}
      <div className={`absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1.5 rounded-2xl shadow-lg border border-cat-pink text-xs font-bold text-cat-accent whitespace-nowrap transition-all duration-300 z-10 ${isHovered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-90'}`}>
        {interaction.text || "喵～"}
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white border-r border-b border-cat-pink rotate-45"></div>
      </div>

      {/* 头像容器 */}
      <div className={`w-24 h-24 rounded-full border-4 border-cat-pink bg-cat-white overflow-hidden shadow-md transition-all duration-300 ${getAnimationClass()}`}>
        <img 
          src={avatarUrl} 
          alt="Cat Maid" 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* 装饰性光晕 */}
      <div className="absolute inset-0 rounded-full bg-cat-accent opacity-0 group-hover:opacity-10 transition-opacity duration-300 animate-pulse pointer-events-none"></div>
    </div>
  );
}
