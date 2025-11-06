# DatePickerComponent

Un componente de calendario avanzado construido con `react-day-picker` v9.x y TypeScript, optimizado para aplicaciones modernas de React.

## 🚀 Características

### ✨ Navegación Personalizada
- **CustomNavigation**: Componente personalizado que reemplaza los controles nativos
- **Navegación mes-a-mes**: Botones personalizados con `onPreviousClick`/`onNextClick`
- **Year-jumping**: Dropdown select para saltar años rápidamente
- **State management**: Gestión avanzada con `useReducer` y `useState`

### 🎬 Animaciones Fluidas
- **FluidTransitions**: Animaciones CSS con `transform: translateX()` 
- **Smooth sliding**: Transiciones suaves entre meses con `transition: all 0.3s ease`
- **Classes CSS**: `.month-enter`, `.month-exit` para control granular
- **Dirección de animación**: `translateX(-100%)` para anterior, `translateX(100%)` para siguiente

### 📅 YearDropdown
- **Select personalizado**: Componente dropdown completamente estilizado
- **Position absolute**: Posicionamiento sobre el header con `z-index: 1000`
- **Lazy loading**: Carga solo cuando es necesario para optimizar rendimiento
- **Overlay behavior**: Gestión completa de clics fuera del área

### ⌨️ Navegación por Teclado
- **PageUp/PageDown**: Navegación mensual
- **Shift+PageUp/PageDown**: Navegación anual
- **Arrow keys**: Navegación por días
- **Modifiers**: Soporte completo para modificadores de teclado
- **onKeyDown handlers**: Handlers personalizables para navegación

### 🎨 Sistema de Temas
- **CSS Custom Properties**: `--rdp-cell-size`, `--rdp-accent-color`, etc.
- **Theming dinámico**: Soporte para cambio de tema en tiempo real
- **Responsive design**: Breakpoints adaptativos
- **Dark/Light mode**: Soporte completo para modo oscuro/claro
- **Integración con ThemeContext**: Se integra con el sistema de temas global

### ⚡ Optimización de Rendimiento
- **React.memo**: Memoización de componentes
- **useMemo**: Cálculos costosos memoizados
- **useCallback**: Event handlers optimizados
- **Lazy loading**: Carga diferida del dropdown de años
- **Tree-shaking**: Optimizado para bundlers modernos

### ♿ Accesibilidad
- **ARIA attributes**: Completamente accesible
- **Focus management**: Gestión correcta del foco durante navegación
- **Screen reader support**: Soporte para lectores de pantalla
- **Keyboard trap**: Manejo adecuado del foco en dropdown

## 📦 Instalación

```bash
npm install react-day-picker
```

## 🔧 Uso Básico

```tsx
import React, { useState } from 'react';
import { DatePickerComponent } from './components/ui/calendar';

function App() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  return (
    <DatePickerComponent
      selected={selectedDate}
      onSelect={setSelectedDate}
      showYearDropdown={true}
      enableKeyboardNavigation={true}
      theme="auto"
    />
  );
}
```

## 🔨 Props Interface

```tsx
interface DatePickerProps extends Omit<DayPickerProps, 'onMonthChange'> {
  showYearDropdown?: boolean;
  enableKeyboardNavigation?: boolean;
  animationDuration?: number;
  customClassNames?: {
    container?: string;
    nav?: string;
    yearDropdown?: string;
    monthContainer?: string;
  };
  onMonthChange?: (month: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  theme?: 'light' | 'dark' | 'auto';
  yearRange?: {
    from?: number;
    to?: number;
  };
}
```

## 🎯 Uso Avanzado

### Hooks Auxiliares

#### useDateNavigation
```tsx
import { useDateNavigation } from './components/ui/calendar';

const {
  currentMonth,
  isTransitioning,
  transitionDirection,
  navigateToMonth,
  navigateToPrevious,
  navigateToNext,
  jumpToYear,
  canNavigatePrevious,
  canNavigateNext
} = useDateNavigation(
  initialMonth,
  minDate,
  maxDate,
  onMonthChange
);
```

