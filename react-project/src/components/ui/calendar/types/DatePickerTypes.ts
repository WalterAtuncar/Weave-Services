import { DayPickerProps } from 'react-day-picker';

// Navigation state for useReducer
export interface NavigationState {
  currentMonth: Date;
  isTransitioning: boolean;
  transitionDirection: 'left' | 'right' | 'none';
}

// Navigation actions
export type NavigationAction =
  | { type: 'UPDATE_MONTH'; payload: Date }
  | { type: 'JUMP_TO_YEAR'; payload: number };

// Extended DatePicker props
export interface DatePickerProps extends Omit<DayPickerProps, 'onMonthChange'> {
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
  // Explicit props for better TypeScript support
  selected?: Date | Date[] | undefined;
  onSelect?: (date: Date | undefined) => void;
}

// Custom Navigation component props
export interface CustomNavigationProps {
  previousMonth?: Date;
  nextMonth?: Date;
  onPreviousClick?: () => void;
  onNextClick?: () => void;
  onMonthSelect?: (month: Date) => void;
  onYearSelect?: (year: number) => void;
  displayMonth: Date;
  showYearDropdown?: boolean;
  yearRange?: {
    from: number;
    to: number;
  };
}

// Year Dropdown props
export interface YearDropdownProps {
  currentYear: number;
  yearRange: {
    from: number;
    to: number;
  };
  onYearSelect: (year: number) => void;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

// Date validation result
export interface DateValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Date navigation hook return
export interface DateNavigationHook {
  currentMonth: Date;
  isTransitioning: boolean;
  transitionDirection: 'left' | 'right' | 'none';
  navigateToMonth: (month: Date) => void;
  navigateToPrevious: () => void;
  navigateToNext: () => void;
  jumpToYear: (year: number) => void;
  canNavigatePrevious: boolean;
  canNavigateNext: boolean;
}

// Date validation hook return
export interface DateValidationHook {
  validateDate: (date: Date) => DateValidationResult;
  validateDateRange: (startDate: Date, endDate: Date) => DateValidationResult;
  isDateInRange: (date: Date, minDate?: Date, maxDate?: Date) => boolean;
  isDateDisabled: (date: Date, disabledDates?: Date[]) => boolean;
}

// Theme configuration
export interface DatePickerTheme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
    hover: string;
    selected: string;
    today: string;
    disabled: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
} 