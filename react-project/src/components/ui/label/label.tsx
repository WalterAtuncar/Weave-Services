import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/utils";
import { useTheme } from "../../../contexts/ThemeContext";
import "./label.css";

const labelVariants = cva(
  "label-base",
  {
    variants: {
      variant: {
        default: "label-default",
        h1: "label-h1",
        h2: "label-h2",
        h3: "label-h3",
        h4: "label-h4",
        h5: "label-h5",
        h6: "label-h6",
        body: "label-body",
        caption: "label-caption",
      },
      size: {
        xs: "label-xs",
        sm: "label-sm",
        md: "label-md",
        lg: "label-lg",
        xl: "label-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface LabelProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof labelVariants> {
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label';
  children: React.ReactNode;
}

const Label = React.forwardRef<HTMLElement, LabelProps>(
  ({ className, variant, size, as, children, ...props }, ref) => {
    const { theme } = useTheme();
    // Determinar el elemento HTML basado en la variante o prop 'as'
    const Component = as || (
      variant === 'h1' ? 'h1' :
      variant === 'h2' ? 'h2' :
      variant === 'h3' ? 'h3' :
      variant === 'h4' ? 'h4' :
      variant === 'h5' ? 'h5' :
      variant === 'h6' ? 'h6' :
      variant === 'body' ? 'p' :
      variant === 'caption' ? 'span' :
      'span'
    ) as keyof JSX.IntrinsicElements;

    // Aplicar clase de tema dinámicamente
    const themeClass = theme === 'dark' ? 'dark' : '';

    return React.createElement(
      Component,
      {
        className: cn(
          labelVariants({ variant, size }),
          themeClass,
          className
        ),
        ref,
        ...props
      },
      children
    );
  }
);

Label.displayName = "Label";

export { Label, labelVariants };