#### useDateValidation
```tsx
import { useDateValidation } from './components/ui/calendar';

const {
  validateDate,
  validateDateRange,
  isDateInRange,
  isDateDisabled
} = useDateValidation(
  minDate,
  maxDate,
  disabledDates,
  disabledWeekdays
);
```

### Configuración Avanzada

```tsx
<DatePickerComponent
  selected={selectedDate}
  onSelect={setSelectedDate}
  showYearDropdown={true}
  enableKeyboardNavigation={true}
  animationDuration={300}
  minDate={new Date(2020, 0, 1)}
  maxDate={new Date(2030, 11, 31)}
  yearRange={{ from: 2020, to: 2030 }}
  theme="dark"
  customClassNames={{
    container: 'shadow-2xl',
    nav: 'bg-blue-50',
    yearDropdown: 'custom-dropdown',
    monthContainer: 'custom-month'
  }}
  onMonthChange={(month) => console.log('Month changed:', month)}
  disabled={[new Date(2024, 11, 25)]} // Deshabilitar Navidad
  weekStartsOn={1} // Lunes como primer día
  locale={es} // Localización española
/>
```

## ⌨️ Atajos de Teclado

| Tecla | Acción |
|-------|--------|
| `PageUp` | Mes anterior |
| `PageDown` | Mes siguiente |
| `Shift + PageUp` | Año anterior |
| `Shift + PageDown` | Año siguiente |
| `Ctrl/Cmd + Home` | Ir al mes actual |
| `Escape` | Quitar foco del calendario |
| `Arrow Keys` | Navegación por días |
| `Enter/Space` | Seleccionar fecha |

## 🎨 Personalización de Temas

### CSS Custom Properties

```css
:root {
  --rdp-cell-size: 2.5rem;
  --rdp-accent-color: #3b82f6;
  --rdp-accent-color-hover: #2563eb;
  --rdp-today-color: #f59e0b;
  --rdp-selected-bg: var(--rdp-accent-color);
  --rdp-selected-text: #ffffff;
  --rdp-border-radius: 0.375rem;
  --rdp-transition-normal: 300ms ease;
}
```

### Temas Personalizados

```tsx
// Tema personalizado
const customTheme = {
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    border: '#e2e8f0',
    accent: '#3b82f6',
    hover: '#f1f5f9',
    selected: '#3b82f6',
    today: '#f59e0b',
    disabled: '#cbd5e1'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  }
};
```

## 📱 Responsive Design

El componente es completamente responsive y se adapta automáticamente:

- **Mobile (≤480px)**: Tamaño compacto con celdas de 2rem
- **Tablet (481px-767px)**: Tamaño estándar
- **Desktop (≥768px)**: Tamaño ampliado con celdas de 2.75rem

## 🌐 Internacionalización

```tsx
import { es } from 'date-fns/locale';

<DatePickerComponent
  locale={es}
  selected={selectedDate}
  onSelect={setSelectedDate}
/>
```

## ⚡ Optimizaciones de Rendimiento

- **Bundle splitting**: Componentes se cargan bajo demanda
- **Memoización**: Uso extensivo de `React.memo`, `useMemo`, `useCallback`
- **CSS containment**: `contain: layout style paint` para optimizar reflows
- **Lazy loading**: Year dropdown solo se inicializa cuando se abre
- **Tree shaking**: Exportaciones optimizadas para bundlers

## 🔧 Compatibilidad

- ✅ **React**: 16.8+ (Hooks requeridos)
- ✅ **TypeScript**: 4.0+
- ✅ **Next.js**: SSR compatible
- ✅ **Bundlers**: Webpack, Vite, Rollup
- ✅ **Navegadores**: Chrome 70+, Firefox 70+, Safari 12+, Edge 79+

## 📝 Ejemplos

Ver `examples/DatePickerExample.tsx` para ejemplos completos de uso.

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

---

🚀 **Hecho con ❤️ para aplicaciones React modernas** 