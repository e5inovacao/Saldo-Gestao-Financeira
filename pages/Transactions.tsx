import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/contexts/AuthContext';
import type { TransactionDB, CategoryDB } from '../types';

const Transactions: React.FC = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [monthFilter, setMonthFilter] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
  })
  const [page, setPage] = useState(0)
  const pageSize = 20
  const [transactions, setTransactions] = useState<TransactionDB[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [categories, setCategories] = useState<CategoryDB[]>([])

  const categoryName = useMemo(() => {
    const map = new Map<string, string>()
    categories.forEach(c => map.set(c.id, c.name))
    return map
  }, [categories])

  const loadCategories = async () => {
    if (!user) return
    const { data } = await supabase.from('categories').select('*').eq('user_id', user.id)
    setCategories(data || [])
  }

  const loadTransactions = async (reset = false) => {
    if (!user) return
    const start = `${monthFilter}-01`
    const endDate = new Date(Number(monthFilter.slice(0,4)), Number(monthFilter.slice(5,7)), 1)
    const end = new Date(endDate.getFullYear(), endDate.getMonth()+1, 1).toISOString().slice(0,10)
    let query = supabase.from('transactions').select('*').eq('user_id', user.id).gte('date', start).lt('date', end).order('date', { ascending: false })
    if (typeFilter !== 'all') query = query.eq('type', typeFilter)
    const from = reset ? 0 : page * pageSize
    const to = from + pageSize - 1
    const { data } = await query.range(from, to)
    if (reset) setTransactions(data || [])
    else setTransactions(prev => [...prev, ...(data || [])])
    setHasMore((data?.length || 0) === pageSize)
  }

  useEffect(() => { loadCategories() }, [user])
  useEffect(() => { setPage(0); loadTransactions(true) }, [user, typeFilter, monthFilter])
  useEffect(() => { if (page > 0) loadTransactions() }, [page])

  const filteredTransactions = transactions.filter((tx) => {
    const catName = categoryName.get(tx.category_id) || ''
    const matchesSearch = catName.toLowerCase().includes(searchTerm.toLowerCase()) || (tx.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  });

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col font-display-jakarta bg-background-light dark:bg-background-dark">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5 md:px-10 lg:px-20 xl:px-40">
          <div className="layout-content-container flex flex-col w-full max-w-[960px] flex-1">
            <Header />
            <main className="flex flex-col gap-6 md:gap-8 p-4 md:p-6 lg:p-8">
              
              {/* Page Header */}
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex min-w-72 flex-col gap-2">
                  <h1 className="text-primary dark:text-background-light text-4xl font-black leading-tight tracking-[-0.033em]">
                    Histórico de Transações
                  </h1>
                  <p className="text-neutral-500 dark:text-neutral-400 text-base font-normal leading-normal">
                    Gerencie e visualize todas as movimentações financeiras.
                  </p>
                </div>
                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-background-light dark:bg-background-light dark:text-primary text-sm font-bold leading-normal tracking-[0.015em] gap-2 hover:opacity-90 transition-opacity">
                  <span className="material-symbols-outlined text-lg">add</span>
                  <span className="truncate">Nova Transação</span>
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-primary/10 dark:border-background-light/10 bg-white dark:bg-background-dark/50 shadow-sm">
                <div className="flex-1 relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">search</span>
                  <input 
                    type="text" 
                    placeholder="Buscar por categoria..." 
                    className="w-full pl-10 bg-primary/5 dark:bg-background-light/5 border-primary/10 dark:border-background-light/10 rounded-lg h-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-48">
                  <select 
                    className="w-full bg-primary/5 dark:bg-background-light/5 border-primary/10 dark:border-background-light/10 rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="all">Todas</option>
                    <option value="expense">Despesas</option>
                    <option value="income">Receitas</option>
                  </select>
                </div>
                <div className="w-full md:w-48">
                  <input 
                    type="month"
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    className="w-full bg-primary/5 dark:bg-background-light/5 border-primary/10 dark:border-background-light/10 rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Transactions List */}
              <div className="flex flex-col gap-2 rounded-xl border border-primary/10 dark:border-background-light/10 bg-white dark:bg-background-dark/50 shadow-sm overflow-hidden">
                {/* Table Header (Hidden on mobile) */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-primary/5 dark:bg-background-light/5 border-b border-primary/10 dark:border-background-light/10 text-sm font-bold text-neutral-600 dark:text-neutral-300">
                  <div className="col-span-1"></div>
                  <div className="col-span-5">Categoria/Descrição</div>
                  <div className="col-span-3">Data</div>
                  <div className="col-span-3 text-right">Valor</div>
                </div>

                {/* Rows */}
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 p-4 md:px-6 md:py-4 border-b last:border-0 border-primary/5 dark:border-background-light/5 hover:bg-primary/5 dark:hover:bg-background-light/5 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between md:col-span-6 md:justify-start gap-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary shrink-0`}
                          >
                            <span className="material-symbols-outlined">receipt_long</span>
                          </div>
                          <div>
                            <p className="font-bold text-primary dark:text-background-light text-base">{categoryName.get(tx.category_id) || 'Categoria'}</p>
                            <p className="md:hidden text-sm text-neutral-500 dark:text-neutral-400">{tx.date}</p>
                          </div>
                        </div>
                        {/* Mobile Amount */}
                        <p
                          className={`md:hidden font-bold ${
                            tx.type === 'expense' ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : '-'} R$ {Math.abs(tx.amount).toFixed(2).replace('.', ',')}
                        </p>
                      </div>

                      <div className="hidden md:flex items-center col-span-3 text-sm text-neutral-500 dark:text-neutral-400">
                        {tx.date}
                      </div>

                      <div className="hidden md:flex items-center justify-end col-span-3">
                        <p
                          className={`font-bold ${
                            tx.type === 'expense' ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : '-'} R$ {Math.abs(tx.amount).toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                   <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
                     Nenhuma transação encontrada.
                   </div>
                )}
              </div>
              
              {/* Pagination Mock */}
              <div className="flex justify-center items-center gap-2">
                {hasMore && (
                  <button onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-lg bg-primary text-white font-bold hover:opacity-90">Carregar mais</button>
                )}
              </div>

            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
