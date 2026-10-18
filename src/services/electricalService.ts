import { supabase, Circuit, CircuitSector, ElectricalReport, ReportStatus, FailureType } from '../lib/supabase';

// Seed data inicial para Paracotos si la base de datos aún no ha sido migrada
const INITIAL_CIRCUITS: Circuit[] = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    code: 'A1',
    name: 'Circuito A1 - Casco Central y Zonas Bajas',
    description: 'Alimenta el Casco Central de Paracotos, Plaza Bolívar, La Candelaria y sectores aledaños.',
    active: true,
    status: 'normal',
    status_updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    code: 'A2',
    name: 'Circuito A2 - Maitana, El Hato y Zonas Altas',
    description: 'Cubre Maitana, El Hato (alto), La Suiza, Las Lagunitas y cordillera este.',
    active: true,
    status: 'normal',
    status_updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    code: 'A3',
    name: 'Circuito A3 - Palo Negro, Los Lirios y Caseríos',
    description: 'Alimenta Palo Negro, Los Lirios, Bucarito, San Ramón, El Laurel y vía sur.',
    active: true,
    status: 'normal',
    status_updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
];

const INITIAL_SECTORS: CircuitSector[] = [
  // Circuito A1
  { id: 's101', circuit_id: 'c1111111-1111-1111-1111-111111111111', sector_name: 'Casco Central', active: true },
  { id: 's102', circuit_id: 'c1111111-1111-1111-1111-111111111111', sector_name: 'Plaza Bolívar', active: true },
  { id: 's103', circuit_id: 'c1111111-1111-1111-1111-111111111111', sector_name: 'Calle Real', active: true },
  { id: 's104', circuit_id: 'c1111111-1111-1111-1111-111111111111', sector_name: 'La Candelaria', active: true },
  { id: 's105', circuit_id: 'c1111111-1111-1111-1111-111111111111', sector_name: 'San Rafael', active: true },
  { id: 's106', circuit_id: 'c1111111-1111-1111-1111-111111111111', sector_name: 'El Hato (Parte Baja)', active: true },
  { id: 's107', circuit_id: 'c1111111-1111-1111-1111-111111111111', sector_name: 'La Vaquera', active: true },
  { id: 's108', circuit_id: 'c1111111-1111-1111-1111-111111111111', sector_name: 'El Limón', active: true },
  { id: 's109', circuit_id: 'c1111111-1111-1111-1111-111111111111', sector_name: 'Calle Comercio', active: true },

  // Circuito A2
  { id: 's201', circuit_id: 'c2222222-2222-2222-2222-222222222222', sector_name: 'Maitana', active: true },
  { id: 's202', circuit_id: 'c2222222-2222-2222-2222-222222222222', sector_name: 'El Hato (Parte Alta)', active: true },
  { id: 's203', circuit_id: 'c2222222-2222-2222-2222-222222222222', sector_name: 'Las Lagunitas', active: true },
  { id: 's204', circuit_id: 'c2222222-2222-2222-2222-222222222222', sector_name: 'La Suiza', active: true },
  { id: 's205', circuit_id: 'c2222222-2222-2222-2222-222222222222', sector_name: 'Los Olivos', active: true },
  { id: 's206', circuit_id: 'c2222222-2222-2222-2222-222222222222', sector_name: 'El Silencio', active: true },
  { id: 's207', circuit_id: 'c2222222-2222-2222-2222-222222222222', sector_name: 'Curva del Pato', active: true },
  { id: 's208', circuit_id: 'c2222222-2222-2222-2222-222222222222', sector_name: 'La Loma', active: true },

  // Circuito A3
  { id: 's301', circuit_id: 'c3333333-3333-3333-3333-333333333333', sector_name: 'Palo Negro', active: true },
  { id: 's302', circuit_id: 'c3333333-3333-3333-3333-333333333333', sector_name: 'Los Lirios', active: true },
  { id: 's303', circuit_id: 'c3333333-3333-3333-3333-333333333333', sector_name: 'La Cumbre', active: true },
  { id: 's304', circuit_id: 'c3333333-3333-3333-3333-333333333333', sector_name: 'El Laurel', active: true },
  { id: 's305', circuit_id: 'c3333333-3333-3333-3333-333333333333', sector_name: 'Bucarito', active: true },
  { id: 's306', circuit_id: 'c3333333-3333-3333-3333-333333333333', sector_name: 'San Ramón', active: true },
  { id: 's307', circuit_id: 'c3333333-3333-3333-3333-333333333333', sector_name: 'Los Manantiales', active: true },
  { id: 's308', circuit_id: 'c3333333-3333-3333-3333-333333333333', sector_name: 'El Carmen', active: true },
];

