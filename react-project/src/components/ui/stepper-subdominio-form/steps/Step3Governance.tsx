import React from 'react';
import { GovernanceStepBase } from '../../stepper-system-form/steps/GovernanceStepBase';
import { Step3GovernanceProps } from '../types';

const Step3Governance: React.FC<Step3GovernanceProps> = ({
  formData,
  errors,
  onDataChange,
  onErrorChange,
  gobernanzas
}) => {
  return (
    <GovernanceStepBase
      formData={formData}
      errors={errors}
      onDataChange={onDataChange}
      onErrorChange={onErrorChange}
      gobernanzas={gobernanzas}
      tipoEntidadId={3} // 3 para datos (subdominios)
      title="Gobernanza de Datos"
      description="Selecciona o configura la gobernanza para este subdominio de datos"
      allowedRoleCodes={['EJ', 'IN']} // Ejecutor e Involucrado
      readOnlyRoleCodes={['SP', 'OW', 'SPONSOR', 'OWNER']} // Solo lectura
    />
  );
};

export default Step3Governance;