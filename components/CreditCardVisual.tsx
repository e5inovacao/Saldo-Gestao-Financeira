import React, { useMemo } from 'react';

interface CreditCardVisualProps {
  number: string;
  holderName: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
  isFlipped: boolean;
}

const CreditCardVisual: React.FC<CreditCardVisualProps> = ({
  number,
  holderName,
  expiryMonth,
  expiryYear,
  ccv,
  isFlipped
}) => {
  
  const formattedNumber = useMemo(() => {
    if (!number) return '•••• •••• •••• ••••';
    const matches = number.match(/.{1,4}/g);
    return matches ? matches.join(' ') : number;
  }, [number]);

  const getCardType = (num: string) => {
    if (/^4/.test(num)) return 'visa';
    if (/^5[1-5]/.test(num)) return 'mastercard';
    if (/^3[47]/.test(num)) return 'amex';
    if (/^6/.test(num)) return 'elo'; // Simplificado
    return 'unknown';
  };

  const cardType = getCardType(number);

  return (
    <div className="perspective-1000 w-full max-w-[320px] h-[200px] mx-auto mb-6 cursor-pointer" style={{ perspective: '1000px' }}>
      <div 
        className={`relative w-full h-full transition-transform duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
        style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* Frente */}
        <div className="absolute w-full h-full backface-hidden rounded-2xl p-6 text-white shadow-2xl flex flex-col justify-between bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/10"
             style={{ backfaceVisibility: 'hidden' }}>
          
          <div className="flex justify-between items-start">
             <div className="w-12 h-8 bg-yellow-500/20 rounded-md border border-yellow-500/40 flex items-center justify-center">
                 <div className="w-8 h-5 bg-yellow-400/80 rounded-sm"></div>
             </div>
             <div className="text-xl font-bold italic tracking-wider uppercase opacity-80">
                 {cardType !== 'unknown' ? cardType : 'BANK'}
             </div>
          </div>

          <div className="mt-4">
            <div className="text-2xl font-mono tracking-widest drop-shadow-md">
              {formattedNumber}
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div>
              <div className="text-[10px] text-neutral-300 uppercase tracking-wider mb-1">Nome do Titular</div>
              <div className="font-medium tracking-wide truncate max-w-[200px] uppercase">
                {holderName || 'SEU NOME AQUI'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-neutral-300 uppercase tracking-wider mb-1">Validade</div>
              <div className="font-mono">
                {expiryMonth || 'MM'}/{expiryYear ? expiryYear.slice(-2) : 'AA'}
              </div>
            </div>
          </div>
        </div>

        {/* Verso */}
        <div className="absolute w-full h-full backface-hidden rounded-2xl bg-gradient-to-bl from-neutral-800 to-neutral-900 text-white shadow-xl rotate-y-180 border border-white/10"
             style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          
          <div className="w-full h-10 bg-black mt-6 opacity-80"></div>
          
          <div className="p-6 pt-4">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-neutral-300 uppercase tracking-wider mb-1 mr-1">CVV</div>
                <div className="w-full h-10 bg-white text-neutral-900 flex items-center justify-end px-3 font-mono font-bold rounded">
                    {ccv || '•••'}
                </div>
            </div>
            
            <div className="mt-6 flex items-center justify-center opacity-50">
                <span className="material-symbols-outlined text-4xl">contactless</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditCardVisual;
