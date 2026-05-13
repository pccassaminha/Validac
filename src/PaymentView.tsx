import React, { useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, getDocs, limit, query, where, doc, getDoc } from 'firebase/firestore';
import { Lock, CreditCard, Copy, LifeBuoy as SupportIcon, Mail, Phone, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';

interface PaymentViewProps {
  reason: string;
  onLogout: () => void;
}

export default function PaymentView({ reason, onLogout }: PaymentViewProps) {
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const q = query(collection(db, 'paymentMethods'));
      const snapshot = await getDocs(q);
      const methods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPaymentMethods(methods);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'paymentMethods');
    } finally {
      setLoading(false);
    }
  };

  const currentStatus = reason === 'expired' 
    ? 'O seu plano expirou.'
    : reason === 'blocked' ? 'A sua conta encontra-se bloqueada.' 
    : reason === 'pending' ? 'A sua conta aguarda activação e pagamento.'
    : 'Acesso restrito.';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className={`p-8 text-center text-white relative ${reason === 'pending' ? 'bg-gradient-to-r from-indigo-500 to-violet-600' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}>
           <Lock size={48} className="mx-auto mb-4 opacity-80" />
           <h1 className="text-3xl font-extrabold mb-2">{reason === 'pending' ? 'Bem-vindo(a) à Valida C!' : 'Acesso Restrito'}</h1>
           <p className={`${reason === 'pending' ? 'text-indigo-100' : 'text-rose-100'} text-lg`}>{currentStatus}</p>
        </div>

        <div className="p-8">
           <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
             <CreditCard className="text-indigo-600" /> Como proceder ao pagamento
           </h2>
           <p className="text-slate-600 mb-6 leading-relaxed">
             Para usar o ecossistema Valida C, efectue o pagamento do plano que deseja através de uma das nossas contas empresariais abaixo.<br/><br/>
             <strong className="text-slate-800">• Plano Starter (Teste de 1 mês): 2.500 Kz</strong><br/>
             <strong className="text-slate-800">• Plano Pro (Mensal): 15.000 Kz</strong>
           </p>

           <div className="space-y-4 mb-8">
             {loading ? (
               <div className="animate-pulse flex flex-col gap-3">
                 <div className="h-24 bg-slate-100 rounded-xl"></div>
                 <div className="h-24 bg-slate-100 rounded-xl"></div>
               </div>
             ) : paymentMethods.length > 0 ? (
               paymentMethods.map(method => (
                 <div key={method.id} className="border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50">
                    <div>
                      <p className="font-bold text-slate-800">{method.name}</p>
                      {method.type === 'referencia' ? (
                        <p className="text-sm text-slate-500">Ref. Pagamento: <span className="font-mono text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded ml-1">{method.details}</span></p>
                      ) : (
                        <p className="text-sm text-slate-500">IBAN: <span className="font-mono text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded ml-1">{method.iban}</span></p>
                      )}
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(method.type === 'referencia' ? method.details : method.iban);
                        alert('Copiado para a área de transferência!');
                      }}
                      className="flex items-center justify-center gap-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 py-2 px-3 rounded-lg hover:bg-slate-50 transition"
                    >
                      <Copy size={14} /> Copiar
                    </button>
                 </div>
               ))
             ) : (
                <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm border border-amber-200">
                   Nenhum método de pagamento configurado no momento. Entre em contacto com o suporte.
                </div>
             )}
           </div>

           <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-8 text-center sm:text-left flex flex-col sm:flex-row gap-6 items-center">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm text-indigo-600">
               <Phone size={28} />
             </div>
             <div>
                <h3 className="font-bold text-indigo-900 mb-1">Precisa de ajuda?</h3>
                <p className="text-indigo-700 text-sm mb-3">Após o pagamento, envie o comprovativo para o nosso suporte para activação imediata.</p>
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  <a href="https://wa.me/244921167980" target="_blank" rel="noopener noreferrer" className="text-xs font-bold bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                    WhatsApp Suporte
                  </a>
                  <a href="mailto:suporte@validac.co.ao" className="text-xs font-bold bg-white text-indigo-600 border border-indigo-200 px-4 py-2 rounded-lg hover:bg-indigo-50 transition">
                    Enviar E-mail
                  </a>
                </div>
             </div>
           </div>

           <div className="flex justify-center border-t border-slate-100 pt-6">
              <button 
                onClick={async () => { await signOut(auth); onLogout(); }} 
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition font-medium"
              >
                <LogOut size={18} /> Terminar Sessão
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
