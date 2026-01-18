import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import CurrencyInput from '../components/CurrencyInput';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/contexts/AuthContext';
import type { GoalDB } from '../types';
import toast from 'react-hot-toast';

const Goals: React.FC = () => {
  const { user } = useAuth()
  const [goals, setGoals] = useState<GoalDB[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddValueModalOpen, setIsAddValueModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<GoalDB | null>(null);
  
  // New Goal Form State
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetAmount: '',
    daysLeft: '',
    color: 'blue' as const,
  });

  // Add Value Form State
  const [addValueAmount, setAddValueAmount] = useState('');

  const handleAddGoal = async () => {
    if (!user || !newGoal.title || !newGoal.targetAmount) return;
    const days = parseInt(newGoal.daysLeft) || 0;
    const targetDate = days > 0 ? new Date(Date.now() + days * 86400000).toISOString().slice(0,10) : null
    const { data, error } = await supabase.from('goals').insert({
      user_id: user.id,
      title: newGoal.title,
      current_amount: 0,
      target_amount: parseFloat(newGoal.targetAmount),
      target_date: targetDate,
      color: newGoal.color,
      icon: 'flag',
      is_completed: false,
    }).select('*').single()
    if (error) { toast.error('Erro ao criar meta'); return }
    setGoals([...goals, data])
    setIsModalOpen(false);
    setNewGoal({ title: '', targetAmount: '', daysLeft: '', color: 'blue' });
  };

  const openAddValueModal = (goal: GoalDB) => {
    setSelectedGoal(goal);
    setAddValueAmount('');
    setIsAddValueModalOpen(true);
  };

  const handleAddValue = async () => {
    if (!selectedGoal || !addValueAmount) return;
    const valueToAdd = parseFloat(addValueAmount);
    const newAmount = (selectedGoal.current_amount || 0) + valueToAdd
    const isCompleted = newAmount >= selectedGoal.target_amount
    const { error } = await supabase.from('goals').update({ current_amount: newAmount, is_completed: isCompleted }).eq('id', selectedGoal.id)
    if (error) { toast.error('Erro ao adicionar valor'); return }
    setGoals(goals.map(g => g.id === selectedGoal.id ? { ...g, current_amount: newAmount, is_completed: isCompleted } : g))
    setIsAddValueModalOpen(false);
    setSelectedGoal(null);
  };

  const loadGoals = async () => {
    if (!user) return
    const { data } = await supabase.from('goals').select('*').eq('user_id', user.id)
    setGoals(data || [])
  }
  useEffect(() => { loadGoals() }, [user])

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col font-display-jakarta bg-background-light dark:bg-background-dark">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5 md:px-10 lg:px-20 xl:px-40">
          <div className="layout-content-container flex flex-col w-full max-w-[960px] flex-1">
            <Header />
            <main className="flex flex-col gap-6 md:gap-8 p-4 md:p-6 lg:p-8">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex min-w-72 flex-col gap-2">
                  <p className="text-primary dark:text-background-light text-4xl font-black leading-tight tracking-[-0.033em]">
                    Minhas Metas
                  </p>
                  <p className="text-neutral-500 dark:text-neutral-400 text-base font-normal leading-normal">
                    Defina e acompanhe seus objetivos financeiros.
                  </p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-background-light dark:bg-background-light dark:text-primary text-sm font-bold leading-normal tracking-[0.015em] gap-2 hover:opacity-90 transition-opacity"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  <span className="truncate">Nova Meta</span>
                </button>
              </div>

              {goals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-neutral-800/50 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700">
                  <span className="material-symbols-outlined text-4xl text-neutral-400 mb-2">flag</span>
                  <h3 className="text-lg font-bold text-neutral-700 dark:text-neutral-300">Nenhuma meta definida</h3>
                  <p className="text-neutral-500 dark:text-neutral-400 max-w-xs">
                    Comece definindo um objetivo financeiro para acompanhar seu progresso.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {goals.map((goal) => {
                    const percentage = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
                    return (
                      <div
                        key={goal.id}
                        className="flex flex-col gap-4 rounded-xl p-6 border border-primary/10 dark:border-background-light/10 bg-white dark:bg-background-dark/50 shadow-sm hover:shadow-md transition-shadow relative"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex flex-col gap-1">
                            <h3 className="text-lg font-bold text-primary dark:text-background-light">{goal.title}</h3>
                          </div>
                          <div
                            className={`flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary`}
                          >
                            <span className="material-symbols-outlined">flag</span>
                          </div>
                        </div>
                        <div className="w-full bg-primary/5 dark:bg-background-light/5 rounded-full h-2.5">
                          <div
                            className={`bg-primary h-2.5 rounded-full transition-all duration-1000`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-baseline">
                          <p className="text-primary dark:text-background-light text-base font-semibold">
                            R$ {goal.current_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            <span className="text-sm font-normal text-neutral-500 dark:text-neutral-400">
                              {' '}
                              / R$ {goal.target_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </p>
                          {goal.is_completed ? (
                            <p className="text-sm font-bold text-green-600 dark:text-green-400">Concluída!</p>
                          ) : (
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">{goal.target_date ? `Até ${goal.target_date}` : 'Sem prazo'}</p>
                          )}
                        </div>

                        {/* Add Value Button */}
                        <div className="pt-2 border-t border-primary/5 dark:border-background-light/5 mt-2">
                           <button 
                             onClick={() => openAddValueModal(goal)}
                             className="w-full py-2 flex items-center justify-center gap-2 text-sm font-bold text-primary/80 dark:text-background-light/80 hover:bg-primary/5 dark:hover:bg-background-light/5 rounded-lg transition-colors"
                           >
                              <span className="material-symbols-outlined text-base">add_circle</span>
                              Adicionar Valor
                           </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Add Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-xl border border-neutral-200 dark:border-neutral-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Nova Meta</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Título da Meta</label>
                <input 
                  type="text" 
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                  placeholder="Ex: Viagem de Férias"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Valor Alvo (R$)</label>
                <CurrencyInput 
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                  value={newGoal.targetAmount}
                  onValueChange={(val) => setNewGoal({...newGoal, targetAmount: val})}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Prazo (Dias)</label>
                <input 
                  type="number" 
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                  placeholder="Ex: 30"
                  value={newGoal.daysLeft}
                  onChange={(e) => setNewGoal({...newGoal, daysLeft: e.target.value})}
                />
                <p className="text-xs text-neutral-500">Será exibido como um cronômetro (ex: "Restam 23 dias").</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Cor</label>
                <div className="flex gap-3">
                  {['blue', 'green', 'yellow', 'purple', 'pink'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewGoal({...newGoal, color: color as any})}
                      className={`size-8 rounded-full border-2 ${newGoal.color === color ? 'border-primary dark:border-white scale-110' : 'border-transparent'}`}
                    >
                      <div className={`w-full h-full rounded-full bg-${color}-500`}></div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddGoal}
                disabled={!newGoal.title || !newGoal.targetAmount}
                className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Salvar Meta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Value Modal */}
      {isAddValueModalOpen && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-xl border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Adicionar Valor</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
              Quanto você economizou para <strong>{selectedGoal.title}</strong>?
            </p>

            <div className="flex flex-col gap-2 mb-6">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Valor (R$)</label>
                <CurrencyInput 
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                  value={addValueAmount}
                  onValueChange={(val) => setAddValueAmount(val)}
                  autoFocus
                />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsAddValueModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddValue}
                disabled={!addValueAmount}
                className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Goals;
