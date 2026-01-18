import React from 'react';
import { Link } from 'react-router-dom';
import PublicHeader from '../components/PublicHeader';

const LandingPage: React.FC = () => {
  return (
    <div className="font-display-manrope relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 sm:px-8 md:px-20 lg:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            
            <PublicHeader />

            <main className="flex-grow">
              {/* Hero */}
              <div className="@container">
                <div className="flex flex-col gap-12 px-4 py-10 md:flex-row-reverse md:items-center md:gap-20">
                  <div className="flex-1">
                    <div
                      className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl shadow-xl"
                      data-alt="Ilustração de planejamento financeiro"
                      style={{
                        backgroundImage:
                          'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD9WVd-1RmJLJWB-hiaxYK8AkK9PTXhRtwD-B_aycf2UP96vSFmsBTw821ZxKNC0FooPg2h_Dy1XAFEe-HbmCDE96joIWLBwIkBjjZZIJV900hssaRMb32PZwdDipKmULpywLANZ6tZb_ToCCIEbKwhfpoNUzINOq_D6ZgPSYgnHwaskaSOaRNPVRdoA_qPPYTM1Jo997aqylgOxstKP1rNke4lVMvn-gwfkF66YBs3J3BvXut3DLSmMbnjsLFYYVuaB_U414l4ihQ")',
                      }}
                    ></div>
                  </div>
                  <div className="flex flex-1 flex-col gap-6 justify-center">
                    <div className="flex flex-col gap-2 text-left">
                      <h1 className="text-gray-900 dark:text-gray-100 text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl">
                        Assuma o controle do seu dinheiro
                      </h1>
                      <h2 className="text-gray-700 dark:text-gray-300 text-sm font-normal leading-normal md:text-base">
                        O <strong>Saldo Gestão Financeira</strong> é a ferramenta completa para organizar suas despesas, definir metas e alcançar sua liberdade financeira.
                      </h2>
                    </div>
                    <Link
                      to="/signup"
                      className="flex min-w-[84px] w-full md:w-auto max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 md:h-12 md:px-5 bg-transparent border-2 border-primary-landing text-primary-landing text-sm font-bold leading-normal tracking-[0.015em] md:text-base hover:bg-primary-landing hover:text-white transition-colors"
                    >
                      <span className="truncate">Comece o Teste Grátis</span>
                    </Link>
                    <Link
                        to="/login"
                        className="flex min-w-[84px] w-full md:w-auto max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 md:h-12 md:px-5 bg-transparent text-primary-landing text-sm font-bold leading-normal tracking-[0.015em] md:text-base hover:text-green-700 transition-colors"
                    >
                        <span className="truncate">Fazer Login</span>
                    </Link>
                  </div>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">
                Usado por mais de 5.000 pessoas
              </p>

              {/* Como Funciona Summary (Kept as a summary) */}
              <section className="py-12 md:py-20" id="como-funciona">
                <div className="px-4">
                  <div className="text-center mb-12">
                    <h2 className="text-gray-900 dark:text-gray-100 text-3xl font-bold leading-tight tracking-[-0.015em]">
                      Como Funciona
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 mt-2">
                      Organize sua vida financeira em 3 passos simples.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { icon: 'person_add', title: '1. Crie sua conta', desc: 'Cadastre-se rapidamente e configure seu perfil.' },
                      { icon: 'paid', title: '2. Registre seus gastos', desc: 'Adicione suas receitas e despesas para ter clareza para onde vai seu dinheiro.' },
                      { icon: 'rocket_launch', title: '3. Alcance seus objetivos', desc: 'Defina orçamentos, crie metas e acompanhe seu progresso.' },
                    ].map((step, idx) => (
                      <div key={idx} className="flex flex-col items-center text-center">
                        <div className="flex items-center justify-center size-12 rounded-full bg-primary-landing/10 text-primary-landing mb-4">
                          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {step.icon}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{step.title}</h3>
                        <p className="text-gray-700 dark:text-gray-300 mt-1">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center mt-8">
                    <Link to="/how-it-works" className="text-primary-landing font-bold hover:underline">
                      Saiba mais detalhes
                    </Link>
                  </div>
                </div>
              </section>

              {/* Plans */}
              <div className="pt-12 pb-6" id="planos">
                <h2 className="text-gray-900 dark:text-gray-100 text-center text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                  Escolha seu plano
                </h2>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 px-4 py-3">
                    {/* Monthly */}
                  <div className="flex flex-1 flex-col gap-4 rounded-xl border border-solid border-gray-200 dark:border-gray-700 bg-background-light dark:bg-background-dark p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-gray-900 dark:text-gray-100 text-base font-bold leading-tight">Mensal</h3>
                      <p className="flex items-baseline gap-1 text-gray-900 dark:text-gray-100">
                        <span className="text-4xl font-black leading-tight tracking-[-0.033em]">R$19.90</span>
                        <span className="text-base font-bold leading-tight">/mês</span>
                      </p>
                    </div>
                    <Link to="/signup?plan=monthly" className="flex w-full min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                      <span className="truncate">Escolher Plano</span>
                    </Link>
                    <div className="flex flex-col gap-3 pt-2">
                        {['Orçamentos Ilimitados', 'Acompanhamento de Metas', 'Relatórios Completos'].map(feat => (
                            <div key={feat} className="text-[13px] font-normal leading-normal flex items-center gap-3 text-gray-900 dark:text-gray-100">
                                <span className="material-symbols-outlined text-primary-landing text-base">check_circle</span> {feat}
                            </div>
                        ))}
                    </div>
                  </div>

                  {/* Yearly */}
                  <div className="flex flex-1 flex-col gap-4 rounded-xl border border-solid border-primary-landing bg-primary-landing/10 dark:bg-primary-landing/20 p-6 shadow-lg relative transform scale-105 z-10">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-gray-900 dark:text-gray-100 text-base font-bold leading-tight">Anual</h3>
                        <p className="text-white text-xs font-medium leading-normal tracking-[0.015em] rounded-full bg-primary-landing px-3 py-[3px] text-center">
                          Mais Popular
                        </p>
                      </div>
                      <p className="flex items-baseline gap-1 text-gray-900 dark:text-gray-100">
                        <span className="text-4xl font-black leading-tight tracking-[-0.033em]">R$199.90</span>
                        <span className="text-base font-bold leading-tight">/ano</span>
                      </p>
                    </div>
                    <Link to="/signup" className="flex w-full min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary-landing text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary-dark transition-colors">
                      <span className="truncate">Escolher Plano</span>
                    </Link>
                    <div className="flex flex-col gap-3 pt-2">
                         {['Todos os recursos', 'Economize 15% na assinatura', 'Exportação de Dados'].map(feat => (
                            <div key={feat} className="text-[13px] font-normal leading-normal flex items-center gap-3 text-gray-900 dark:text-gray-100">
                                <span className="material-symbols-outlined text-primary-landing text-base">check_circle</span> {feat}
                            </div>
                        ))}
                    </div>
                  </div>

                  {/* Quarterly */}
                  <div className="flex flex-1 flex-col gap-4 rounded-xl border border-solid border-gray-200 dark:border-gray-700 bg-background-light dark:bg-background-dark p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-gray-900 dark:text-gray-100 text-base font-bold leading-tight">Trimestral</h3>
                      <p className="flex items-baseline gap-1 text-gray-900 dark:text-gray-100">
                        <span className="text-4xl font-black leading-tight tracking-[-0.033em]">R$54.90</span>
                        <span className="text-base font-bold leading-tight">/trimestre</span>
                      </p>
                    </div>
                    <Link to="/signup?plan=quarterly" className="flex w-full min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                      <span className="truncate">Escolher Plano</span>
                    </Link>
                    <div className="flex flex-col gap-3 pt-2">
                        {['Todos os recursos do Mensal', 'Economize 5%', 'Suporte por Email'].map(feat => (
                            <div key={feat} className="text-[13px] font-normal leading-normal flex items-center gap-3 text-gray-900 dark:text-gray-100">
                                <span className="material-symbols-outlined text-primary-landing text-base">check_circle</span> {feat}
                            </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonials */}
              <section className="py-12 md:py-20" id="testemunhos">
                <div className="px-4">
                  <div className="text-center mb-12">
                    <h2 className="text-gray-900 dark:text-gray-100 text-3xl font-bold leading-tight tracking-[-0.015em]">
                      O que nossos usuários dizem
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 mt-2">
                      Histórias reais de quem transformou sua vida financeira.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        { text: "Mudou completamente como eu lido com meu dinheiro. Agora sei exatamente para onde vai cada centavo.", name: "Carlos M.", time: "Usuário há 1 ano", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAqnXg6_y14R2iopi1Thqm0SzseYv9cHZ-39U5IgfPqfGc7CwNjOyHRNBtZzXAjx9kOCOC0RqOuvkEKWBdhSqNyE8aY5vzBk3-Lg3DIC7A-edxuMkcH6Phgcnh9MBSTqvQpL9z0nziSRP0YFPqr-ycD-GYPDFtLQLFUlM1IP9z8px5WE5RGF_vovWlbfx5mUQcgonZFp8wtX3UJhUI8ulyPV2cjUaULaXyAb7djcVE-4O46q-1KHvuaujnZTmxJwCWZhrFkHciVngY" },
                        { text: "Consegui juntar dinheiro para minha viagem dos sonhos usando o sistema de metas. Simples e eficaz.", name: "Sofia L.", time: "Usuária há 6 meses", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCS5QnS5G-FMZi2duoqYItAM_zUq04DhxCniiTHSbp9J7dYs-XMkbw8BIDSd5WPYgwm1kiGY6BK1gkr6KOxJgUJT4jsq-6ecrBCF9aO3XfS9V_o7we2VBJ7JPezijH4Eb2S0P_SendAnpImpc3HOluo5sXF5jHP6tI0xuM-IaZ1UcHPE_qp8weRC-7lM1E6TV8YKUZHmcTWVcTeavZN2opqgD0OgEN-MORBXOSx5RaFse3UUmYKoy6ConPkSzyS8DNwkRW60xl0_BA" },
                        { text: "Interface limpa e intuitiva. O melhor app de finanças pessoais que já usei.", name: "Marcos P.", time: "Usuário há 2 anos", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCz3KIS5KZfc5SIWsLgoZwEXm5fDpyJ9K_L23tbQHu-VDqWW9GNA73w3LfCFADy9cGKth3tHTq4ROsWb8hwt8gWmYPO2YRvL7DOBP2lRdiOIAwdjwOGvZtag6PpO_qOFbgU2h5O_3EvTb9a18aChm0Gl3uukUcHE6jryLpZRozdr_CW_dH3RXf9C7LHq2jV81e8l_7vkavMJwcCzfHGLAnXyVbbUmJoTNnbNuboCsy6ALklGNCySUbQyi9SliSBDEUXXzGXWCW5Dfc" }
                    ].map((t, idx) => (
                        <div key={idx} className="p-6 rounded-xl border border-solid border-gray-200 dark:border-gray-700 bg-background-light dark:bg-background-dark">
                          <p className="text-gray-700 dark:text-gray-300">"{t.text}"</p>
                          <div className="flex items-center mt-4">
                            <img alt={`Foto de ${t.name}`} className="w-10 h-10 rounded-full object-cover" src={t.img} />
                            <div className="ml-3">
                              <p className="font-bold text-gray-900 dark:text-gray-100">{t.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{t.time}</p>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* FAQ */}
              <section className="py-12 md:py-20" id="faq">
                <div className="px-4">
                  <div className="text-center mb-12">
                    <h2 className="text-gray-900 dark:text-gray-100 text-3xl font-bold leading-tight tracking-[-0.015em]">
                      Perguntas Frequentes
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 mt-2">
                      Tire suas dúvidas.
                    </p>
                  </div>
                  <div className="max-w-3xl mx-auto space-y-4">
                    {[
                        { q: "Meus dados estão seguros?", a: "Sim, utilizamos criptografia avançada para garantir que apenas você tenha acesso às suas informações financeiras." },
                        { q: "Posso cancelar quando quiser?", a: "Sim, sem contratos de longo prazo. Você pode cancelar a qualquer momento nas configurações da sua conta." },
                        { q: "Existe versão mobile?", a: "Nosso site é totalmente responsivo e funciona perfeitamente em qualquer dispositivo móvel." }
                    ].map((faq, idx) => (
                        <details key={idx} className="group rounded-lg bg-gray-50 dark:bg-gray-800/50 p-6">
                            <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-gray-900 dark:text-white">
                                <h3 className="text-lg font-bold">{faq.q}</h3>
                                <span className="relative size-5 shrink-0">
                                <span className="material-symbols-outlined absolute inset-0 size-5 opacity-100 group-open:opacity-0">add</span>
                                <span className="material-symbols-outlined absolute inset-0 size-5 opacity-0 group-open:opacity-100">remove</span>
                                </span>
                            </summary>
                            <p className="mt-4 leading-relaxed text-gray-700 dark:text-gray-300">
                                {faq.a}
                            </p>
                        </details>
                    ))}
                  </div>
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;