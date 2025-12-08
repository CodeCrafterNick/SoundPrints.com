'use client'

import { cn } from '@/lib/utils'
import { Slider } from '@/components/ui/slider'
import { ChevronDown, type LucideIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'

// ============================================================================
// COMPACT SLIDER - Condensed slider with label and value on same line
// ============================================================================
interface CompactSliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  unit?: string
  className?: string
}

export function CompactSlider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = '',
  className,
}: CompactSliderProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1 py-0.5 rounded">
          {typeof value === 'number' ? Math.round(value) : value}{unit}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  )
}

// ============================================================================
// TOGGLE SWITCH - Standardized toggle component
// ============================================================================
interface ToggleSwitchProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
}

export function ToggleSwitch({ label, description, checked, onChange, className }: ToggleSwitchProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        {description && <span className="text-[10px] text-gray-400">{description}</span>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
          checked ? 'bg-gray-900' : 'bg-gray-200'
        )}
      >
        <span
          className={cn(
            "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm",
            checked ? 'translate-x-5' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  )
}

// ============================================================================
// BUTTON GROUP - Standardized segmented button selector
// ============================================================================
interface ButtonGroupOption<T extends string> {
  value: T
  label: string
  icon?: LucideIcon
}

interface ButtonGroupProps<T extends string> {
  options: ButtonGroupOption<T>[]
  value: T
  onChange: (value: T) => void
  size?: 'sm' | 'md'
  className?: string
}

export function ButtonGroup<T extends string>({
  options,
  value,
  onChange,
  size = 'sm',
  className,
}: ButtonGroupProps<T>) {
  return (
    <div className={cn("flex gap-1", className)}>
      {options.map((option) => {
        const isActive = value === option.value
        const Icon = option.icon
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex-1 font-medium rounded transition-all",
              size === 'sm' ? 'py-1.5 text-xs' : 'py-2 text-sm',
              isActive
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {Icon && <Icon className={cn("inline-block mr-1", size === 'sm' ? 'w-3 h-3' : 'w-4 h-4')} />}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

// ============================================================================
// COLLAPSIBLE SECTION - Expandable section with header
// ============================================================================
interface CollapsibleSectionProps {
  title: string
  icon?: LucideIcon
  defaultOpen?: boolean
  children: ReactNode
  className?: string
}

export function CollapsibleSection({
  title,
  icon: Icon,
  defaultOpen = true,
  children,
  className,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={cn("border-t border-gray-100 first:border-t-0", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-2.5 text-left hover:bg-gray-50/50 -mx-1 px-1 rounded"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground" />}
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{title}</span>
        </div>
        <ChevronDown 
          className={cn(
            "w-4 h-4 text-gray-400 transition-transform",
            isOpen && "rotate-180"
          )} 
        />
      </button>
      {isOpen && (
        <div className="space-y-3 pb-3">
          {children}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// COLOR PRESET GRID - Compact color swatch grid
// ============================================================================
interface ColorPresetGridProps {
  colors: { name: string; value: string }[]
  value: string
  onChange: (color: string) => void
  columns?: number
  className?: string
}

export function ColorPresetGrid({
  colors,
  value,
  onChange,
  columns = 8,
  className,
}: ColorPresetGridProps) {
  return (
    <div className={cn(`grid gap-2`, className)} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {colors.map((color) => (
        <button
          key={color.value}
          onClick={() => onChange(color.value)}
          className={cn(
            'aspect-square min-w-[28px] rounded border-2 transition-all hover:scale-110 shadow-sm',
            value === color.value
              ? 'border-gray-900 ring-2 ring-gray-900/30 scale-105'
              : 'border-gray-200 hover:border-gray-400'
          )}
          style={{ backgroundColor: color.value }}
          title={color.name}
        />
      ))}
    </div>
  )
}

// ============================================================================
// SECTION HEADER - Compact section header with icon
// ============================================================================
interface SectionHeaderProps {
  icon?: LucideIcon
  title: string
  action?: ReactNode
  className?: string
}

export function SectionHeader({ icon: Icon, title, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground" />}
        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{title}</span>
      </div>
      {action}
    </div>
  )
}

// ============================================================================
// INLINE CONTROL ROW - For tight layouts with label + control inline
// ============================================================================
interface InlineControlProps {
  label: string
  children: ReactNode
  className?: string
}

export function InlineControl({ label, children, className }: InlineControlProps) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <span className="text-xs text-muted-foreground flex-shrink-0">{label}</span>
      <div className="flex-1 max-w-[160px]">{children}</div>
    </div>
  )
}

// ============================================================================
// COLOR PICKER INPUT - Simple color input with hex display
// ============================================================================
interface ColorPickerInputProps {
  color: string
  onChange: (color: string) => void
  className?: string
}

export function ColorPickerInput({ color, onChange, className }: ColorPickerInputProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded border border-gray-200 cursor-pointer bg-transparent"
          style={{ padding: 0 }}
        />
      </div>
      <input
        type="text"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-3 py-2 text-sm font-mono border border-gray-200 rounded focus:ring-2 focus:ring-primary/20 focus:border-primary"
        placeholder="#000000"
      />
    </div>
  )
}
