import { useReducer, useCallback, useMemo } from 'react';
import { NavigationState, NavigationAction, DateNavigationHook } from '../types/DatePickerTypes';
import { 
  addMonths, 
  createSafeDate, 
  getPreviousMonth, 
  getNextMonth, 
  isDateInRange 
} from '../utils/dateUtils';

// Initial state
const createInitialState = (initialMonth?: Date): NavigationState => ({
  currentMonth: initialMonth || new Date(),
  isTransitioning: false, // Always false to prevent blocking
  transitionDirection: 'none'
});

// Reducer function
const navigationReducer = (state: NavigationState, action: NavigationAction): NavigationState => {
  switch (action.type) {
    case 'UPDATE_MONTH':
      return {
        ...state,
        currentMonth: action.payload,
        isTransitioning: false,
        transitionDirection: 'none'
      };

    case 'JUMP_TO_YEAR':
      return {
        ...state,
        currentMonth: createSafeDate(action.payload, state.currentMonth.getMonth()),
        isTransitioning: false,
        transitionDirection: 'none'
      };



    default:
      return state;
  }
};

export const useDateNavigation = (
  initialMonth?: Date,
  minDate?: Date,
  maxDate?: Date,
  onMonthChange?: (month: Date) => void
): DateNavigationHook => {
  const [state, dispatch] = useReducer(
    navigationReducer, 
    createInitialState(initialMonth)
  );

  // Navigate to specific month
  const navigateToMonth = useCallback((month: Date) => {
    const clampedMonth = minDate || maxDate 
      ? createSafeDate(
          Math.max(
            minDate?.getFullYear() || month.getFullYear(),
            Math.min(
              maxDate?.getFullYear() || month.getFullYear(),
              month.getFullYear()
            )
          ),
          Math.max(
            minDate && minDate.getFullYear() === month.getFullYear() 
              ? minDate.getMonth() 
              : month.getMonth(),
            Math.min(
              maxDate && maxDate.getFullYear() === month.getFullYear()
                ? maxDate.getMonth()
                : month.getMonth(),
              month.getMonth()
            )
          )
        )
      : month;

    dispatch({ type: 'UPDATE_MONTH', payload: clampedMonth });
    onMonthChange?.(clampedMonth);
  }, [minDate, maxDate, onMonthChange]);

  // Navigate to previous month
  const navigateToPrevious = useCallback(() => {
    const previousMonth = getPreviousMonth(state.currentMonth);
    
    if (isDateInRange(previousMonth, minDate, maxDate)) {
      dispatch({ type: 'UPDATE_MONTH', payload: previousMonth });
      onMonthChange?.(previousMonth);
    }
  }, [state.currentMonth, minDate, maxDate, onMonthChange]);

  // Navigate to next month
  const navigateToNext = useCallback(() => {
    const nextMonth = getNextMonth(state.currentMonth);
    
    if (isDateInRange(nextMonth, minDate, maxDate)) {
      dispatch({ type: 'UPDATE_MONTH', payload: nextMonth });
      onMonthChange?.(nextMonth);
    }
  }, [state.currentMonth, minDate, maxDate, onMonthChange]);

  // Jump to specific year
  const jumpToYear = useCallback((year: number) => {
    const newMonth = createSafeDate(year, state.currentMonth.getMonth());
    
    if (isDateInRange(newMonth, minDate, maxDate)) {
      dispatch({ type: 'JUMP_TO_YEAR', payload: year });
      onMonthChange?.(newMonth);
    }
  }, [state.currentMonth, minDate, maxDate, onMonthChange]);

  // Check if can navigate to previous month
  const canNavigatePrevious = useMemo(() => {
    const previousMonth = getPreviousMonth(state.currentMonth);
    return isDateInRange(previousMonth, minDate, maxDate);
  }, [state.currentMonth, minDate, maxDate]);

  // Check if can navigate to next month
  const canNavigateNext = useMemo(() => {
    const nextMonth = getNextMonth(state.currentMonth);
    return isDateInRange(nextMonth, minDate, maxDate);
  }, [state.currentMonth, minDate, maxDate]);

  return {
    currentMonth: state.currentMonth,
    isTransitioning: state.isTransitioning,
    transitionDirection: state.transitionDirection,
    navigateToMonth,
    navigateToPrevious,
    navigateToNext,
    jumpToYear,
    canNavigatePrevious,
    canNavigateNext
  };
}; 