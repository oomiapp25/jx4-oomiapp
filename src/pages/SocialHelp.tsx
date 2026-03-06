import React, { useState, useEffect } from 'react';
import { supabase, SocialInventory, SocialDelivery } from '../lib/supabase';
import { Heart, Package, CheckCircle, Clock, AlertCircle, Send, Phone, User, FileText, Camera, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { uploadToImgBB } from '../services/imgbbService';

export default function SocialHelp() {
  const [inventory, setInventory] = useState<SocialInventory[]>([]);
  const [deliveries, setDeliveries] = useState<SocialDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [formData, setFormData] = useState({
    requester_name: '',
    requester_phone: '',
    item_requested: '',
    justification: '',
    medical_report_url: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [invRes, delRes] = await Promise.all([
        supabase.from('social_inventory').select('*').eq('active', true).order('name'),
        supabase.from('social_deliveries').select('*').order('delivery_date', { ascending: false }).limit(10)
      ]);

      if (invRes.data) setInventory(invRes.data);
      if (delRes.data) setDeliveries(delRes.data);
    } catch (error) {
      console.error('Error fetching social help data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!acceptedTerms) {
      alert('Debes aceptar los términos y condiciones para continuar.');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('social_requests').insert([formData]);
      if (error) throw error;
      
      // Construct WhatsApp message
      const message = `🆕 *Nueva Solicitud de Ayuda Social*\n\n👤 *Nombre:* ${formData.requester_name}\n📱 *Teléfono:* ${formData.requester_phone}\n📦 *Insumo Requerido:* ${formData.item_requested}\n📝 *Motivo:* ${formData.justification}${formData.medical_report_url ? `\n📄 *Informe Médico:* ${formData.medical_report_url}` : ''}`;
      const whatsappUrl = `https://wa.me/584242384014?text=${encodeURIComponent(message)}`;
      
      setSuccess(true);
      setFormData({
        requester_name: '',
        requester_phone: '',
        item_requested: '',
        justification: '',
        medical_report_url: ''
      });
      setAcceptedTerms(false);

      // Redirect to WhatsApp
      window.open(whatsappUrl, '_blank');
    } catch (error: any) {
      alert('Error al enviar solicitud: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadToImgBB(file);
      setFormData({ ...formData, medical_report_url: url });
    } catch (error: any) {
      alert('Error al subir imagen: ' + error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Hero Section */}
      <div className="bg-ml-monte-verde text-white py-8 sm:py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-ml-quebrada font-bold text-[10px] uppercase tracking-widest mb-4"
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            Iniciativa Social
          </motion.div>
          
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 bg-ml-quebrada rounded-xl flex items-center justify-center text-ml-monte-verde">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-[10px] uppercase font-black text-white/50 tracking-widest">Gestión Directa</p>
                <p className="font-bold">Vía WhatsApp</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Inventory & Transparency */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Available Inventory */}
            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
              <div className="p-6 border-b border-stone-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-ml-monte-verde" />
                  <h2 className="font-black text-stone-900 uppercase tracking-wider text-sm">Insumos Disponibles</h2>
                </div>
                <span className="text-[10px] font-bold text-stone-400 uppercase">Actualizado hoy</span>
              </div>
              
              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-ml-monte-verde/20 border-t-ml-monte-verde rounded-full animate-spin" />
                  </div>
                ) : inventory.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {inventory.map((item) => (
                      <div key={item.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-100 flex items-center gap-4">
                        <div className="w-16 h-16 bg-white rounded-xl border border-stone-100 flex items-center justify-center overflow-hidden">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <Package className="w-6 h-6 text-stone-200" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-stone-900">{item.name}</h3>
                          <p className="text-xs text-stone-500 line-clamp-1">{item.description}</p>
                          <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">
                            {item.quantity} unidades
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-stone-400">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No hay insumos disponibles en este momento.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Transparency / Deliveries */}
            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
              <div className="p-6 border-b border-stone-50">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <h2 className="font-black text-stone-900 uppercase tracking-wider text-sm">Transparencia: Entregas Realizadas</h2>
                </div>
              </div>
              
              <div className="p-6">
                {deliveries.length > 0 ? (
                  <div className="space-y-6">
                    {deliveries.map((delivery) => (
                      <div key={delivery.id} className="flex gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                          <User className="w-6 h-6" />
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-stone-900">{delivery.beneficiary_name}</h3>
                            <span className="text-[10px] text-stone-400 font-medium">
                              {new Date(delivery.delivery_date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-stone-600">Recibió: <span className="font-bold text-ml-monte-verde">{delivery.item_delivered}</span></p>
                          {delivery.description && <p className="text-xs text-stone-400 mt-1 italic">"{delivery.description}"</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-stone-400 text-sm italic">Próximamente se listarán las entregas para garantizar transparencia.</p>
                )}
              </div>
            </div>

          </div>

          {/* Request Form */}
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden sticky top-32">
              <div className="p-6 bg-ml-monte-verde text-white">
                <h2 className="text-xl font-black mb-2">Solicitar Insumo</h2>
                <p className="text-white/70 text-xs leading-relaxed uppercase tracking-widest font-bold">
                  Completa tus datos con honestidad
                </p>
              </div>
              
              <div className="p-6">
                {success ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-black text-stone-900 mb-2">Solicitud Enviada</h3>
                    <p className="text-sm text-stone-500 mb-6">
                      Tu solicitud ha sido registrada. El equipo de Alvert Sanz la revisará y se contactará contigo a la brevedad.
                    </p>
                    <button 
                      onClick={() => setSuccess(false)}
                      className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold text-sm"
                    >
                      Nueva Solicitud
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 px-1">Nombre Completo</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                        <input 
                          required
                          type="text" 
                          value={formData.requester_name}
                          onChange={e => setFormData({...formData, requester_name: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-sm focus:ring-2 focus:ring-ml-quebrada outline-none"
                          placeholder="Tu nombre"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 px-1">Teléfono WhatsApp</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                        <input 
                          required
                          type="tel" 
                          value={formData.requester_phone}
                          onChange={e => setFormData({...formData, requester_phone: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-sm focus:ring-2 focus:ring-ml-quebrada outline-none"
                          placeholder="Ej. 04241234567"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 px-1">Insumo que Necesitas</label>
                      <div className="relative">
                        <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                        <input 
                          required
                          type="text" 
                          value={formData.item_requested}
                          onChange={e => setFormData({...formData, item_requested: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-sm focus:ring-2 focus:ring-ml-quebrada outline-none"
                          placeholder="Ej. Silla de ruedas, Gasa, etc."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 px-1">Justificación / Caso</label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 w-4 h-4 text-stone-300" />
                        <textarea 
                          required
                          rows={4}
                          value={formData.justification}
                          onChange={e => setFormData({...formData, justification: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-sm focus:ring-2 focus:ring-ml-quebrada outline-none resize-none"
                          placeholder="Explica brevemente tu situación..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 px-1">Foto Informe Médico (Opcional)</label>
                      <div className="relative">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="medical-report"
                        />
                        <label 
                          htmlFor="medical-report"
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-sm flex items-center gap-2 cursor-pointer hover:bg-stone-100 transition-colors"
                        >
                          {uploading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-ml-monte-verde" />
                          ) : (
                            <Camera className="w-4 h-4 text-stone-300" />
                          )}
                          <span className="text-stone-500 truncate">
                            {formData.medical_report_url ? 'Informe cargado ✅' : 'Subir foto del informe'}
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                      <p className="text-[10px] text-amber-700 leading-tight font-medium">
                        Es obligatorio presentar informe médico original al momento de la entrega para validar el caso.
                      </p>
                    </div>

                    <div className="space-y-3 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                      <p className="text-[9px] text-stone-500 leading-relaxed">
                        Al enviar esta solicitud, aceptas los siguientes términos: 1) Los insumos médicos deben ser utilizados exclusivamente para el fin declarado y devueltos en buen estado dentro del plazo acordado (si aplica). 2) El mal uso, pérdida o no devolución implicará responsabilidad legal, pudiendo ser sometido a las autoridades competentes. 3) Te comprometes a presentar el informe médico original al momento de la entrega. 4) Aceptas que tus datos sean utilizados para fines de transparencia y gestión del banco social.
                      </p>
                      <label className="flex items-start gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          required
                          checked={acceptedTerms}
                          onChange={e => setAcceptedTerms(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded border-stone-300 text-ml-monte-verde focus:ring-ml-quebrada"
                        />
                        <span className="text-[10px] font-bold text-stone-600 group-hover:text-stone-900 transition-colors">
                          He leído y acepto los términos y condiciones
                        </span>
                      </label>
                    </div>

                    <button 
                      type="submit"
                      disabled={submitting || !acceptedTerms}
                      className="w-full py-4 bg-ml-monte-verde text-white rounded-2xl font-black text-sm hover:bg-ml-monte-verde/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? 'Enviando...' : 'Enviar Solicitud'}
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div className="bg-ml-quebrada/20 p-6 rounded-3xl border border-ml-quebrada/30">
              <h3 className="text-sm font-black text-ml-monte-verde uppercase tracking-widest mb-3">¿Quieres donar?</h3>
              <p className="text-xs text-ml-monte-verde/70 leading-relaxed mb-4">
                Si tienes insumos médicos en buen estado que ya no utilices, puedes donarlos para que lleguen a quien los necesite.
              </p>
              <a 
                href="https://wa.me/584242384014" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-black text-ml-monte-verde hover:underline"
              >
                Contactar al equipo <Send className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 mt-20 text-center">
        <p className="text-sm sm:text-base text-stone-400 max-w-2xl mx-auto leading-relaxed italic">
          Impulsado por <span className="text-stone-600 font-bold">Alvert Sanz</span>. 
          Un espacio dedicado a canalizar la solidaridad y brindar apoyo con insumos médicos a quienes más lo necesitan en nuestra parroquia.
        </p>
      </div>
    </div>
  );
}
