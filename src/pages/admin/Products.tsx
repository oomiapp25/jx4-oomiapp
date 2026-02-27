import { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { supabase, Product } from '../../lib/supabase';
import { Plus, Search, Edit2, Trash2, Package, X, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { uploadToImgBB } from '../../services/imgbbService';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    department_id: '',
    images: [] as string[]
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [manualImageUrl, setManualImageUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
    fetchMetadata();
  }, []);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        title: editingProduct.title,
        description: editingProduct.description,
        price: editingProduct.price.toString(),
        stock: editingProduct.stock.toString(),
        category_id: editingProduct.category_id || '',
        department_id: editingProduct.department_id || '',
        images: editingProduct.images || []
      });
    } else {
      setFormData({ 
        title: '', 
        description: '', 
        price: '', 
        stock: '', 
        category_id: '', 
        department_id: '', 
        images: [] 
      });
    }
  }, [editingProduct]);

  async function fetchProducts() {
    const { data } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  }

  async function fetchMetadata() {
    const { data: cats } = await supabase.from('categories').select('*');
    const { data: depts } = await supabase.from('departments').select('*');
    if (cats) setCategories(cats);
    if (depts) setDepartments(depts);
  }

  function openCreateModal() {
    setEditingProduct(null);
    setIsModalOpen(true);
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setIsModalOpen(true);
  }

  async function deleteProduct(id: string) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) alert('Error: ' + error.message);
    else fetchProducts();
  }

  function addManualImage() {
    if (!manualImageUrl.trim()) return;
    if (!manualImageUrl.startsWith('http')) {
      alert('Por favor ingresa una URL válida (debe empezar con http)');
      return;
    }
    setFormData({ ...formData, images: [...formData.images, manualImageUrl.trim()] });
    setManualImageUrl('');
  }

  async function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages = [...formData.images];

    for (const file of Array.from(files)) {
      try {
        const imageUrl = await uploadToImgBB(file as File);
        newImages.push(imageUrl);
      } catch (error) {
        console.error('Error uploading image to ImgBB:', error);
        alert('Error al subir imagen. Por favor intenta de nuevo.');
      }
    }

    setFormData({ ...formData, images: newImages });
    setUploading(false);
  }

  function removeImage(index: number) {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    const productData = {
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      category_id: formData.category_id || null,
      department_id: formData.department_id || null,
      images: formData.images,
    };

    let error;
    if (editingProduct) {
      const { error: updateError } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('products')
        .insert(productData);
      error = insertError;
    }

    if (error) {
      alert('Error: ' + error.message);
    } else {
      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData({ title: '', description: '', price: '', stock: '', images: [] });
      fetchProducts();
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o SKU..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
          />
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-stone-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </button>
      </div>

      {/* Modal */}
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
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                <h3 className="text-lg font-black text-stone-900">
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone-50 rounded-full transition-colors">
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 px-1">Título</label>
                      <input 
                        required
                        type="text" 
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 px-1">Precio ($)</label>
                        <input 
                          required
                          type="number" 
                          step="0.01"
                          value={formData.price}
                          onChange={e => setFormData({...formData, price: e.target.value})}
                          className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 px-1">Stock</label>
                        <input 
                          required
                          type="number" 
                          value={formData.stock}
                          onChange={e => setFormData({...formData, stock: e.target.value})}
                          className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 px-1">Categoría</label>
                        <select 
                          value={formData.category_id}
                          onChange={e => setFormData({...formData, category_id: e.target.value})}
                          className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                          <option value="">Seleccionar...</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 px-1">Departamento</label>
                        <select 
                          value={formData.department_id}
                          onChange={e => setFormData({...formData, department_id: e.target.value})}
                          className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                          <option value="">Seleccionar...</option>
                          {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 px-1">Descripción</label>
                      <textarea 
                        rows={4}
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 px-1">Imágenes del Producto</label>
                    
                    {/* Manual URL Input */}
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Pegar URL de imagen..."
                        value={manualImageUrl}
                        onChange={(e) => setManualImageUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addManualImage())}
                        className="flex-grow px-4 py-2 bg-stone-50 border border-stone-100 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <button 
                        type="button"
                        onClick={addManualImage}
                        className="px-4 py-2 bg-stone-100 text-stone-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-200 transition-all"
                      >
                        Añadir
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {formData.images.map((url, index) => (
                        <div key={index} className="aspect-square rounded-xl overflow-hidden bg-stone-100 relative group">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="aspect-square rounded-xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-400 hover:border-emerald-500 hover:text-emerald-600 transition-all"
                      >
                        {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
                        <span className="text-[10px] font-bold mt-1">{uploading ? 'Subiendo...' : 'Añadir'}</span>
                      </button>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />
                    <p className="text-[10px] text-stone-400 italic">Puedes subir múltiples imágenes. La primera será la principal.</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-stone-100 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 border border-stone-200 rounded-xl text-sm font-bold text-stone-600 hover:bg-stone-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={loading || uploading}
                    className="flex-1 py-3 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Guardando...' : (editingProduct ? 'Guardar Cambios' : 'Crear Producto')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4">Precio</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.length > 0 ? products.map((product) => (
                <tr key={product.id} className="text-sm hover:bg-stone-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-stone-100 overflow-hidden">
                        <img src={product.images[0] || 'https://picsum.photos/seed/prod/40/40'} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">{product.title}</p>
                        <p className="text-[10px] text-stone-400 font-mono">ID: {product.id.slice(0,8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-stone-500">
                    {(product as any).categories?.name || 'Sin categoría'}
                  </td>
                  <td className="px-6 py-4 font-bold text-stone-900">${product.price}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      product.stock > 10 ? 'bg-emerald-50 text-emerald-600' : 
                      product.stock > 0 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {product.stock} en stock
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(product)}
                        className="p-2 text-stone-400 hover:text-emerald-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteProduct(product.id)}
                        className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center text-stone-400">
                      <Package className="w-12 h-12 mb-4 opacity-20" />
                      <p className="text-sm font-medium">No hay productos registrados</p>
                      <button className="mt-4 text-xs font-bold text-emerald-600 hover:underline">Crear el primero</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
