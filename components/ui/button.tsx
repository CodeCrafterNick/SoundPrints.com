import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary - Main CTA button with gradient and glow
        default: 
          "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/30 hover:from-rose-600 hover:to-rose-700 active:scale-[0.98] rounded-xl",
        
        // Secondary - Subtle background
        secondary:
          "bg-gray-100 text-gray-900 hover:bg-gray-200 active:scale-[0.98] rounded-xl",
        
        // Outline - Clean bordered button
        outline:
          "border-2 border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] rounded-xl",
        
        // Ghost - Minimal, no background
        ghost: 
          "text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:scale-[0.98] rounded-xl",
        
        // Link - Text only with underline
        link: 
          "text-rose-600 underline-offset-4 hover:underline hover:text-rose-700 p-0 h-auto",
        
        // Destructive - For dangerous actions
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 hover:from-red-600 hover:to-red-700 active:scale-[0.98] rounded-xl",
        
        // ===== NEW MODERN VARIANTS =====
        
        // Gradient - Multi-color gradient button
        gradient:
          "bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 hover:brightness-110 active:scale-[0.98] rounded-xl",
        
        // Glow - Button with animated glow effect
        glow:
          "bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.5)] hover:shadow-[0_0_30px_rgba(244,63,94,0.7)] hover:bg-rose-600 active:scale-[0.98] rounded-xl animate-pulse-glow",
        
        // Glass - Glassmorphism effect
        glass:
          "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:border-white/30 active:scale-[0.98] rounded-xl shadow-lg",
        
        // Dark - Sleek dark button
        dark:
          "bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-900/20 active:scale-[0.98] rounded-xl",
        
        // Soft - Soft colored backgrounds
        soft:
          "bg-rose-100 text-rose-700 hover:bg-rose-200 active:scale-[0.98] rounded-xl",
        
        // Premium - Gold/luxury feel
        premium:
          "bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-amber-950 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/40 font-semibold active:scale-[0.98] rounded-xl",
        
        // Success - Green success button
        success:
          "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-[0.98] rounded-xl",
        
        // Outline Primary - Outlined with primary color
        "outline-primary":
          "border-2 border-rose-500 bg-transparent text-rose-600 hover:bg-rose-50 hover:text-rose-700 active:scale-[0.98] rounded-xl",
        
        // Pill - Fully rounded button
        pill:
          "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/30 active:scale-[0.98] rounded-full",
        
        // Shimmer - Button with shimmer animation
        shimmer:
          "bg-gradient-to-r from-rose-500 via-rose-400 to-rose-500 bg-[length:200%_100%] animate-shimmer text-white shadow-lg shadow-rose-500/25 active:scale-[0.98] rounded-xl",
        
        // Minimal - Ultra minimal design
        minimal:
          "text-gray-500 hover:text-gray-900 underline underline-offset-4 decoration-gray-300 hover:decoration-gray-500 p-0 h-auto font-normal",
        
        // 3D - Button with 3D depth effect
        "3d":
          "bg-rose-500 text-white border-b-4 border-rose-700 hover:border-b-2 hover:translate-y-[2px] hover:bg-rose-600 active:border-b-0 active:translate-y-[4px] rounded-xl transition-all",
        
        // Neon - Neon glow effect
        neon:
          "bg-transparent border-2 border-rose-500 text-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5),inset_0_0_10px_rgba(244,63,94,0.1)] hover:shadow-[0_0_20px_rgba(244,63,94,0.8),inset_0_0_20px_rgba(244,63,94,0.2)] hover:text-rose-400 hover:border-rose-400 rounded-xl transition-all",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 px-4 py-2 text-xs",
        lg: "h-12 px-8 py-3 text-base",
        xl: "h-14 px-10 py-4 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg 
              className="animate-spin -ml-1 mr-2 h-4 w-4" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </>
        ) : children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
