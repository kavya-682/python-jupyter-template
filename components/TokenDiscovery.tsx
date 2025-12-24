
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ColumnType, Token, SortField, SortOrder } from '../types';
import { createMockToken, COLORS } from '../constants';
import TokenRow from './TokenRow';
import { SkeletonRow, Tooltip } from './SharedUI';
import { ArrowUpDown, Search, RefreshCw, Info } from 'lucide-react';

const Column: React.FC<{ type: ColumnType }> = ({ type }) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('marketCap');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filter, setFilter] = useState('');

  // Initial Data Fetch Simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      const initialTokens = Array.from({ length: 15 }, (_, i) => createMockToken(`${type}-${i}`, i));
      setTokens(initialTokens);
      setLoading(false);
    }, Math.random() * 1000 + 500);
    return () => clearTimeout(timer);
  }, [type]);

  // Real-time "WebSocket" Simulation
  useEffect(() => {
    if (loading) return;

    const interval = setInterval(() => {
      setTokens(prev => {
        const next = [...prev];
        const updateCount = Math.floor(Math.random() * 3) + 1;
        
        for(let i = 0; i < updateCount; i++) {
          const idx = Math.floor(Math.random() * next.length);
          const t = next[idx];
          const change = (Math.random() * 0.04) - 0.02; // +/- 2%
          const direction = change > 0 ? 'up' : 'down';
          
          next[idx] = {
            ...t,
            price: t.price * (1 + change),
            marketCap: t.marketCap * (1 + change),
            lastUpdateDirection: direction as any,
            sparkline: [...t.sparkline.slice(1), Math.random() * 100]
          };

          // Reset the flash effect after a delay
          setTimeout(() => {
            setTokens(current => current.map(token => 
              token.id === t.id ? { ...token, lastUpdateDirection: null } : token
            ));
          }, 1000);
        }
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [loading]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedAndFilteredTokens = useMemo(() => {
    return tokens
      .filter(t => t.symbol.toLowerCase().includes(filter.toLowerCase()) || t.name.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => {
        const factor = sortOrder === 'desc' ? -1 : 1;
        if (typeof a[sortField] === 'string') {
          return (a[sortField] as string).localeCompare(b[sortField] as string) * factor;
        }
        return ((a[sortField] as number) - (b[sortField] as number)) * factor;
      });
  }, [tokens, sortField, sortOrder, filter]);

  return (
    <div className="flex flex-col bg-[#0B0C0E] border border-[#23262B] rounded-xl overflow-hidden shadow-xl min-h-[600px] h-full">
      <div className="p-4 border-b border-[#23262B] bg-[#141519]/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">{type}</h2>
            <Tooltip content={`Discovery list for ${type} updated in real-time.`}>
              <Info size={14} className="text-gray-500 cursor-help" />
            </Tooltip>
          </div>
          <button className="text-gray-500 hover:text-white transition-colors">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={14} />
            <input 
              type="text" 
              placeholder="Search symbol..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-[#0B0C0E] border border-[#23262B] rounded-lg py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-600"
            />
          </div>

          <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            <button 
              onClick={() => handleSort('marketCap')}
              className={`flex items-center gap-1 hover:text-white transition-colors ${sortField === 'marketCap' ? 'text-blue-500' : ''}`}
            >
              Market Cap <ArrowUpDown size={10} />
            </button>
            <button 
              onClick={() => handleSort('volume')}
              className={`flex items-center gap-1 hover:text-white transition-colors ${sortField === 'volume' ? 'text-blue-500' : ''}`}
            >
              Volume <ArrowUpDown size={10} />
            </button>
            <button 
              onClick={() => handleSort('age')}
              className={`flex items-center gap-1 hover:text-white transition-colors ${sortField === 'age' ? 'text-blue-500' : ''}`}
            >
              Age <ArrowUpDown size={10} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
        ) : sortedAndFilteredTokens.length > 0 ? (
          sortedAndFilteredTokens.map(token => (
            <TokenRow key={token.id} token={token} type={type} />
          ))
        ) : (
          <div className="p-8 text-center text-gray-500 text-xs italic">
            No tokens found.
          </div>
        )}
      </div>

      <div className="p-2 border-t border-[#23262B] bg-[#141519] flex justify-center">
        <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Axiom Pulse Engine v2.4</span>
      </div>
    </div>
  );
};

const TokenDiscovery: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-[1400px] mx-auto p-4 md:p-8">
      <Column type={ColumnType.NEW_PAIRS} />
      <Column type={ColumnType.FINAL_STRETCH} />
      <Column type={ColumnType.MIGRATED} />
    </div>
  );
};

export default TokenDiscovery;
