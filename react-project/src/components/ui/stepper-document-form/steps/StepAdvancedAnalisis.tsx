import React from 'react';
import { Tags, FileText, Search } from 'lucide-react';
import styles from '../../stepper-system-form/StepperSystemForm.module.css';

interface StepAdvancedAnalisisProps {
  extractedText?: string;
  onNext?: () => void;
  onPrev?: () => void;
}

export const StepAdvancedAnalisis: React.FC<StepAdvancedAnalisisProps> = ({ 
  extractedText, 
  onNext, 
  onPrev 
}) => {
  return (
    <div className={styles.stepContent}>
      <div className={styles.stepHeader}>
        <h3>Análisis Avanzado del Documento</h3>
        <p>Esta sección permitirá realizar análisis detallado del documento cargado.</p>
      </div>

      <div className={styles.stepBody}>
        <div className="space-y-6">
          {/* Placeholder para análisis de contenido */}
          <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <Tags size={48} className="mx-auto mb-4 text-gray-400" />
            <h4 className="text-lg font-medium text-gray-700 mb-2">
              Análisis de Contenido
            </h4>
            <p className="text-gray-500 mb-4">
              Funcionalidad de análisis avanzado estará disponible próximamente.
            </p>
            <div className="text-sm text-gray-400">
              {extractedText ? 
                `Documento cargado: ${Math.round(extractedText.length / 1000)}k caracteres` : 
                'No hay documento cargado'
              }
            </div>
          </div>

          {/* Placeholder para herramientas de análisis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={20} className="text-blue-500" />
                <h5 className="font-medium">Extracción de Temas</h5>
              </div>
              <p className="text-sm text-gray-600">
                Identificación automática de temas principales del documento.
              </p>
              <div className="mt-3 text-xs text-gray-400">
                Próximamente disponible
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Search size={20} className="text-green-500" />
                <h5 className="font-medium">Búsqueda Semántica</h5>
              </div>
              <p className="text-sm text-gray-600">
                Búsqueda inteligente dentro del contenido del documento.
              </p>
              <div className="mt-3 text-xs text-gray-400">
                Próximamente disponible
              </div>
            </div>
          </div>

          {/* Placeholder para resumen */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <h5 className="font-medium mb-2">Resumen del Análisis</h5>
            <div className="text-sm text-gray-600">
              <p>• Análisis de estructura del documento</p>
              <p>• Identificación de conceptos clave</p>
              <p>• Extracción de información relevante</p>
              <p>• Generación de insights automáticos</p>
            </div>
            <div className="mt-3 text-xs text-gray-400">
              Estas funcionalidades estarán disponibles en futuras versiones
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};