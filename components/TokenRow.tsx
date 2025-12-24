
import React, { memo, useState } from 'react';
import { Token, ColumnType } from '../types';
import { COLORS } from '../constants';
import { Tooltip, Modal, Badge } from './SharedUI';
import { ExternalLink, TrendingUp, TrendingDown, Clock, Layers } from 'lucide-react';

interface TokenRowProps {
  token: Token;
  type: ColumnType;
}

const TokenRow: React.FC<TokenRowProps> = ({ token, type }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatCurrency = (val: number) => {
    if (val < 0.0001) return `$${val.toFixed(8)}`;
    if (val > 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val > 1000) return `$${(val / 1000).toFixed(2)}K`;
    return `$${val.toFixed(4)}`;
  };

  const isUp = token.change24h >= 0;

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className={`group flex items-center justify-between p-3 border-b border-[#1A1D23] hover:bg-[#1A1D23] transition-all cursor-pointer select-none active:scale-[0.99] ${
          token.lastUpdateDirection === 'up' ? 'price-up' : token.lastUpdateDirection === 'down' ? 'price-down' : ''
        }`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <img src={token.logoUrl} alt={token.symbol} className="w-8 h-8 rounded-full bg-[#141519] object-cover border border-[#23262B]" />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-white truncate">{token.symbol}</span>
              {type === ColumnType.MIGRATED && <Badge variant="warning">{token.migratedTo}</Badge>}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-medium">
              <span className="flex items-center gap-0.5"><Clock size={10} /> {token.age}</span>
              <span className="flex items-center gap-0.5"><Layers size={10} /> MC {formatCurrency(token.marketCap)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 px-2">
          <span className="text-xs font-mono font-medium text-white">{formatCurrency(token.price)}</span>
          <div className={`flex items-center gap-0.5 text-[10px] font-bold ${isUp ? 'text-green-500' : 'text-red-500'}`}>
            {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {Math.abs(token.change24h).toFixed(2)}%
          </div>
        </div>

        {type === ColumnType.FINAL_STRETCH && (
          <div className="w-16 ml-2">
            <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
              <div 
                className="bg-blue-500 h-full transition-all duration-1000" 
                style={{ width: `${token.progress}%` }} 
              />
            </div>
            <span className="text-[9px] text-gray-500 font-bold block text-center mt-1">{token.progress}%</span>
          </div>
        )}

        <div className="w-12 h-6 ml-2 hidden sm:block">
           <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
              <path 
                d={`M 0 ${30 - (token.sparkline[0] / 100 * 30)} ${token.sparkline.map((v, i) => `L ${(i / (token.sparkline.length - 1)) * 100} ${30 - (v / 100 * 30)}`).join(' ')}`}
                fill="none"
                stroke={isUp ? COLORS.green : COLORS.red}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
           </svg>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Token Details: ${token.name} (${token.symbol})`}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-black/20 rounded-lg border border-[#23262B]">
              <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Price</p>
              <p className="text-xl font-mono text-white">{formatCurrency(token.price)}</p>
            </div>
            <div className="p-3 bg-black/20 rounded-lg border border-[#23262B]">
              <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Market Cap</p>
              <p className="text-xl font-mono text-white">{formatCurrency(token.marketCap)}</p>
            </div>
            <div className="p-3 bg-black/20 rounded-lg border border-[#23262B]">
              <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Volume (24h)</p>
              <p className="text-xl font-mono text-white">{formatCurrency(token.volume)}</p>
            </div>
            <div className="p-3 bg-black/20 rounded-lg border border-[#23262B]">
              <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Liquidity</p>
              <p className="text-xl font-mono text-white">{formatCurrency(token.liquidity)}</p>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
              Trade on Raydium <ExternalLink size={16} />
            </button>
            <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-all">
              View Chart
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default memo(TokenRow);
