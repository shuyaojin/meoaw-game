import React, { useState, useMemo } from 'react';
import CatInputForm from './components/CatInputForm';
import GameCard from './components/GameCard';
import PawCursor from './components/PawCursor';
import DesktopPet from './components/DesktopPet';
import { GAMES } from './data/mockGames';
import { ArrowUpDown, Flame, Star, DollarSign, Cat } from 'lucide-react';

const EXPECTATION_KEYWORDS = {
  Story: ['story rich', 'story', '剧情', 'narrative'],
  'Open World': ['open world', '开放世界'],
  Multiplayer: ['multi-player', 'multiplayer', 'co-op', 'coop', 'online pvp', 'pvp', '多人', '联机'],
  Graphics: ['beautiful', 'visual', '画面', '高清'],
  Hardcore: ['hardcore', 'difficult', 'souls', '高难度', '硬核'],
  Relaxing: ['casual', 'relax', 'relaxing', '轻松', '解压'],
  Indie: ['indie', '独立']
};

const DEMAND_FILTERS = {
  Sale: (game) => game.discount > 0,
  Free: (game) => game.basePrice === 0,
  Positive: (game) => game.rating >= 8.5,
  Trending: (game) => game.dau >= 5000 || game.rating >= 8.5
};

const getGameText = (game) => (game.tags.join(' ') + ' ' + game.title).toLowerCase();

const getEffectivePrice = (game) => {
  if (!Number.isFinite(game.basePrice)) return null;
  return game.basePrice * (1 - game.discount);
};

