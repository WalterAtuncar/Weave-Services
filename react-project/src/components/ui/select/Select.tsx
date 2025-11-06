import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import * as React from "react";
import { useTheme } from '../../../contexts/ThemeContext';
import styles from './Select.module.css';

// Importación dinámica de lucide-react para evitar conflictos de tipos
const getLucideIcon = async (iconName: string): Promise<React.ComponentType<any> | null> => {
  try {
    const lucideModule = await import('lucide-react');
    return (lucideModule as any)[iconName] || null;
  } catch {
    return null;
  }
};

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

interface SelectTriggerProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  icon?: string;
  label?: string;
  requiredText?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
}

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ className, children, icon, ...props }, ref) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [IconComponent, setIconComponent] = React.useState<React.ComponentType<any> | null>(null);
  
  // Obtener el ícono dinámicamente
  React.useEffect(() => {
    if (icon) {
      getLucideIcon(icon).then(setIconComponent);
    } else {
      setIconComponent(null);
    }
  }, [icon]);
  
  return (
    <div className={styles.selectContainer}>
      {IconComponent && (
        <div className={styles.iconContainer}>
          <IconComponent className={`${styles.leftIcon} ${isDark ? styles.dark : ''}`} />
        </div>
      )}
      <SelectPrimitive.Trigger
        ref={ref}
        className={`${styles.trigger} ${isDark ? styles.dark : ''} ${icon ? styles.withIcon : ''} ${className || ''}`}
        {...props}
      >
        {children}
        <SelectPrimitive.Icon asChild>
          <ChevronDownIcon className={styles.icon} />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
    </div>
  );
});
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <SelectPrimitive.ScrollUpButton
      ref={ref}
      className={`${styles.scrollButton} ${isDark ? styles.dark : ''} ${className || ''}`}
      {...props}
    >
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpButton>
  );
});
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <SelectPrimitive.ScrollDownButton
      ref={ref}
      className={`${styles.scrollButton} ${isDark ? styles.dark : ''} ${className || ''}`}
      {...props}
    >
      <ChevronDownIcon />
    </SelectPrimitive.ScrollDownButton>
  );
});
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={`${styles.content} ${isDark ? styles.dark : ''} ${className || ''}`}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport className={styles.viewport}>
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <SelectPrimitive.Label
      ref={ref}
      className={`${styles.label} ${isDark ? styles.dark : ''} ${className || ''}`}
      {...props}
    />
  );
});
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={`${styles.item} ${isDark ? styles.dark : ''} ${className || ''}`}
      {...props}
    >
      <span className={styles.itemIndicator}>
        <SelectPrimitive.ItemIndicator>
          <CheckIcon />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <SelectPrimitive.Separator
      ref={ref}
      className={`${styles.separator} ${isDark ? styles.dark : ''} ${className || ''}`}
      {...props}
    />
  );
});
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

// Wrapper component que incluye label y validación
interface SelectWrapperProps {
  label?: string;
  requiredText?: boolean;
  required?: boolean; // Agregar soporte para required nativo
  icon?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  // Modo multiselección (nulleable): si no es null y es true, habilita checks múltiples
  multiSelected?: boolean | null;
  selectedValues?: string[];
  onValuesChange?: (values: string[]) => void;
  placeholder?: string;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
}

const SelectWrapper = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Root>,
  SelectWrapperProps
