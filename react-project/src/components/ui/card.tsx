import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority";
import { useTheme } from "@/contexts/ThemeContext";

const cardVariants = cva(
  "relative shadow-sm",
  {
    variants: {
      variant: {
        default: "rounded-lg border bg-card text-card-foreground shadow-sm",
        login: "box-border w-[420px] h-[480px] border-[0.5px] rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => {
    const { colors } = useTheme();
    
    const loginStyles = variant === "login" ? {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      boxShadow: "2px 2px 2px 0.5px rgba(173, 146, 146, 0.15)",
      color: colors.text
    } : {
      backgroundColor: colors.surface,
      color: colors.text
    };

    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant }), className)}
        style={loginStyles}
        {...props}
      />
    );
  }
);
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  const { colors } = useTheme();
  
  return (
    <h3
      ref={ref}
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className
      )}
      style={{ color: colors.text }}
      {...props}
    />
  );
})
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { colors } = useTheme();
  
  return (
    <p
      ref={ref}
      className={cn("text-sm", className)}
      style={{ color: colors.textSecondary }}
      {...props}
    />
  );
})
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
}