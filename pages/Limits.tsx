import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/contexts/AuthContext';
import type { CategoryDB } from '../types';
import toast from 'react-hot-toast';
import CurrencyInput from '../components/CurrencyInput';

const Limits: React.FC = () => {
  const { user } = useAuth()
  const [categories, setCategories] = useState<CategoryDB[]>([])
  const [limits, setLimits] = useState<Record<string, number>>({})
  const [monthTotals, setMonthTotals] = useState<Record<string, number>>({})

  const expenseCategories = useMemo(() => categories.filter(c => c.type === 'expense'), [categories])

  const loadData = async () => {
    if (!user) return
    const { data: cats } = await supabase.from('categories').select('*').eq('user_id', user.id)
    setCategories(cats || [])
    const { data: lims } = await supabase.from('limits').select('*').eq('user_id', user.id)
    const limMap: Record<string, number> = {}
    (lims || []).forEach(l => { limMap[l.category_id] = l.limit_amount })
    setLimits(limMap)
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10)
    const end = new Date(now.getFullYear(), now.getMonth()+1, 1).toISOString().slice(0,10)
    const { data: txs } = await supabase.from('transactions').select('*').eq('user_id', user.id).gte('date', start).lt('date', end).eq('type','expense')
    const totals: Record<string, number> = {}
    (txs || []).forEach(t => { totals[t.category_id] = (totals[t.category_id] || 0) + t.amount })
    setMonthTotals(totals)
  }

  useEffect(() => { loadData() }, [user])

  const saveChanges = async () => {
    if (!user) return
    for (const catId of Object.keys(limits)) {
      const existing = await supabase.from('limits').select('id').eq('user_id', user.id).eq('category_id', catId).single()
      if (existing.data?.id) {
        await supabase.from('limits').update({ limit_amount: limits[catId] }).eq('id', existing.data.id)
      } else {
        await supabase.from('limits').insert({ user_id: user.id, category_id: catId, limit_amount: limits[catId] })
      }
    }
    toast.success('Limites salvos')
  }

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
                    Configuração de Limites
                  </p>
                  <p className="text-neutral-500 dark:text-neutral-400 text-base font-normal leading-normal">
                    Defina limites de gastos mensais para suas categorias.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link to="/settings" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary/10 dark:bg-background-light/10 text-primary dark:text-background-light text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/20 transition-colors">
                    <span className="truncate">Cancelar</span>
                  </Link>
                  <button onClick={saveChanges} className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-background-light dark:bg-background-light dark:text-primary text-sm font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity">
                    <span className="truncate">Salvar Alterações</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-xl p-4 sm:p-6 border border-primary/10 dark:border-background-light/10 bg-white dark:bg-background-dark/50 shadow-sm">
                <div className="grid grid-cols-5 items-center gap-4 px-4 py-2 border-b border-primary/10 dark:border-background-light/10">
                  <p className="col-span-2 text-sm font-bold text-neutral-600 dark:text-neutral-300">Categoria</p>
                  <p className="text-sm font-bold text-neutral-600 dark:text-neutral-300">Gasto Atual</p>
                  <p className="text-sm font-bold text-neutral-600 dark:text-neutral-300">Limite Mensal</p>
                  <p className="text-sm font-bold text-neutral-600 dark:text-neutral-300">Progresso</p>
                </div>
                <div className="flex flex-col">
                  {expenseCategories.map((cat) => {
                    const spent = monthTotals[cat.id] || 0
                    const limitAmount = limits[cat.id] || 0
                    const percentage = limitAmount ? Math.min(100, Math.round((spent / limitAmount) * 100)) : 0
                    return (
                      <div key={cat.id} className="grid grid-cols-5 items-center gap-4 p-4 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                        <div className="col-span-2 flex items-center gap-3">
                          <div className="flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary">
                            <span className="material-symbols-outlined">{cat.icon || 'category'}</span>
                          </div>
                          <p className="font-semibold text-primary dark:text-background-light">{cat.name}</p>
                        </div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">R$ {spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        <div className="relative">
                          <CurrencyInput
                            className="w-full bg-primary/5 dark:bg-background-light/5 border-primary/10 dark:border-background-light/10 rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={limitAmount}
                            onValueChange={(val) => setLimits(prev => ({ ...prev, [cat.id]: Number(val) }))}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-primary/10 dark:bg-background-light/10 h-2 rounded-full overflow-hidden">
                            <div className={`bg-red-500 h-full rounded-full`} style={{ width: `${percentage}%` }}></div>
                          </div>
                          <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{percentage}%</span>
                        </div>
                      </div>
                    )
                  })}
                  {expenseCategories.length === 0 && <p className="p-4 text-center text-neutral-500">Nenhuma categoria de despesa encontrada.</p>}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Limits;