const INITIAL_REPORTS: ElectricalReport[] = [
  {
    id: 'rep-001',
    ticket_code: 'ELEC-A2-4821',
    sector: 'Maitana',
    circuit: 'A2',
    circuit_id: 'c2222222-2222-2222-2222-222222222222',
    location_detail: 'Sector El Trapiche, cerca de la entrada principal',
    failure_type: 'corte_total',
    description: 'Corte general de luz desde las 2:00 PM tras fluctuación fuerte.',
    reporter_name: 'Carlos Mendoza',
    reporter_phone: '04141234567',
    status: 'cuadrilla_asignada',
    assigned_crew: 'Cuadrilla 1 - Técnico Morales',
    admin_notes: 'Revisando ramal del transformador principal de Maitana',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'rep-002',
    ticket_code: 'ELEC-A1-1903',
    sector: 'Casco Central',
    circuit: 'A1',
    circuit_id: 'c1111111-1111-1111-1111-111111111111',
    location_detail: 'Frente a la panadería de la Plaza',
    failure_type: 'bajo_voltaje',
    description: 'Bajo voltaje constante en fase 110V, no encienden motores ni neveras.',
    reporter_name: 'María González',
    reporter_phone: '04249876543',
    status: 'en_revision',
    admin_notes: 'Reportado al centro de despacho para balanceo de carga',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'rep-003',
    ticket_code: 'ELEC-A3-8820',
    sector: 'Palo Negro',
    circuit: 'A3',
    circuit_id: 'c3333333-3333-3333-3333-333333333333',
    location_detail: 'Calle Principal sector La Ceiba',
    failure_type: 'cable_caido',
    description: 'Rama de árbol cayó sobre guaya secundaria, cable suelto sin chispa.',
    reporter_name: 'Pedro Rangel',
    reporter_phone: '04125558899',
    status: 'resuelto',
    assigned_crew: 'Cuadrilla Emergencias Vías',
    admin_notes: 'Línea despejada y tensada a las 11:30 AM. Servicio restablecido.',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    resolved_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
];

// Helper para almacenamiento local seguro
function getLocal<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(`jx4_elec_${key}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading from localStorage', e);
  }
  return defaultVal;
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`jx4_elec_${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn('Error writing to localStorage', e);
  }
}

export function generateTicketCode(circuitCode: string): string {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ELEC-${circuitCode || 'GEN'}-${random}`;
}

export const failureLabels: Record<FailureType, { label: string; desc: string; icon: string }> = {
  corte_total: {
    label: 'Corte Total de Luz',
    desc: 'Sin suministro eléctrico completo en la zona o vivienda',
    icon: 'ZapOff',
  },
  bajo_voltaje: {
    label: 'Bajo Voltaje / Fluctuación',
    desc: 'Luz tenue, protectores disparados o variación brusca',
    icon: 'Activity',
  },
  cable_caido: {
    label: 'Cable / Guaya Caída',
    desc: 'Peligro de electrocución o línea cortada en la vía',
    icon: 'AlertTriangle',
  },
  transformador: {
    label: 'Falla de Transformador',
    desc: 'Explosión, humo, chisporroteo o fusible botado',
    icon: 'Flame',
  },
  poste: {
    label: 'Poste o Acometida Dañada',
    desc: 'Poste quebrado, inclinado o caja de distribución quemada',
    icon: 'Radio',
  },
  otro: {
    label: 'Otro Problema Eléctrico',
    desc: 'Falla no especificada que amerita revisión técnica',
    icon: 'HelpCircle',
  },
};

export const statusLabels: Record<ReportStatus, { label: string; color: string; bg: string }> = {
  pendiente: { label: 'Pendiente', color: 'text-amber-800', bg: 'bg-amber-100 border-amber-300' },
  en_revision: { label: 'En Revisión', color: 'text-blue-800', bg: 'bg-blue-100 border-blue-300' },
  cuadrilla_asignada: { label: 'Cuadrilla Asignada', color: 'text-purple-800', bg: 'bg-purple-100 border-purple-300' },
  resuelto: { label: 'Resuelto', color: 'text-emerald-800', bg: 'bg-emerald-100 border-emerald-300' },
};

export const electricalService = {
  /**
   * Obtiene todos los circuitos disponibles con estatus y conteo de sectores
   */
  async getCircuits(): Promise<Circuit[]> {
    try {
      const { data, error } = await supabase.from('circuits').select('*').order('code');
      if (!error && data && data.length > 0) {
        setLocal('circuits', data);
        return data;
      }
    } catch (e) {
      console.warn('Usando almacenamiento local de circuitos:', e);
    }
    return getLocal<Circuit[]>('circuits', INITIAL_CIRCUITS);
  },

  /**
   * Obtiene todos los sectores registrados
   */
  async getSectors(circuitId?: string): Promise<CircuitSector[]> {
    try {
      let query = supabase.from('circuit_sectors').select('*').eq('active', true).order('sector_name');
      if (circuitId) {
        query = query.eq('circuit_id', circuitId);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        setLocal('sectors', data);
        return data;
      }
    } catch (e) {
      console.warn('Usando almacenamiento local de sectores:', e);
    }

    const localSectors = getLocal<CircuitSector[]>('sectors', INITIAL_SECTORS);
    if (circuitId) {
      return localSectors.filter((s) => s.circuit_id === circuitId && s.active);
    }
    return localSectors.filter((s) => s.active);
  },

  /**
   * Obtiene todos los sectores incluso inactivos (para el panel admin)
   */
  async getAllSectorsAdmin(): Promise<CircuitSector[]> {
    try {
      const { data, error } = await supabase.from('circuit_sectors').select('*').order('sector_name');
      if (!error && data && data.length > 0) {
        setLocal('sectors_admin', data);
        return data;
      }
    } catch (e) {
      console.warn('Usando almacenamiento local de admin sectores:', e);
    }
    return getLocal<CircuitSector[]>('sectors', INITIAL_SECTORS);
  },

  /**
   * DEDUCE AUTOMÁTICAMENTE EL CIRCUITO A PARTIR DEL SECTOR INDICADO.
   * Busca por coincidencia exacta o subcadena.
   */
  async deduceCircuitBySector(sectorQuery: string): Promise<{
    circuit: Circuit | null;
    matchedSector: CircuitSector | null;
    circuitCode: string;
  }> {
    if (!sectorQuery || !sectorQuery.trim()) {
      return { circuit: null, matchedSector: null, circuitCode: 'Desconocido' };
    }

    const cleanQuery = sectorQuery.trim().toLowerCase();
    const [circuits, sectors] = await Promise.all([this.getCircuits(), this.getSectors()]);

    // 1. Coincidencia exacta
    let match = sectors.find((s) => s.sector_name.toLowerCase() === cleanQuery);

    // 2. Coincidencia de subcadena
    if (!match) {
      match = sectors.find(
        (s) =>
          cleanQuery.includes(s.sector_name.toLowerCase()) ||
          s.sector_name.toLowerCase().includes(cleanQuery)
      );
    }

    if (match) {
      const foundCircuit = circuits.find((c) => c.id === match?.circuit_id) || null;
      return {
        circuit: foundCircuit,
        matchedSector: match,
        circuitCode: foundCircuit?.code || 'A1',
      };
    }

    // Si no coincide, retorna null para que el usuario o el sistema use general
    return { circuit: null, matchedSector: null, circuitCode: 'Por Confirmar' };
  },

  /**
   * Crear un nuevo reporte de falla eléctrica
   */
  async createReport(params: {
    sector: string;
    circuit: string;
    circuit_id?: string | null;
    location_detail?: string;
    failure_type: FailureType;
    description?: string;
    reporter_name?: string;
    reporter_phone?: string;
  }): Promise<ElectricalReport> {
    const ticket_code = generateTicketCode(params.circuit);
    const newReport: ElectricalReport = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `rep-${Date.now()}`,
      ticket_code,
      sector: params.sector.trim(),
      circuit: params.circuit || 'A1',
      circuit_id: params.circuit_id || null,
      location_detail: params.location_detail?.trim() || null,
      failure_type: params.failure_type,
      description: params.description?.trim() || null,
      reporter_name: params.reporter_name?.trim() || 'Vecino de Paracotos',
      reporter_phone: params.reporter_phone?.trim() || null,
      status: 'pendiente',
      admin_notes: null,
      assigned_crew: null,
      created_at: new Date().toISOString(),
      resolved_at: null,
    };

    try {
      const { data, error } = await supabase
        .from('electrical_reports')
        .insert([newReport])
        .select()
        .single();

      if (!error && data) {
        // Actualizamos copia local
        const currentLocal = getLocal<ElectricalReport[]>('reports', INITIAL_REPORTS);
        setLocal('reports', [data, ...currentLocal]);
        return data;
      }
    } catch (e) {
      console.warn('Guardando reporte en almacenamiento local:', e);
    }

    const currentLocal = getLocal<ElectricalReport[]>('reports', INITIAL_REPORTS);
    const updated = [newReport, ...currentLocal];
    setLocal('reports', updated);
    return newReport;
  },

  /**
   * Obtiene todos los reportes con filtros
   */
  async getReports(filters?: {
    circuit?: string;
    status?: string;
    failure_type?: string;
    query?: string;
  }): Promise<ElectricalReport[]> {
    let reports: ElectricalReport[] = [];
    try {
      const { data, error } = await supabase
        .from('electrical_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        reports = data;
        setLocal('reports', data);
      } else {
        reports = getLocal<ElectricalReport[]>('reports', INITIAL_REPORTS);
      }
    } catch (e) {
      reports = getLocal<ElectricalReport[]>('reports', INITIAL_REPORTS);
    }

    if (!filters) return reports;

    return reports.filter((r) => {
      if (filters.circuit && filters.circuit !== 'ALL' && r.circuit !== filters.circuit) return false;
      if (filters.status && filters.status !== 'ALL' && r.status !== filters.status) return false;
      if (filters.failure_type && filters.failure_type !== 'ALL' && r.failure_type !== filters.failure_type) return false;
      if (filters.query && filters.query.trim()) {
        const q = filters.query.toLowerCase().trim();
        const matchesTicket = r.ticket_code?.toLowerCase().includes(q);
        const matchesSector = r.sector?.toLowerCase().includes(q);
        const matchesName = r.reporter_name?.toLowerCase().includes(q);
        const matchesPhone = r.reporter_phone?.includes(q);
        if (!matchesTicket && !matchesSector && !matchesName && !matchesPhone) return false;
      }
      return true;
    });
  },

  /**
   * Buscar reportes por número de ticket o teléfono
   */
  async searchReports(searchQuery: string): Promise<ElectricalReport[]> {
    const clean = searchQuery.trim().toLowerCase();
    if (!clean) return [];
    const all = await this.getReports();
    return all.filter((r) => {
      const matchTicket = r.ticket_code?.toLowerCase().includes(clean);
      const matchPhone = r.reporter_phone && r.reporter_phone.replace(/\D/g, '').includes(clean.replace(/\D/g, ''));
      const matchSector = r.sector?.toLowerCase().includes(clean);
      return matchTicket || matchPhone || matchSector;
    });
  },

  /**
   * Actualizar estatus de reporte (para admin/gerente de electricidad)
   */
  async updateReport(
    id: string,
    updates: {
      status?: ReportStatus;
      admin_notes?: string;
      assigned_crew?: string;
    }
  ): Promise<ElectricalReport | null> {
    const payload: any = { ...updates };
    if (updates.status === 'resuelto') {
      payload.resolved_at = new Date().toISOString();
    } else if (updates.status) {
      payload.resolved_at = null;
    }

    try {
      const { data, error } = await supabase
        .from('electrical_reports')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        const currentLocal = getLocal<ElectricalReport[]>('reports', INITIAL_REPORTS);
        const updated = currentLocal.map((r) => (r.id === id ? { ...r, ...data } : r));
        setLocal('reports', updated);
        return data;
      }
    } catch (e) {
      console.warn('Actualizando reporte en almacenamiento local:', e);
    }

    const currentLocal = getLocal<ElectricalReport[]>('reports', INITIAL_REPORTS);
    let found: ElectricalReport | null = null;
    const updated = currentLocal.map((r) => {
      if (r.id === id) {
        found = { ...r, ...payload };
        return found;
      }
      return r;
    });
    setLocal('reports', updated);
    return found;
  },

  /**
   * AGREGAR NUEVO SECTOR A UN CIRCUITO (Panel Admin)
   * Permite al gerente de electricidad registrar sectores sin tocar código.
   */
  async addSector(circuitId: string, sectorName: string): Promise<CircuitSector> {
    const trimmedName = sectorName.trim();
    const newSector: CircuitSector = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `s-${Date.now()}`,
      circuit_id: circuitId,
      sector_name: trimmedName,
      active: true,
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from('circuit_sectors')
        .insert([newSector])
        .select()
        .single();

      if (!error && data) {
        const current = getLocal<CircuitSector[]>('sectors', INITIAL_SECTORS);
        setLocal('sectors', [...current, data]);
        return data;
      }
    } catch (e) {
      console.warn('Añadiendo sector en almacenamiento local:', e);
    }

    const current = getLocal<CircuitSector[]>('sectors', INITIAL_SECTORS);
    const updated = [...current, newSector];
    setLocal('sectors', updated);
    return newSector;
  },

  /**
   * Activar / Desactivar sector
   */
  async toggleSectorActive(sectorId: string, active: boolean): Promise<boolean> {
    try {
      await supabase.from('circuit_sectors').update({ active }).eq('id', sectorId);
    } catch (e) {
      console.warn('Actualizando sector en local:', e);
    }

    const current = getLocal<CircuitSector[]>('sectors', INITIAL_SECTORS);
    const updated = current.map((s) => (s.id === sectorId ? { ...s, active } : s));
    setLocal('sectors', updated);
    return true;
  },

  /**
   * Eliminar sector
   */
  async deleteSector(sectorId: string): Promise<boolean> {
    try {
      await supabase.from('circuit_sectors').delete().eq('id', sectorId);
    } catch (e) {
      console.warn('Borrando sector en local:', e);
    }

    const current = getLocal<CircuitSector[]>('sectors', INITIAL_SECTORS);
    const updated = current.filter((s) => s.id !== sectorId);
    setLocal('sectors', updated);
    return true;
  },

  /**
   * Actualizar estatus del Circuito completo (ej. Normal, Mantenimiento, Falla General)
   */
  async updateCircuitStatus(
    circuitId: string,
    status: Circuit['status'],
    description?: string
  ): Promise<Circuit | null> {
    const payload: any = {
      status,
      status_updated_at: new Date().toISOString(),
    };
    if (description !== undefined) payload.description = description;

    try {
      const { data, error } = await supabase
        .from('circuits')
        .update(payload)
        .eq('id', circuitId)
        .select()
        .single();

      if (!error && data) {
        const current = getLocal<Circuit[]>('circuits', INITIAL_CIRCUITS);
        const updated = current.map((c) => (c.id === circuitId ? { ...c, ...data } : c));
        setLocal('circuits', updated);
        return data;
      }
    } catch (e) {
      console.warn('Actualizando circuito en local:', e);
    }

    const current = getLocal<Circuit[]>('circuits', INITIAL_CIRCUITS);
    let found: Circuit | null = null;
    const updated = current.map((c) => {
      if (c.id === circuitId) {
        found = { ...c, ...payload };
        return found;
      }
      return c;
    });
    setLocal('circuits', updated);
    return found;
  },

  /**
   * Genera el enlace de WhatsApp para compartir el reporte
   */
  getWhatsAppShareUrl(report: ElectricalReport, targetPhone: string = '584241208234'): string {
    const statusText = statusLabels[report.status]?.label || report.status;
    const failureText = failureLabels[report.failure_type]?.label || report.failure_type;
    const text = `⚡ *REPORTE DE AVERÍA ELÉCTRICA - JX4 PARACOTOS* ⚡\n\n` +
      `🎫 *Folio:* ${report.ticket_code || report.id}\n` +
      `📍 *Sector:* ${report.sector}\n` +
      `🔌 *Circuito Asignado:* ${report.circuit}\n` +
      `⚠️ *Tipo de Falla:* ${failureText}\n` +
      `📌 *Punto de Referencia:* ${report.location_detail || 'No especificado'}\n` +
      `📝 *Descripción:* ${report.description || 'Sin detalle adicional'}\n` +
      `👤 *Reportante:* ${report.reporter_name || 'Vecino'} (${report.reporter_phone || 'Sin tlf'})\n` +
      `📊 *Estatus Actual:* ${statusText}\n\n` +
      `_Reportado a través de la plataforma comunitaria JX4 Paracotos._`;

    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
  },
};
