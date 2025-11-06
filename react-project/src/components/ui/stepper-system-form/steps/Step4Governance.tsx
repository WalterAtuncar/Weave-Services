import React from 'react';
import { SystemFormData, SystemFormErrors, GobernanzaRef } from '../types';
import { GovernanceStepBase } from './GovernanceStepBase';
import { TipoEntidadAsociacion } from '../../../../services/types/gobernanza-entidad.types';

interface Step4GovernanceProps {
  formData: SystemFormData;
  errors?: SystemFormErrors;
  onDataChange: (data: Partial<SystemFormData>) => void;
  onErrorChange?: (errors: SystemFormErrors) => void;
  gobernanzas?: GobernanzaRef[];
}

const Step4Governance: React.FC<Step4GovernanceProps> = ({ 
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
      tipoEntidadId={TipoEntidadAsociacion.SISTEMA}
      title="Gobernanza"
      description="Configura si el sistema tiene gobernanza propia o hace referencia a una existente"
    />
  );
};

export default Step4Governance;