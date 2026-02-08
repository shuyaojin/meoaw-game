import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageSquare, Cat, Sparkles } from 'lucide-react';

const SYSTEM_RESPONSES = {
  greeting: ["主人好！我是您的专属游戏管家喵～ 想找什么游戏都可以告诉我哦！", "喵～ 今天想玩什么类型的游戏呢？", "随时为您服务，主人！"],
  unknown: ["喵呜？不太明白主人的意思... 能再说简单点吗？", "那个... 这一点太难了喵，换个说法试试？", "正在努力学习人类语言中... 喵！"],
  searching: ["收到！正在为主人寻找相关游戏...", "好的喵！马上为您筛选～", "让我想想... 这些游戏应该适合您！"],
  cheap: ["为您找到了便宜的游戏喵！省钱买小鱼干！", "性价比高的游戏都在这里啦～"],
  expensive: ["哇！主人要看贵族游戏吗？都在这里了喵！"],
  rating: ["口碑最好的游戏！大家都在玩喵～"],
  horror: ["呜... 主人喜欢吓人的游戏吗？我不看... 给您找出来啦！", "恐怖游戏... 记得开灯玩哦喵！"],
  action: ["动作游戏！热血沸腾喵！", "打打杀杀的游戏在这里～"],
  rpg: ["角色扮演！去冒险吧主人！", "一段新的旅程在等着您喵～"],
  strategy: ["动脑筋的游戏喵～ 主人最聪明了！", "运筹帷幄决胜千里！"],
};

const KEYWORDS = {
  horror: ['恐怖', '吓人', '鬼', 'horror', 'scary', 'zombie', '僵尸'],
  action: ['动作', '打架', '战斗', 'action', 'fight', 'shooter', '射击', '枪'],
  rpg: ['角色扮演', '剧情', '故事', 'rpg', 'role', 'story', 'adventure', '冒险'],
  strategy: ['策略', '战棋', '塔防', 'strategy', 'tactic', '脑', 'think'],
  cheap: ['便宜', '低价', '打折', 'cheap', 'discount', 'sale', 'free', '免费'],
  expensive: ['贵', '高价', 'expensive', 'premium'],
  rating: ['好玩', '高分', '推荐', '热门', 'best', 'good', 'top', 'rating', 'popular'],
};

export default function CatChat({ isOpen, onToggle, onAiCommand }) {
  const [messages, setMessages] = useState([
    { id: 1, text: SYSTEM_RESPONSES.greeting[0], sender: 'cat' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const catMaidUrl = `${import.meta.env.BASE_URL}cat-maid.jpg`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    setMessages(prev => [...prev, { id: Date.now(), text: userText, sender: 'user' }]);
    setInputValue('');
    setIsTyping(true);

    // Simulate thinking delay
    setTimeout(() => {
      processMessage(userText);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const processMessage = (text) => {
    const lowerText = text.toLowerCase();
    let responseKey = 'unknown';
    let command = null;

    // Logic for keyword matching
    if (KEYWORDS.cheap.some(k => lowerText.includes(k))) {
      responseKey = 'cheap';
      command = { type: 'sort', value: 'price_asc' };
    } else if (KEYWORDS.expensive.some(k => lowerText.includes(k))) {
      responseKey = 'expensive';
      command = { type: 'sort', value: 'price_desc' };
    } else if (KEYWORDS.rating.some(k => lowerText.includes(k))) {
      responseKey = 'rating';
      command = { type: 'sort', value: 'rating' };
    } else {
      // Check genres
      for (const [genre, words] of Object.entries(KEYWORDS)) {
        if (['cheap', 'expensive', 'rating'].includes(genre)) continue;
        
        if (words.some(k => lowerText.includes(k))) {
          responseKey = genre; // e.g. 'horror'
          // Map internal genre keys to display tags if needed, or just search text
          // Simple approach: search for the genre name
          const tagMap = {
            horror: 'Horror',
            action: 'Action',
            rpg: 'RPG',
            strategy: 'Strategy'
          };
          command = { type: 'search', value: tagMap[genre] || genre };
          break;
        }
      }
    }

    // Pick random response
    const responses = SYSTEM_RESPONSES[responseKey] || SYSTEM_RESPONSES.unknown;
    const replyText = responses[Math.floor(Math.random() * responses.length)];

    setMessages(prev => [...prev, { id: Date.now(), text: replyText, sender: 'cat' }]);

    if (command) {
      onAiCommand(command);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="fixed top-24 right-4 md:top-auto md:bottom-4 md:right-4 z-50 flex flex-col-reverse md:flex-col items-end gap-4 md:gap-0">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-0 md:mb-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-cat-pink animate-fade-in-up">
          {/* Header */}
          <div className="bg-cat-pink/20 p-3 flex items-center justify-between border-b border-cat-pink/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-cat-accent overflow-hidden border-2 border-white">
                <img src={catMaidUrl} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-cat-dark">猫娘管家 AI</h3>
                <span className="text-[10px] text-cat-accent flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  Online
                </span>
              </div>
            </div>
            <button 
              onClick={onToggle}
              className="text-cat-dark/50 hover:text-cat-accent transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="h-80 overflow-y-auto p-4 space-y-3 bg-cat-white/30">
            {messages.map(msg => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-cat-accent text-white rounded-tr-none' 
                      : 'bg-white text-cat-dark border border-cat-pink/20 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-2 rounded-2xl rounded-tl-none border border-cat-pink/20 shadow-sm flex gap-1">
                  <span className="w-1.5 h-1.5 bg-cat-pink rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-cat-pink rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                  <span className="w-1.5 h-1.5 bg-cat-pink rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-cat-pink/10 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="告诉我想玩什么游戏喵..."
              className="flex-1 bg-gray-50 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cat-pink/50 transition-all"
            />
            <button 
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="p-2 bg-cat-accent text-white rounded-full hover:bg-cat-pink disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md transform active:scale-95"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`group flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all duration-300 ${
          isOpen 
            ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' 
            : 'bg-cat-accent text-white hover:bg-cat-pink hover:scale-105 animate-bounce-subtle'
        }`}
      >
        {isOpen ? (
          <>
            <X size={20} />
            <span className="font-bold text-sm">关闭</span>
          </>
        ) : (
          <>
            <div className="relative">
              <MessageSquare size={20} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-400 rounded-full animate-ping"></span>
            </div>
            <span className="font-bold text-sm">召唤猫娘管家</span>
            <Sparkles size={16} className="animate-spin-slow" />
          </>
        )}
      </button>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite ease-in-out;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
