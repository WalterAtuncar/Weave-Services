import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/utils";
import * as Icons from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import "./button.css";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center overflow-hidden transition-all duration-300 font-medium",
  {
    variants: {
      variant: {
        default: "button-default",
        primary: "button-default",
        secondary: "button-secondary bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300",
        outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
        ghost: "bg-transparent hover:bg-gray-100",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        custom: "button-custom",
        action: "button-action",
      },
      size: {
        s: "h-8 px-3 text-xs min-w-[100px]",
        m: "h-8 px-4 text-sm min-w-[118px]", 
        l: "h-12 px-6 text-base min-w-[140px]",
        xl: "h-14 px-8 text-lg min-w-[160px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "m",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  iconName?: keyof typeof Icons;
  iconPosition?: "left" | "right";
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  loading?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const adjustBrightness = (color: string, amount: number): string => {
  if (!color.startsWith('#')) return color;
  
  const num = parseInt(color.replace("#", ""), 16);
  const r = (num >> 16) + amount;
  const g = (num >> 8 & 0x00FF) + amount;
  const b = (num & 0x0000FF) + amount;
  
  return "#" + (0x1000000 + (r < 255 ? r < 1 ? 0 : r : 255) * 0x10000 +
    (g < 255 ? g < 1 ? 0 : g : 255) * 0x100 +
    (b < 255 ? b < 1 ? 0 : b : 255)).toString(16).slice(1);
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant,
    size, 
    iconName, 
    iconPosition = "left",
    backgroundColor,
    textColor,
    borderColor,
    loading = false,
    children,
    onClick,
    ...props 
  }, ref) => {
    const { colors, theme } = useTheme();
    const Icon = iconName ? ((Icons as Record<string, React.ComponentType<any>>)[iconName] as React.ComponentType<any>) : null;

    // Detectar modo icon-only circular independientemente de la variante
    const isIconOnly = !!Icon && !children;
    // Diámetro por tamaño
    const diameter = size === 'xl' ? 44 : size === 'l' ? 40 : size === 'm' ? 36 : 32;

    React.useEffect(() => {
      // Aplicar estilos con !important usando useEffect
      if (ref && 'current' in ref && ref.current && (variant === 'default' || variant === 'primary')) {
        let finalBackgroundColor: string;
        let finalTextColor: string;

        if (theme === 'light') {
          finalBackgroundColor = colors.primary; // #414976 (oscuro)
          finalTextColor = '#FFFFFF'; // Blanco sobre oscuro
        } else {
          finalBackgroundColor = colors.primary; // #F3F4F8 (claro)
          finalTextColor = '#414976'; // Oscuro sobre claro
        }

        ref.current.style.setProperty('background-color', finalBackgroundColor, 'important');
        ref.current.style.setProperty('color', finalTextColor, 'important');
      }
    }, [variant, theme, colors.primary, ref]);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      // Para botones de tipo submit, no interceptar el evento si no hay onClick personalizado
      if (props.type === 'submit' && !onClick) {
        // Dejar que el evento se propague naturalmente para disparar el submit del formulario
        return;
      }
      
      if (onClick) {
        onClick(event);
      }
    };

    const hasCustomColors = backgroundColor || textColor || borderColor;
    const effectiveVariant = hasCustomColors ? (variant === "action" ? "action" : "custom") : variant;

    // Lógica mejorada para colores del botón default/primary
    let finalBackgroundColor: string;
    let finalTextColor: string;

    if (backgroundColor && textColor) {
      // Si se especifican ambos colores personalizados
      finalBackgroundColor = backgroundColor;
      finalTextColor = textColor;
    } else if (variant === 'default' || variant === 'primary') {
      // Para botón default/primary, usar colores que aseguren buen contraste
      if (theme === 'light') {
        finalBackgroundColor = colors.primary; // #414976 (oscuro)
        finalTextColor = '#FFFFFF'; // Blanco sobre oscuro
      } else {
        finalBackgroundColor = colors.primary; // #F3F4F8 (claro)
        finalTextColor = '#414976'; // Oscuro sobre claro
      }
    } else {
      // Para otras variantes
      finalBackgroundColor = backgroundColor || colors.surface;
      finalTextColor = textColor || colors.text;
    }

    const customStyles: React.CSSProperties = hasCustomColors || variant === 'default' || variant === 'primary' || variant === 'action' ? {
      backgroundColor: finalBackgroundColor,
      color: finalTextColor,
      border: borderColor ? `1px solid ${borderColor}` : "none",
      borderRadius: isIconOnly ? "9999px" : "8px",
      boxShadow: borderColor ? "none" : `
        0px 0px 2px rgba(39, 13, 105, 0.2),
        inset 0px 4px 4px rgba(255, 255, 255, 0.25),
        inset 0px -2px 2px ${adjustBrightness(finalBackgroundColor, -20)},
        inset 0px 0.5px 1px 2px rgba(60, 53, 94, 0.25)
      `,
      // Forzar circular icon-only: anular min-width y padding de utilidades Tailwind
      minWidth: isIconOnly ? 0 : undefined,
      width: isIconOnly ? `${diameter}px` : undefined,
      height: isIconOnly ? `${diameter}px` : undefined,
      padding: isIconOnly ? "0" : undefined,
    } : {};

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if ((hasCustomColors || variant === 'default' || variant === 'primary') && variant !== 'action' && finalBackgroundColor) {
        e.currentTarget.style.setProperty('background-color', adjustBrightness(finalBackgroundColor, -15), 'important');
      }
      if ((hasCustomColors || variant === 'default' || variant === 'primary' || variant === 'action') && finalBackgroundColor) {
        e.currentTarget.style.transform = "translateY(-1px)";
      }
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      if ((hasCustomColors || variant === 'default' || variant === 'primary') && variant !== 'action') {
        e.currentTarget.style.setProperty('background-color', finalBackgroundColor, 'important');
      }
      if (hasCustomColors || variant === 'default' || variant === 'primary' || variant === 'action') {
        e.currentTarget.style.transform = "translateY(0px)";
      }
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
      if ((hasCustomColors || variant === 'default' || variant === 'primary') && variant !== 'action' && finalBackgroundColor) {
        e.currentTarget.style.setProperty('background-color', adjustBrightness(finalBackgroundColor, -30), 'important');
      }
      if ((hasCustomColors || variant === 'default' || variant === 'primary' || variant === 'action') && finalBackgroundColor) {
        e.currentTarget.style.transform = "translateY(0px)";
      }
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
      if ((hasCustomColors || variant === 'default' || variant === 'primary') && variant !== 'action') {
        e.currentTarget.style.setProperty('background-color', finalBackgroundColor, 'important');
      }
      if (hasCustomColors || variant === 'default' || variant === 'primary' || variant === 'action') {
        e.currentTarget.style.transform = "translateY(-1px)";
      }
    };

    // Filtrar el prop loading para que no se pase al elemento HTML
    const { loading: _, ...filteredProps } = props;

    return (
      <button
        className={cn(buttonVariants({ variant: effectiveVariant, size }), className, isIconOnly ? "button-action-icon-only" : undefined)}
        ref={ref}
        onClick={loading ? undefined : handleClick}
        disabled={loading || props.disabled}
        style={customStyles}
        onMouseEnter={loading ? undefined : handleMouseEnter}
        onMouseLeave={loading ? undefined : handleMouseLeave}
        onMouseDown={loading ? undefined : handleMouseDown}
        onMouseUp={loading ? undefined : handleMouseUp}
        {...filteredProps}
      >
        {loading ? (
          <Icons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          Icon && iconPosition === "left" && (
            <Icon className={cn(isIconOnly ? "h-4 w-4" : "mr-2 h-4 w-4")} />
          )
        )}
        {children}
        {!loading && Icon && iconPosition === "right" && (
          <Icon className={cn(isIconOnly ? "h-4 w-4" : "ml-2 h-4 w-4")} />
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };