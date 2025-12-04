"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

interface DeferredSliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  onDeferredValueChange?: (value: number[]) => void
}

/**
 * DeferredSlider - A slider optimized for frequent updates
 * 
 * Uses useDeferredValue to defer expensive re-renders while still
 * providing smooth visual feedback during drag operations.
 * 
 * Use onValueChange for immediate visual feedback
 * Use onDeferredValueChange for expensive operations (like re-rendering canvas)
 */
const DeferredSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  DeferredSliderProps
>(({ className, value, onValueChange, onDeferredValueChange, ...props }, ref) => {
  // Local state for immediate visual updates
  const [localValue, setLocalValue] = React.useState(value)
  
  // Deferred value for expensive operations
  const deferredValue = React.useDeferredValue(localValue)
  
  // Sync local state with external value
  React.useEffect(() => {
    setLocalValue(value)
  }, [value])
  
  // Call deferred handler when deferred value changes
  React.useEffect(() => {
    if (deferredValue && onDeferredValueChange) {
      onDeferredValueChange(deferredValue)
    }
  }, [deferredValue, onDeferredValueChange])
  
  const handleValueChange = React.useCallback((newValue: number[]) => {
    setLocalValue(newValue)
    onValueChange?.(newValue)
  }, [onValueChange])
  
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      value={localValue}
      onValueChange={handleValueChange}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
  )
})
DeferredSlider.displayName = "DeferredSlider"

export { DeferredSlider }
