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
             style={{ 
                 backfaceVisibility: 'hidden',
                 backgroundImage: 'linear-gradient(135deg, #1f1f1f 0%, #0a0a0a 100%)',
                 boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05), 0 20px 40px -10px rgba(0,0,0,0.5)'
             }}>
          
          {/* Chip and Contactless */}
          <div className="flex justify-between items-start">
             <div className="w-12 h-9 bg-yellow-500/20 rounded-md border border-yellow-500/40 flex items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/20 to-yellow-600/20"></div>
                 <div className="w-full h-[1px] bg-yellow-500/30 absolute top-1/3"></div>
                 <div className="w-full h-[1px] bg-yellow-500/30 absolute bottom-1/3"></div>
                 <div className="h-full w-[1px] bg-yellow-500/30 absolute left-1/3"></div>
                 <div className="h-full w-[1px] bg-yellow-500/30 absolute right-1/3"></div>
                 <div className="w-6 h-4 bg-yellow-400/80 rounded-sm relative z-10 opacity-80"></div>
             </div>
             <div className="flex flex-col items-end">
                 <span className="material-symbols-outlined text-2xl opacity-80 rotate-90">wifi</span>
                 <div className="text-xl font-bold italic tracking-wider uppercase opacity-90 mt-1">
                     {cardType !== 'unknown' ? cardType : 'BANK'}
                 </div>
             </div>
          </div>

          <div className="mt-2">
            <div className="text-2xl font-mono tracking-widest drop-shadow-md" style={{ fontFamily: '"OCR A Std", "monospace"', letterSpacing: '0.15em', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              {formattedNumber}
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div>
              <div className="text-[9px] text-neutral-400 uppercase tracking-widest mb-0.5">Nome do Titular</div>
              <div className="font-medium tracking-wide truncate max-w-[200px] uppercase text-sm" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                {holderName || 'SEU NOME AQUI'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[9px] text-neutral-400 uppercase tracking-widest mb-0.5">Validade</div>
              <div className="font-mono text-sm" style={{ fontFamily: '"OCR A Std", "monospace"' }}>
                {expiryMonth || 'MM'}/{expiryYear ? expiryYear.slice(-2) : 'AA'}
              </div>
            </div>
          </div>
        </div>

        {/* Verso */}
        <div className="absolute w-full h-full backface-hidden rounded-2xl bg-gradient-to-bl from-neutral-800 to-neutral-900 text-white shadow-xl rotate-y-180 border border-white/10"
             style={{ 
                 backfaceVisibility: 'hidden', 
                 transform: 'rotateY(180deg)',
                 backgroundImage: 'linear-gradient(135deg, #1f1f1f 0%, #0a0a0a 100%)'
             }}>
          
          <div className="w-full h-12 bg-black mt-6 opacity-90"></div>
          
          <div className="p-6 pt-4">
            <div className="flex flex-col items-end relative">
                <div className="text-[9px] text-neutral-400 uppercase tracking-widest mb-1 mr-1">CVV</div>
                <div className="w-full h-10 bg-white text-neutral-900 flex items-center justify-end px-3 font-mono font-bold rounded bg-opacity-90 bg-stripes-gray">
                    <span className="mr-2 italic opacity-50 text-xs">CVV</span>
                    {ccv || '•••'}
                </div>
            </div>
            
            <div className="mt-8 flex items-center justify-between opacity-50">
                <div className="text-[8px] max-w-[150px] leading-tight">
                    Este cartão é propriedade do emissor. O uso deste cartão implica na aceitação dos termos e condições.
                </div>
                <div className="text-xl font-bold italic tracking-wider uppercase">
                     {cardType !== 'unknown' ? cardType : 'BANK'}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditCardVisual;
