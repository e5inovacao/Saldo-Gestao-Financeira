import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/contexts/AuthContext';
import type { CategoryDB, SubcategoryDB } from '../types';
import toast from 'react-hot-toast';
import CurrencyInput from '../components/CurrencyInput';

const Limits: React.FC = () => {
  const { user } = useAuth()
  const [categories, setCategories] = useState<CategoryDB[]>([])
  const [subcategories, setSubcategories] = useState<SubcategoryDB[]>([])
  // Map: subcategory_id -> limit_amount
  const [limits, setLimits] = useState<Record<string, number>>({})
  // Map: subcategory_id -> spent_amount
  const [monthTotals, setMonthTotals] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  const expenseCategories = useMemo(() => {
      return (categories || []).filter(c => c.type === 'expense')
  }, [categories])

  const subMap = useMemo(() => {
    const m: Record<string, SubcategoryDB[]> = {}
    subcategories.forEach(s => { 
        if (!m[s.category_id]) m[s.category_id] = []
        m[s.category_id].push(s) 
    })
    return m
  }, [subcategories])

  const loadData = async () => {
    if (!user) return
    setLoading(true)
    try {
        // 1. Fetch Categories
        const { data: cats, error: catError } = await supabase.from('categories').select('*').eq('user_id', user.id)
        if (catError) throw catError
        setCategories(cats || [])

        // 2. Fetch Subcategories
        const { data: subs, error: subError } = await supabase.from('subcategories').select('*')
        if (subError) throw subError
        setSubcategories(subs || [])

        // 3. Fetch Limits (Subcategory based)
        const { data: lims, error: limError } = await supabase.from('limits').select('*').eq('user_id', user.id)
        if (limError) throw limError
        
        const limMap: Record<string, number> = {}
        if (lims && Array.isArray(lims)) {
            lims.forEach(l => { 
                if (l.subcategory_id) limMap[l.subcategory_id] = l.limit_amount 
            })
        }
        setLimits(limMap)

        // 4. Fetch Transactions (Current Month)
        const now = new Date()
        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10)
        // Last day of month logic or just next month 1st
        const end = new Date(now.getFullYear(), now.getMonth()+1, 1).toISOString().slice(0,10)
        
        const { data: txs, error: txError } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .gte('date', start)
            .lt('date', end)
            .eq('type','expense')
        
        if (txError) throw txError

        const totals: Record<string, number> = {}
        if (txs && Array.isArray(txs)) {
            txs.forEach(t => { 
                if (t.subcategory_id) {
                    totals[t.subcategory_id] = (totals[t.subcategory_id] || 0) + Math.abs(t.amount)
                }
            })
        }
        setMonthTotals(totals)
    } catch (e) {
        const error = e as Error | { message?: string }
        console.error('Erro ao carregar dados de limites:', error)
        toast.error(`Erro ao carregar limites: ${(error as any).message || 'Erro desconhecido'}`)
    } finally {
        setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [user])

  // Debounced Save Function
  const saveLimit = async (subId: string, amount: number) => {
    if (!user) return
    try {
        const sub = subcategories.find(s => s.id === subId)
        if (!sub) return

        const existing = await supabase.from('limits').select('id').eq('user_id', user.id).eq('subcategory_id', subId).single()
        
        if (existing.data?.id) {
            await supabase.from('limits').update({ 
                limit_amount: amount,
                updated_at: new Date().toISOString()
            }).eq('id', existing.data.id)
        } else {
            await supabase.from('limits').insert({ 
                user_id: user.id, 
                category_id: sub.category_id,
                subcategory_id: subId, 
                limit_amount: amount 
            })
        }
    } catch (e) {
        console.error('Error saving limit:', e)
        toast.error('Erro ao salvar limite')
    }
  }

  // Handle Input Change with Debounce
  const handleLimitChange = (subId: string, val: string) => {
      const amount = Number(val)
      setLimits(prev => ({ ...prev, [subId]: amount }))
      
      // Clear existing timer
      const timerId = (window as any)[`timeout_${subId}`]
      if (timerId) clearTimeout(timerId)

      // Set new timer
      ;(window as any)[`timeout_${subId}`] = setTimeout(() => {
          saveLimit(subId, amount)
      }, 800) // 800ms delay
  }

  // Original Save Button (Keep as Force Save)
  const saveChanges = async () => {
    // ... same logic but maybe refresh data
    const toastId = toast.loading('Sincronizando...')
    // ... logic ...
    // Since we autosave, this button might just be "Ensure Synced" or similar
    // Let's keep the logic to force save all just in case
    // ...
    // Copy-paste existing logic here but improve toast
    try {
        for (const subId of Object.keys(limits)) {
            // ... same implementation ...
             const sub = subcategories.find(s => s.id === subId)
            if (!sub) continue

            const existing = await supabase.from('limits').select('id').eq('user_id', user.id).eq('subcategory_id', subId).single()
            
            if (existing.data?.id) {
                await supabase.from('limits').update({ 
                    limit_amount: limits[subId],
                    updated_at: new Date().toISOString()
                }).eq('id', existing.data.id)
            } else {
                await supabase.from('limits').insert({ 
                    user_id: user.id, 
                    category_id: sub.category_id,
                    subcategory_id: subId, 
                    limit_amount: limits[subId] 
                })
            }
        }
        toast.success('Todos os limites sincronizados!', { id: toastId })
        loadData()
    } catch (e) {
        console.error(e)
        toast.error('Erro ao sincronizar', { id: toastId })
    }
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
                    Limites de Gastos
                  </p>
                  <p className="text-neutral-500 dark:text-neutral-400 text-base font-normal leading-normal">
                    Defina limites mensais por subcategoria para controlar seu orçamento.
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
                
                {loading ? (
                    <div className="p-8 text-center text-neutral-500">Carregando limites...</div>
                ) : expenseCategories.length === 0 ? (
                    <div className="p-8 text-center text-neutral-500">Nenhuma categoria de despesa encontrada.</div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {expenseCategories.map((cat) => {
                            const catSubs = subMap[cat.id] || []
                            if (catSubs.length === 0) return null // Skip categories without subcategories for now

                            return (
                                <div key={cat.id} className="flex flex-col gap-3">
                                    {/* Category Header */}
                                    <div className="flex items-center gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
                                        <div className="flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary">
                                            <span className="material-symbols-outlined text-sm">{cat.icon || 'category'}</span>
                                        </div>
                                        <h3 className="font-bold text-neutral-700 dark:text-neutral-200">{cat.name}</h3>
                                    </div>

                                    {/* Subcategories List */}
                                    <div className="flex flex-col gap-2 pl-4">
                                        {catSubs.map(sub => {
                                            const spent = monthTotals[sub.id] || 0
                                            const limitAmount = limits[sub.id] || 0
                                            const percentage = limitAmount ? Math.min(100, Math.round((spent / limitAmount) * 100)) : 0
                                            const isOverLimit = spent > limitAmount && limitAmount > 0
                                            const isWarning = spent > limitAmount * 0.9 && !isOverLimit

                                            return (
                                                <div key={sub.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                                                    {/* Name */}
                                                    <div className="md:col-span-4 font-medium text-neutral-600 dark:text-neutral-300">
                                                        {sub.name}
                                                    </div>

                                                    {/* Spent */}
                                                    <div className="md:col-span-2 text-sm text-neutral-500 dark:text-neutral-400">
                                                        Gasto: R$ {spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </div>

                                                    {/* Limit Input */}
                                                    <div className="md:col-span-3">
                                                        <CurrencyInput
                                                            className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md h-9 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                            value={limitAmount}
                                                            onValueChange={(val) => handleLimitChange(sub.id, val)}
                                                            placeholder="Definir limite"
                                                        />
                                                    </div>

                                                    {/* Progress */}
                                                    <div className="md:col-span-3 flex items-center gap-3">
                                                        <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden relative">
                                                            <div 
                                                                className={`h-full rounded-full transition-all duration-500 ${
                                                                    isOverLimit ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-green-500'
                                                                }`} 
                                                                style={{ width: `${Math.min(100, percentage)}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className={`text-xs font-bold whitespace-nowrap ${
                                                            isOverLimit ? 'text-red-500' : isWarning ? 'text-yellow-600' : 'text-neutral-500'
                                                        }`}>
                                                            {percentage}% {isOverLimit && '(Estourado)'}
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                        {expenseCategories.every(c => !subMap[c.id]?.length) && (
                            <div className="p-8 text-center">
                                <p className="text-neutral-500 mb-2">Você ainda não tem subcategorias cadastradas.</p>
                                <Link to="/categories" className="text-primary font-bold hover:underline">
                                    Gerenciar Categorias
                                </Link>
                            </div>
                        )}
                    </div>
                )}

              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Limits;
