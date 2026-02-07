import React, { useState, useEffect } from 'react';
import { Ghost, Sword, Brain, Coffee, Cat } from 'lucide-react';

const MOODS = {
  default: {
    Icon: Cat,
    color: 'bg-cat-pink',
    borderColor: 'border-cat-pink',
    message: '喵～有什么吩咐吗？'
  },
  horror: {
    Icon: Ghost,
    color: 'bg-purple-500',
    borderColor: 'border-purple-600',
    message: '呜... 好黑... 好怕怕...'
  },
  action: {
    Icon: Sword,
    color: 'bg-red-500',
    borderColor: 'border-red-600',
    message: '战斗！爽！'
  },
  strategy: {
    Icon: Brain,
    color: 'bg-blue-500',
    borderColor: 'border-blue-600',
    message: '一切都在计划之中...'
  },
  casual: {
    Icon: Coffee,
    color: 'bg-green-400',
    borderColor: 'border-green-500',
    message: '摸鱼时间到～'
  }
};

export default function DesktopPet({ mood = 'default' }) {
  const [position, setPosition] = useState(() => {
    // Check if mobile (md breakpoint is 768px)
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    return { 
      x: 20, 
      y: isMobile ? 100 : (typeof window !== 'undefined' ? window.innerHeight - 150 : 500)
    };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [currentMessage, setCurrentMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  const currentMood = MOODS[mood] || MOODS.default;

  useEffect(() => {
    setCurrentMessage(currentMood.message);
    setShowMessage(true);
    const timer = setTimeout(() => setShowMessage(false), 3000);
    return () => clearTimeout(timer);
  }, [mood]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      className="fixed z-50 cursor-move transition-colors duration-500"
      style={{ left: position.x, top: position.y }}
      onMouseDown={handleMouseDown}
    >
      {/* Message Bubble */}
      <div 
        className={`absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-2xl shadow-lg border-2 ${currentMood.borderColor} whitespace-nowrap transition-all duration-300 ${showMessage ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
      >
        <p className="text-sm font-bold text-gray-700">{currentMessage}</p>
        <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 ${currentMood.borderColor} rotate-45`}></div>
      </div>

      {/* Avatar */}
      <div 
        className={`w-14 h-14 md:w-24 md:h-24 rounded-full ${currentMood.color} border-2 md:border-4 ${currentMood.borderColor} shadow-xl flex items-center justify-center text-white animate-bounce-slow hover:scale-110 transition-all duration-300 relative overflow-hidden`}
        onClick={() => {
            setShowMessage(true);
            setTimeout(() => setShowMessage(false), 3000);
        }}
      >
        <currentMood.Icon className="w-8 h-8 md:w-12 md:h-12" />
        
        {/* Shine effect */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-white opacity-20 rounded-bl-full"></div>
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
