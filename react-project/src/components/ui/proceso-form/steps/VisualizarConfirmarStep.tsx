import React from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../ui/card';

export const VisualizarConfirmarStep: React.FC = () => {
  const { colors } = useTheme();
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Visualizar y Confirmar</CardTitle>
          <CardDescription>
            Revisión final. Se mostrarán los datos generados antes de confirmar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{
            minHeight: 180,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.textSecondary
          }}>
            Próximamente: panel de resumen y confirmación.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisualizarConfirmarStep;