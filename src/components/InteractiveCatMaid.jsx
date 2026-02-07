import React, { useState, useEffect } from 'react';
import { MessageCircle, Heart, Cat } from 'lucide-react';

const INTERACTIONS = [
  { action: 'wiggle', text: '喵呜？(Nya?)' },
  { action: 'pop', text: '你好呀！(Hello!)' },
  { action: 'tilt', text: '想玩游戏吗？' },
  { action: 'bounce', text: '摸摸头～ (Pat!)' },
  { action: 'spin', text: '转圈圈～ (Spin!)' },
  { action: 'zoom', text: '凑近看看喵～' },
  { action: 'wiggle', text: '开心～ (Happy!)' },
  { action: 'pop', text: '要吃小鱼干吗？' },
  { action: 'tilt', text: '一直陪着你喵～' },
  { action: 'bounce', text: '好开心喵！' },
];

export default function InteractiveCatMaid() {
  const [interaction, setInteraction] = useState({ action: 'idle', text: '' });
  const [isHovered, setIsHovered] = useState(false);
  const [hearts, setHearts] = useState([]);
  const [clickCount, setClickCount] = useState(0);

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

  const handleClick = (e) => {
    // Trigger interaction
    triggerRandomInteraction();

    // Add heart effect
    const rect = e.currentTarget.getBoundingClientRect();
    // Calculate position relative to the container
    // Randomize slightly around the center
    const x = 50 + (Math.random() * 40 - 20); 
    const y = 50 + (Math.random() * 40 - 20);
    
    const newHeart = {
      id: Date.now(),
      x,
      y,
      color: Math.random() > 0.5 ? '#FFB6C1' : '#FF69B4' // Light pink or hot pink
    };

    setHearts(prev => [...prev, newHeart]);
    setClickCount(prev => prev + 1);

    // Remove heart after animation
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 1000);
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
      className="relative group cursor-pointer md:mr-4 select-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* 对话气泡 */}
      <div className={`absolute -top-10 md:-top-12 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 md:px-3 md:py-1.5 rounded-2xl shadow-lg border border-cat-pink text-[10px] md:text-xs font-bold text-cat-accent whitespace-nowrap transition-all duration-300 z-10 ${isHovered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-90'}`}>
        {interaction.text || "喵～"}
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white border-r border-b border-cat-pink rotate-45"></div>
      </div>

      {/* 头像容器 */}
      <div className={`w-16 h-16 md:w-24 md:h-24 rounded-full border-2 md:border-4 border-cat-pink bg-cat-white overflow-hidden shadow-md transition-all duration-300 flex items-center justify-center bg-pink-50 ${getAnimationClass()}`}>
        <Cat className="w-10 h-10 md:w-16 md:h-16 text-cat-pink" />
      </div>
      
      {/* 装饰性光晕 */}
      <div className="absolute inset-0 rounded-full bg-cat-accent opacity-0 group-hover:opacity-10 transition-opacity duration-300 animate-pulse pointer-events-none"></div>

      {/* 点击产生的小爱心 */}
      {hearts.map(heart => (
        <div
          key={heart.id}
          className="absolute pointer-events-none animate-float-up"
          style={{
            left: `${heart.x}%`,
            top: `${heart.y}%`,
            color: heart.color,
            fontSize: '1.5rem'
          }}
        >
          <Heart fill={heart.color} size={20} />
        </div>
      ))}

      <style>{`
        @keyframes float-up {
          0% { opacity: 1; transform: translateY(0) scale(0.5); }
          100% { opacity: 0; transform: translateY(-50px) scale(1.2); }
        }
        .animate-float-up {
          animation: float-up 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
