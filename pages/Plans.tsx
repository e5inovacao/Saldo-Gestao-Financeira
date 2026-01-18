import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import toast from 'react-hot-toast';

const Plans: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const handlePlanClick = (amount: number, description: string, cycle: string) => {
      console.log('Plano selecionado:', description, cycle); // Debug
      if (!user) {
          toast.error('Você precisa estar logado.');
          return;
      }
      
      // Redireciona para a página de checkout
      navigate(`/checkout?plan=${cycle}&amount=${amount}&description=${encodeURIComponent(description)}`);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display-jakarta flex flex-col relative">
      
      {/* Simple Header */}
      <header className="flex justify-center py-6 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="flex items-center gap-3">
            <div className="size-8 text-primary dark:text-white">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="48" height="48" rx="12" fill="currentColor" fillOpacity="0.1"/>
                    <path d="M24 24V10C16.268 10 10 16.268 10 24C10 31.732 16.268 38 24 38C31.732 38 38 31.732 38 24H24Z" fill="currentColor"/>
                    <path d="M28 20V10C33.5228 10 38 14.4772 38 20H28Z" fill="currentColor" fillOpacity="0.5"/>
                </svg>
            </div>
            <span className="font-black text-xl text-primary dark:text-white tracking-tight">Saldo</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="max-w-5xl w-full flex flex-col gap-10">
            
            <div className="text-center flex flex-col gap-3 animate-fade-in">
                <div className="inline-flex items-center justify-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-1.5 rounded-full text-sm font-bold w-fit mx-auto">
                    <span className="material-symbols-outlined text-lg">verified</span>
                    7 dias grátis em todos os planos
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-neutral-900 dark:text-white">
                    Escolha o plano ideal para você
                </h1>
                <p className="text-neutral-500 dark:text-neutral-400 text-lg max-w-2xl mx-auto">
                    Comece seu teste gratuito agora. Cancele a qualquer momento nas configurações se não amar o Saldo.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                
                {/* Monthly */}
                <div className="flex flex-col gap-6 p-8 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Mensal</h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-neutral-900 dark:text-white">R$ 19,90</span>
                            <span className="text-neutral-500 dark:text-neutral-400">/mês</span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-2">Cobrado mensalmente</p>
                    </div>
                    
                    <button 
                        onClick={() => handlePlanClick(19.90, 'Plano Mensal - Saldo', 'MONTHLY')}
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-white font-bold hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Processando...' : 'Assinar Mensal'}
                    </button>

                    <ul className="flex flex-col gap-3">
                        <li className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
                            <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                            Acesso total ao app
                        </li>
                        <li className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
                            <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                            Metas ilimitadas
                        </li>
                        <li className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
                            <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                            Cancele quando quiser
                        </li>
                    </ul>
                </div>

                {/* Yearly - Highlighted */}
                <div className="relative flex flex-col gap-6 p-8 rounded-2xl bg-primary text-white shadow-xl hover:-translate-y-1 transition-all duration-300 scale-105 z-10">
                    <div className="absolute top-0 right-0 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
                        MAIS POPULAR
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white/90 mb-2">Anual</h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-white">R$ 199,90</span>
                            <span className="text-white/70">/ano</span>
                        </div>
                        <p className="text-xs text-white/60 mt-2">Equivalente a R$ 16,65/mês</p>
                    </div>
                    
                    <button 
                        onClick={() => handlePlanClick(199.90, 'Plano Anual - Saldo', 'YEARLY')}
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-white text-primary font-bold hover:bg-neutral-100 transition-colors shadow-md disabled:opacity-50"
                    >
                        {loading ? 'Processando...' : 'Assinar Anual (Melhor Oferta)'}
                    </button>

                    <ul className="flex flex-col gap-3">
                        <li className="flex items-center gap-3 text-sm text-white/90">
                            <span className="material-symbols-outlined text-white text-lg">check_circle</span>
                            Economize 15%
                        </li>
                        <li className="flex items-center gap-3 text-sm text-white/90">
                            <span className="material-symbols-outlined text-white text-lg">check_circle</span>
                            Todos os recursos do mensal
                        </li>
                        <li className="flex items-center gap-3 text-sm text-white/90">
                            <span className="material-symbols-outlined text-white text-lg">check_circle</span>
                            Relatórios avançados
                        </li>
                         <li className="flex items-center gap-3 text-sm text-white/90">
                            <span className="material-symbols-outlined text-white text-lg">check_circle</span>
                            Suporte prioritário
                        </li>
                    </ul>
                </div>

                 {/* Quarterly */}
                 <div className="flex flex-col gap-6 p-8 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Trimestral</h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-neutral-900 dark:text-white">R$ 54,90</span>
                            <span className="text-neutral-500 dark:text-neutral-400">/trimestre</span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-2">Cobrado a cada 3 meses</p>
                    </div>
                    
                    <button 
                        onClick={() => handlePlanClick(54.90, 'Plano Trimestral - Saldo', 'QUARTERLY')}
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-white font-bold hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Processando...' : 'Assinar Trimestral'}
                    </button>

                    <ul className="flex flex-col gap-3">
                        <li className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
                            <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                            Economize 5%
                        </li>
                        <li className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
                            <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                            Acesso total
                        </li>
                        <li className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
                            <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                            Renovação automática
                        </li>
                    </ul>
                </div>

            </div>

            <p className="text-center text-sm text-neutral-400 dark:text-neutral-500">
                A cobrança só será iniciada após o período de teste de 7 dias.<br/>
                Nenhuma cobrança será feita se você cancelar antes do fim do teste.
            </p>
        </div>
      </main>
    </div>
  );
};

export default Plans;