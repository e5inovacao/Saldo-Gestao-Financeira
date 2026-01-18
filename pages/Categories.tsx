import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import { useAuth } from '../src/contexts/AuthContext';
import { supabase } from '../src/lib/supabase';
import type { CategoryDB, SubcategoryDB } from '../types';
import toast from 'react-hot-toast';

// Common financial icons
const ICON_LIST = [
  'category', 'home', 'restaurant', 'commute', 'shopping_cart', 
  'local_mall', 'flight', 'medical_services', 'school', 'pets', 
  'sports_esports', 'movie', 'fitness_center', 'work', 'savings', 
  'payments', 'receipt_long', 'attach_money', 'credit_card', 'account_balance',
  'directions_car', 'local_gas_station', 'water_drop', 'bolt', 'wifi'
];

const Categories: React.FC = () => {
  const { user } = useAuth()
  const [categories, setCategories] = useState<CategoryDB[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryDB[]>([]);
  const [viewCategoryId, setViewCategoryId] = useState<string>('')
  const [loadingCats, setLoadingCats] = useState(false)
  const [loadingSubs, setLoadingSubs] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  // Modal States
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddSubcategoryOpen, setIsAddSubcategoryOpen] = useState(false);
  
  // Filtered Categories for Subcategory Select
  const categoriesForSelect = useMemo(() => categories, [categories]);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [isDeleteCategoryOpen, setIsDeleteCategoryOpen] = useState(false);
  
  // Selection State
  const [selectedCategory, setSelectedCategory] = useState<CategoryDB | null>(null);

  // Form States
  const [catForm, setCatForm] = useState({ name: '', type: 'expense', icon: 'category' });
  const [subCatForm, setSubCatForm] = useState({ parentId: '', name: '' });
  
  // Edit Form State (Includes Subcategories)
  const [editCatForm, setEditCatForm] = useState({ 
    name: '', 
    icon: '', 
    subcategories: [] as SubcategoryDB[],
    newSubcategoryName: '' 
  });

  // Handlers
  const handleAddCategory = async () => {
    if (!user || !catForm.name) return;
    const exists = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', catForm.name)
      .single()
    if (exists.data?.id) { toast.error('Categoria já existe'); return }
    const { error } = await supabase.from('categories').insert({
      user_id: user.id,
      name: catForm.name,
      type: catForm.type,
      icon: catForm.icon,
      is_default: false,
    })
    if (error) { toast.error('Erro ao criar categoria'); return }
    await loadCategories()
    setIsAddCategoryOpen(false);
    setCatForm({ name: '', type: 'expense', icon: 'category' });
    console.log('[Categories] Categoria criada e recarregada:', catForm.name)
  };

  const handleAddSubcategory = async () => {
    if (!subCatForm.parentId || !subCatForm.name) return;
    const dup = await supabase.from('subcategories').select('id').eq('category_id', subCatForm.parentId).eq('name', subCatForm.name).single()
    if (dup.data?.id) { toast.error('Subcategoria já existe'); return }
    const { error } = await supabase.from('subcategories').insert({ category_id: subCatForm.parentId, name: subCatForm.name, is_default: false })
    if (error) { toast.error('Erro ao criar subcategoria'); return }
    await loadSubcategories()
    setIsAddSubcategoryOpen(false);
    setSubCatForm({ parentId: '', name: '' });
    console.log('[Categories] Subcategoria criada e recarregada:', subCatForm.name)
  };

  const openEditModal = async (category: CategoryDB) => {
    setSelectedCategory(category);
    const subs = subcategories.filter(s => s.category_id === category.id)
    setEditCatForm({ 
      name: category.name, 
      icon: category.icon || 'category', 
      subcategories: subs,
      newSubcategoryName: '' 
    });
    setIsEditCategoryOpen(true);
  };

  const handleEditCategory = async () => {
    if (!selectedCategory || !editCatForm.name) return;
    const { error } = await supabase.from('categories').update({ name: editCatForm.name, icon: editCatForm.icon }).eq('id', selectedCategory.id)
    if (error) { toast.error('Erro ao salvar categoria'); return }
    await loadCategories()
    setIsEditCategoryOpen(false);
    setSelectedCategory(null);
    console.log('[Categories] Categoria atualizada e recarregada:', editCatForm.name)
  };

  const addSubcategoryInEdit = async () => {
    if(!selectedCategory || !editCatForm.newSubcategoryName) return;
    const { data, error } = await supabase.from('subcategories').insert({ category_id: selectedCategory.id, name: editCatForm.newSubcategoryName }).select('*').single()
    if (error) { toast.error('Erro ao adicionar subcategoria'); return }
    setEditCatForm({
      ...editCatForm,
      subcategories: [...editCatForm.subcategories, data],
      newSubcategoryName: ''
    });
  };

  const removeSubcategoryInEdit = async (index: number) => {
    const target = editCatForm.subcategories[index]
    if (!target) return
    const { error } = await supabase.from('subcategories').delete().eq('id', target.id)
    if (error) { toast.error('Erro ao remover subcategoria'); return }
    const updatedSubs = [...editCatForm.subcategories];
    updatedSubs.splice(index, 1);
    setEditCatForm({
      ...editCatForm,
      subcategories: updatedSubs
    });
    await loadSubcategories()
    console.log('[Categories] Subcategoria removida e recarregada:', target.name)
  };

  const openDeleteModal = (category: CategoryDB) => {
    setSelectedCategory(category);
    setIsDeleteCategoryOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    const { error } = await supabase.from('categories').delete().eq('id', selectedCategory.id)
    if (error) { toast.error('Erro ao excluir categoria'); return }
    setCategories(categories.filter(cat => cat.id !== selectedCategory.id));
    setSubcategories(subcategories.filter(s => s.category_id !== selectedCategory.id))
    setIsDeleteCategoryOpen(false);
    setSelectedCategory(null);
    await loadCategories(); await loadSubcategories();
    console.log('[Categories] Categoria removida e listas recarregadas')
  };

  const verifyCategoryData = (cats: CategoryDB[], subs: SubcategoryDB[]) => {
    const catIds = new Set(cats.map(c => c.id))
    const orphanSubs = subs.filter(s => !catIds.has(s.category_id))
    const dupCats = new Map<string, number>()
    cats.forEach(c => { const key = `${c.user_id}:${c.name}`; dupCats.set(key, (dupCats.get(key) || 0) + 1) })
    const dupCatEntries = Array.from(dupCats.entries()).filter(([,count]) => count > 1)
    if (orphanSubs.length > 0) console.warn('[Categories] Subcategorias órfãs detectadas:', orphanSubs.length)
    if (dupCatEntries.length > 0) console.warn('[Categories] Categorias duplicadas por usuário:', dupCatEntries)
  }

  const loadCategories = async () => {
    if (!user) return
    setLoadingCats(true); setErrorMsg(null)
    const { data, error } = await supabase.from('categories').select('*').eq('user_id', user.id).order('created_at', { ascending: true })
    setLoadingCats(false)
    if (error) { setErrorMsg('Erro ao carregar categorias'); console.error('[Categories] loadCategories error', error); return }
    setCategories(data || [])
    console.log('[Categories] Categorias carregadas:', (data || []).length)
    verifyCategoryData(data || [], subcategories)
  }
  const loadSubcategories = async () => {
    setLoadingSubs(true); setErrorMsg(null)
    const { data, error } = await supabase.from('subcategories').select('*')
    setLoadingSubs(false)
    if (error) { setErrorMsg('Erro ao carregar subcategorias'); console.error('[Categories] loadSubcategories error', error); return }
    setSubcategories(data || [])
    console.log('[Categories] Subcategorias carregadas:', (data || []).length)
    verifyCategoryData(categories, data || [])
  }

  useEffect(() => { loadCategories(); loadSubcategories(); }, [user])

  const categoriesExpense = useMemo(() => categories.filter(c => c.type === 'expense'), [categories])
  const categoriesIncome = useMemo(() => categories.filter(c => c.type === 'income'), [categories])
  const subMap = useMemo(() => {
    const m: Record<string, SubcategoryDB[]> = {}
    subcategories.forEach(s => { (m[s.category_id] ||= []).push(s) })
    return m
  }, [subcategories])

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col font-display-jakarta bg-background-light dark:bg-background-dark">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5 md:px-10 lg:px-20 xl:px-40">
          <div className="layout-content-container flex flex-col w-full max-w-[960px] flex-1">
            <Header />
            <main className="flex flex-col gap-6 md:gap-8 p-4 md:p-6 lg:p-8">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex min-w-72 flex-col gap-2">
                  <h1 className="text-primary dark:text-background-light text-4xl font-black leading-tight tracking-[-0.033em]">
                    Gerenciamento de Categorias
                  </h1>
                  <p className="text-neutral-500 dark:text-neutral-400 text-base font-normal leading-normal">
                    Adicione, edite ou remova suas categorias de despesas e receitas.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsAddSubcategoryOpen(true)}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary/10 dark:bg-background-light/10 text-primary dark:text-background-light text-sm font-bold leading-normal tracking-[0.015em] gap-2 hover:bg-primary/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">add_circle</span>
                    <span className="truncate">Adicionar Subcategoria</span>
                  </button>
                  <button 
                    onClick={() => setIsAddCategoryOpen(true)}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-background-light dark:bg-background-light dark:text-primary text-sm font-bold leading-normal tracking-[0.015em] gap-2 hover:opacity-90 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-lg">add_circle</span>
                    <span className="truncate">Adicionar Categoria</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Expenses Column */}
                <div className="flex flex-col gap-4">
                  <h2 className="text-lg font-bold text-red-500 dark:text-red-400">Despesas</h2>
                  {errorMsg && <div role="alert" className="text-red-600 text-sm">{errorMsg}</div>}
                  {(loadingCats || loadingSubs) && <div className="text-sm text-neutral-500">Carregando...</div>}
                  {categoriesExpense.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex flex-col gap-4 rounded-xl p-4 border border-primary/10 dark:border-background-light/10 bg-white dark:bg-background-dark/50 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-2xl text-primary/80 dark:text-background-light/80">
                            {cat.icon}
                          </span>
                          <button
                            onClick={() => setViewCategoryId(cat.id)}
                            className={`font-semibold text-primary dark:text-background-light text-left ${viewCategoryId === cat.id ? 'underline' : ''}`}
                            aria-expanded={viewCategoryId === cat.id}
                          >
                            {cat.name}
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          {!cat.is_default && (
                            <>
                              <button 
                                onClick={() => openEditModal(cat)}
                                className="p-2 rounded-md hover:bg-primary/10 dark:hover:bg-background-light/10 text-neutral-500 dark:text-neutral-400 transition-colors"
                              >
                                <span className="material-symbols-outlined text-lg">edit</span>
                              </button>
                              <button 
                                onClick={() => openDeleteModal(cat)}
                                className="p-2 rounded-md hover:bg-primary/10 dark:hover:bg-background-light/10 text-neutral-500 dark:text-neutral-400 transition-colors"
                              >
                                <span className="material-symbols-outlined text-lg">delete</span>
                              </button>
                            </>
                          )}
                          {cat.is_default && <span className="text-xs text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">Padrão</span>}
                        </div>
                      </div>
                      {viewCategoryId === cat.id && subMap[cat.id]?.length ? (
                        <div className="flex flex-col gap-2 pl-10">
                          {subMap[cat.id].map((sub) => (
                            <div
                              key={sub.id}
                              className="flex items-center justify-between p-2 rounded-lg hover:bg-primary/5 dark:hover:bg-background-light/5 group/sub"
                            >
                              <p className="text-sm text-neutral-600 dark:text-neutral-300">{sub.name}</p>
                              {/* Subcategory specific actions can be added here later */}
                            </div>
                          ))}
                        </div>
                      ) : viewCategoryId === cat.id ? (
                        <div className="pl-10 text-xs text-neutral-400">Nenhuma subcategoria.</div>
                      ) : null}
                    </div>
                  ))}
                  {categoriesExpense.length === 0 && <p className="text-neutral-400 text-sm italic">Nenhuma categoria de despesa.</p>}
                </div>

                {/* Income Column */}
                <div className="flex flex-col gap-4">
                  <h2 className="text-lg font-bold text-green-600 dark:text-green-400">Receitas</h2>
                  {errorMsg && <div role="alert" className="text-red-600 text-sm">{errorMsg}</div>}
                  {(loadingCats || loadingSubs) && <div className="text-sm text-neutral-500">Carregando...</div>}
                  {categoriesIncome.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex flex-col gap-4 rounded-xl p-4 border border-primary/10 dark:border-background-light/10 bg-white dark:bg-background-dark/50 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-2xl text-primary/80 dark:text-background-light/80">
                            {cat.icon}
                          </span>
                          <button
                            onClick={() => setViewCategoryId(cat.id)}
                            className={`font-semibold text-primary dark:text-background-light text-left ${viewCategoryId === cat.id ? 'underline' : ''}`}
                            aria-expanded={viewCategoryId === cat.id}
                          >
                            {cat.name}
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          {!cat.is_default && (
                            <>
                              <button 
                                onClick={() => openEditModal(cat)}
                                className="p-2 rounded-md hover:bg-primary/10 dark:hover:bg-background-light/10 text-neutral-500 dark:text-neutral-400 transition-colors"
                              >
                                <span className="material-symbols-outlined text-lg">edit</span>
                              </button>
                              <button 
                                onClick={() => openDeleteModal(cat)}
                                className="p-2 rounded-md hover:bg-primary/10 dark:hover:bg-background-light/10 text-neutral-500 dark:text-neutral-400 transition-colors"
                              >
                                <span className="material-symbols-outlined text-lg">delete</span>
                              </button>
                            </>
                          )}
                          {cat.is_default && <span className="text-xs text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">Padrão</span>}
                        </div>
                      </div>
                      {viewCategoryId === cat.id && subMap[cat.id]?.length ? (
                        <div className="flex flex-col gap-2 pl-10">
                          {subMap[cat.id].map((sub) => (
                            <div
                              key={sub.id}
                              className="flex items-center justify-between p-2 rounded-lg hover:bg-primary/5 dark:hover:bg-background-light/5 group/sub"
                            >
                              <p className="text-sm text-neutral-600 dark:text-neutral-300">{sub.name}</p>
                            </div>
                          ))}
                        </div>
                      ) : viewCategoryId === cat.id ? (
                        <div className="pl-10 text-xs text-neutral-400">Nenhuma subcategoria.</div>
                      ) : null}
                    </div>
                  ))}
                   {categoriesIncome.length === 0 && <p className="text-neutral-400 text-sm italic">Nenhuma categoria de receita.</p>}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Add Category Modal */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-xl border border-neutral-200 dark:border-neutral-700 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Nova Categoria</h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Nome</label>
                <input 
                  type="text" 
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                  placeholder="Ex: Assinaturas"
                  value={catForm.name}
                  onChange={(e) => setCatForm({...catForm, name: e.target.value})}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Tipo</label>
                <select 
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                  value={catForm.type}
                  onChange={(e) => setCatForm({...catForm, type: e.target.value})}
                >
                  <option value="expense">Despesa</option>
                  <option value="income">Receita</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Ícone</label>
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-40 overflow-y-auto p-2 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    {ICON_LIST.map(icon => (
                        <button 
                            key={icon}
                            onClick={() => setCatForm({...catForm, icon})}
                            className={`aspect-square flex items-center justify-center rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors ${catForm.icon === icon ? 'bg-primary/20 dark:bg-primary/40 text-primary dark:text-white ring-2 ring-primary/50' : 'text-neutral-500 dark:text-neutral-400'}`}
                        >
                            <span className="material-symbols-outlined text-xl">{icon}</span>
                        </button>
                    ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-8">
              <button onClick={() => setIsAddCategoryOpen(false)} className="px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors">Cancelar</button>
              <button onClick={handleAddCategory} disabled={!catForm.name} className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Subcategory Modal */}
      {isAddSubcategoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-xl border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Nova Subcategoria</h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Categoria Pai</label>
                <select 
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                  value={subCatForm.parentId}
                  onChange={(e) => setSubCatForm({...subCatForm, parentId: e.target.value})}
                >
                  <option value="">Selecione uma categoria...</option>
                  {categoriesForSelect.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name} ({cat.type === 'expense' ? 'Despesa' : 'Receita'})</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Nome da Subcategoria</label>
                <input 
                  type="text" 
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                  placeholder="Ex: Internet"
                  value={subCatForm.name}
                  onChange={(e) => setSubCatForm({...subCatForm, name: e.target.value})}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-8">
              <button onClick={() => setIsAddSubcategoryOpen(false)} className="px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors">Cancelar</button>
              <button onClick={handleAddSubcategory} disabled={!subCatForm.parentId || !subCatForm.name} className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {isEditCategoryOpen && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-xl border border-neutral-200 dark:border-neutral-700 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Editar Categoria</h3>
            <div className="flex flex-col gap-5">
               <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Nome</label>
                <input 
                  type="text" 
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                  value={editCatForm.name}
                  onChange={(e) => setEditCatForm({...editCatForm, name: e.target.value})}
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Ícone</label>
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-32 overflow-y-auto p-2 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    {ICON_LIST.map(icon => (
                        <button 
                            key={icon}
                            onClick={() => setEditCatForm({...editCatForm, icon})}
                            className={`aspect-square flex items-center justify-center rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors ${editCatForm.icon === icon ? 'bg-primary/20 dark:bg-primary/40 text-primary dark:text-white ring-2 ring-primary/50' : 'text-neutral-500 dark:text-neutral-400'}`}
                        >
                            <span className="material-symbols-outlined text-xl">{icon}</span>
                        </button>
                    ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                 <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Subcategorias</label>
                 <div className="flex flex-col gap-2 p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
                    {editCatForm.subcategories.length > 0 ? (
                        editCatForm.subcategories.map((sub, idx) => (
                            <div key={sub.id} className="flex justify-between items-center bg-white dark:bg-neutral-800 p-2 rounded shadow-sm">
                                <span className="text-sm text-neutral-700 dark:text-neutral-300">{sub.name}</span>
                                <button onClick={() => removeSubcategoryInEdit(idx)} className="text-red-500 hover:text-red-700">
                                    <span className="material-symbols-outlined text-lg">close</span>
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-neutral-400 italic">Nenhuma subcategoria.</p>
                    )}
                 </div>
                 
                 <div className="flex gap-2 mt-2">
                    <input 
                        type="text"
                        placeholder="Adicionar nova subcategoria..."
                        className="flex-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg h-9 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                        value={editCatForm.newSubcategoryName}
                        onChange={(e) => setEditCatForm({...editCatForm, newSubcategoryName: e.target.value})}
                    />
                    <button 
                        onClick={addSubcategoryInEdit}
                        disabled={!editCatForm.newSubcategoryName}
                        className="px-3 rounded-lg bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20 disabled:opacity-50"
                    >
                        Adicionar
                    </button>
                 </div>
              </div>

            </div>
            <div className="flex items-center justify-end gap-3 mt-8">
              <button onClick={() => setIsEditCategoryOpen(false)} className="px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors">Cancelar</button>
              <button onClick={handleEditCategory} className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition-opacity">Salvar Alterações</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteCategoryOpen && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-xl border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Excluir Categoria?</h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6">
              Você tem certeza que deseja excluir <strong>{selectedCategory.name}</strong>? Isso também removerá todas as subcategorias associadas.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setIsDeleteCategoryOpen(false)} className="px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors">Cancelar</button>
              <button onClick={handleDeleteCategory} className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors">Excluir</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Categories;
