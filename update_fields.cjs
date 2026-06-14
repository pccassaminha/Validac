const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const roteadorStart = content.indexOf('{/* SALES ROTEADOR VIEW */}');
if (roteadorStart === -1) {
  console.log("Could not find SALES ROTEADOR VIEW");
  process.exit(1);
}

const beforeRoteador = content.slice(0, roteadorStart);
let roteadorView = content.slice(roteadorStart);

const oldSelectBlock = `                    <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                        Província
                      </label>
                      <div className="relative">
                        <select
                          value={formData.province}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              province: e.target.value,
                            })
                          }
                          className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:ring-4 focus:ring-sky-100 focus:border-sky-500 outline-none transition-all appearance-none font-bold text-slate-700"
                        >
                          <option value="Luanda">Luanda</option>
                          <option value="Huambo">Huambo</option>
                          <option value="Benguela">Benguela</option>
                          <option value="Outra">Outra</option>
                        </select>
                        <ChevronDown
                          size={18}
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />
                      </div>
                      {formData.province === "Outra" && (
                        <div className="mt-4">
                          <input
                            type="text"
                            required
                            value={formData.customProvince}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                customProvince: e.target.value,
                              })
                            }
                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:ring-4 focus:ring-sky-100 focus:border-sky-500 outline-none transition-all placeholder:text-slate-300 font-bold"
                            placeholder="Escreva a sua província..."
                          />
                        </div>
                      )}
                    </div>`;

const newSelectBlock = `                    <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                        Província
                      </label>
                      <div className="relative">
                        <select
                          disabled
                          value="Luanda"
                          className="w-full px-6 py-4 bg-slate-100/60 rounded-2xl border border-slate-200 outline-none transition-all appearance-none font-bold text-slate-500 cursor-not-allowed opacity-100 uppercase"
                        >
                          <option value="Luanda">Somente Luanda</option>
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          <Lock size={16} />
                        </div>
                      </div>
                    </div>`;

roteadorView = roteadorView.replace(oldSelectBlock, newSelectBlock);

const oldAreaBlock = `                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                        Bairro, Zona, Município
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.area}
                        onChange={(e) =>
                          setFormData({ ...formData, area: e.target.value })
                        }
                        className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:ring-4 focus:ring-sky-100 focus:border-sky-500 outline-none transition-all placeholder:text-slate-300 font-bold"
                        placeholder="Ex: Talatona, Rua 4, perto do banco..."
                      />
                    </div>`;

const newAreaBlock = `                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                        Bairro, Zona, Município
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.area}
                        onChange={(e) =>
                          setFormData({ ...formData, area: e.target.value })
                        }
                        className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:ring-4 focus:ring-sky-100 focus:border-sky-500 outline-none transition-all placeholder:text-slate-300 font-bold"
                        placeholder="Ex: Talatona, Rua 4, perto do banco..."
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                        Observações (opcional)
                      </label>
                      <textarea
                        rows={2}
                        value={formData.observacoes || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, observacoes: e.target.value })
                        }
                        className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:ring-4 focus:ring-sky-100 focus:border-sky-500 outline-none transition-all placeholder:text-slate-300 font-bold resize-none"
                        placeholder="Alguma nota para o entregador...?"
                      />
                    </div>`;

roteadorView = roteadorView.replace(oldAreaBlock, newAreaBlock);

fs.writeFileSync('src/App.tsx', beforeRoteador + roteadorView);
console.log('Roteador form fields updated.');
