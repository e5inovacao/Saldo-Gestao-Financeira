import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/contexts/AuthContext';
import type { TransactionDB, CategoryDB, SubcategoryDB } from '../types';
import toast from 'react-hot-toast';
import CurrencyInput from '../components/CurrencyInput';

const Transactions: React.FC = () => {
  const { user } = useAuth()
  // ... (previous states)
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
  
  // New States for Subcategories and Modal
  const [allSubcategories, setAllSubcategories] = useState<SubcategoryDB[]>([]) // Raw data
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Transaction Form State
  const [newTx, setNewTx] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    type: 'expense' as 'expense' | 'income',
    categoryId: '',
    subcategoryId: ''
  });

  const categoryName = useMemo(() => {
    const map = new Map<string, string>()
    categories.forEach(c => map.set(c.id, c.name))
    return map
  }, [categories])

  // Map subcategory ID to Name for display
  const subcategoryName = useMemo(() => {
      const map = new Map<string, string>()
      allSubcategories.forEach(s => map.set(s.id, s.name))
      return map
  }, [allSubcategories])

  const loadCategoriesAndSubcategories = async () => {
    if (!user) return
    
    try {
        // Load Categories
        const { data: cats, error: catError } = await supabase.from('categories').select('*').eq('user_id', user.id)
        if (catError) console.error('Error loading categories:', catError)
        setCategories(cats || [])

        // Load Subcategories (Load ALL to ensure we have them)
        const { data: subs, error: subError } = await supabase.from('subcategories').select('*')
        if (subError) console.error('Error loading subcategories:', subError)
        setAllSubcategories(subs || [])
    } catch (e) {
        console.error('Exception loading data:', e)
    }
  }

  const loadTransactions = async (reset = false) => {
    // ... (rest of the function)
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

  useEffect(() => { loadCategoriesAndSubcategories() }, [user])
  useEffect(() => { setPage(0); loadTransactions(true) }, [user, typeFilter, monthFilter])
  useEffect(() => { if (page > 0) loadTransactions() }, [page])

  // Filtered Subcategories for the Modal Select
  // SIMPLIFIED LOGIC: Filter directly from allSubcategories based on selected categoryId
  const availableSubcategories = useMemo(() => {
      if (!newTx.categoryId) return []
      const filtered = allSubcategories.filter(s => s.category_id === newTx.categoryId)
      return filtered
  }, [newTx.categoryId, allSubcategories])

  // Reset subcategory when category changes
  useEffect(() => {
      setNewTx(prev => ({ ...prev, subcategoryId: '' }))
  }, [newTx.categoryId])

  const handleAddTransaction = async () => {
      if (!user || !newTx.amount || !newTx.categoryId || !newTx.description) {
          toast.error('Preencha os campos obrigatórios');
          return;
      }

      const { error } = await supabase.from('transactions').insert({
          user_id: user.id,
          description: newTx.description,
          amount: newTx.type === 'expense' ? -Math.abs(parseFloat(newTx.amount)) : Math.abs(parseFloat(newTx.amount)),
          date: newTx.date,
          type: newTx.type,
          category_id: newTx.categoryId,
          subcategory_id: newTx.subcategoryId || null
      })

      if (error) {
          toast.error('Erro ao salvar transação');
          console.error(error);
      } else {
          toast.success('Transação salva com sucesso!');
          setIsModalOpen(false);
          setNewTx({ description: '', amount: '', date: new Date().toISOString().slice(0, 10), type: 'expense', categoryId: '', subcategoryId: '' });
          loadTransactions(true);
      }
  }

  const filteredTransactions = transactions.filter((tx) => {
    const catName = categoryName.get(tx.category_id) || ''
    const subName = tx.subcategory_id ? subcategoryName.get(tx.subcategory_id) || '' : ''
    const matchesSearch = catName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          subName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (tx.description || '').toLowerCase().includes(searchTerm.toLowerCase())
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
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-background-light dark:bg-background-light dark:text-primary text-sm font-bold leading-normal tracking-[0.015em] gap-2 hover:opacity-90 transition-opacity"
                >
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
                    placeholder="Buscar por categoria, subcategoria ou descrição..." 
                    className="w-full pl-10 bg-primary/5 dark:bg-background-light/5 border-primary/10 dark:border-background-light/10 rounded-lg h-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-48">
                  <select 
                    className="w-full bg-primary/5 dark:bg-background-light/5 border-primary/10 dark:border-background-light/10 rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as any)}
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
                  <div className="col-span-5">Categoria / Sub / Descrição</div>
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
                            <div className="flex items-center gap-2">
                                <p className="font-bold text-primary dark:text-background-light text-base">{categoryName.get(tx.category_id) || 'Categoria'}</p>
                                {tx.subcategory_id && (
                                    <span className="text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-500 px-2 py-0.5 rounded-full">
                                        {subcategoryName.get(tx.subcategory_id)}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">{tx.description || 'Sem descrição'}</p>
                            <p className="md:hidden text-xs text-neutral-400 mt-1">{tx.date}</p>
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

      {/* New Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-xl border border-neutral-200 dark:border-neutral-700 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Nova Transação</h3>
            
            <div className="flex flex-col gap-4">
                {/* Tipo */}
                <div className="flex gap-2 p-1 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                    <button 
                        onClick={() => setNewTx({...newTx, type: 'expense'})}
                        className={`flex-1 py-2 rounded-md font-bold text-sm transition-all ${newTx.type === 'expense' ? 'bg-white dark:bg-neutral-600 text-red-500 shadow-sm' : 'text-neutral-500'}`}
                    >
                        Despesa
                    </button>
                    <button 
                        onClick={() => setNewTx({...newTx, type: 'income'})}
                        className={`flex-1 py-2 rounded-md font-bold text-sm transition-all ${newTx.type === 'income' ? 'bg-white dark:bg-neutral-600 text-green-500 shadow-sm' : 'text-neutral-500'}`}
                    >
                        Receita
                    </button>
                </div>

                {/* Valor */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Valor</label>
                    <CurrencyInput 
                        className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg h-12 px-4 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                        value={newTx.amount}
                        onValueChange={(val) => setNewTx({...newTx, amount: val})}
                        autoFocus
                    />
                </div>

                {/* Descrição */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Descrição</label>
                    <input 
                        type="text"
                        placeholder="Ex: Compras da semana"
                        className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                        value={newTx.description}
                        onChange={(e) => setNewTx({...newTx, description: e.target.value})}
                    />
                </div>

                {/* Categoria */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Categoria</label>
                    <select 
                        className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                        value={newTx.categoryId}
                        onChange={(e) => setNewTx({...newTx, categoryId: e.target.value})}
                    >
                        <option value="">Selecione...</option>
                        {categories.filter(c => c.type === newTx.type).map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                {/* Subcategoria (Condicional) */}
                <div className="flex flex-col gap-2">
                    <label className={`text-sm font-medium text-neutral-700 dark:text-neutral-300 ${!newTx.categoryId ? 'opacity-50' : ''}`}>Subcategoria</label>
                    <select 
                        className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        value={newTx.subcategoryId}
                        onChange={(e) => setNewTx({...newTx, subcategoryId: e.target.value})}
                        disabled={!newTx.categoryId || availableSubcategories.length === 0}
                    >
                        <option value="">{availableSubcategories.length === 0 ? (newTx.categoryId ? 'Nenhuma subcategoria disponível' : 'Selecione uma categoria primeiro') : 'Selecione (Opcional)'}</option>
                        {availableSubcategories.map((sub: any) => (
                            <option key={sub.id} value={sub.id}>{sub.name}</option>
                        ))}
                    </select>
                </div>

                {/* Data */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Data</label>
                    <input 
                        type="date"
                        className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                        value={newTx.date}
                        onChange={(e) => setNewTx({...newTx, date: e.target.value})}
                    />
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
                onClick={handleAddTransaction} 
                disabled={!newTx.amount || !newTx.categoryId || !newTx.description}
                className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Transactions;