function BackgroundDecorations() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="hidden md:block absolute top-20 left-10 text-cat-pink/20 transform rotate-12 animate-float" style={{ animationDelay: '0s' }}>
        <Cat size={64} />
      </div>
      <div className="absolute top-20 right-4 md:top-40 md:right-20 text-cat-pink/20 transform -rotate-12 animate-float" style={{ animationDelay: '1s' }}>
        <Cat size={40} className="md:w-12 md:h-12" />
      </div>
      <div className="absolute bottom-20 left-4 md:left-1/4 text-cat-pink/20 transform rotate-45 animate-float" style={{ animationDelay: '2s' }}>
        <Cat size={48} className="md:w-14 md:h-14" />
      </div>
      <div className="hidden md:block absolute top-1/3 right-10 text-cat-pink/10 transform -rotate-12 animate-float" style={{ animationDelay: '1.5s' }}>
        <Cat size={120} />
      </div>
    </div>
  );
}

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortType, setSortType] = useState('rating'); // rating, price_asc, price_desc, dau
  const [petMood, setPetMood] = useState('default');

  const handleSearch = (formData) => {
    setHasSearched(true);
    
    // Determine Mood based on search terms
    const searchStr = (formData.tags + ' ' + formData.expectations + ' ' + formData.demand).toLowerCase();
    
    if (['horror', 'scary', 'zombie', '恐怖', '吓人', '鬼'].some(k => searchStr.includes(k))) {
        setPetMood('horror');
    } else if (['action', 'fight', 'shooter', '动作', '战斗', '射击'].some(k => searchStr.includes(k))) {
        setPetMood('action');
    } else if (['strategy', 'tactic', 'brain', '策略', '战棋', '脑'].some(k => searchStr.includes(k))) {
        setPetMood('strategy');
    } else if (['casual', 'relax', 'easy', '休闲', '轻松'].some(k => searchStr.includes(k))) {
        setPetMood('casual');
    } else {
        setPetMood('default');
    }

    // 1. Filter by Platform
    let filtered = GAMES.filter(g => g.platforms.includes(formData.platform));

    // 2. Text Analysis & Scoring
    
    // Split tags into "Hard Filters" (Genres) and "Soft Filters" (Expectations/Demand)
    // Note: formData.tags comes in as a space-separated string from the form submit handler
    const genreTags = formData.tags ? formData.tags.split(' ').filter(t => t) : [];
    const expectationIds = formData.expectations ? formData.expectations.split(' ').filter(t => t) : [];
    const demandIds = formData.demand ? formData.demand.split(' ').filter(t => t) : [];
    const otherTags = [formData.expectations, formData.demand].join(' ').toLowerCase().trim();
    
    // Check for discount keywords
    const wantsDiscount = ['sale', 'discount', 'cheap', 'offer', '促销', '打折', '便宜'].some(k => otherTags.includes(k));

    // First, apply HARD filtering for Genres
    // If user selected Genres, game MUST match at least one of them
    if (genreTags.length > 0) {
      filtered = filtered.filter(game => {
        const gameTags = game.tags.join(' ').toLowerCase();
        // Check if game matches ANY of the selected genres
        return genreTags.some(genre => gameTags.includes(genre.toLowerCase()));
      });
    }

    if (demandIds.length > 0) {
      filtered = filtered.filter(game =>
        demandIds.every(demand => {
          const handler = DEMAND_FILTERS[demand];
          return handler ? handler(game) : true;
        })
      );
    }

    // Then apply scoring based on ALL criteria
    filtered = filtered.map(game => {
      let score = 0;
      const gameText = getGameText(game);
      
      // Score for Genres (give them high weight to sort relevant genres to top)
      genreTags.forEach(tag => {
        if (gameText.includes(tag.toLowerCase())) score += 10;
      });

      // Score for Other Tags (Expectations/Demand)
      if (otherTags) {
        const terms = otherTags.split(/[\s,，]+/); 
        terms.forEach(term => {
          if (term && gameText.includes(term)) score += 5;
        });
      }

      if (expectationIds.length > 0) {
        expectationIds.forEach(expectation => {
          const keywords = EXPECTATION_KEYWORDS[expectation] || [];
          if (keywords.some(k => gameText.includes(k))) score += 6;
        });
      }

      // Boost discounted games if requested
      if (game.discount > 0) {
        score += wantsDiscount ? 20 : 0; 
      }

      return { ...game, matchScore: score };
    });

    // Final cleanup: If we have ANY search criteria, filter out completely irrelevant games (score 0)
    // unless we only had hard filters which are already applied.
    const hasSearchCriteria = genreTags.length > 0 || otherTags.length > 0 || expectationIds.length > 0 || demandIds.length > 0;
    
    if (hasSearchCriteria) {
      // If we only have genres, the hard filter above handled it.
      // If we have other tags, we want to ensure we don't show random games that only matched the genre but not the expectation?
      // Actually, standard behavior is: Hard Filter (Genre) AND Soft Sort (Expectations).
      // So if I select "Action" + "Story", I want Action games, sorted by Story.
      // Games with score 0 should theoretically be filtered out IF they didn't match the Hard Filter.
      // But since we already hard filtered, any remaining game is valid by Genre.
      // If NO genre selected, then we rely on Score > 0.
      
      if (genreTags.length === 0) {
         filtered = filtered.filter(game => game.matchScore > 0);
      }
    }
    
    setSearchResults(filtered);
  };

  const sortedGames = useMemo(() => {
    let sorted = [...searchResults];
    
    // First sort by match score (relevance)
    sorted.sort((a, b) => b.matchScore - a.matchScore);

    // Then apply specific sort
    switch (sortType) {
      case 'price_asc':
        sorted.sort((a, b) => {
          const priceA = getEffectivePrice(a);
          const priceB = getEffectivePrice(b);
          const safeA = Number.isFinite(priceA) ? priceA : Number.POSITIVE_INFINITY;
          const safeB = Number.isFinite(priceB) ? priceB : Number.POSITIVE_INFINITY;
          return safeA - safeB;
        });
        break;
      case 'price_desc':
        sorted.sort((a, b) => {
          const priceA = getEffectivePrice(a);
          const priceB = getEffectivePrice(b);
          const safeA = Number.isFinite(priceA) ? priceA : Number.NEGATIVE_INFINITY;
          const safeB = Number.isFinite(priceB) ? priceB : Number.NEGATIVE_INFINITY;
          return safeB - safeA;
        });
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'dau':
        sorted.sort((a, b) => (b.dau || 0) - (a.dau || 0));
        break;
      default:
        break;
    }
    return sorted;
  }, [searchResults, sortType]);

  return (
    <div className="min-h-screen pb-20 relative overflow-x-hidden">
      <PawCursor />
      <DesktopPet mood={petMood} />
      <BackgroundDecorations />
      {/* Header */}
      <header className="bg-white/90 backdrop-blur shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <h1 className="text-lg md:text-2xl font-bold text-cat-accent flex items-center gap-2">
            <Cat className="w-6 h-6 md:w-8 md:h-8" />
            Meaow Game Recommender
          </h1>
          <div className="text-xs md:text-sm text-gray-500 hidden sm:block font-medium">
            🐾 为您服务的专属游戏向导 🐾
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-8 md:space-y-12 relative z-10">
        {/* Input Section */}
        <section>
          <CatInputForm onSearch={handleSearch} />
        </section>

        {/* Results Section */}
        {hasSearched && (
          <section className="space-y-4 md:space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-cat-pink/20">
              <h2 className="text-lg md:text-xl font-bold text-cat-dark">
                为您找到 {sortedGames.length} 款游戏！
              </h2>
              
              <div className="flex flex-wrap gap-2">
                <span className="text-gray-500 text-sm flex items-center mr-2">排序：</span>
                
                <button 
                  onClick={() => setSortType('rating')}
                  className={`px-2 md:px-3 py-1.5 rounded-lg text-xs md:text-sm flex items-center gap-1 transition-colors ${sortType === 'rating' ? 'bg-cat-accent text-white' : 'bg-gray-100 text-gray-600 hover:bg-cat-pink/20'}`}
                >
                  <Star className="w-3 h-3 md:w-4 md:h-4" /> 评分
                </button>
                
                <button 
                  onClick={() => setSortType('price_asc')}
                  className={`px-2 md:px-3 py-1.5 rounded-lg text-xs md:text-sm flex items-center gap-1 transition-colors ${sortType === 'price_asc' ? 'bg-cat-accent text-white' : 'bg-gray-100 text-gray-600 hover:bg-cat-pink/20'}`}
                >
                  <DollarSign className="w-3 h-3 md:w-4 md:h-4" /> 便宜
                </button>
                
                <button 
                  onClick={() => setSortType('price_desc')}
                  className={`px-2 md:px-3 py-1.5 rounded-lg text-xs md:text-sm flex items-center gap-1 transition-colors ${sortType === 'price_desc' ? 'bg-cat-accent text-white' : 'bg-gray-100 text-gray-600 hover:bg-cat-pink/20'}`}
                >
                  <DollarSign className="w-3 h-3 md:w-4 md:h-4" /> 贵价
                </button>
                
                <button 
                  onClick={() => setSortType('dau')}
                  className={`px-2 md:px-3 py-1.5 rounded-lg text-xs md:text-sm flex items-center gap-1 transition-colors ${sortType === 'dau' ? 'bg-cat-accent text-white' : 'bg-gray-100 text-gray-600 hover:bg-cat-pink/20'}`}
                >
                  <Flame className="w-3 h-3 md:w-4 md:h-4" /> 热门
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {sortedGames.map(game => (
                <GameCard key={game.id} game={game} />
              ))}
              {sortedGames.length === 0 && (
                <div className="col-span-full text-center py-20 text-gray-400">
                  <p>呜呜，没有找到符合要求的游戏喵... 换个条件试试？</p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
