import React, { useState, useEffect } from 'react';
import { supabase, SocialInventory, SocialRequest, SocialDelivery } from '../../lib/supabase';
import { Heart, Package, CheckCircle, Clock, AlertCircle, Plus, Trash2, Edit2, Search, Filter, User, Phone, FileText, X, Loader2, Camera, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { uploadToImgBB } from '../../services/imgbbService';

export default function SocialManagement() {
  const [inventory, setInventory] = useState<SocialInventory[]>([]);
  const [requests, setRequests] = useState<SocialRequest[]>([]);
  const [deliveries, setDeliveries] = useState<SocialDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inventory' | 'requests' | 'deliveries'>('requests');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'inventory' | 'delivery' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form states
  const [inventoryForm, setInventoryForm] = useState({
    name: '',
    description: '',
    quantity: 0,
    image_url: '',
    active: true
  });

  const [deliveryForm, setDeliveryForm] = useState({
    beneficiary_name: '',
    item_delivered: '',
    description: '',
    image_url: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [invRes, reqRes, delRes] = await Promise.all([
        supabase.from('social_inventory').select('*').order('name'),
        supabase.from('social_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('social_deliveries').select('*').order('delivery_date', { ascending: false })
      ]);

      if (invRes.data) setInventory(invRes.data);
      if (reqRes.data) setRequests(reqRes.data);
      if (delRes.data) setDeliveries(delRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleInventorySubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.from('social_inventory').insert([inventoryForm]);
      if (error) throw error;
      setIsModalOpen(false);
      setInventoryForm({ name: '', description: '', quantity: 0, image_url: '', active: true });
      fetchData();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, type: 'inventory' | 'delivery') {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadToImgBB(file);
      if (type === 'inventory') {
        setInventoryForm({ ...inventoryForm, image_url: url });
      } else {
        setDeliveryForm({ ...deliveryForm, image_url: url });
      }
    } catch (error: any) {
      alert('Error al subir imagen: ' + error.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDeliverySubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.from('social_deliveries').insert([deliveryForm]);
      if (error) throw error;
      setIsModalOpen(false);
      setDeliveryForm({ beneficiary_name: '', item_delivered: '', description: '', image_url: '' });
      fetchData();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function updateRequestStatus(id: string, status: string) {
    try {
      const { error } = await supabase.from('social_requests').update({ status }).eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  }

  async function deleteInventory(id: string) {
    if (!confirm('¿Estás seguro de eliminar este insumo?')) return;
    try {
      const { error } = await supabase.from('social_inventory').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-ml-monte-verde text-white rounded-2xl flex items-center justify-center shadow-lg shadow-ml-monte-verde/20">
            <Heart className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">Gestión Ayuda Social</h1>
            <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Panel de Alvert Sanz</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => { setModalType('inventory'); setIsModalOpen(true); }}
            className="px-6 py-3 bg-ml-monte-verde text-white rounded-xl text-xs font-black hover:bg-ml-monte-verde/90 transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nuevo Insumo
          </button>
          <button 
            onClick={() => { setModalType('delivery'); setIsModalOpen(true); }}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-sm"
          >
            <CheckCircle className="w-4 h-4" />
            Registrar Entrega
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('requests')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'requests' ? 'bg-white text-ml-monte-verde shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
        >
          Solicitudes ({requests.length})
        </button>
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'inventory' ? 'bg-white text-ml-monte-verde shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
        >
          Inventario ({inventory.length})
        </button>
        <button 
          onClick={() => setActiveTab('deliveries')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'deliveries' ? 'bg-white text-ml-monte-verde shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
        >
          Entregas ({deliveries.length})
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-stone-400">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="text-sm font-bold uppercase tracking-widest">Cargando datos...</p>
          </div>
        ) : (
          <>
            {activeTab === 'requests' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-stone-50 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                      <th className="px-8 py-5">Solicitante</th>
                      <th className="px-8 py-5">Insumo</th>
                      <th className="px-8 py-5">Estado</th>
                      <th className="px-8 py-5">Fecha</th>
                      <th className="px-8 py-5">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {requests.map((req) => (
                      <tr key={req.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="font-bold text-stone-900">{req.requester_name}</span>
                            <span className="text-xs text-stone-500">{req.requester_phone}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-stone-700">{req.item_requested}</span>
                            <span className="text-[10px] text-stone-400 italic line-clamp-1">{req.justification}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                            req.status === 'delivered' ? 'bg-blue-100 text-blue-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {req.status === 'pending' ? 'Pendiente' :
                             req.status === 'approved' ? 'Aprobado' :
                             req.status === 'delivered' ? 'Entregado' : 'Rechazado'}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-xs text-stone-500">
                          {new Date(req.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex gap-2">
                            <select 
                              value={req.status}
                              onChange={(e) => updateRequestStatus(req.id, e.target.value)}
                              className="text-[10px] font-bold border-none bg-stone-100 rounded-lg px-2 py-1 outline-none"
                            >
                              <option value="pending">Pendiente</option>
                              <option value="approved">Aprobar</option>
                              <option value="delivered">Entregado</option>
                              <option value="rejected">Rechazar</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inventory.map((item) => (
                  <div key={item.id} className="p-6 bg-stone-50 rounded-3xl border border-stone-100 flex flex-col gap-4 relative group">
                    <button 
                      onClick={() => deleteInventory(item.id)}
                      className="absolute top-4 right-4 p-2 text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="w-16 h-16 bg-white rounded-2xl border border-stone-100 flex items-center justify-center overflow-hidden">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-7 h-7 text-stone-200" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900">{item.name}</h3>
                      <p className="text-xs text-stone-500 mt-1">{item.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-stone-200/50">
                      <span className="text-xs font-black text-ml-monte-verde uppercase tracking-widest">Stock: {item.quantity}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${item.active ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-500'}`}>
                        {item.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'deliveries' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-stone-50 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                      <th className="px-8 py-5">Beneficiario</th>
                      <th className="px-8 py-5">Insumo Entregado</th>
                      <th className="px-8 py-5">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {deliveries.map((del) => (
                      <tr key={del.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-8 py-5 font-bold text-stone-900">{del.beneficiary_name}</td>
                        <td className="px-8 py-5 text-sm text-stone-600">{del.item_delivered}</td>
                        <td className="px-8 py-5 text-xs text-stone-500">
                          {new Date(del.delivery_date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-stone-100 flex items-center justify-between bg-stone-50">
                <h3 className="text-xl font-black text-stone-900">
                  {modalType === 'inventory' ? 'Nuevo Insumo' : 'Registrar Entrega'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>

              <div className="p-8">
                {modalType === 'inventory' ? (
                  <form onSubmit={handleInventorySubmit} className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 px-1">Nombre del Insumo</label>
                      <input 
                        required
                        type="text" 
                        value={inventoryForm.name}
                        onChange={e => setInventoryForm({...inventoryForm, name: e.target.value})}
                        className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl text-sm focus:ring-2 focus:ring-ml-monte-verde outline-none"
                        placeholder="Ej. Silla de Ruedas"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 px-1">Descripción</label>
                      <textarea 
                        rows={3}
                        value={inventoryForm.description}
                        onChange={e => setInventoryForm({...inventoryForm, description: e.target.value})}
                        className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl text-sm focus:ring-2 focus:ring-ml-monte-verde outline-none resize-none"
                        placeholder="Detalles del insumo..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 px-1">Cantidad</label>
                        <input 
                          required
                          type="number" 
                          value={inventoryForm.quantity}
                          onChange={e => setInventoryForm({...inventoryForm, quantity: parseInt(e.target.value)})}
                          className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl text-sm focus:ring-2 focus:ring-ml-monte-verde outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 px-1">Imagen del Insumo</label>
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={e => handleImageUpload(e, 'inventory')}
                            className="hidden"
                            id="inventory-image"
                          />
                          <label 
                            htmlFor="inventory-image"
                            className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl text-sm flex items-center gap-2 cursor-pointer hover:bg-stone-100 transition-colors"
                          >
                            {uploading ? (
                              <Loader2 className="w-4 h-4 animate-spin text-ml-monte-verde" />
                            ) : (
                              <Camera className="w-4 h-4 text-stone-400" />
                            )}
                            <span className="text-stone-500 truncate">
                              {inventoryForm.image_url ? 'Imagen lista' : 'Subir imagen'}
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <button 
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 bg-ml-monte-verde text-white rounded-2xl font-black text-sm hover:bg-ml-monte-verde/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? 'Guardando...' : 'Guardar Insumo'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleDeliverySubmit} className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 px-1">Nombre del Beneficiario</label>
                      <input 
                        required
                        type="text" 
                        value={deliveryForm.beneficiary_name}
                        onChange={e => setDeliveryForm({...deliveryForm, beneficiary_name: e.target.value})}
                        className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                        placeholder="Nombre de quien recibe"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 px-1">Insumo Entregado</label>
                      <input 
                        required
                        type="text" 
                        value={deliveryForm.item_delivered}
                        onChange={e => setDeliveryForm({...deliveryForm, item_delivered: e.target.value})}
                        className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                        placeholder="Ej. 1 Silla de Ruedas"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 px-1">Foto de la Entrega (Opcional)</label>
                      <div className="relative">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={e => handleImageUpload(e, 'delivery')}
                          className="hidden"
                          id="delivery-image"
                        />
                        <label 
                          htmlFor="delivery-image"
                          className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl text-sm flex items-center gap-2 cursor-pointer hover:bg-stone-100 transition-colors"
                        >
                          {uploading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                          ) : (
                            <Camera className="w-4 h-4 text-stone-400" />
                          )}
                          <span className="text-stone-500 truncate">
                            {deliveryForm.image_url ? 'Imagen lista' : 'Subir foto evidencia'}
                          </span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 px-1">Nota / Comentario</label>
                      <textarea 
                        rows={3}
                        value={deliveryForm.description}
                        onChange={e => setDeliveryForm({...deliveryForm, description: e.target.value})}
                        className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-600 outline-none resize-none"
                        placeholder="Detalles de la entrega..."
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? 'Registrando...' : 'Registrar Entrega'}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
