import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useAuth } from '../src/contexts/AuthContext';
import { supabase } from '../src/lib/supabase';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert';
  created_at: string;
  read: boolean;
}

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      
      // Simulação de notificações baseadas em Metas e Limites (já que não temos tabela de notificações ainda)
      const alerts: Notification[] = [];
      
      // 1. Checar Metas Vencendo
      const { data: goals } = await supabase.from('goals').select('*').eq('user_id', user.id);
      goals?.forEach(goal => {
        if (goal.target_date) {
            const today = new Date();
            const target = new Date(goal.target_date);
            const diffTime = target.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            // Faltando 10% do tempo (simplificado para 7 dias aqui)
            if (diffDays <= 7 && diffDays >= 0 && !goal.is_completed) {
                alerts.push({
                    id: `goal-${goal.id}`,
                    title: 'Meta Próxima do Prazo',
                    message: `A meta "${goal.title}" vence em ${diffDays} dias!`,
                    type: 'warning',
                    created_at: new Date().toISOString(),
                    read: false
                });
            } else if (diffDays < 0 && !goal.is_completed) {
                alerts.push({
                    id: `goal-overdue-${goal.id}`,
                    title: 'Meta Vencida',
                    message: `A data limite da meta "${goal.title}" expirou.`,
                    type: 'alert',
                    created_at: new Date().toISOString(),
                    read: false
                });
            }
        }
      });

      // 2. Checar Limites de Categoria (Futuro)
      // ... Lógica de limites virá aqui

      setNotifications(alerts);
      setLoading(false);
    };

    fetchNotifications();
  }, [user]);

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col font-display-jakarta bg-background-light dark:bg-background-dark">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5 md:px-10 lg:px-20 xl:px-40">
          <div className="layout-content-container flex flex-col w-full max-w-[960px] flex-1">
            <Header />
            <main className="flex flex-col gap-6 md:gap-8 p-4 md:p-6 lg:p-8">
              <div className="flex flex-col gap-2">
                <h1 className="text-primary dark:text-background-light text-4xl font-black leading-tight tracking-[-0.033em]">
                  Notificações
                </h1>
                <p className="text-neutral-500 dark:text-neutral-400 text-base font-normal leading-normal">
                  Alertas importantes sobre suas finanças.
                </p>
              </div>

              {loading ? (
                  <div className="text-neutral-500">Carregando alertas...</div>
              ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-neutral-800/50 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700">
                    <span className="material-symbols-outlined text-4xl text-neutral-400 mb-2">notifications_off</span>
                    <h3 className="text-lg font-bold text-neutral-700 dark:text-neutral-300">Tudo tranquilo!</h3>
                    <p className="text-neutral-500 dark:text-neutral-400">Você não tem novas notificações no momento.</p>
                  </div>
              ) : (
                  <div className="flex flex-col gap-4">
                      {notifications.map(note => (
                          <div key={note.id} className={`p-4 rounded-xl border flex items-start gap-4 ${
                              note.type === 'alert' 
                                ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30' 
                                : note.type === 'warning'
                                ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30'
                                : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
                          }`}>
                              <div className={`p-2 rounded-full shrink-0 ${
                                  note.type === 'alert' ? 'bg-red-100 text-red-600' : 
                                  note.type === 'warning' ? 'bg-yellow-100 text-yellow-600' : 
                                  'bg-blue-100 text-blue-600'
                              }`}>
                                  <span className="material-symbols-outlined">
                                      {note.type === 'alert' ? 'error' : note.type === 'warning' ? 'warning' : 'info'}
                                  </span>
                              </div>
                              <div>
                                  <h3 className={`font-bold ${
                                      note.type === 'alert' ? 'text-red-700 dark:text-red-400' : 
                                      note.type === 'warning' ? 'text-yellow-700 dark:text-yellow-400' : 
                                      'text-neutral-900 dark:text-white'
                                  }`}>{note.title}</h3>
                                  <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">{note.message}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
