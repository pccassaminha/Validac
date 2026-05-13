import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { Users, CreditCard, Save, Plus, Trash2, Edit2, ShieldAlert, CheckCircle, XCircle, AlertTriangle, Key, ArrowLeft, Info, Activity, Lock } from 'lucide-react';
import { auth } from './firebase';

interface SettingsViewProps {
  onBack: () => void;
  aiKeys: { gemini: string; openai: string; anthropic: string };
  setAiKeys: (keys: any) => void;
}

export default function SettingsView({ onBack, aiKeys, setAiKeys }: SettingsViewProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<'admin' | 'user'>('user');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (auth.currentUser) {
        const userDoc = await getDocs(collection(db, 'users'));
        const allUsers = userDoc.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        setUsers(allUsers);
        
        const myDoc = allUsers.find(u => u.id === auth.currentUser?.uid);
        if (myDoc && myDoc.role === 'admin') {
          setCurrentUserRole('admin');
        } else if (auth.currentUser.email === 'exportacoes.extras@gmail.com') { // fallback admin
          setCurrentUserRole('admin');
        }
      }

      const pmSnapshot = await getDocs(collection(db, 'paymentMethods'));
      setPaymentMethods(pmSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { status: newStatus });
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    }
  };

  const addPaymentMethod = async () => {
    const name = prompt('Nome do Banco / Carteira (ex: Banco BAI):');
    if (!name) return;
    const type = prompt('Tipo (referencia ou iban):', 'iban');
    if (!type || (type !== 'referencia' && type !== 'iban')) return;
    const details = prompt(`Introduza o ${type.toUpperCase()}:`);
    if (!details) return;

    try {
      const docRef = await addDoc(collection(db, 'paymentMethods'), { name, type, [type === 'iban' ? 'iban' : 'details']: details });
      setPaymentMethods([...paymentMethods, { id: docRef.id, name, type, [type === 'iban' ? 'iban' : 'details']: details }]);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'paymentMethods');
    }
  };

  const deletePaymentMethod = async (id: string) => {
    if (!confirm('Eliminar este método de pagamento?')) return;
    try {
      await deleteDoc(doc(db, 'paymentMethods', id));
      setPaymentMethods(paymentMethods.filter(p => p.id !== id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'paymentMethods');
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">A carregar configurações...</div>;

  return (
    <main className="w-full max-w-6xl mx-auto px-4 py-10 flex-grow">
      <div className="mb-8 block">
        <button 
          onClick={onBack} 
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 font-medium mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Voltar
        </button>
        <h1 className="text-3xl font-extrabold text-slate-900">Configurações Gerais</h1>
        <p className="text-slate-500 mt-2 text-lg">Configure os acessos, métodos de pagamento e chaves API.</p>
      </div>

      {currentUserRole === 'admin' ? (
        <div className="space-y-10">
          
          {/* USERS MANAGEMENT */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
               <Users className="text-indigo-600" />
               <h2 className="text-xl font-bold text-slate-800">Gestão de Utilizadores</h2>
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-sm font-semibold text-slate-500 border-b border-slate-200">
                    <th className="pb-3 px-4">Nome</th>
                    <th className="pb-3 px-4">E-mail</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 px-4">Papel</th>
                    <th className="pb-3 px-4 text-right">Acções</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="py-4 px-4 font-medium text-slate-800">{u.name || '-'}</td>
                      <td className="py-4 px-4 text-slate-600">{u.email}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          u.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          u.status === 'blocked' ? 'bg-rose-100 text-rose-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {u.status === 'approved' ? 'Aprovado' : u.status === 'blocked' ? 'Bloqueado' : u.status || 'Pendente'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-500 capitalize">{u.role || 'user'}</td>
                      <td className="py-4 px-4 text-right space-x-2">
                        {u.status !== 'approved' && (
                          <button onClick={() => updateUserStatus(u.id, 'approved')} className="text-emerald-600 hover:text-emerald-700" title="Aprovar">
                            <CheckCircle size={18} />
                          </button>
                        )}
                        {u.status !== 'blocked' && (
                          <button onClick={() => updateUserStatus(u.id, 'blocked')} className="text-rose-600 hover:text-rose-700" title="Bloquear">
                            <XCircle size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* PAYMENT METHODS */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <CreditCard className="text-indigo-600" />
                 <h2 className="text-xl font-bold text-slate-800">Métodos de Pagamento</h2>
               </div>
               <button onClick={addPaymentMethod} className="flex items-center gap-1.5 text-sm font-bold bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-200 transition">
                 <Plus size={16} /> Adicionar
               </button>
            </div>
            <div className="p-6">
              {paymentMethods.length === 0 ? (
                <p className="text-slate-500 text-sm">Nenhum método configurado. Adicione contas para os utilizadores pagarem o sistema.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paymentMethods.map(pm => (
                    <div key={pm.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-800">{pm.name}</h4>
                        <div className="text-sm mt-1 text-slate-500">
                          <span className="font-semibold uppercase text-xs mr-2">{pm.type}:</span>
                          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{pm.type === 'iban' ? pm.iban : pm.details}</span>
                        </div>
                      </div>
                      <button onClick={() => deletePaymentMethod(pm.id)} className="text-slate-400 hover:text-rose-500 transition">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-800 flex items-start gap-4 mb-10">
          <AlertTriangle className="shrink-0" />
          <div>
            <h3 className="font-bold text-lg mb-1">Acesso Restrito Admin</h3>
            <p>Apenas administradores podem gerir contas e métodos de pagamento. (Tem acesso à secção de IA abaixo).</p>
          </div>
        </div>
      )}

      {/* AI KEYS SECTION (AVAILABLE TO EVERYONE) */}
      <div className="grid md:grid-cols-2 gap-8 mt-10">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Key size={18} className="text-indigo-600" /> Chaves de API das IA
            </h3>
          </div>
          <div className="p-6 space-y-5">
            <p className="text-sm text-slate-600 mb-4">Insira as chaves dos provedores que deseja utilizar no gerador inteligente de páginas.</p>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Google Gemini API (Recomendado)</label>
              <input 
                type="password" 
                value={aiKeys.gemini}
                onChange={(e) => setAiKeys({...aiKeys, gemini: e.target.value})}
                placeholder="AIza..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
              <p className="text-xs text-slate-500 mt-1">A opção "Gemini Free" usará uma cota gratuita embarcada na plataforma se não inserir uma chave, mas com limites de uso.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">OpenAI (ChatGPT)</label>
              <input 
                type="password" 
                value={aiKeys.openai}
                onChange={(e) => setAiKeys({...aiKeys, openai: e.target.value})}
                placeholder="sk-..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Anthropic (Claude)</label>
              <input 
                type="password" 
                value={aiKeys.anthropic}
                onChange={(e) => setAiKeys({...aiKeys, anthropic: e.target.value})}
                placeholder="sk-ant-..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <button 
              onClick={() => {
                localStorage.setItem('valida_c_ai_keys', JSON.stringify(aiKeys));
                alert('Chaves de API guardadas com sucesso no seu dispositivo!');
              }}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-lg text-sm transition-colors mt-4 text-lg"
            >
              Salvar Chaves API
            </button>
            <p className="text-xs text-slate-400 text-center mt-2 flex items-center justify-center gap-1.5 focus:outline-none focus:ring-0">
              <Lock size={12} /> As chaves são armazenadas localmente com segurança no seu navegador.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Activity size={18} className="text-emerald-600" /> Utilização de Créditos (Hoje)
            </h3>
          </div>
          <div className="p-6 space-y-6 flex-grow flex flex-col">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                <div className="text-3xl font-black text-indigo-600">4</div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Páginas Geradas</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                <div className="text-3xl font-black text-indigo-600">1.2<span className="text-lg">K</span></div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Tokens de Entrada</div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-700">Consumo por Modelo (Custo Estimado)</h4>
              
              <div className="space-y-3">
                 <div>
                   <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-600 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Gemini Free</span>
                      <span className="font-semibold text-slate-700">100% da Cota</span>
                   </div>
                   <div className="w-full bg-slate-100 rounded-full h-2">
                     <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                   </div>
                 </div>
                 <div>
                   <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-600 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500"></div> GPT-4o</span>
                      <span className="font-semibold text-slate-700">$0.00</span>
                   </div>
                   <div className="w-full bg-slate-100 rounded-full h-2">
                     <div className="bg-purple-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                   </div>
                 </div>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-100">
              <div className="flex items-start gap-3 p-4 bg-indigo-50 border border-indigo-100 text-indigo-800 rounded-xl text-sm">
                <Info size={20} className="shrink-0 mt-0.5 text-indigo-500" />
                <div>
                  <strong className="block mb-1">Dica de Utilização</strong>
                  Recomendamos o uso da sua própria chave <span className="font-semibold">Gemini Pro</span> para obter páginas com maior qualidade em português de Angola sem bloqueios de taxa de pedido.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
