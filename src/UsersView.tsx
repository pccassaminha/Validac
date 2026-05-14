import React, { useState, useEffect } from 'react';
import { User, ShieldAlert, CheckCircle, XCircle, Trash2, Shield, ArrowLeft, Loader2, Info, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType, firebaseConfig } from './firebase';
import { collection, doc, getDocs, updateDoc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

interface UsersViewProps {
  onBack: () => void;
  currentUserEmail: string | null;
}

export default function UsersView({ onBack, currentUserEmail }: UsersViewProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  
  const isSuperAdmin = currentUserEmail === 'exportacoes.extras@gmail.com' || currentUserEmail?.toLowerCase() === 'grupocassaminha@gmail.com';

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const q = collection(db, 'users');
      const querySnapshot = await getDocs(q);
      const userList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(userList);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError('Erro ao aceder aos utilizadores. O utilizador poderá não ter permissões.');
      // handleFirestoreError(err, OperationType.GET, 'users');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, currentStatus: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: newStatus
      });
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    } catch (err) {
      console.error('Error updating user:', err);
      handleFirestoreError(err, OperationType.UPDATE, 'users');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm('Tem certeza que deseja apagar este utilizador? Esta ação não pode ser desfeita.')) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      handleFirestoreError(err, OperationType.DELETE, 'users');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || newUserPassword.length < 6) {
       setCreateError('Preencha os campos obrigatórios e a palavra-passe (mín 6 caracteres).');
       return;
    }
    setIsCreating(true);
    setCreateError('');

    try {
      // Create secondary app to avoid logging out the current admin
      const secondaryAppName = 'SecondaryApp-' + Date.now();
      const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
      const secondaryAuth = getAuth(secondaryApp);

      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newUserEmail, newUserPassword);
      await updateProfile(userCredential.user, { displayName: newUserName });
      
      const newUid = userCredential.user.uid;
      
      // Sign out and cleanup the secondary app
      await secondaryAuth.signOut();

      // Write to Firestore using the primary auth (admin)
      await setDoc(doc(db, 'users', newUid), {
        name: newUserName,
        email: newUserEmail,
        status: 'approved',
        createdAt: serverTimestamp()
      });

      // Reload users or just add to local state
      setUsers([...users, { id: newUid, name: newUserName, email: newUserEmail, status: 'approved' }]);
      setShowModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
    } catch (err: any) {
       console.error('Error creating user:', err);
       setCreateError('Erro ao criar utilizador. O email já pode estar em uso ou a senha é muito fraca.');
    } finally {
       setIsCreating(false);
    }
  };

  // Prevent access for non-superadmins
  if (!isSuperAdmin) {
     return (
       <div className="w-full h-[60vh] flex flex-col items-center justify-center p-6 text-center">
         <ShieldAlert size={64} className="text-red-500 mb-4" />
         <h1 className="text-2xl font-bold text-slate-800 mb-2">Acesso Negado</h1>
         <p className="text-slate-600 mb-6">Apenas o super administrador (Grupo Cassaminha) pode aceder a esta página.</p>
         <button onClick={onBack} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700">
           Voltar
         </button>
       </div>
     );
  }

  return (
    <main className="w-full max-w-[1400px] mx-auto px-4 py-10 flex-grow">
      <div className="mb-8 block">
        <button 
          onClick={onBack} 
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 font-medium mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Voltar
        </button>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Shield size={32} className="text-indigo-600" />
              Gestão de Utilizadores
            </h1>
            <p className="text-slate-500 mt-1">Aprove ou bloqueie gestores de contas associados à plataforma.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold shadow-sm transition"
          >
            <Plus size={18} /> Novo Utilizador
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p>A carregar utilizadores...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 bg-red-50">
            <ShieldAlert className="mx-auto mb-3" size={32} />
            <p className="font-medium">{error}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-500 border-t border-slate-200 bg-slate-50">
            <Info className="mx-auto mb-3 text-slate-400" size={32} />
            <h3 className="font-bold text-lg text-slate-700 mb-1">Nenhum utilizador encontrado</h3>
            <p>Nenhuma conta foi registrada na plataforma ainda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                   <th className="font-semibold py-4 px-6">Nome</th>
                   <th className="font-semibold py-4 px-6">Email</th>
                   <th className="font-semibold py-4 px-6">Estado Atual</th>
                   <th className="font-semibold py-4 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 text-sm font-semibold text-slate-900">
                      {user.name || 'Sem Nome'}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500">
                      {user.email || 'N/A'}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                         user.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                         user.status === 'blocked' ? 'bg-red-100 text-red-800' :
                         'bg-amber-100 text-amber-800'
                      }`}>
                         {user.status === 'approved' && <CheckCircle size={12} />}
                         {user.status === 'pending' && <Info size={12} />}
                         {user.status === 'blocked' && <XCircle size={12} />}
                         {user.status === 'approved' ? 'Aprovado' : user.status === 'blocked' ? 'Bloqueado' : 'Pendente'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                       {user.status !== 'approved' && (
                         <button 
                           onClick={() => updateUserStatus(user.id, user.status, 'approved')}
                           className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg transition border border-emerald-200"
                         >
                           Aprovar
                         </button>
                       )}
                       {user.status !== 'blocked' && (
                         <button 
                           onClick={() => updateUserStatus(user.id, user.status, 'blocked')}
                           className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold rounded-lg transition border border-orange-200"
                         >
                           Bloquear
                         </button>
                       )}
                       <button 
                         onClick={() => deleteUser(user.id)}
                         className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                         title="Excluir"
                       >
                         <Trash2 size={16} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Criar Utilizador */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <User size={20} className="text-indigo-600" />
                  Criar Gestor de Conta
                </h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition"
                  disabled={isCreating}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                {createError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 font-medium">
                    {createError}
                  </div>
                )}
                <form id="createUserForm" onSubmit={handleCreateUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Nome de Exibição <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 outline-none transition"
                      placeholder="Ex: Ana Silva"
                      required
                      disabled={isCreating}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Email <span className="text-red-500">*</span></label>
                    <input 
                      type="email" 
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 outline-none transition"
                      placeholder="ana.silva@exemplo.com"
                      required
                      disabled={isCreating}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Palavra-passe (Mínimo 6) <span className="text-red-500">*</span></label>
                    <input 
                      type="password" 
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 outline-none transition"
                      placeholder="••••••••"
                      required
                      minLength={6}
                      disabled={isCreating}
                    />
                    <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                      <Info size={12} /> A nova conta será aprovada automaticamente.
                    </p>
                  </div>
                </form>
              </div>

              <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition"
                  disabled={isCreating}
                >
                  Cancelar
                </button>
                <button 
                  form="createUserForm"
                  type="submit"
                  className="px-5 py-2.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={isCreating}
                >
                  {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  {isCreating ? 'A Criar Utilizador...' : 'Criar e Aprovar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
