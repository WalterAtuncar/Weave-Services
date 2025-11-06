import React from 'react';
import { GovernanceStepBase } from '../../stepper-system-form/steps/GovernanceStepBase';

interface Step5GovernanceProps {
  formData: any;
  errors?: any;
  onDataChange: (data: any) => void;
  onErrorChange?: (errors: any) => void;
  gobernanzas?: any[];
}

const Step5Governance: React.FC<Step5GovernanceProps> = ({
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
      tipoEntidadId={4} // 4 para Documentos
      title="Gobernanza del Documento"
      description="Configura si el documento tiene gobernanza propia o referencia una existente"
      allowedRoleCodes={['EJ', 'IN']}
      readOnlyRoleCodes={['SP', 'OW', 'SPONSOR', 'OWNER']}
    />
  );
};

export default Step5Governance;