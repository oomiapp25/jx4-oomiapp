import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Database, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

export default function SeedData() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  async function seedDemoData() {
    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      // 1. Create Departments
      const depts = [
        { name: 'Ferretería', slug: 'ferreteria', icon: 'Home' },
        { name: 'Supermercado', slug: 'supermercado', icon: 'ShoppingBag' },
        { name: 'Farmacia', slug: 'farmacia', icon: 'ShieldCheck' },
        { name: 'Tecnología', slug: 'tecnologia', icon: 'Smartphone' }
      ];

      const { data: createdDepts, error: deptsError } = await supabase
        .from('departments')
        .upsert(depts, { onConflict: 'slug' })
        .select();

      if (deptsError) throw deptsError;

      // 2. Create Categories
      const categories = [
        { name: 'Herramientas', slug: 'herramientas' },
        { name: 'Alimentos', slug: 'alimentos' },
        { name: 'Medicamentos', slug: 'medicamentos' },
        { name: 'Celulares', slug: 'celulares' }
      ];

      const { data: createdCats, error: catsError } = await supabase
        .from('categories')
        .upsert(categories, { onConflict: 'slug' })
        .select();

      if (catsError) throw catsError;

      // 3. Create Products
      if (createdDepts && createdCats) {
        const products = [
          {
            title: 'Martillo de Carpintero',
            description: 'Martillo de acero forjado con mango ergonómico.',
            price: 15.50,
            stock: 50,
            images: ['https://picsum.photos/seed/hammer/800/800'],
            department_id: createdDepts.find(d => d.slug === 'ferreteria')?.id,
            category_id: createdCats.find(c => c.slug === 'herramientas')?.id
          },
          {
            title: 'Arroz Premium 1kg',
            description: 'Arroz blanco de grano largo, calidad superior.',
            price: 1.20,
            stock: 200,
            images: ['https://picsum.photos/seed/rice/800/800'],
            department_id: createdDepts.find(d => d.slug === 'supermercado')?.id,
            category_id: createdCats.find(c => c.slug === 'alimentos')?.id
          },
          {
            title: 'Paracetamol 500mg',
            description: 'Caja de 20 tabletas para el alivio del dolor.',
            price: 3.00,
            stock: 100,
            images: ['https://picsum.photos/seed/medicine/800/800'],
            department_id: createdDepts.find(d => d.slug === 'farmacia')?.id,
            category_id: createdCats.find(c => c.slug === 'medicamentos')?.id
          },
          {
            title: 'iPhone 15 Pro',
            description: 'El último smartphone de Apple con chip A17 Pro.',
            price: 999.00,
            stock: 10,
            images: ['https://picsum.photos/seed/iphone/800/800'],
            department_id: createdDepts.find(d => d.slug === 'tecnologia')?.id,
            category_id: createdCats.find(c => c.slug === 'celulares')?.id
          }
        ];

        const { error: productsError } = await supabase
          .from('products')
          .insert(products);

        if (productsError) throw productsError;
      }

      // 4. Create Transport Lines
      const transportLines = [
        {
          name: 'Línea Paracotos - Caracas',
          origin: 'Paracotos',
          destination: 'Caracas',
          schedule: '5:00 AM - 8:00 PM',
          departure_time: '05:00 AM',
          arrival_time: '06:30 AM',
          price: 2.50,
          news_update: 'Operando con normalidad.',
          status: 'normal',
          whatsapp: '584120000000',
          active: true
        },
        {
          name: 'Línea Paracotos - Los Teques',
          origin: 'Paracotos',
          destination: 'Los Teques',
          schedule: '6:00 AM - 6:00 PM',
          departure_time: '06:00 AM',
          arrival_time: '07:00 AM',
          price: 1.50,
          news_update: 'Retraso por mantenimiento en la vía.',
          status: 'retraso',
          whatsapp: '584120000001',
          active: true
        }
      ];

      const { error: linesError } = await supabase
        .from('transport_lines')
        .insert(transportLines);

      if (linesError) throw linesError;

      // 5. Create Transports (Delivery)
      const transports = [
        {
          name: 'Juan Delivery',
          carrier_info: 'Moto propia, rápido y seguro.',
          base_price: 2.00,
          has_papers: true,
          vehicle_type: 'Moto',
          whatsapp: '584120000002'
        },
        {
          name: 'Transportes Paracotos',
          carrier_info: 'Camioneta para fletes y mudanzas.',
          base_price: 15.00,
          has_papers: true,
          vehicle_type: 'Camioneta',
          whatsapp: '584120000003'
        }
      ];

      const { error: transportsError } = await supabase
        .from('transports')
        .insert(transports);

      if (transportsError) throw transportsError;

      // 6. Create News
      const news = [
        {
          title: 'Inauguración de JX4 Paracotos',
          excerpt: 'La nueva plataforma de comercio local ya está disponible.',
          content: 'Hoy celebramos el lanzamiento oficial de JX4 Paracotos, una herramienta diseñada para potenciar el comercio en nuestra parroquia.',
          image_url: 'https://picsum.photos/seed/news1/1200/630',
          active: true,
          published_at: new Date().toISOString()
        }
      ];

      const { error: newsError } = await supabase
        .from('news')
        .insert(news);

      if (newsError) throw newsError;

      // 7. Create Job Offers
      const jobs = [
        {
          title: 'Vendedor de Mostrador',
          company: 'Ferretería El Clavo',
          description: 'Se busca persona proactiva con conocimiento en herramientas.',
          contact_info: 'Enviar CV a ferreteria@ejemplo.com',
          active: true
        }
      ];

      const { error: jobsError } = await supabase
        .from('job_offers')
        .insert(jobs);

      if (jobsError) throw jobsError;

      // 8. Create Services
      const services = [
        {
          title: 'Plomería General',
          provider_name: 'Carlos Tubos',
          description: 'Reparación de filtraciones, instalación de piezas sanitarias.',
          whatsapp: '584120000004',
          category: 'Hogar',
          active: true
        }
      ];

      const { error: servicesError } = await supabase
        .from('services_portfolio')
        .insert(services);

      if (servicesError) throw servicesError;

      setStatus({ type: 'success', message: '¡Datos demo creados exitosamente!' });
    } catch (err: any) {
      console.error('Error seeding data:', err);
      setStatus({ type: 'error', message: 'Error al crear datos: ' + err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-ml-neutral text-ml-secundario rounded-xl flex items-center justify-center">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Generador de Datos Demo</h3>
          <p className="text-xs text-stone-500">Puebla la base de datos con información de prueba para verificar el funcionamiento.</p>
        </div>
      </div>

      <div className="space-y-4">
        {status.type && (
          <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
            status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {status.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {status.message}
          </div>
        )}

        <button
          onClick={seedDemoData}
          disabled={loading}
          className="w-full py-3 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creando datos...
            </>
          ) : (
            'Generar Información Demo'
          )}
        </button>
      </div>
    </div>
  );
}
