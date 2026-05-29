'use client';

import React from 'react';

interface NumericKeypadProps {
  onInput: (digit: string) => void;
  onClear: () => void;
  onDelete: () => void;
}

export const NumericKeypad = ({ onInput, onClear, onDelete }: NumericKeypadProps) => {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];

  return (
    <div className="grid grid-cols-3 gap-6 w-full max-w-md mx-auto">
      {digits.map((d) => (
        <button
          key={d}
          type="button"
          onClick={() => {
            if (d === 'C') onClear();
            else if (d === '⌫') onDelete();
            else onInput(d);
          }}
          className={`h-24 md:h-32 text-5xl font-black rounded-[30px] transition-all active:scale-90 shadow-2xl flex items-center justify-center border-4 border-white/10 ${
            d === 'C' ? 'bg-red-500 text-white hover:bg-red-600' :
            d === '⌫' ? 'bg-amber-500 text-white hover:bg-amber-600' :
            'bg-[#0055d4] text-white hover:bg-[#0044b1]'
          }`}
        >
          {d}
        </button>
      ))}
    </div>
  );
};
