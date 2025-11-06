import React, { useState } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Plus } from 'lucide-react';

export const DatosActividadesStep: React.FC = () => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'tabla' | 'diagrama'>('tabla');

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Datos y Actividades</CardTitle>
          <CardDescription>
            Define actividades y sistemas. Cambia entre Tabla y Diagrama.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <Button
              variant={activeTab === 'tabla' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('tabla')}
            >
              Tabla
            </Button>
            <Button
              variant={activeTab === 'diagrama' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('diagrama')}
            >
              Diagrama
            </Button>
          </div>

          {/* Content by tab */}
          {activeTab === 'tabla' && (
            <div>
              {/* Tabla simple de actividades (skeleton) */}
              <div style={{ overflowX: 'auto', border: `1px solid ${colors.border}`, borderRadius: 8 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: colors.background }}>
                      {['¿Qué?', '¿Quién?', '¿Cómo?', 'Sistemas', 'Inputs', 'Outputs'].map((h) => (
                        <th key={h} style={{ textAlign: 'left', padding: '10px 12px', borderBottom: `1px solid ${colors.border}`, color: colors.text }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Fila de ejemplo */}
                    <tr>
                      <td style={{ padding: '10px 12px', borderBottom: `1px solid ${colors.border}` }}>Solicitar cotización</td>
                      <td style={{ padding: '10px 12px', borderBottom: `1px solid ${colors.border}` }}>Cliente</td>
                      <td style={{ padding: '10px 12px', borderBottom: `1px solid ${colors.border}` }}>Envía correo o realiza llamada</td>
                      <td style={{ padding: '10px 12px', borderBottom: `1px solid ${colors.border}` }}>Correo</td>
                      <td style={{ padding: '10px 12px', borderBottom: `1px solid ${colors.border}` }}>Solicitud</td>
                      <td style={{ padding: '10px 12px', borderBottom: `1px solid ${colors.border}` }}>Cotización</td>
                    </tr>
                    {/* Filas vacías de placeholder */}
                    {[0,1].map((i) => (
                      <tr key={i}>
                        {Array.from({ length: 6 }).map((_, j) => (
                          <td key={j} style={{ padding: '10px 12px', borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary }}>—</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Acción añadir */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <Button variant="secondary" size="sm" iconLeft={<Plus size={16} />}>Añadir actividad</Button>
              </div>
            </div>
          )}

          {activeTab === 'diagrama' && (
            <div style={{
              minHeight: 380,
              border: `1px dashed ${colors.border}`,
              borderRadius: 8,
              backgroundColor: colors.background,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.textSecondary
            }}>
              Canvas en blanco (biblioteca de diagrama por definir)
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DatosActividadesStep;