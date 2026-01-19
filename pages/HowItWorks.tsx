import React from 'react';
import PublicHeader from '../components/PublicHeader';
import { Link } from 'react-router-dom';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      title: 'Dashboard Intuitivo',
      description: 'Tenha uma visão clara de suas finanças assim que entrar. Acompanhe seu saldo atual, receitas e despesas do mês, além de um gráfico interativo e calendário para visualizar seu fluxo de caixa.',
      icon: 'dashboard',
      image: '/img_landingpage/img_01_controle.png'
    },
    {
      title: 'Controle de Transações',
      description: 'Registre cada gasto ou ganho com facilidade. Categorize suas movimentações (Alimentação, Transporte, Lazer, etc.) para entender exatamente para onde seu dinheiro está indo.',
      icon: 'receipt_long',
      image: '/img_landingpage/img_01_controle.png'
    },
    {
      title: 'Metas Financeiras',
      description: 'Sonha em viajar, comprar uma casa ou montar sua reserva de emergência? Crie metas personalizadas, defina valores alvo e acompanhe visualmente o quanto falta para realizar seus sonhos.',
      icon: 'flag',
      image: '/img_landingpage/img_02_metas.png'
    },
    {
      title: 'Categorias Personalizáveis',
      description: 'O Saldo se adapta a você. Crie suas próprias categorias e subcategorias para organizar suas finanças da maneira que fizer mais sentido para sua realidade.',
      icon: 'category',
      image: '/img_landingpage/img_03_categorias.png'
    }
  ];

  return (
    <div className="font-display-manrope relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 sm:px-8 md:px-20 lg:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <PublicHeader />

            <main className="flex-grow py-12 md:py-20">
              {/* Hero Section */}
              <div className="text-center mb-16 md:mb-24 px-4">
                <h1 className="text-gray-900 dark:text-gray-100 text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em] mb-6">
                  Como o Saldo funciona
                </h1>
                <p className="text-gray-700 dark:text-gray-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                  Uma plataforma completa e intuitiva projetada para colocar você no controle total da sua vida financeira.
                </p>
              </div>

              {/* Feature Steps */}
              <div className="flex flex-col gap-20">
                {steps.map((step, index) => (
                  <div 
                    key={index} 
                    className={`flex flex-col md:flex-row gap-8 md:gap-16 items-center ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
                  >
                    {/* Text Side */}
                    <div className="flex-1 flex flex-col gap-4 text-left">
                      <div className="flex items-center justify-center size-14 rounded-full bg-primary-landing/10 text-primary-landing mb-2 w-fit">
                        <span className="material-symbols-outlined text-3xl">
                          {step.icon}
                        </span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {step.title}
                      </h2>
                      <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    {/* Image Side */}
                    <div className="flex-1 w-full">
                       <div
                        className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 relative overflow-hidden group"
                        style={{
                            backgroundImage: `url("${step.image}")`,
                        }}
                        >
                            {/* Overlay para suavizar cores se necessário e dar o tom "clay" unificado */}
                            <div className="absolute inset-0 bg-orange-50/10 dark:bg-black/10 transition-opacity"></div>
                        </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom CTA */}
              <div className="mt-24 bg-primary-landing/5 dark:bg-primary-landing/10 rounded-2xl p-8 md:p-12 text-center">
                <h2 className="text-gray-900 dark:text-gray-100 text-2xl md:text-3xl font-bold mb-4">
                  Pronto para transformar suas finanças?
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-8 max-w-xl mx-auto">
                  Junte-se a milhares de usuários que já assumiram o controle do seu dinheiro com o Saldo.
                </p>
                <Link
                  to="/dashboard"
                  className="inline-flex min-w-[180px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary-landing text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-blue-700 transition-colors shadow-md"
                >
                  Começar Agora
                </Link>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;