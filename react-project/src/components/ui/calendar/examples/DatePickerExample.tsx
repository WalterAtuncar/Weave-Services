import React, { useState } from 'react';
import { DatePickerComponent, useDateNavigation, useDateValidation } from '../index';
import { AlertService } from '../../alerts';

/**
 * Example component demonstrating DatePickerComponent usage
 */
export const DatePickerExample: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [showYearDropdown, setShowYearDropdown] = useState(true);
  const [enableKeyboardNav, setEnableKeyboardNav] = useState(true);

  // Example of using the validation hook independently
  const { validateDate, isDateInRange } = useDateValidation(
    new Date(2020, 0, 1), // minDate
    new Date(2030, 11, 31), // maxDate
    [new Date(2024, 11, 25)], // disabled dates (Christmas)
    [0, 6] // disabled weekdays (Sunday, Saturday)
  );

  // Example of using the navigation hook independently
  const {
    currentMonth,
    navigateToMonth,
    canNavigatePrevious,
    canNavigateNext
  } = useDateNavigation(
    selectedDate,
    new Date(2020, 0, 1),
    new Date(2030, 11, 31),
    (month) => // Debug removed
  );

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const validation = validateDate(date);
      if (validation.isValid) {
        setSelectedDate(date);
      } else {
        console.warn('Invalid date selected:', validation.errors);
        AlertService.error(`Fecha inválida: ${validation.errors.join(', ')}`);
      }
    } else {
      setSelectedDate(undefined);
    }
  };

  const handleMonthChange = (month: Date) => {
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">
        DatePickerComponent Example
      </h1>

      {/* Controls */}
      <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Configuración
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Tema
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as any)}
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            >
              <option value="auto">Auto</option>
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
            </select>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showYearDropdown}
                onChange={(e) => setShowYearDropdown(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Mostrar selector de año
              </span>
            </label>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={enableKeyboardNav}
                onChange={(e) => setEnableKeyboardNav(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Navegación por teclado
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* DatePicker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Calendario Principal
          </h2>
          
          <DatePickerComponent
            selected={selectedDate}
            onSelect={handleDateSelect}
            onMonthChange={handleMonthChange}
            theme={theme}
            showYearDropdown={showYearDropdown}
            enableKeyboardNavigation={enableKeyboardNav}
            minDate={new Date(2020, 0, 1)}
            maxDate={new Date(2030, 11, 31)}
            yearRange={{
              from: 2020,
              to: 2030
            }}
            className="mx-auto"
            animationDuration={300}
            customClassNames={{
              container: 'shadow-xl',
              nav: 'bg-blue-50 dark:bg-blue-900'
            }}
          />
        </div>

        {/* Information Panel */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Información
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-medium mb-2 text-gray-800 dark:text-gray-200">
                Fecha Seleccionada
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedDate 
                  ? selectedDate.toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'Ninguna fecha seleccionada'
                }
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-medium mb-2 text-gray-800 dark:text-gray-200">
                Mes Actual
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {currentMonth.toLocaleDateString('es-ES', {
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-medium mb-2 text-gray-800 dark:text-gray-200">
                Navegación
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>◀️ Anterior: {canNavigatePrevious ? 'Disponible' : 'No disponible'}</p>
                <p>▶️ Siguiente: {canNavigateNext ? 'Disponible' : 'No disponible'}</p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
              <h3 className="font-medium mb-2 text-blue-800 dark:text-blue-200">
                Atajos de Teclado
              </h3>
              <div className="space-y-1 text-sm text-blue-600 dark:text-blue-300">
                <p><kbd className="bg-blue-100 dark:bg-blue-800 px-1 rounded">PageUp</kbd> - Mes anterior</p>
                <p><kbd className="bg-blue-100 dark:bg-blue-800 px-1 rounded">PageDown</kbd> - Mes siguiente</p>
                <p><kbd className="bg-blue-100 dark:bg-blue-800 px-1 rounded">Shift+PageUp</kbd> - Año anterior</p>
                <p><kbd className="bg-blue-100 dark:bg-blue-800 px-1 rounded">Shift+PageDown</kbd> - Año siguiente</p>
                <p><kbd className="bg-blue-100 dark:bg-blue-800 px-1 rounded">Ctrl+Home</kbd> - Mes actual</p>
                <p><kbd className="bg-blue-100 dark:bg-blue-800 px-1 rounded">Escape</kbd> - Quitar foco</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Usage Example */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Uso Avanzado con Hooks
        </h2>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-x-auto">
{`// Usando hooks independientemente
const { validateDate, isDateInRange } = useDateValidation(
  minDate,
  maxDate,
  disabledDates,
  disabledWeekdays
);

const {
  currentMonth,
  navigateToMonth,
  navigateToPrevious,
  navigateToNext,
  canNavigatePrevious,
  canNavigateNext
} = useDateNavigation(initialMonth, minDate, maxDate, onMonthChange);

// Validar una fecha
const validation = validateDate(someDate);
if (validation.isValid) {
  // Fecha válida
} else {
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}; 