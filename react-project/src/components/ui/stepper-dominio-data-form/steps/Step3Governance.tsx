import React from 'react';
import { GovernanceStepBase } from '../../stepper-system-form/steps/GovernanceStepBase';
import { TipoEntidadAsociacion } from '../../../../services/types/gobernanza-entidad.types';

interface Step3GovernanceProps {
  formData: any;
  errors: any;
  onDataChange: (data: any) => void;
  loading?: boolean;
}

const Step3Governance: React.FC<Step3GovernanceProps> = ({
  formData,
  errors,
  onDataChange,
  loading = false
}) => {
  return (
    <GovernanceStepBase
      formData={formData}
      errors={errors}
      onDataChange={onDataChange}
      loading={loading}
      tipoEntidadId={TipoEntidadAsociacion.DATA}
      title="Configuración de Gobernanza"
      description="Define la estructura de gobierno y control para el dominio de datos"
      fieldHint="Selecciona la gobernanza que regirá este dominio de datos. Solo se muestran gobernanzas de tipo 'Data'."
      ownGovernanceMessage="Este dominio tendrá su propia estructura de gobernanza independiente."
    />
  );
};

export default Step3Governance;