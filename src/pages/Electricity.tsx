import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  ZapOff, 
  Activity, 
  AlertTriangle, 
  Flame, 
  Radio, 
  HelpCircle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Share2, 
  Phone, 
  MapPin, 
  RefreshCw, 
  FileText, 
  Check, 
  ChevronRight, 
  Users, 
  Sparkles,
  Info,
  Wrench,
  ShieldAlert
} from 'lucide-react';
import { 
  electricalService, 
  failureLabels, 
  statusLabels 
} from '../services/electricalService';
import { Circuit, CircuitSector, ElectricalReport, FailureType } from '../lib/supabase';

export default function Electricity() {
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [sectors, setSectors] = useState<CircuitSector[]>([]);
  const [reports, setReports] = useState<ElectricalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'report' | 'check' | 'status'>('report');

  // Form State
  const [selectedSector, setSelectedSector] = useState('');
  const [customSector, setCustomSector] = useState('');
  const [isCustomSector, setIsCustomSector] = useState(false);
  const [deducedCircuit, setDeducedCircuit] = useState<{ circuit: Circuit | null; circuitCode: string }>({
    circuit: null,
    circuitCode: '',
  });
  const [failureType, setFailureType] = useState<FailureType>('corte_total');
  const [locationDetail, setLocationDetail] = useState('');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successReport, setSuccessReport] = useState<ElectricalReport | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedReports, setSearchedReports] = useState<ElectricalReport[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Filter for sectors dropdown
  const [sectorFilter, setSectorFilter] = useState('');
  const [isSectorDropdownOpen, setIsSectorDropdownOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [circuitsData, sectorsData, reportsData] = await Promise.all([
        electricalService.getCircuits(),
        electricalService.getSectors(),
        electricalService.getReports(),
      ]);
      setCircuits(circuitsData);
      setSectors(sectorsData);
      setReports(reportsData);
    } catch (e) {
      console.error('Error loading electrical data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // Handle Sector Selection & Automatic Circuit Deduction
  const handleSelectSector = async (sectorName: string) => {
    setSelectedSector(sectorName);
    setIsCustomSector(false);
    setIsSectorDropdownOpen(false);
    const result = await electricalService.deduceCircuitBySector(sectorName);
    setDeducedCircuit({
      circuit: result.circuit,
      circuitCode: result.circuitCode,
    });
  };

  const handleCustomSectorChange = async (val: string) => {
    setCustomSector(val);
    if (val.trim().length > 1) {
      const result = await electricalService.deduceCircuitBySector(val);
      setDeducedCircuit({
        circuit: result.circuit,
        circuitCode: result.circuitCode,
      });
    } else {
      setDeducedCircuit({ circuit: null, circuitCode: 'A1' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalSector = isCustomSector ? customSector.trim() : selectedSector.trim();
    if (!finalSector) {
      alert('Por favor indica tu sector en Paracotos.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await electricalService.createReport({
        sector: finalSector,
        circuit: deducedCircuit.circuit?.code || deducedCircuit.circuitCode || 'A1',
        circuit_id: deducedCircuit.circuit?.id || null,
        location_detail: locationDetail,
        failure_type: failureType,
        description,
        reporter_name: reporterName,
        reporter_phone: reporterPhone,
      });

      setSuccessReport(created);
      // Reload reports in background
      loadData();
    } catch (err) {
      console.error('Error al registrar reporte:', err);
      alert('Ocurrió un error al enviar el reporte. Por favor inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedSector('');
    setCustomSector('');
    setIsCustomSector(false);
    setDeducedCircuit({ circuit: null, circuitCode: '' });
    setFailureType('corte_total');
    setLocationDetail('');
    setDescription('');
    setReporterName('');
    setReporterPhone('');
    setSuccessReport(null);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await electricalService.searchReports(searchQuery);
      setSearchedReports(results);
    } catch (err) {
      console.error('Error buscando reporte:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Helper icons for failure types
  const getFailureIcon = (type: FailureType) => {
    switch (type) {
      case 'corte_total':
        return <ZapOff className="w-5 h-5 text-rose-600" />;
      case 'bajo_voltaje':
        return <Activity className="w-5 h-5 text-amber-500" />;
      case 'cable_caido':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'transformador':
        return <Flame className="w-5 h-5 text-red-600" />;
      case 'poste':
        return <Radio className="w-5 h-5 text-purple-600" />;
      default:
        return <HelpCircle className="w-5 h-5 text-stone-500" />;
    }
  };

  const filteredSectorsList = sectors.filter((s) =>
    s.sector_name.toLowerCase().includes(sectorFilter.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass bg-gradient-to-br from-ml-monte-verde via-[#044c38] to-stone-900 rounded-[40px] p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400/20 border border-amber-400/30 rounded-full text-amber-300 text-xs font-black uppercase tracking-widest mb-4">
            <Zap className="w-4 h-4 text-amber-400 animate-pulse fill-amber-400" />
            Monitoreo Eléctrico Comunitario
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-tight mb-4">
            Reporte de Fallas <span className="text-amber-400">Eléctricas</span>
          </h1>
          <p className="text-white/80 text-sm sm:text-base font-medium max-w-2xl leading-relaxed">
            Reporta cortes de luz, bajo voltaje o averías en Paracotos. Solo indica tu <strong className="text-white">sector</strong> y nuestro sistema deducirá automáticamente tu <strong className="text-amber-300">circuito eléctrico</strong> para alertar a las cuadrillas de guardia.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-8">
            <button
              onClick={() => {
                setActiveTab('report');
                window.scrollTo({ top: 500, behavior: 'smooth' });
              }}
              className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-stone-900 rounded-[24px] font-black uppercase tracking-wider text-xs shadow-xl transition-all transform active:scale-95 flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-stone-900" />
              Reportar Falla Ahora
            </button>
            <button
              onClick={() => setActiveTab('check')}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-[24px] font-black uppercase tracking-wider text-xs transition-all flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Consultar Mi Folio
            </button>
            <button
              onClick={() => {
                setRefreshing(true);
                loadData();
              }}
              disabled={refreshing}
              className="p-3.5 bg-white/5 hover:bg-white/15 border border-white/10 rounded-[20px] text-white/80 hover:text-white transition-all ml-auto"
              title="Actualizar estado"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Circuit Status Cards (A1, A2, A3) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-ml-monte-verde">
              Estado de los Circuitos en Paracotos
            </h2>
            <div className="h-1 w-16 bg-amber-400 mt-1 rounded-full" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 bg-stone-100 px-3 py-1.5 rounded-full">
            3 Circuitos de Distribución
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {circuits.map((circ) => {
            const activeReportsInCircuit = reports.filter(
              (r) => r.circuit === circ.code && r.status !== 'resuelto'
            );
            const circuitSectors = sectors.filter((s) => s.circuit_id === circ.id);

            const isNormal = circ.status === 'normal' && activeReportsInCircuit.length === 0;
            const hasReports = activeReportsInCircuit.length > 0;

            return (
              <motion.div
                key={circ.id}
                whileHover={{ y: -4 }}
                className="bg-white rounded-[32px] p-6 shadow-xl border border-stone-100 flex flex-col justify-between relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-stone-50 rounded-bl-[40px] flex items-center justify-center -mr-4 -mt-4 text-stone-300 group-hover:text-amber-400/40 transition-colors">
                  <Zap className="w-10 h-10 transform rotate-12" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3.5 py-1 bg-ml-monte-verde text-white text-xs font-black uppercase tracking-wider rounded-full shadow-sm">
                      Circuito {circ.code}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 ${
                        isNormal
                          ? 'bg-emerald-100 text-emerald-800'
                          : hasReports
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isNormal
                            ? 'bg-emerald-500'
                            : hasReports
                            ? 'bg-amber-500 animate-ping'
                            : 'bg-blue-500'
                        }`}
                      />
                      {isNormal ? 'Operativo' : `${activeReportsInCircuit.length} Reportes`}
                    </span>
                  </div>

                  <h3 className="text-base font-black uppercase tracking-tight text-ml-monte-verde mb-2">
                    {circ.name}
                  </h3>
                  <p className="text-xs text-stone-500 mb-4 line-clamp-2 leading-relaxed">
                    {circ.description || 'Circuito eléctrico de alta y media tensión.'}
                  </p>

                  <div className="pt-3 border-t border-stone-100">
                    <p className="text-[10px] font-black uppercase tracking-wider text-stone-400 mb-2">
                      Sectores Principales ({circuitSectors.length}):
                    </p>
                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto no-scrollbar">
                      {circuitSectors.slice(0, 6).map((sec) => (
                        <span
                          key={sec.id}
                          className="text-[10px] font-semibold bg-stone-100 text-stone-600 px-2.5 py-1 rounded-lg"
                        >
                          {sec.sector_name}
                        </span>
                      ))}
                      {circuitSectors.length > 6 && (
                        <span className="text-[10px] font-bold text-ml-monte-verde bg-ml-monte-verde/10 px-2.5 py-1 rounded-lg">
                          +{circuitSectors.length - 6} más
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-400 text-[10px] font-bold uppercase">
                    {hasReports ? 'Atendiendo incidencias' : 'Servicio Estable'}
                  </span>
                  <button
                    onClick={() => {
                      setActiveTab('report');
                      setDeducedCircuit({ circuit: circ, circuitCode: circ.code });
                      window.scrollTo({ top: 550, behavior: 'smooth' });
                    }}
                    className="text-xs font-black uppercase tracking-widest text-ml-monte-verde hover:text-amber-600 flex items-center gap-1 transition-colors"
                  >
                    Reportar en {circ.code} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Tabs Navigation */}
      <div className="flex justify-center">
        <div className="glass bg-white/80 p-1.5 rounded-[28px] border border-stone-200 shadow-lg flex gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('report')}
            className={`px-5 py-3 rounded-[22px] text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'report'
                ? 'bg-ml-monte-verde text-white shadow-md'
                : 'text-stone-600 hover:text-ml-monte-verde hover:bg-stone-100'
            }`}
          >
            <Zap className="w-4 h-4" />
            Reportar Falla
          </button>
          <button
            onClick={() => setActiveTab('check')}
            className={`px-5 py-3 rounded-[22px] text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'check'
                ? 'bg-ml-monte-verde text-white shadow-md'
                : 'text-stone-600 hover:text-ml-monte-verde hover:bg-stone-100'
            }`}
          >
            <Search className="w-4 h-4" />
            Consultar Estado
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`px-5 py-3 rounded-[22px] text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'status'
                ? 'bg-ml-monte-verde text-white shadow-md'
                : 'text-stone-600 hover:text-ml-monte-verde hover:bg-stone-100'
            }`}
          >
            <Activity className="w-4 h-4" />
            Historial de Reportes ({reports.length})
          </button>
        </div>
      </div>

      {/* TAB 1: FORMULARIO DE REPORTE */}
      {activeTab === 'report' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          {successReport ? (
            /* Pantalla de Éxito */
            <div className="bg-white rounded-[40px] p-8 sm:p-12 shadow-2xl border border-stone-100 text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="px-4 py-1.5 bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-widest rounded-full">
                  Folio: {successReport.ticket_code}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-ml-monte-verde mt-3">
                  ¡Reporte Registrado con Éxito!
                </h3>
                <p className="text-sm text-stone-500 max-w-md mx-auto mt-2">
                  La avería ha sido asignada al <strong className="text-ml-monte-verde">Circuito {successReport.circuit}</strong> ({successReport.sector}) y enviada al equipo de gestión eléctrica de Paracotos.
                </p>
              </div>

              {/* Resumen del reporte */}
              <div className="bg-stone-50 rounded-[28px] p-6 text-left border border-stone-200/60 max-w-lg mx-auto space-y-3 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-stone-200">
                  <span className="font-bold text-stone-400 uppercase">Sector:</span>
                  <span className="font-black text-stone-800 uppercase">{successReport.sector}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-stone-200">
                  <span className="font-bold text-stone-400 uppercase">Circuito Asignado:</span>
                  <span className="font-black text-amber-600 uppercase">Circuito {successReport.circuit}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-stone-200">
                  <span className="font-bold text-stone-400 uppercase">Tipo de Avería:</span>
                  <span className="font-bold text-stone-800">
                    {failureLabels[successReport.failure_type]?.label}
                  </span>
                </div>
                {successReport.location_detail && (
                  <div className="flex justify-between items-center py-1 border-b border-stone-200">
                    <span className="font-bold text-stone-400 uppercase">Punto Referencia:</span>
                    <span className="font-semibold text-stone-700 text-right">{successReport.location_detail}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-1">
                  <span className="font-bold text-stone-400 uppercase">Estatus:</span>
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 font-black uppercase text-[10px] rounded-full">
                    Pendiente por Cuadrilla
                  </span>
                </div>
              </div>

              {/* Botones de acción post-reporte */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <a
                  href={electricalService.getWhatsAppShareUrl(successReport)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[24px] font-black uppercase tracking-wider text-xs shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <Share2 className="w-4 h-4" />
                  Notificar Cuadrilla por WhatsApp
                </a>
                <button
                  onClick={resetForm}
                  className="w-full sm:w-auto px-8 py-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-[24px] font-black uppercase tracking-wider text-xs transition-colors"
                >
                  Registrar Otro Reporte
                </button>
              </div>
            </div>
          ) : (
            /* Formulario */
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-[40px] p-6 sm:p-10 shadow-2xl border border-stone-100 space-y-8"
            >
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-ml-monte-verde">
                  Formulario de Reporte de Avería
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Completa los datos para que el equipo pueda ubicar la falla y programar la cuadrilla.
                </p>
              </div>

              {/* PASO 1: SECTOR (Deducción automática de circuito) */}
              <div className="space-y-3">
                <label className="block text-xs font-black uppercase tracking-wider text-ml-monte-verde">
                  1. Selecciona tu Sector en Paracotos <span className="text-amber-500">*</span>
                </label>
                <p className="text-[11px] text-stone-500">
                  Al elegir tu sector, el circuito eléctrico (A1, A2 o A3) se calculará automáticamente.
                </p>

                {!isCustomSector ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsSectorDropdownOpen(!isSectorDropdownOpen)}
                      className="w-full px-5 py-4 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-[24px] text-left text-sm font-bold flex items-center justify-between transition-colors"
                    >
                      <span className={selectedSector ? 'text-stone-900 font-black uppercase' : 'text-stone-400'}>
                        {selectedSector || 'Toca para buscar o seleccionar tu sector...'}
                      </span>
                      <ChevronRight className={`w-5 h-5 text-stone-400 transition-transform ${isSectorDropdownOpen ? 'rotate-90' : ''}`} />
                    </button>

                    {/* Dropdown flotante con filtro */}
                    {isSectorDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[28px] border border-stone-200 shadow-2xl z-50 p-3 max-h-72 overflow-hidden flex flex-col">
                        <div className="relative mb-2">
                          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                          <input
                            type="text"
                            placeholder="Buscar sector (ej. Casco Central, Maitana, Palo Negro)..."
                            value={sectorFilter}
                            onChange={(e) => setSectorFilter(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-stone-100 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ml-monte-verde"
                            autoFocus
                          />
                        </div>

                        <div className="overflow-y-auto space-y-1 pr-1">
                          {filteredSectorsList.map((sec) => (
                            <button
                              key={sec.id}
                              type="button"
                              onClick={() => handleSelectSector(sec.sector_name)}
                              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${
                                selectedSector === sec.sector_name
                                  ? 'bg-ml-monte-verde text-white'
                                  : 'hover:bg-stone-100 text-stone-800'
                              }`}
                            >
                              <span>{sec.sector_name}</span>
                              <span className="text-[10px] opacity-70">
                                {circuits.find((c) => c.id === sec.circuit_id)?.code ? `Circuito ${circuits.find((c) => c.id === sec.circuit_id)?.code}` : ''}
                              </span>
                            </button>
                          ))}

                          {filteredSectorsList.length === 0 && (
                            <div className="p-4 text-center text-xs text-stone-400">
                              No encontramos ese sector en la lista registrada.
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setIsCustomSector(true);
                              setSelectedSector('');
                              setIsSectorDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 rounded-xl text-xs font-black text-amber-700 bg-amber-50 hover:bg-amber-100 mt-2 flex items-center justify-between"
                          >
                            <span>+ Mi sector no aparece (Escribir manualmente)</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Escribe el nombre de tu sector o calle..."
                        value={customSector}
                        onChange={(e) => handleCustomSectorChange(e.target.value)}
                        className="flex-grow px-5 py-4 bg-stone-50 border border-stone-200 rounded-[24px] text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-ml-monte-verde"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomSector(false);
                          setCustomSector('');
                        }}
                        className="px-4 py-2 text-xs font-black text-stone-500 hover:text-stone-800 uppercase"
                      >
                        Volver a la lista
                      </button>
                    </div>
                  </div>
                )}

                {/* Badge de Circuito Deducido en tiempo real */}
                {(selectedSector || customSector) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-[22px] bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-transparent border border-amber-300/40 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500 text-stone-900 rounded-xl flex items-center justify-center font-black shadow-md">
                        <Zap className="w-5 h-5 fill-stone-900" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-amber-900">
                          Circuito Deducido Automáticamente:
                        </p>
                        <p className="text-sm font-black uppercase text-ml-monte-verde">
                          {deducedCircuit.circuit?.name || `Circuito ${deducedCircuit.circuitCode}`}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-amber-400 text-stone-900 text-xs font-black uppercase rounded-full shadow-sm">
                      {deducedCircuit.circuit?.code || deducedCircuit.circuitCode || 'A1'}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* PASO 2: TIPO DE AVERÍA */}
              <div className="space-y-3">
                <label className="block text-xs font-black uppercase tracking-wider text-ml-monte-verde">
                  2. ¿Qué tipo de problema se presenta? <span className="text-amber-500">*</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(Object.keys(failureLabels) as FailureType[]).map((type) => {
                    const item = failureLabels[type];
                    const isSelected = failureType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFailureType(type)}
                        className={`p-4 rounded-[24px] border text-left transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'bg-ml-monte-verde text-white border-ml-monte-verde shadow-lg scale-[1.01]'
                            : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-800'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-white shadow-sm'
                          }`}
                        >
                          {getFailureIcon(type)}
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-tight">{item.label}</p>
                          <p
                            className={`text-[10px] mt-0.5 line-clamp-2 ${
                              isSelected ? 'text-white/80' : 'text-stone-500'
                            }`}
                          >
                            {item.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PASO 3: DETALLES DE UBICACIÓN */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-ml-monte-verde mb-1.5">
                    3. Punto de Referencia o Dirección Exacta
                  </label>
                  <div className="relative">
                    <MapPin className="w-5 h-5 text-stone-400 absolute left-4 top-4" />
                    <input
                      type="text"
                      placeholder="Ej. Frente al abasto Los Mangos, poste con transformador gris"
                      value={locationDetail}
                      onChange={(e) => setLocationDetail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-[22px] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ml-monte-verde"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-ml-monte-verde mb-1.5">
                    Descripción Breve de la Falla
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe lo sucedido (ej. Se escuchó una detonación fuerte hace 30 minutos y se fue la luz en toda la cuadra)..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-4 bg-stone-50 border border-stone-200 rounded-[22px] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ml-monte-verde"
                  />
                </div>
              </div>

              {/* PASO 4: DATOS DE CONTACTO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-600 mb-1.5">
                    Nombre del Vecino / Reportante
                  </label>
                  <input
                    type="text"
                    placeholder="Tu nombre y apellido"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-[20px] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ml-monte-verde"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-600 mb-1.5">
                    Teléfono o WhatsApp de Contacto
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
                    <input
                      type="tel"
                      placeholder="Ej. 0414-1234567"
                      value={reporterPhone}
                      onChange={(e) => setReporterPhone(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-[20px] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ml-monte-verde"
                    />
                  </div>
                </div>
              </div>

              {/* BOTÓN DE ENVÍO */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting || (!selectedSector && !customSector)}
                  className="w-full py-5 bg-ml-monte-verde hover:bg-ml-quebrada disabled:bg-stone-300 text-white rounded-[26px] font-black uppercase tracking-wider text-sm shadow-xl transition-all transform active:scale-98 flex items-center justify-center gap-3"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Procesando Reporte...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 fill-amber-400 text-amber-400" />
                      Registrar Reporte de Falla Eléctrica
                    </>
                  )}
                </button>
                <p className="text-center text-[10px] text-stone-400 uppercase tracking-widest mt-3">
                  Reporte verificado bajo el sistema JX4 Paracotos
                </p>
              </div>
            </form>
          )}
        </motion.div>
      )}

      {/* TAB 2: CONSULTAR FOLIO O TELÉFONO */}
      {activeTab === 'check' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          <div className="bg-white rounded-[36px] p-6 sm:p-10 shadow-xl border border-stone-100">
            <h3 className="text-2xl font-black uppercase tracking-tight text-ml-monte-verde mb-2">
              Consulta el Estado de tu Reporte
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              Ingresa el código de folio (ej. <code className="bg-stone-100 px-2 py-0.5 rounded text-stone-800">ELEC-A2-4821</code>) o el número de teléfono con el que reportaste.
            </p>

            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-grow">
                <Search className="w-5 h-5 text-stone-400 absolute left-4 top-4" />
                <input
                  type="text"
                  placeholder="Número de Folio o Teléfono..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-[22px] text-sm font-bold focus:outline-none focus:ring-2 focus:ring-ml-monte-verde"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="px-6 py-4 bg-ml-monte-verde hover:bg-ml-quebrada disabled:bg-stone-300 text-white rounded-[22px] font-black uppercase tracking-wider text-xs shadow-md transition-all shrink-0 flex items-center gap-2"
              >
                {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Buscar
              </button>
            </form>
          </div>

          {/* Resultados de búsqueda */}
          {searchedReports !== null && (
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-stone-400">
                Resultados de Búsqueda ({searchedReports.length})
              </h4>

              {searchedReports.length === 0 ? (
                <div className="bg-white rounded-[32px] p-8 text-center border border-stone-200">
                  <HelpCircle className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-stone-700">No se encontraron reportes con ese criterio.</p>
                  <p className="text-xs text-stone-400 mt-1">Verifica que el número de folio o teléfono esté bien escrito.</p>
                </div>
              ) : (
                searchedReports.map((report) => {
                  const sInfo = statusLabels[report.status] || { label: report.status, bg: 'bg-stone-100', color: 'text-stone-800' };
                  return (
                    <div
                      key={report.id}
                      className="bg-white rounded-[32px] p-6 shadow-xl border border-stone-100 space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black bg-stone-900 text-white px-3 py-1 rounded-full">
                            {report.ticket_code || report.id}
                          </span>
                          <span className="text-xs font-black uppercase text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                            Circuito {report.circuit}
                          </span>
                        </div>
                        <span className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${sInfo.bg} ${sInfo.color}`}>
                          {sInfo.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="font-bold text-stone-400 uppercase text-[10px]">Sector:</p>
                          <p className="font-black text-stone-800 text-sm uppercase">{report.sector}</p>
                          {report.location_detail && (
                            <p className="text-stone-500 text-[11px] mt-0.5">{report.location_detail}</p>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-stone-400 uppercase text-[10px]">Avería:</p>
                          <p className="font-black text-stone-800">
                            {failureLabels[report.failure_type]?.label || report.failure_type}
                          </p>
                          <p className="text-stone-400 text-[10px] mt-0.5">
                            Fecha: {new Date(report.created_at).toLocaleDateString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      {/* Timeline de Seguimiento */}
                      <div className="bg-stone-50 rounded-[24px] p-4 border border-stone-200/60">
                        <p className="text-[10px] font-black uppercase tracking-wider text-stone-400 mb-3">
                          Línea de Progreso:
                        </p>
                        <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-black uppercase">
                          <div className={`p-2 rounded-xl ${report.status === 'pendiente' || report.status === 'en_revision' || report.status === 'cuadrilla_asignada' || report.status === 'resuelto' ? 'bg-amber-400 text-stone-900' : 'bg-stone-200 text-stone-400'}`}>
                            1. Recibido
                          </div>
                          <div className={`p-2 rounded-xl ${report.status === 'en_revision' || report.status === 'cuadrilla_asignada' || report.status === 'resuelto' ? 'bg-amber-400 text-stone-900' : 'bg-stone-200 text-stone-400'}`}>
                            2. Revisión
                          </div>
                          <div className={`p-2 rounded-xl ${report.status === 'cuadrilla_asignada' || report.status === 'resuelto' ? 'bg-purple-500 text-white' : 'bg-stone-200 text-stone-400'}`}>
                            3. Cuadrilla
                          </div>
                          <div className={`p-2 rounded-xl ${report.status === 'resuelto' ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-400'}`}>
                            4. Resuelto
                          </div>
                        </div>

                        {report.assigned_crew && (
                          <div className="mt-3 pt-2 border-t border-stone-200 text-xs flex items-center gap-2 text-purple-900 font-bold">
                            <Wrench className="w-4 h-4 text-purple-600" />
                            Cuadrilla asignada: {report.assigned_crew}
                          </div>
                        )}

                        {report.admin_notes && (
                          <div className="mt-2 text-xs text-stone-600 bg-white p-3 rounded-xl border border-stone-200">
                            <strong className="text-stone-800">Nota del equipo:</strong> {report.admin_notes}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end">
                        <a
                          href={electricalService.getWhatsAppShareUrl(report)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-black uppercase text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          Compartir Actualización por WhatsApp
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* TAB 3: TABLERO DE REPORTES COMUNITARIOS */}
      {activeTab === 'status' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black uppercase tracking-tight text-ml-monte-verde">
              Reportes Eléctricos Recientes en Paracotos
            </h3>
            <span className="text-xs text-stone-400 font-bold">
              Total registrados: {reports.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((report) => {
              const sInfo = statusLabels[report.status] || { label: report.status, bg: 'bg-stone-100', color: 'text-stone-800' };
              return (
                <div
                  key={report.id}
                  className="bg-white rounded-[28px] p-5 shadow-lg border border-stone-100 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                        {report.ticket_code || report.id.slice(0, 8)}
                      </span>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${sInfo.bg} ${sInfo.color}`}>
                        {sInfo.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <h4 className="font-black uppercase text-sm text-ml-monte-verde tracking-tight">
                        {report.sector}
                      </h4>
                      <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                        Circuito {report.circuit}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-stone-700 mb-1">
                      {failureLabels[report.failure_type]?.label || report.failure_type}
                    </p>

                    {report.location_detail && (
                      <p className="text-[11px] text-stone-500 line-clamp-1 mb-2">
                        📍 {report.location_detail}
                      </p>
                    )}

                    {report.description && (
                      <p className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100 line-clamp-2">
                        "{report.description}"
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[10px] font-bold text-stone-400">
                    <span>
                      {new Date(report.created_at).toLocaleDateString('es-VE', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {report.assigned_crew && (
                      <span className="text-purple-700 font-black uppercase">
                        ⚡ {report.assigned_crew}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
