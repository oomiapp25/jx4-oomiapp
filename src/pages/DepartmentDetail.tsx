import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, Product, Department } from '../lib/supabase';
import { motion } from 'motion/react';
import { Package, ArrowLeft, Filter } from 'lucide-react';
import { getIconById } from '../lib/icons';

export default function DepartmentDetail() {
  const { slug } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [slug]);

  async function fetchData() {
    setLoading(true);
    // 1. Fetch Department
    const { data: deptData } = await supabase
      .from('departments')
      .select('*')
      .eq('slug', slug)
      .single();

    if (deptData) {
      setDepartment(deptData);
      // 2. Fetch Products for this department
      const { data: prodData } = await supabase
        .from('products')
        .select('*')
        .eq('department_id', deptData.id)
        .order('created_at', { ascending: false });
      
      if (prodData) setProducts(prodData);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse text-stone-400 font-medium">Cargando departamento...</div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-ml-dark mb-4">Departamento no encontrado</h2>
        <Link to="/" className="text-ml-acento font-bold hover:underline">Volver al inicio</Link>
      </div>
    );
  }

  const DeptIcon = getIconById(department.icon);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-ml-monte-verde">
            <DeptIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-ml-monte-verde tracking-tighter">{department.name}</h1>
            <p className="text-sm text-ml-hierro">Explora todos los productos de este departamento</p>
          </div>
        </div>
        <Link to="/" className="flex items-center gap-2 text-sm font-bold text-ml-hierro hover:text-ml-monte-verde transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded overflow-hidden shadow-sm hover:shadow-md transition-shadow group border border-transparent hover:border-ml-white-cal"
            >
              <Link to={`/producto/${product.id}`} className="block aspect-square overflow-hidden bg-white relative p-4">
                <img 
                  src={product.images[0] || 'https://picsum.photos/seed/product/400/400'} 
                  alt={product.title}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              </Link>
              <div className="p-4 border-t border-ml-white-cal">
                <div className="flex flex-col gap-1">
                  <span className="text-xl font-normal text-ml-monte-verde">${product.price}</span>
                  <p className="text-xs text-ml-quebrada font-bold">Envío gratis</p>
                  <Link to={`/producto/${product.id}`} className="text-sm text-ml-monte-verde hover:text-ml-hierro transition-colors line-clamp-2 mt-1 leading-tight">
                    {product.title}
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-stone-200">
          <Package className="w-16 h-16 text-stone-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-ml-dark mb-2">No hay productos aún</h3>
          <p className="text-sm text-ml-hierro">Vuelve pronto para ver las novedades de este departamento.</p>
        </div>
      )}
    </div>
  );
}
