import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Legend } from 'recharts';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/contexts/AuthContext';
import type { CategoryDB, TransactionDB, DailyFlow, MonthlyFlow } from '../types';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [chartView, setChartView] = useState<'month' | 'year' | 'calendar'>('month');
  const { user } = useAuth()

  const [categories, setCategories] = useState<CategoryDB[]>([])
  const [recentTransactions, setRecentTransactions] = useState<TransactionDB[]>([])
  const [monthTransactions, setMonthTransactions] = useState<TransactionDB[]>([])
  const [yearTransactions, setYearTransactions] = useState<TransactionDB[]>([])
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return
      const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
      setUserName(data?.full_name || '')
    }
    loadProfile()
  }, [user])
  
  // Form States
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  
  // Get current date in YYYY-MM-DD format respecting local timezone
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [date, setDate] = useState(getCurrentDate());

  // Filter Categories based on Type
  const availableCategories = useMemo(() => {
    return categories.filter(c => c.type === transactionType);
  }, [transactionType, categories]);

  // Filter Subcategories based on selected Category
  const availableSubcategories = useMemo(() => {
    const categoryData = availableCategories.find(c => c.name === selectedCategory);
    return [];
  }, [selectedCategory, availableCategories]);

  // Reset Category when Type changes
  useEffect(() => {
    if (availableCategories.length > 0) {
      setSelectedCategory(availableCategories[0].name);
    } else {
      setSelectedCategory('');
    }
  }, [transactionType, availableCategories]);

  // Reset Subcategory when Category changes
  useEffect(() => {
    if (availableSubcategories.length > 0) {
      setSelectedSubcategory(availableSubcategories[0]);
    } else {
      setSelectedSubcategory('');
    }
  }, [selectedCategory, availableSubcategories]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Remove all non-numeric characters
    value = value.replace(/\D/g, "");

    if (value === "") {
      setAmount("");
      return;
    }

    // Convert to decimal (cents)
    const numberValue = parseFloat(value) / 100;

    // Format to BRL currency
    const formatted = numberValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    setAmount(formatted);
  };

  const monthChartData: MonthlyFlow[] = useMemo(() => {
    const weeks = [0, 0, 0, 0]
    monthTransactions.forEach(t => {
      const d = new Date(t.date)
      const weekIndex = Math.min(3, Math.floor((d.getDate() - 1) / 7))
      weeks[weekIndex] += t.type === 'income' ? t.amount : -t.amount
    })
    const incomePerWeek = [0, 0, 0, 0]
    const expensePerWeek = [0, 0, 0, 0]
    monthTransactions.forEach(t => {
      const d = new Date(t.date)
      const weekIndex = Math.min(3, Math.floor((d.getDate() - 1) / 7))
      if (t.type === 'income') incomePerWeek[weekIndex] += t.amount
      else expensePerWeek[weekIndex] += t.amount
    })
    return [1,2,3,4].map(i => ({ name: `Semana ${i}`, income: incomePerWeek[i-1], expense: expensePerWeek[i-1] }))
  }, [monthTransactions])

  const yearlyChartData: MonthlyFlow[] = useMemo(() => {
    const income = Array(12).fill(0)
    const expense = Array(12).fill(0)
    yearTransactions.forEach(t => {
      const d = new Date(t.date)
      const m = d.getMonth()
      if (t.type === 'income') income[m] += t.amount
      else expense[m] += t.amount
    })
    const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
    return months.map((name, idx) => ({ name, income: income[idx], expense: expense[idx] }))
  }, [yearTransactions])

  const chartData = chartView === 'year' ? yearlyChartData : monthChartData;

  // Calendar render logic
  const renderCalendar = () => {
    const now = new Date()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div className="grid grid-cols-7 gap-2 p-2">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
            <div key={i} className="text-center text-xs font-bold text-neutral-400 py-2">{day}</div>
        ))}
        {days.map((day) => {
            const dayIncome = monthTransactions.filter(t => new Date(t.date).getDate() === day && t.type === 'income').reduce((s, t) => s + t.amount, 0)
            const dayExpense = monthTransactions.filter(t => new Date(t.date).getDate() === day && t.type === 'expense').reduce((s, t) => s + t.amount, 0)
            const data: DailyFlow | null = (dayIncome > 0 || dayExpense > 0) ? { day, income: dayIncome, expense: dayExpense, hasData: true } : null
            const balance = data ? data.income - data.expense : 0;
            
            return (
                <div key={day} className="group relative aspect-square border border-primary/5 dark:border-background-light/5 rounded-lg flex flex-col items-center justify-center hover:bg-primary/5 dark:hover:bg-background-light/5 transition-colors cursor-default">
                    <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">{day}</span>
                    {data && (
                        <div className="flex gap-1 mt-1">
                            {data.income > 0 && <div className="size-1.5 rounded-full bg-teal-400"></div>}
                            {data.expense > 0 && <div className="size-1.5 rounded-full bg-red-400"></div>}
                        </div>
                    )}
                    
                    {/* Hover Tooltip */}
                    {data && (
                      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col gap-1 bg-white dark:bg-neutral-800 p-3 rounded-lg shadow-xl border border-neutral-100 dark:border-neutral-700 z-50 min-w-[140px]">
                        <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 mb-1">Dia {day}</p>
                        <div className="flex justify-between items-center text-xs">
                           <span className="text-teal-600 dark:text-teal-400">Entradas:</span>
                           <span className="font-medium dark:text-neutral-200">R$ {data.income.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                           <span className="text-red-500 dark:text-red-400">Saídas:</span>
                           <span className="font-medium dark:text-neutral-200">R$ {data.expense.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="h-px bg-neutral-200 dark:bg-neutral-700 my-1"></div>
                        <div className="flex justify-between items-center text-xs font-bold">
                           <span className="text-neutral-700 dark:text-neutral-300">Saldo:</span>
                           <span className={balance >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-500 dark:text-red-400'}>
                             R$ {balance.toLocaleString('pt-BR')}
                           </span>
                        </div>
                        {/* Triangle arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white dark:border-t-neutral-800"></div>
                      </div>
                    )}
                </div>
            )
        })}
      </div>
    );
  };

  // Fetch categories and transactions
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      console.log('[Dashboard] Fetch start for user:', user.id)
      const { data: cats, error: catErr } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
      if (catErr) toast.error('Erro ao carregar categorias')
      else setCategories(cats || [])
      console.log('[Dashboard] Categorias:', (cats || []).length)

      const now = new Date()
      const startMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      const { data: monthTx } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startMonth.toISOString().slice(0,10))
        .lt('date', endMonth.toISOString().slice(0,10))
        .order('date', { ascending: false })
      setMonthTransactions(monthTx || [])
      console.log('[Dashboard] Month transactions:', (monthTx || []).length)

      const startYear = new Date(now.getFullYear(), 0, 1)
      const endYear = new Date(now.getFullYear() + 1, 0, 1)
      const { data: yearTx } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startYear.toISOString().slice(0,10))
        .lt('date', endYear.toISOString().slice(0,10))
      setYearTransactions(yearTx || [])
      console.log('[Dashboard] Year transactions:', (yearTx || []).length)

      const { data: recentTx } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(5)
      setRecentTransactions(recentTx || [])
      console.log('[Dashboard] Recent transactions:', (recentTx || []).length)
    }
    fetchData()
  }, [user])

  const currentBalance = useMemo(() => {
    const income = monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    return income - expense
  }, [monthTransactions])

  const incomeMonth = useMemo(() => monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), [monthTransactions])
  const expenseMonth = useMemo(() => monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [monthTransactions])

  const saveTransaction = async () => {
    if (!user) return
    const numericAmount = Number(amount.replace(/[^0-9,-]/g, '').replace('.', '').replace(',', '.'))
    if (!numericAmount || !selectedCategory) {
      toast.error('Preencha valor e categoria')
      return
    }
    const cat = availableCategories.find(c => c.name === selectedCategory)
    if (!cat) {
      toast.error('Categoria inválida')
      return
    }
    const { error } = await supabase.from('transactions').insert({
      user_id: user.id,
      category_id: cat.id,
      description: null,
      amount: numericAmount,
      date,
      type: transactionType,
    })
    if (error) {
      toast.error('Erro ao salvar transação')
      console.error('[Dashboard] saveTransaction error:', error)
      return
    }
    toast.success('Transação salva com sucesso')
    console.log('[Dashboard] Transação salva:', { amount: numericAmount, type: transactionType, date, category: cat.name })
    setAmount('')
    setDate(getCurrentDate())
    const { data: monthTx } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', date.slice(0,7) + '-01')
      .lt('date', (() => { const d = new Date(date); return new Date(d.getFullYear(), d.getMonth()+1,1).toISOString().slice(0,10) })())
      .order('date', { ascending: false })
    setMonthTransactions(monthTx || [])
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col font-display-jakarta bg-background-light dark:bg-background-dark">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5 md:px-10 lg:px-20 xl:px-40">
          <div className="layout-content-container flex flex-col w-full max-w-[960px] flex-1">
            <Header />
            <main className="flex flex-col gap-6 md:gap-8 p-4 md:p-6 lg:p-8">
              {/* Intro */}
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex min-w-72 flex-col gap-2">
                  <p className="text-primary dark:text-background-light text-4xl font-black leading-tight tracking-[-0.033em]">
                    Olá, {userName || 'Visitante'}!
                  </p>
                  <p className="text-neutral-500 dark:text-neutral-400 text-base font-normal leading-normal">
                    Aqui está o resumo das suas finanças.
                  </p>
                </div>
              </div>

              {/* New Transaction Form */}
              <div className="flex flex-col gap-4 rounded-xl p-6 border border-primary/10 dark:border-background-light/10 bg-white dark:bg-background-dark/50 shadow-sm">
                <h3 className="text-primary dark:text-background-light text-lg font-bold leading-tight tracking-[-0.015em]">
                  Nova Transação
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-300" htmlFor="valor">
                      Valor
                    </label>
                    <input
                      className="w-full bg-primary/5 dark:bg-background-light/5 border-primary/10 dark:border-background-light/10 rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      id="valor"
                      placeholder="R$ 0,00"
                      type="text"
                      value={amount}
                      onChange={handleAmountChange}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-300" htmlFor="data">
                      Data da Transação
                    </label>
                    <input
                      className="w-full bg-primary/5 dark:bg-background-light/5 border-primary/10 dark:border-background-light/10 rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      id="data"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-300" htmlFor="tipo">
                      Tipo
                    </label>
                    <select
                      className="w-full bg-primary/5 dark:bg-background-light/5 border-primary/10 dark:border-background-light/10 rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      id="tipo"
                      value={transactionType}
                      onChange={(e) => setTransactionType(e.target.value as 'expense' | 'income')}
                    >
                      <option value="expense">Despesa</option>
                      <option value="income">Receita</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-300" htmlFor="categoria">
                      Categoria
                    </label>
                    <select
                      className="w-full bg-primary/5 dark:bg-background-light/5 border-primary/10 dark:border-background-light/10 rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      id="categoria"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      {availableCategories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2 lg:col-span-2">
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-300" htmlFor="subcategoria">
                      Subcategoria
                    </label>
                    <select
                      className="w-full bg-primary/5 dark:bg-background-light/5 border-primary/10 dark:border-background-light/10 rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      id="subcategoria"
                      value={selectedSubcategory}
                      onChange={(e) => setSelectedSubcategory(e.target.value)}
                      disabled={availableSubcategories.length === 0}
                    >
                       {availableSubcategories.length > 0 ? (
                          availableSubcategories.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))
                        ) : (
                          <option value="">Nenhuma subcategoria</option>
                        )}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2 lg:col-span-2">
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-300" htmlFor="descricao">
                      Descrição (opcional)
                    </label>
                    <input
                      className="w-full bg-primary/5 dark:bg-background-light/5 border-primary/10 dark:border-background-light/10 rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      id="descricao"
                      placeholder="Ex: Compras do mês no supermercado"
                      type="text"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 mt-2">
                  <button 
                    onClick={() => { 
                      setAmount(''); 
                      setDate(getCurrentDate());
                      setTransactionType('expense');
                    }}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary/10 dark:bg-background-light/10 text-primary dark:text-background-light text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/20 transition-colors"
                  >
                    <span className="truncate">Limpar</span>
                  </button>
                  <button onClick={saveTransaction} className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-background-light dark:bg-background-light dark:text-primary text-sm font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity">
                    <span className="truncate">Salvar</span>
                  </button>
                </div>
              </div>

              {/* Balances */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: 'Saldo Atual', amount: `R$ ${currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: 'text-primary dark:text-background-light' },
                  { title: 'Receitas (Mês)', amount: `R$ ${incomeMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: 'text-teal-600 dark:text-teal-400' },
                  { title: 'Despesas (Mês)', amount: `R$ ${expenseMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: 'text-red-500 dark:text-red-400' },
                ].map((card, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-2 rounded-xl p-6 border border-primary/10 dark:border-background-light/10 bg-white dark:bg-background-dark/50 shadow-sm"
                  >
                    <p className="text-neutral-600 dark:text-neutral-300 text-base font-medium leading-normal">
                      {card.title}
                    </p>
                    <p className={`${card.color} tracking-light text-3xl font-bold leading-tight`}>
                      {card.amount}
                    </p>
                  </div>
                ))}
              </div>

              {/* Chart & Recent Transactions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section - Income vs Expense Bar Chart with Calendar View */}
                <div className="lg:col-span-2 flex flex-col gap-4 p-6 rounded-xl border border-primary/10 dark:border-background-light/10 bg-white dark:bg-background-dark/50 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex flex-col gap-1">
                      <p className="text-primary dark:text-background-light text-lg font-bold leading-normal">
                        Entradas e Saídas
                      </p>
                      <p className="text-neutral-500 dark:text-neutral-400 text-sm font-normal leading-normal">
                        Acompanhe seu fluxo financeiro
                      </p>
                    </div>
                    <div>
                      <select 
                        className="bg-primary/5 dark:bg-background-light/5 border-primary/10 dark:border-background-light/10 rounded-lg h-10 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-primary dark:text-background-light appearance-none"
                        value={chartView}
                        onChange={(e) => setChartView(e.target.value as 'month' | 'year' | 'calendar')}
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                      >
                        <option value="month">Gráfico Mensal</option>
                        <option value="year">Gráfico Anual</option>
                        <option value="calendar">Calendário</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Content Area */}
                  <div className="w-full min-h-[300px] mt-2">
                    {chartView === 'calendar' ? (
                       renderCalendar()
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} barGap={4}>
                            <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#a3a3a3', fontSize: 12 }} 
                            dy={10}
                            />
                            <Tooltip 
                                formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                                cursor={{fill: 'transparent'}}
                                contentStyle={{ 
                                    borderRadius: '8px', 
                                    border: 'none', 
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    color: '#333'
                                }}
                            />
                            <Legend verticalAlign="top" height={36} iconType="circle" />
                            <Bar name="Receitas" dataKey="income" fill="#2dd4bf" radius={[4, 4, 0, 0]} barSize={24} />
                            <Bar name="Despesas" dataKey="expense" fill="#f87171" radius={[4, 4, 0, 0]} barSize={24} />
                        </BarChart>
                        </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Recent Transactions List */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                  <h2 className="text-primary dark:text-background-light text-xl font-bold leading-tight tracking-[-0.015em]">
                    Transações Recentes
                  </h2>
                  <div className="flex flex-col gap-3">
                    {recentTransactions.length > 0 ? (
                      recentTransactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center gap-4 p-3 rounded-lg hover:bg-primary/5 dark:hover:bg-background-light/5 transition-colors cursor-pointer"
                        >
                          <div
                            className={`flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary`}
                          >
                            <span className="material-symbols-outlined">receipt_long</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-primary dark:text-background-light">{tx.type === 'expense' ? 'Despesa' : 'Receita'}</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">{tx.date}</p>
                          </div>
                          <p
                            className={`font-bold ${
                              tx.type === 'expense' ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                            }`}
                          >
                            {tx.type === 'income' ? '+' : '-'} R$ {Math.abs(tx.amount).toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-neutral-500 dark:text-neutral-400 italic">
                        Nenhuma transação recente.
                      </div>
                    )}
                  </div>
                  <Link to="/transactions" className="text-center text-sm font-bold text-primary dark:text-background-light mt-2 hover:underline">
                    Ver todas as transações
                  </Link>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
