import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Search, Filter, ChevronRight, ShoppingCart, Plus } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase, Product, Category, Department } from '../lib/supabase';
import { useCart } from '../hooks/useCart';
import { IconRenderer } from '../components/IconRenderer';
import { parseImages } from '../lib/utils';

export default function Catalog() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number>(43.31);

  useEffect(() => {
    fetchData();
    fetchExchangeRate();
  }, []);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const filteredProducts = products
        .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 5)
        .map(p => ({ ...p, type: 'product' }));
      
      const filteredDepts = departments
        .filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 3)
        .map(d => ({ ...d, type: 'department' }));

      setSuggestions([...filteredDepts, ...filteredProducts]);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, products, departments]);

  async function fetchExchangeRate() {
    const { data } = await supabase.from('settings').select('*').eq('key', 'exchange_rate').single();
    if (data) setExchangeRate(parseFloat(data.value.rate));
  }

  async function fetchData() {
    try {
      const [productsRes, categoriesRes, departmentsRes] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('categories').select('*'),
        supabase.from('departments').select('*')
      ]);

      if (productsRes.data) setProducts(productsRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (departmentsRes.data) setDepartments(departmentsRes.data);
    } catch (error) {
      console.error('Error fetching catalog data:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
    const matchesDepartment = !selectedDepartment || product.department_id === selectedDepartment;
    
    // Filter by sector if selected
    const productDept = departments.find(d => d.id === product.department_id);
    const matchesSector = !selectedSector || productDept?.sector === selectedSector;
    
    return matchesSearch && matchesCategory && matchesDepartment && matchesSector;
  });

  const uniqueSectors = Array.from(new Set(departments.map(d => d.sector).filter(Boolean))) as string[];

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const result = addToCart(product, 1);
    if (result?.success === false) {
      const choice = confirm(
        `${result.message}\n\n` +
        `• Aceptar: Ir al carrito para finalizar la compra actual.\n` +
        `• Cancelar: Seguir viendo productos.`
      );
      if (choice) {
        navigate('/checkout');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-ml-monte-verde font-black uppercase tracking-widest">Cargando Catálogo...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ml-white-cal pb-20">
      {/* Header */}
      <div className="bg-emerald-900 text-white pt-12 pb-20 px-4 rounded-b-[50px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 mb-2">
              <ShoppingBag className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Catálogo Completo</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none text-white">
              Todo lo que necesitas <br /> <span className="text-amber-400">en un solo lugar</span>
            </h1>
          </motion.div>

          {/* Search Bar */}
          <div className="mt-10 max-w-2xl mx-auto relative">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-900 w-5 h-5 group-focus-within:scale-110 transition-transform" />
              <input 
                type="text"
                placeholder="¿Qué estás buscando hoy?"
                value={searchQuery}
                onFocus={() => searchQuery.trim().length > 1 && setShowSuggestions(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchParams(prev => {
                    if (e.target.value) {
                      prev.set('q', e.target.value);
                    } else {
                      prev.delete('q');
                    }
                    return prev;
                  }, { replace: true });
                }}
                className="w-full bg-white/95 backdrop-blur-xl border-none rounded-[30px] py-5 pl-16 pr-24 text-emerald-900 placeholder:text-emerald-900/40 font-bold shadow-2xl focus:ring-4 focus:ring-amber-400/30 transition-all outline-none"
              />
              <button 
                onClick={() => {
                  if (searchQuery.trim()) {
                    setSearchParams({ q: searchQuery.trim() });
                  }
                }}
                className="absolute right-3 top-3 bottom-3 px-6 bg-emerald-800 text-white rounded-[20px] hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg"
              >
                <Search className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Buscar</span>
              </button>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <>
                <div 
                  className="fixed inset-0 z-[-1]" 
                  onClick={() => setShowSuggestions(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 mt-4 bg-white/95 backdrop-blur-xl rounded-[30px] border border-white/40 shadow-2xl overflow-hidden z-[100] p-2"
                >
                  {suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (item.type === 'product') {
                          navigate(`/producto/${item.id}`);
                        } else {
                          navigate(`/departamento/${item.slug}`);
                        }
                        setShowSuggestions(false);
                      }}
                      className="w-full flex items-center gap-4 p-4 hover:bg-ml-monte-verde/5 rounded-2xl transition-colors text-left group"
                    >
                      <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center text-ml-monte-verde group-hover:bg-ml-monte-verde group-hover:text-white transition-all overflow-hidden">
                        {item.type === 'product' ? (
                          <img src={parseImages(item.images)[0] || 'https://picsum.photos/seed/product/40/40'} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <IconRenderer iconId={item.icon} className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-ml-monte-verde uppercase tracking-tighter">
                          {item.type === 'product' ? item.title : item.name}
                        </p>
                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                          {item.type === 'product' ? 'Producto' : 'Departamento'}
                        </p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
        {/* Filters */}
        <div className="flex flex-col gap-6 mb-10">
          {/* Sector Filter */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-ml-monte-verde uppercase tracking-widest px-2">Filtrar por Sector</h4>
            <div className="flex overflow-x-auto no-scrollbar flex gap-3 pb-2">
              <button 
                onClick={() => setSelectedSector(null)}
                className={`px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all shadow-lg ${!selectedSector ? 'bg-ml-quebrada text-white' : 'bg-white text-ml-monte-verde hover:bg-stone-100'}`}
              >
                Todos los Sectores
              </button>
              {uniqueSectors.map(sector => (
                <button 
                  key={sector}
                  onClick={() => setSelectedSector(sector)}
                  className={`px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all shadow-lg ${selectedSector === sector ? 'bg-ml-quebrada text-white' : 'bg-white text-ml-monte-verde hover:bg-stone-100'}`}
                >
                  {sector}
                </button>
              ))}
            </div>
          </div>

          {/* Department Filter */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-ml-monte-verde uppercase tracking-widest px-2">Filtrar por Tienda / Depto</h4>
            <div className="flex overflow-x-auto no-scrollbar flex gap-3 pb-2">
              <button 
                onClick={() => setSelectedDepartment(null)}
                className={`px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all shadow-lg ${!selectedDepartment ? 'bg-ml-monte-verde text-white' : 'bg-white text-ml-monte-verde hover:bg-stone-100'}`}
              >
                Todas las Tiendas
              </button>
              {departments
                .filter(dept => !selectedSector || dept.sector === selectedSector)
                .map(dept => (
                  <button 
                    key={dept.id}
                    onClick={() => setSelectedDepartment(dept.id)}
                    className={`px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all shadow-lg ${selectedDepartment === dept.id ? 'bg-ml-monte-verde text-white' : 'bg-white text-ml-monte-verde hover:bg-stone-100'}`}
                  >
                    {dept.name}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group bg-white rounded-[40px] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-stone-100 flex flex-col"
            >
              <Link to={`/producto/${product.id}`} className="relative aspect-square overflow-hidden block">
                <img 
                  src={parseImages(product.images)[0] || 'https://picsum.photos/seed/product/400/400'} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  alt={product.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-black text-ml-monte-verde uppercase tracking-tighter leading-tight group-hover:text-ml-quebrada transition-colors line-clamp-2">
                    {product.title}
                  </h4>
                </div>
                
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <div>
                    <div className="text-xl font-black text-ml-monte-verde tracking-tighter">
                      ${product.price}
                    </div>
                    <div className="text-[10px] font-black text-ml-quebrada uppercase tracking-widest">
                      {Math.round(product.price * exchangeRate)} Bs.
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => handleQuickAdd(e, product)}
                    className="w-12 h-12 bg-ml-monte-verde text-white rounded-2xl flex items-center justify-center hover:bg-ml-quebrada transition-all shadow-lg shadow-ml-monte-verde/20 active:scale-90"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-stone-300" />
            </div>
            <h3 className="text-xl font-black text-ml-monte-verde uppercase tracking-tighter">No encontramos productos</h3>
            <p className="text-stone-400 font-bold mt-2">Intenta con otra búsqueda o filtro</p>
          </div>
        )}
      </div>
    </div>
  );
}
