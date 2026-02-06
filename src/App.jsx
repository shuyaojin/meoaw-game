import React, { useState, useMemo } from 'react';
import CatInputForm from './components/CatInputForm';
import GameCard from './components/GameCard';
import { GAMES } from './data/mockGames';
import { ArrowUpDown, Flame, Star, DollarSign, Cat } from 'lucide-react';

function BackgroundDecorations() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute top-20 left-10 text-cat-pink/20 transform rotate-12 animate-float" style={{ animationDelay: '0s' }}>
        <Cat size={64} />
      </div>
      <div className="absolute top-40 right-20 text-cat-pink/20 transform -rotate-12 animate-float" style={{ animationDelay: '1s' }}>
        <Cat size={48} />
      </div>
      <div className="absolute bottom-20 left-1/4 text-cat-pink/20 transform rotate-45 animate-float" style={{ animationDelay: '2s' }}>
        <Cat size={56} />
      </div>
      <div className="absolute top-1/3 right-10 text-cat-pink/10 transform -rotate-12 animate-float" style={{ animationDelay: '1.5s' }}>
        <Cat size={120} />
      </div>
    </div>
  );
}

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortType, setSortType] = useState('rating'); // rating, price_asc, price_desc, dau

  const handleSearch = (formData) => {
    setHasSearched(true);
    
    // 1. Filter by Platform
    let filtered = GAMES.filter(g => g.platforms.includes(formData.platform));

    // 2. Text Analysis & Scoring
    const searchTerms = [
      formData.tags, 
      formData.expectations, 
      formData.demand
    ].join(' ').toLowerCase();

    // Check for discount keywords
    const wantsDiscount = ['sale', 'discount', 'cheap', 'offer', '促销', '打折', '便宜'].some(k => searchTerms.includes(k));

    filtered = filtered.map(game => {
      let score = 0;
      const gameText = (game.tags.join(' ') + ' ' + game.title).toLowerCase();
      
      // Keyword matching
      if (searchTerms) {
        const terms = searchTerms.split(/[\s,，]+/); // Split by space or comma
        terms.forEach(term => {
          if (term && gameText.includes(term)) score += 5;
        });
      }

      // Boost discounted games if requested or generally good
      if (game.discount > 0) {
        score += wantsDiscount ? 20 : 5; 
      }

      return { ...game, matchScore: score };
    });

    // Filter out zero matches if search terms exist, but keep all if generic
    // Actually, for a recommender, we should just return everything sorted by relevance if no hard filters fail
    
    setSearchResults(filtered);
  };

  const sortedGames = useMemo(() => {
    let sorted = [...searchResults];
    
    // First sort by match score (relevance)
    sorted.sort((a, b) => b.matchScore - a.matchScore);

    // Then apply specific sort
    switch (sortType) {
      case 'price_asc':
        sorted.sort((a, b) => (a.basePrice * (1 - a.discount)) - (b.basePrice * (1 - b.discount)));
        break;
      case 'price_desc':
        sorted.sort((a, b) => (b.basePrice * (1 - b.discount)) - (a.basePrice * (1 - a.discount)));
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'dau':
        sorted.sort((a, b) => b.dau - a.dau);
        break;
      default:
        break;
    }
    return sorted;
  }, [searchResults, sortType]);

  return (
    <div className="min-h-screen pb-20 relative">
      <BackgroundDecorations />
      {/* Header */}
      <header className="bg-white/90 backdrop-blur shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-cat-accent flex items-center gap-2">
            <Cat className="w-8 h-8" />
            Meaow Game Recommender
          </h1>
          <div className="text-sm text-gray-500 hidden md:block font-medium">
            🐾 为主人服务的专属猫娘管家 🐾
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-12 relative z-10">
        {/* Input Section */}
        <section>
          <CatInputForm onSearch={handleSearch} />
        </section>

        {/* Results Section */}
        {hasSearched && (
          <section className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-cat-pink/20">
              <h2 className="text-xl font-bold text-cat-dark">
                为您找到 {sortedGames.length} 款游戏喵！
              </h2>
              
              <div className="flex flex-wrap gap-2">
                <span className="text-gray-500 text-sm flex items-center mr-2">排序方式：</span>
                
                <button 
                  onClick={() => setSortType('rating')}
                  className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-colors ${sortType === 'rating' ? 'bg-cat-accent text-white' : 'bg-gray-100 text-gray-600 hover:bg-cat-pink/20'}`}
                >
                  <Star className="w-4 h-4" /> 评分最高
                </button>
                
                <button 
                  onClick={() => setSortType('price_asc')}
                  className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-colors ${sortType === 'price_asc' ? 'bg-cat-accent text-white' : 'bg-gray-100 text-gray-600 hover:bg-cat-pink/20'}`}
                >
                  <DollarSign className="w-4 h-4" /> 价格最低
                </button>

                <button 
                  onClick={() => setSortType('price_desc')}
                  className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-colors ${sortType === 'price_desc' ? 'bg-cat-accent text-white' : 'bg-gray-100 text-gray-600 hover:bg-cat-pink/20'}`}
                >
                  <DollarSign className="w-4 h-4" /> 价格最高
                </button>
                
                <button 
                  onClick={() => setSortType('dau')}
                  className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-colors ${sortType === 'dau' ? 'bg-cat-accent text-white' : 'bg-gray-100 text-gray-600 hover:bg-cat-pink/20'}`}
                >
                  <Flame className="w-4 h-4" /> 最热门 (DAU)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