>(({ label, requiredText = false, required = false, icon, value, onValueChange, multiSelected = null, selectedValues = [], onValuesChange, placeholder, children, className, disabled, searchable = false, searchPlaceholder = "Buscar...", ...props }, ref) => {
  const { colors } = useTheme();
  const [touched, setTouched] = React.useState(false);
  const [blurred, setBlurred] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const isMulti = multiSelected !== null && multiSelected === true;
  const [multiSelectedSet, setMultiSelectedSet] = React.useState<Set<string>>(new Set(selectedValues || []));

  React.useEffect(() => {
    setMultiSelectedSet(new Set(selectedValues || []));
  }, [selectedValues]);

  // Generar un id único
  const selectId = `select-${Math.random().toString(36).substr(2, 9)}`;

  // Determinar errores
  const isEmpty = isMulti ? (multiSelectedSet.size === 0) : (!value || (typeof value === 'string' && value.trim() === ""));
  const hasRequiredError = (requiredText || required) && touched && isEmpty;

  React.useEffect(() => {
    let error = false;
    let message = "";

    if (hasRequiredError) {
      error = true;
      message = label ? `${label} es requerido` : "Este campo es requerido";
    }

    setHasError(error);
    setErrorMessage(message);
  }, [hasRequiredError, label]);

  const handleValueChange = (newValue: string) => {
    setTouched(true);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  const handleToggleMulti = (val: string) => {
    setTouched(true);
    // Calcular el siguiente conjunto a partir del estado actual
    const next = new Set(multiSelectedSet);
    if (next.has(val)) next.delete(val); else next.add(val);
    // Actualizar estado local
    setMultiSelectedSet(next);
    // Notificar al padre DESPUÉS de calcular el nuevo estado,
    // fuera del render/actualización interna para evitar la advertencia de React
    if (onValuesChange) onValuesChange(Array.from(next));
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      // Enfocar el input de búsqueda cuando se abre el dropdown
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
    if (!open && touched) {
      setBlurred(true);
    }
  };

  // Función para filtrar children si es searchable
  const filterChildren = (children: React.ReactNode, searchTerm: string): React.ReactNode => {
    if (!searchable || !searchTerm) return children;
    
    return React.Children.map(children, (child) => {
      if (React.isValidElement(child) && child.type === SelectContent) {
        const filteredItems = React.Children.map(child.props.children, (item) => {
          if (React.isValidElement(item) && item.type === SelectItem) {
            const itemProps = item.props as any;
            const itemText = itemProps.children?.toString().toLowerCase() || '';
            const itemValue = itemProps.value?.toString().toLowerCase() || '';
            const search = searchTerm.toLowerCase();
            
            if (itemText.includes(search) || itemValue.includes(search)) {
              return item;
            }
            return null;
          }
          return item;
        });
        
        return React.cloneElement(child, child.props, filteredItems);
      }
      return child;
    });
  };

  // Extraer opciones desde los children (SelectContent > SelectItem)
  const extractOptions = (children: React.ReactNode): { value: string; label: React.ReactNode }[] => {
    const opts: { value: string; label: React.ReactNode }[] = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === SelectContent) {
        React.Children.forEach(child.props.children, (item) => {
          if (React.isValidElement(item) && item.type === SelectItem) {
            const itemProps = item.props as any;
            const v = String(itemProps.value);
            const lbl = itemProps.children;
            opts.push({ value: v, label: lbl });
          }
        });
      }
    });
    return opts;
  };

  const allOptions = React.useMemo(() => extractOptions(children), [children]);
  const filteredOptions = React.useMemo(() => {
    if (!searchable || !searchTerm) return allOptions;
    const search = searchTerm.toLowerCase();
    return allOptions.filter(opt => {
      const txt = (typeof opt.label === 'string') ? opt.label.toLowerCase() : String(opt.value).toLowerCase();
      return txt.includes(search) || String(opt.value).toLowerCase().includes(search);
    });
  }, [allOptions, searchable, searchTerm]);

  const selectElement = (
    <Select
      value={isMulti ? undefined : (value || undefined)}
      onValueChange={isMulti ? undefined : handleValueChange}
      onOpenChange={handleOpenChange}
      disabled={disabled}
      {...props}
    >
      <SelectTrigger
        icon={icon}
        className={`${hasError ? styles.triggerError : ''} ${className || ''}`}
      >
        {isMulti ? (
          <span>
            {multiSelectedSet.size > 0 ? `${multiSelectedSet.size} seleccionados` : (placeholder || 'Selecciona opciones')}
          </span>
        ) : (
          <SelectValue placeholder={placeholder} />
        )}
      </SelectTrigger>
      
      {/* Renderizar children con búsqueda si es necesario */}
      {isMulti ? (
        <SelectContent>
          {/* Search input */}
          {searchable && (
            <div style={{ padding: '8px', borderBottom: `1px solid ${colors.border}` }}>
              <input
                ref={searchInputRef}
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: colors.background,
                  color: colors.text
                }}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                onKeyUp={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
          )}
          {/* Multi options list */}
          {filteredOptions.length === 0 ? (
            <div className="flex items-center justify-center p-4">
              <span className="text-sm text-gray-600">No se encontraron opciones</span>
            </div>
          ) : (
            filteredOptions.map(opt => (
              <div
                key={opt.value}
                className={styles.item}
                onClick={(e) => { e.stopPropagation(); handleToggleMulti(String(opt.value)); }}
              >
                <span className={styles.itemIndicator}>
                  {multiSelectedSet.has(String(opt.value)) && (<CheckIcon />)}
                </span>
                <span>{opt.label}</span>
              </div>
            ))
          )}
        </SelectContent>
      ) : (
        searchable ? (
          React.Children.map(children, (child) => {
            if (React.isValidElement(child) && child.type === SelectContent) {
              return React.cloneElement(child, child.props, [
                <div key="search" style={{ padding: '8px', borderBottom: `1px solid ${colors.border}` }}>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '4px',
                      fontSize: '14px',
                      backgroundColor: colors.background,
                      color: colors.text
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      // Evitar que Radix Select capture las teclas (typeahead) y cambie el foco
                      e.stopPropagation();
                    }}
                    onKeyUp={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    autoFocus
                  />
                </div>,
                ...React.Children.toArray(child.props.children).filter((item) => {
                  if (React.isValidElement(item) && item.type === SelectItem) {
                    const itemText = item.props.children?.toString().toLowerCase() || '';
                    const itemValue = item.props.value?.toString().toLowerCase() || '';
                    const search = searchTerm.toLowerCase();
                    
                    return !searchTerm || itemText.includes(search) || itemValue.includes(search);
                  }
                  return true;
                })
              ]);
            }
            return child;
          })
        ) : children
      )}
    </Select>
  );

  // Si no hay label, devolver solo el select
  if (!label) {
    return selectElement;
  }

  // Si hay label, devolver el conjunto completo
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label 
        htmlFor={selectId} 
        className="block text-sm font-medium"
        style={{ color: colors.text }}
      >
        {label}
        {(requiredText || required) && <span className="text-red-500 ml-1">*</span>}
      </label>
      {selectElement}
      {/* Hidden input para activar validación HTML5 del select */}
      {(required || requiredText) && (
        <input
          type="text"
          value={value || ''}
          onChange={() => {}} // 🔧 FIX: Agregar onChange vacío para evitar warnings
          required
          style={{
            position: 'absolute',
            left: '-9999px',
            opacity: 0,
            pointerEvents: 'none'
          }}
          onInvalid={(e) => {
            e.preventDefault();
            setTouched(true);
            setHasError(true);
            setErrorMessage(label ? `${label} es requerido` : "Este campo es requerido");
          }}
          tabIndex={-1}
          aria-hidden="true"
        />
      )}
      {errorMessage && (
        <p className="text-sm text-red-500" style={{ margin: 0 }}>{errorMessage}</p>
      )}
    </div>
  );
});
SelectWrapper.displayName = "SelectWrapper";

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  SelectWrapper,
};

export default Select;