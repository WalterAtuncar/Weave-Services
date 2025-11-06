import type { TipoEntidad, EntidadRef } from './types';

export const TIPOS_ENTIDAD_MOCK: TipoEntidad[] = [
  { id: 'documento', nombre: 'Documento', icono: 'FileText' },
  { id: 'sistema', nombre: 'Sistema', icono: 'Server' },
  { id: 'riesgo', nombre: 'Riesgo', icono: 'AlertTriangle' },
];

export const ENTIDADES_BY_TIPO_MOCK: Record<string, EntidadRef[]> = {
  documento: [
    { id: 'MAN-0001', nombre: '[MAN-0001] Manual de atención al cliente' },
    { id: 'MAN-0002', nombre: '[MAN-0002] Manual de conducta de mercado' },
    { id: 'MAN-0003', nombre: '[MAN-0003] Manual de riesgos operacionales' },
    { id: 'POL-0010', nombre: '[POL-0010] Política de seguridad de la información' },
    { id: 'PRO-0021', nombre: '[PRO-0021] Procedimiento de gestión de incidencias' },
  ],
  sistema: [
    { id: 'SIS-0001', nombre: '[SIS-0001] Core bancario' },
    { id: 'SIS-0002', nombre: '[SIS-0002] Gestión documental' },
    { id: 'SIS-0003', nombre: '[SIS-0003] CRM corporativo' },
  ],
  riesgo: [
    { id: 'RIE-1001', nombre: '[RIE-1001] Riesgo de crédito' },
    { id: 'RIE-1002', nombre: '[RIE-1002] Riesgo operativo' },
    { id: 'RIE-1003', nombre: '[RIE-1003] Riesgo reputacional' },
  ],
};