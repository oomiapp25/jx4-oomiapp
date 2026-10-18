import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Plus, 
  Trash2, 
  Edit2, 
  Search, 
  Filter, 
  X, 
  Loader2, 
  CheckCircle, 
  AlertTriangle, 
  Wrench, 
  Activity, 
  Phone, 
  MapPin, 
  Copy, 
  Share2, 
  Save, 
  Check, 
  RefreshCw, 
  Radio, 
  Flame, 
  ZapOff,
  Database,
  ExternalLink
} from 'lucide-react';
import { 
  electricalService, 
  failureLabels, 
  statusLabels 
} from '../../services/electricalService';
import { Circuit, CircuitSector, ElectricalReport, ReportStatus, FailureType } from '../../lib/supabase';

export default function ElectricityManagement() {
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [sectors, setSectors] = useState<CircuitSector[]>([]);
  const [reports, setReports] = useState<ElectricalReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs
  const [activeTab, setActiveTab] = useState<'reports' | 'sectors' | 'sql'>('reports');

  // Filters for reports
  const [circuitFilter, setCircuitFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [failureFilter, setFailureFilter] = useState('ALL');
  const [searchFilter, setSearchFilter] = useState('');

  // Sector management state
  const [newSectorCircuitId, setNewSectorCircuitId] = useState('');
  const [newSectorName, setNewSectorName] = useState('');
  const [sectorSearch, setSectorSearch] = useState('');
  const [isAddingSector, setIsAddingSector] = useState(false);

  // Edit Report Modal
  const [editingReport, setEditingReport] = useState<ElectricalReport | null>(null);
  const [modalStatus, setModalStatus] = useState<ReportStatus>('pendiente');
  const [modalCrew, setModalCrew] = useState('');
  const [modalNotes, setModalNotes] = useState('');
  const [savingReport, setSavingReport] = useState(false);

  // Manual Report Modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    sector: '',
    circuit: 'A1',
    failure_type: 'corte_total' as FailureType,
    location_detail: '',
    description: '',
    reporter_name: '',
    reporter_phone: '',
  });

  // Copied SQL state
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    try {
      const [cData, sData, rData] = await Promise.all([
        electricalService.getCircuits(),
        electricalService.getAllSectorsAdmin(),
        electricalService.getReports(),
      ]);
      setCircuits(cData);
      setSectors(sData);
      setReports(rData);
      if (cData.length > 0 && !newSectorCircuitId) {
        setNewSectorCircuitId(cData[0].id);
      }
    } catch (e) {
      console.error('Error al cargar datos de electricidad:', e);
    } finally {
      setLoading(false);
    }
  }

  // Handle Quick Status Change
  const handleQuickStatusChange = async (reportId: string, newStatus: ReportStatus) => {
    try {
      await electricalService.updateReport(reportId, { status: newStatus });
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
      );
    } catch (e) {
      console.error('Error actualizando estatus:', e);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (report: ElectricalReport) => {
    setEditingReport(report);
    setModalStatus(report.status);
    setModalCrew(report.assigned_crew || '');
    setModalNotes(report.admin_notes || '');
  };

  // Save Edit Modal
  const handleSaveEdit = async () => {
    if (!editingReport) return;
    setSavingReport(true);
    try {
      const updated = await electricalService.updateReport(editingReport.id, {
        status: modalStatus,
        assigned_crew: modalCrew.trim() || undefined,
        admin_notes: modalNotes.trim() || undefined,
      });
      if (updated) {
        setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      }
      setEditingReport(null);
    } catch (e) {
      console.error('Error guardando cambios del reporte:', e);
    } finally {
      setSavingReport(false);
    }
  };

  // Add new sector
  const handleAddSector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectorName.trim() || !newSectorCircuitId) return;

    setIsAddingSector(true);
    try {
      const created = await electricalService.addSector(newSectorCircuitId, newSectorName.trim());
      setSectors((prev) => [...prev, created]);
      setNewSectorName('');
    } catch (e) {
      console.error('Error agregando sector:', e);
    } finally {
      setIsAddingSector(false);
    }
  };

  // Toggle Sector Active
  const handleToggleSector = async (sectorId: string, currentActive: boolean) => {
    try {
      await electricalService.toggleSectorActive(sectorId, !currentActive);
      setSectors((prev) =>
        prev.map((s) => (s.id === sectorId ? { ...s, active: !currentActive } : s))
      );
    } catch (e) {
      console.error('Error alternando sector:', e);
    }
  };

  // Delete Sector
  const handleDeleteSector = async (sectorId: string, sectorName: string) => {
    if (!confirm(`¿Eliminar el sector "${sectorName}" del circuito?`)) return;
    try {
      await electricalService.deleteSector(sectorId);
      setSectors((prev) => prev.filter((s) => s.id !== sectorId));
    } catch (e) {
      console.error('Error eliminando sector:', e);
    }
  };

  // Create Manual Report
  const handleCreateManualReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.sector.trim()) {
      alert('Indica el sector de la avería');
      return;
    }

    try {
      const created = await electricalService.createReport({
        sector: manualForm.sector,
        circuit: manualForm.circuit,
        failure_type: manualForm.failure_type,
        location_detail: manualForm.location_detail,
        description: manualForm.description,
        reporter_name: manualForm.reporter_name || 'Reporte Manual Admin',
        reporter_phone: manualForm.reporter_phone,
      });
      setReports((prev) => [created, ...prev]);
      setIsManualModalOpen(false);
      setManualForm({
        sector: '',
        circuit: 'A1',
        failure_type: 'corte_total',
        location_detail: '',
        description: '',
        reporter_name: '',
        reporter_phone: '',
      });
    } catch (e) {
      console.error('Error creando reporte manual:', e);
    }
  };

  // Metrics
  const totalReports = reports.length;
  const pendingCount = reports.filter((r) => r.status === 'pendiente').length;
  const inReviewCount = reports.filter((r) => r.status === 'en_revision').length;
  const crewAssignedCount = reports.filter((r) => r.status === 'cuadrilla_asignada').length;
  const resolvedCount = reports.filter((r) => r.status === 'resuelto').length;

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    if (circuitFilter !== 'ALL' && r.circuit !== circuitFilter) return false;
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (failureFilter !== 'ALL' && r.failure_type !== failureFilter) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      const matchTicket = r.ticket_code?.toLowerCase().includes(q);
      const matchSector = r.sector?.toLowerCase().includes(q);
      const matchName = r.reporter_name?.toLowerCase().includes(q);
      const matchPhone = r.reporter_phone?.includes(q);
      if (!matchTicket && !matchSector && !matchName && !matchPhone) return false;
    }
    return true;
  });

  const sqlCode = `-- SQL para Supabase: Módulo de Electricidad JX4 Paracotos
-- Copia y pega en el SQL Editor de tu proyecto Supabase:

CREATE TABLE IF NOT EXISTS circuits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'normal',
  status_updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS circuit_sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circuit_id UUID REFERENCES circuits(id) ON DELETE CASCADE,
  sector_name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(circuit_id, sector_name)
);

CREATE TABLE IF NOT EXISTS electrical_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_code TEXT,
  sector TEXT NOT NULL,
  circuit TEXT NOT NULL,
  circuit_id UUID REFERENCES circuits(id) ON DELETE SET NULL,
  location_detail TEXT,
  failure_type TEXT NOT NULL,
  description TEXT,
  reporter_name TEXT,
  reporter_phone TEXT,
  status TEXT DEFAULT 'pendiente',
  admin_notes TEXT,
  assigned_crew TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_circuit_sectors_circuit ON circuit_sectors(circuit_id);
CREATE INDEX IF NOT EXISTS idx_circuit_sectors_name ON circuit_sectors(LOWER(sector_name));
CREATE INDEX IF NOT EXISTS idx_electrical_reports_circuit ON electrical_reports(circuit);
CREATE INDEX IF NOT EXISTS idx_electrical_reports_status ON electrical_reports(status);

ALTER TABLE circuits ENABLE ROW LEVEL SECURITY;
ALTER TABLE circuit_sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE electrical_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura publica circuits" ON circuits FOR SELECT USING (true);
CREATE POLICY "Lectura publica circuit_sectors" ON circuit_sectors FOR SELECT USING (true);
CREATE POLICY "Insercion publica reportes" ON electrical_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Lectura reportes publica" ON electrical_reports FOR SELECT USING (true);
CREATE POLICY "Modificacion admin reportes" ON electrical_reports FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin total circuit_sectors" ON circuit_sectors FOR ALL USING (auth.role() = 'authenticated');
`;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-black uppercase tracking-wider mb-2">
            <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            Servicios Públicos de Paracotos
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-ml-monte-verde">
            Panel de Gestión Eléctrica
          </h1>
          <p className="text-xs text-stone-500">
            Control de averías en Circuitos A1, A2 y A3 y administración de sectores en Paracotos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-stone-900 rounded-[20px] font-black uppercase text-xs tracking-wider shadow-lg flex items-center gap-2 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Nuevo Reporte Manual
          </button>
          <button
            onClick={loadAllData}
            disabled={loading}
            className="p-3 bg-white hover:bg-stone-50 border border-stone-200 rounded-[20px] text-stone-600 shadow-sm transition-colors"
            title="Refrescar datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-5 rounded-[28px] border border-stone-200/80 shadow-md">
          <p className="text-[10px] font-black uppercase tracking-wider text-stone-400">Total Reportes</p>
          <p className="text-2xl font-black text-stone-800 tracking-tight mt-1">{totalReports}</p>
        </div>
        <div className="bg-amber-50/80 p-5 rounded-[28px] border border-amber-200 shadow-md">
          <p className="text-[10px] font-black uppercase tracking-wider text-amber-800">Pendientes</p>
          <p className="text-2xl font-black text-amber-600 tracking-tight mt-1">{pendingCount}</p>
        </div>
        <div className="bg-blue-50/80 p-5 rounded-[28px] border border-blue-200 shadow-md">
          <p className="text-[10px] font-black uppercase tracking-wider text-blue-800">En Revisión</p>
          <p className="text-2xl font-black text-blue-600 tracking-tight mt-1">{inReviewCount}</p>
        </div>
        <div className="bg-purple-50/80 p-5 rounded-[28px] border border-purple-200 shadow-md">
          <p className="text-[10px] font-black uppercase tracking-wider text-purple-800">Cuadrilla Asignada</p>
          <p className="text-2xl font-black text-purple-600 tracking-tight mt-1">{crewAssignedCount}</p>
        </div>
        <div className="bg-emerald-50/80 p-5 rounded-[28px] border border-emerald-200 shadow-md col-span-2 sm:col-span-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-emerald-800">Resueltos</p>
          <p className="text-2xl font-black text-emerald-600 tracking-tight mt-1">{resolvedCount}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 gap-2">
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 px-4 font-black uppercase text-xs tracking-wider transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'border-ml-monte-verde text-ml-monte-verde'
              : 'border-transparent text-stone-400 hover:text-stone-700'
          }`}
        >
          <Zap className="w-4 h-4" />
          Reportes de Averías ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab('sectors')}
          className={`pb-3 px-4 font-black uppercase text-xs tracking-wider transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'sectors'
              ? 'border-ml-monte-verde text-ml-monte-verde'
              : 'border-transparent text-stone-400 hover:text-stone-700'
          }`}
        >
          <MapPin className="w-4 h-4" />
          Circuitos y Sectores ({sectors.length})
        </button>
        <button
          onClick={() => setActiveTab('sql')}
          className={`pb-3 px-4 font-black uppercase text-xs tracking-wider transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'sql'
              ? 'border-ml-monte-verde text-ml-monte-verde'
              : 'border-transparent text-stone-400 hover:text-stone-700'
          }`}
        >
          <Database className="w-4 h-4" />
          Script Supabase SQL
        </button>
      </div>

      {/* TAB 1: GESTIÓN DE REPORTES */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white p-5 rounded-[28px] border border-stone-200/80 shadow-md space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Folio, sector o nombre..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ml-monte-verde"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1">
                  Circuito
                </label>
                <select
                  value={circuitFilter}
                  onChange={(e) => setCircuitFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ml-monte-verde"
                >
                  <option value="ALL">Todos los Circuitos</option>
                  <option value="A1">Circuito A1</option>
                  <option value="A2">Circuito A2</option>
                  <option value="A3">Circuito A3</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1">
                  Estatus
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ml-monte-verde"
                >
                  <option value="ALL">Todos los Estatus</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="en_revision">En Revisión</option>
                  <option value="cuadrilla_asignada">Cuadrilla Asignada</option>
                  <option value="resuelto">Resuelto</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1">
                  Tipo de Avería
                </label>
                <select
                  value={failureFilter}
                  onChange={(e) => setFailureFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ml-monte-verde"
                >
                  <option value="ALL">Todas las Averías</option>
                  <option value="corte_total">Corte Total</option>
                  <option value="bajo_voltaje">Bajo Voltaje</option>
                  <option value="cable_caido">Cable Caído</option>
                  <option value="transformador">Falla Transformador</option>
                  <option value="poste">Poste Dañado</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>

            {(circuitFilter !== 'ALL' || statusFilter !== 'ALL' || failureFilter !== 'ALL' || searchFilter) && (
              <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                <span className="text-stone-400 text-[11px]">
                  Mostrando {filteredReports.length} de {reports.length} reportes
                </span>
                <button
                  onClick={() => {
                    setCircuitFilter('ALL');
                    setStatusFilter('ALL');
                    setFailureFilter('ALL');
                    setSearchFilter('');
                  }}
                  className="text-amber-700 hover:text-amber-900 font-bold uppercase text-[10px]"
                >
                  Limpiar Filtros
                </button>
              </div>
            )}
          </div>

          {/* List of Reports */}
          <div className="space-y-3">
            {filteredReports.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-[32px] border border-stone-200">
                <ZapOff className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-stone-700">No hay reportes con los filtros seleccionados.</p>
              </div>
            ) : (
              filteredReports.map((report) => {
                const sInfo = statusLabels[report.status] || { label: report.status, bg: 'bg-stone-100', color: 'text-stone-800' };
                return (
                  <motion.div
                    key={report.id}
                    layout
                    className="bg-white rounded-[26px] p-5 border border-stone-200/70 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Info */}
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-black bg-stone-900 text-white px-2.5 py-0.5 rounded-md">
                            {report.ticket_code || report.id.slice(0, 8)}
                          </span>
                          <span className="text-xs font-black uppercase text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                            Circuito {report.circuit}
                          </span>
                          <span className="text-xs font-black uppercase text-ml-monte-verde">
                            {report.sector}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            • {new Date(report.created_at).toLocaleDateString('es-VE', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-stone-800">
                            {failureLabels[report.failure_type]?.label || report.failure_type}
                          </span>
                          {report.location_detail && (
                            <span className="text-xs text-stone-500 truncate">
                              — 📍 {report.location_detail}
                            </span>
                          )}
                        </div>

                        {report.description && (
                          <p className="text-xs text-stone-600 line-clamp-1 italic">
                            "{report.description}"
                          </p>
                        )}

                        {/* Contact & Crew */}
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-stone-500">
                          <span>
                            Vecino: <strong className="text-stone-700">{report.reporter_name}</strong>
                          </span>
                          {report.reporter_phone && (
                            <a
                              href={`https://wa.me/${report.reporter_phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-700 hover:underline flex items-center gap-1 font-bold"
                            >
                              <Phone className="w-3 h-3" />
                              {report.reporter_phone}
                            </a>
                          )}
                          {report.assigned_crew && (
                            <span className="text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-md">
                              🔧 {report.assigned_crew}
                            </span>
                          )}
                          {report.admin_notes && (
                            <span className="text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md truncate max-w-xs">
                              Nota: {report.admin_notes}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-100">
                        {/* Status Dropdown */}
                        <select
                          value={report.status}
                          onChange={(e) => handleQuickStatusChange(report.id, e.target.value as ReportStatus)}
                          className={`text-xs font-black uppercase px-3 py-2 rounded-xl border font-mono transition-colors ${sInfo.bg} ${sInfo.color}`}
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="en_revision">En Revisión</option>
                          <option value="cuadrilla_asignada">Cuadrilla Asignada</option>
                          <option value="resuelto">Resuelto</option>
                        </select>

                        <button
                          onClick={() => handleOpenEdit(report)}
                          className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors"
                          title="Gestionar cuadrilla y notas"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <a
                          href={electricalService.getWhatsAppShareUrl(report)}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl transition-colors"
                          title="Compartir por WhatsApp"
                        >
                          <Share2 className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: GESTIÓN DE CIRCUITOS Y SECTORES */}
      {activeTab === 'sectors' && (
        <div className="space-y-8">
          {/* Form to add a new sector to any circuit */}
          <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-stone-200/80 shadow-lg">
            <h3 className="text-lg font-black uppercase tracking-tight text-ml-monte-verde mb-1">
              Añadir Nuevo Sector a un Circuito
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              El gerente de electricidad puede registrar nuevos sectores o caseríos para que el sistema los deduzca automáticamente sin tocar código.
            </p>

            <form onSubmit={handleAddSector} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1">
                  Circuito Asignado
                </label>
                <select
                  value={newSectorCircuitId}
                  onChange={(e) => setNewSectorCircuitId(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-ml-monte-verde"
                >
                  {circuits.map((c) => (
                    <option key={c.id} value={c.id}>
                      Circuito {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1">
                  Nombre del Sector o Comunidad
                </label>
                <input
                  type="text"
                  placeholder="Ej. Urbanización El Bosque, Caserío San José..."
                  value={newSectorName}
                  onChange={(e) => setNewSectorName(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-ml-monte-verde"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isAddingSector || !newSectorName.trim()}
                  className="w-full py-3.5 bg-ml-monte-verde hover:bg-ml-quebrada disabled:bg-stone-300 text-white rounded-2xl font-black uppercase text-xs tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Guardar Sector
                </button>
              </div>
            </form>
          </div>

          {/* List of Circuits with Sectors */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {circuits.map((circ) => {
              const circSectors = sectors.filter((s) => s.circuit_id === circ.id);
              return (
                <div
                  key={circ.id}
                  className="bg-white rounded-[32px] p-6 border border-stone-200 shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-3 py-1 bg-ml-monte-verde text-white text-xs font-black uppercase rounded-full">
                        Circuito {circ.code}
                      </span>
                      <span className="text-[10px] font-bold text-stone-400 uppercase">
                        {circSectors.length} Sectores
                      </span>
                    </div>

                    <h4 className="font-black uppercase text-sm text-stone-800 tracking-tight mb-2">
                      {circ.name}
                    </h4>
                    <p className="text-xs text-stone-500 mb-4">{circ.description}</p>

                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {circSectors.map((sector) => (
                        <div
                          key={sector.id}
                          className="flex items-center justify-between p-2.5 bg-stone-50 hover:bg-stone-100 rounded-xl text-xs transition-colors"
                        >
                          <span className={`font-bold ${sector.active ? 'text-stone-800' : 'text-stone-400 line-through'}`}>
                            {sector.sector_name}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleToggleSector(sector.id, sector.active)}
                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                                sector.active
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-stone-200 text-stone-600'
                              }`}
                            >
                              {sector.active ? 'Activo' : 'Inactivo'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSector(sector.id, sector.sector_name)}
                              className="p-1 text-stone-400 hover:text-rose-600 rounded"
                              title="Eliminar sector"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 text-[10px] text-stone-400">
                    ID Circuito: {circ.id.slice(0, 8)}...
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: SUPABASE SQL SCRIPT */}
      {activeTab === 'sql' && (
        <div className="bg-stone-900 text-stone-100 rounded-[32px] p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-amber-400">
                Script SQL para Supabase (Tablas de Electricidad)
              </h3>
              <p className="text-xs text-stone-400">
                Ejecuta este código en el editor SQL de Supabase para activar la sincronización permanente en la nube.
              </p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(sqlCode);
                setCopiedSql(true);
                setTimeout(() => setCopiedSql(false), 3000);
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-900 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-colors"
            >
              {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedSql ? 'Copiado al Portapapeles' : 'Copiar SQL'}
            </button>
          </div>

          <pre className="p-4 bg-stone-950 rounded-2xl overflow-x-auto text-[11px] font-mono text-stone-300 border border-stone-800">
            {sqlCode}
          </pre>
        </div>
      )}

      {/* MODAL: EDITAR REPORTE / ASIGNAR CUADRILLA */}
      <AnimatePresence>
        {editingReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingReport(null)}
              className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-[32px] p-6 sm:p-8 max-w-lg w-full shadow-2xl z-10 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <span className="font-mono text-xs font-black bg-stone-900 text-white px-2.5 py-0.5 rounded">
                    {editingReport.ticket_code || editingReport.id}
                  </span>
                  <h3 className="text-base font-black uppercase text-ml-monte-verde mt-1">
                    Gestionar Reporte: {editingReport.sector}
                  </h3>
                </div>
                <button
                  onClick={() => setEditingReport(null)}
                  className="p-2 text-stone-400 hover:text-stone-700 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1">
                    Estatus del Reporte
                  </label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value as ReportStatus)}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_revision">En Revisión</option>
                    <option value="cuadrilla_asignada">Cuadrilla Asignada</option>
                    <option value="resuelto">Resuelto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1">
                    Cuadrilla o Técnico Asignado
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Cuadrilla 1 - Técnico Morales"
                    value={modalCrew}
                    onChange={(e) => setModalCrew(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1">
                    Notas Internas o Informe de Reparación
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Escribe el diagnóstico, piezas reemplazadas o motivo de demora..."
                    value={modalNotes}
                    onChange={(e) => setModalNotes(e.target.value)}
                    className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingReport(null)}
                  className="px-4 py-2.5 text-xs font-bold text-stone-500 hover:text-stone-800 uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={savingReport}
                  className="px-6 py-2.5 bg-ml-monte-verde hover:bg-ml-quebrada text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-2"
                >
                  {savingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Guardar Cambios
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: NUEVO REPORTE MANUAL */}
      <AnimatePresence>
        {isManualModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsManualModalOpen(false)}
              className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-[32px] p-6 sm:p-8 max-w-lg w-full shadow-2xl z-10 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="text-base font-black uppercase text-ml-monte-verde">
                  Registrar Reporte Manual (Llamada Telefónica / Guardia)
                </h3>
                <button
                  onClick={() => setIsManualModalOpen(false)}
                  className="p-2 text-stone-400 hover:text-stone-700 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateManualReport} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1">
                      Sector
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Maitana"
                      value={manualForm.sector}
                      onChange={(e) => setManualForm({ ...manualForm, sector: e.target.value })}
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1">
                      Circuito
                    </label>
                    <select
                      value={manualForm.circuit}
                      onChange={(e) => setManualForm({ ...manualForm, circuit: e.target.value })}
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold"
                    >
                      <option value="A1">Circuito A1</option>
                      <option value="A2">Circuito A2</option>
                      <option value="A3">Circuito A3</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1">
                    Tipo de Avería
                  </label>
                  <select
                    value={manualForm.failure_type}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, failure_type: e.target.value as FailureType })
                    }
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="corte_total">Corte Total</option>
                    <option value="bajo_voltaje">Bajo Voltaje</option>
                    <option value="cable_caido">Cable Caído</option>
                    <option value="transformador">Falla de Transformador</option>
                    <option value="poste">Poste Dañado</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1">
                    Punto de Referencia
                  </label>
                  <input
                    type="text"
                    placeholder="Ubicación o calle exacta..."
                    value={manualForm.location_detail}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, location_detail: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1">
                      Nombre Vecino
                    </label>
                    <input
                      type="text"
                      placeholder="Nombre..."
                      value={manualForm.reporter_name}
                      onChange={(e) =>
                        setManualForm({ ...manualForm, reporter_name: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      placeholder="0414..."
                      value={manualForm.reporter_phone}
                      onChange={(e) =>
                        setManualForm({ ...manualForm, reporter_phone: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setIsManualModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-stone-500 uppercase"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-ml-monte-verde hover:bg-ml-quebrada text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md"
                  >
                    Crear Reporte
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
