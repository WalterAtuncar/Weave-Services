// Main DatePicker Component Export
export { DatePickerComponent as default } from './DatePickerComponent';
export { DatePickerComponent } from './DatePickerComponent';

// Auxiliary Hooks for Advanced Use Cases
export { useDateNavigation } from './hooks/useDateNavigation';
export { useDateValidation } from './hooks/useDateValidation';

// Component Exports
export { CustomNavigation } from './components/CustomNavigation';
export { YearDropdown } from './components/YearDropdown';

// Type Exports
export type {
  DatePickerProps,
  DateNavigationHook,
  DateValidationHook,
  DateValidationResult,
  CustomNavigationProps,
  YearDropdownProps,
  NavigationState,
  NavigationAction,
  DatePickerTheme
} from './types/DatePickerTypes';

// Utility Exports
export * from './utils/dateUtils';

// Re-export for legacy compatibility
export { DatePickerComponent as Calendar } from './DatePickerComponent';
