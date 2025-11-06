import React, { useMemo } from 'react';
import { Modal } from '../modal/Modal';
import { StatusBadge } from '../status-badge';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  DominioData,
  EstadoDominioData,
  getEstadoDominioDataLabel,
  getTipoDominioDataLabel
} from '../../../models/DominiosData';

export interface DominioViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  dominio?: DominioData | null;
}

// Mapea estado numérico a tipo de badge visual
const mapEstadoToBadge = (estado?: number) => {
  switch (estado) {
    case EstadoDominioData.ACTIVO:
      return 'active' as const;
    case EstadoDominioData.INACTIVO:
      return 'inactive' as const;
    case EstadoDominioData.RECHAZADO:
      return 'error' as const;
    case EstadoDominioData.PENDIENTE:
      return 'pending' as const;
    case EstadoDominioData.BORRADOR:
      return 'info' as const;
    case EstadoDominioData.INICIAR_FLUJO:
      return 'running' as const;
    default:
      return 'warning' as const;
  }
};

const display = (value: any, fallback = '—') => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string' && value.trim() === '') return fallback;
  return value;
};

const formatDateTime = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '—' : d.toLocaleString();
};

export const DominioViewModal: React.FC<DominioViewModalProps> = ({
  isOpen,
  onClose,
  dominio = null
}) => {
  const { colors } = useTheme();

  const titulo = dominio ? `Ver Dominio: ${display(dominio.nombre, 'Dominio')}` : 'Ver Dominio';

  const totalSubDominios = useMemo(
    () => dominio?.totalSubDominios ?? dominio?.subDominiosData?.length ?? 0,
    [dominio]
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={titulo}
      size="l"
      hideFooter={true}
    >
      {!dominio ? (
        <div style={{ color: colors.textSecondary }}>Sin datos del dominio</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Encabezado con estado */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: colors.textSecondary, fontSize: '12px' }}>Código</div>
              <div style={{ color: colors.text, fontWeight: 600 }}>{display(dominio.codigo, '—')}</div>
            </div>
            <StatusBadge
              status={mapEstadoToBadge(dominio.estado)}
              label={getEstadoDominioDataLabel(dominio.estado)}
              variant="subtle"
              size="m"
              title={`Estado: ${getEstadoDominioDataLabel(dominio.estado)}`}
            />
          </div>

          {/* Datos principales */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
            <div>
              <div style={{ color: colors.textSecondary, fontSize: '12px' }}>Nombre</div>
              <div style={{ color: colors.text }}>{display(dominio.nombre, '—')}</div>
            </div>
            <div>
              <div style={{ color: colors.textSecondary, fontSize: '12px' }}>Tipo</div>
              <div style={{ color: colors.text }}>{display(dominio.tipoTexto ?? getTipoDominioDataLabel(dominio.tipo), '—')}</div>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <div style={{ color: colors.textSecondary, fontSize: '12px' }}>Descripción</div>
            <div style={{
              color: colors.textSecondary,
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              padding: '10px',
              minHeight: '64px'
            }}>
              {display(dominio.descripcion, 'Sin descripción')}
            </div>
          </div>


          {/* Sub-dominios */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: colors.textSecondary, fontSize: '12px' }}>Sub-dominios</div>
              <div style={{ color: colors.textSecondary, fontSize: '12px' }}>
                Total: {totalSubDominios}
              </div>
            </div>
            {totalSubDominios === 0 ? (
              <div style={{ color: colors.textSecondary }}>No hay sub-dominios</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                {(dominio.subDominiosData || []).map((sd) => (
                  <div key={sd.subDominioId} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: colors.surface,
                    border: `1px solid ${colors.border}`
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: colors.text, fontWeight: 600 }}>{display(sd.nombre, '—')}</span>
                      <span style={{ color: colors.textSecondary, fontSize: '12px' }}>Código: {display(sd.codigo, '—')}</span>
                    </div>
                    <StatusBadge
                      status={mapEstadoToBadge(sd.estado)}
                      label={getEstadoDominioDataLabel(sd.estado as any)}
                      size="s"
                      variant="dot"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default DominioViewModal;