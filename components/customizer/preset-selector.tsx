'use client'

import { useState } from 'react'
import { useCustomizerStore } from '@/lib/stores/customizer-store'
import { DESIGN_PRESETS, PRESET_CATEGORIES, getPresetsByCategory, type DesignPreset } from '@/lib/design-presets'
import { cn } from '@/lib/utils'
import { Check, Sparkles, Square, Rainbow, Radio, Leaf, PartyPopper, Lightbulb } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Square,
  Rainbow,
  Sparkles,
  Radio,
  Leaf,
  PartyPopper,
}

interface PresetSelectorProps {
  className?: string
}

function PresetCard({ preset, onSelect, isSelected }: { 
  preset: DesignPreset
  onSelect: (preset: DesignPreset) => void
  isSelected: boolean
}) {
  return (
    <button
      onClick={() => onSelect(preset)}
      className={cn(
        "relative group rounded-lg border-2 transition-all duration-200",
        "hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
        isSelected 
          ? "border-blue-500 ring-2 ring-blue-200" 
          : "border-gray-200 hover:border-gray-300"
      )}
    >
      {/* Preview */}
      <div 
        className="w-full h-20 rounded-t-md flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: preset.preview.backgroundColor }}
      >
        {/* Mini waveform preview */}
        <div className="flex items-center gap-[1px] h-8">
          {[0.3, 0.5, 0.7, 1, 0.8, 0.6, 0.9, 0.7, 0.5, 0.8, 1, 0.6, 0.4, 0.7, 0.9, 0.5].map((h, i) => (
            <div
              key={i}
              className="w-1 rounded-full transition-all"
              style={{ 
                height: `${h * 24}px`,
                backgroundColor: preset.preview.waveformColor,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Label */}
      <div className="p-2 bg-white rounded-b-md">
        <p className="text-xs font-medium text-gray-900 truncate">{preset.name}</p>
        <p className="text-[10px] text-gray-500 truncate">{preset.description}</p>
      </div>
      
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-1 right-1 bg-blue-500 rounded-full p-0.5">
          <Check className="h-3 w-3 text-white" />
        </div>
      )}
    </button>
  )
}

export function PresetSelector({ className }: PresetSelectorProps) {
  const [open, setOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('minimal')
  const [appliedPresetId, setAppliedPresetId] = useState<string | null>(null)
  
  const applyPreset = useCustomizerStore(state => state.applyPreset)
  const waveformColor = useCustomizerStore(state => state.waveformColor)
  const backgroundColor = useCustomizerStore(state => state.backgroundColor)
  
  const handleSelectPreset = (preset: DesignPreset) => {
    applyPreset(preset)
    setAppliedPresetId(preset.id)
    toast.success(`Applied "${preset.name}" theme`, {
      description: 'You can undo with Cmd+Z',
      duration: 2000,
    })
    setOpen(false)
  }
  
  const filteredPresets = getPresetsByCategory(selectedCategory)
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn("gap-2", className)}
        >
          <Sparkles className="h-4 w-4" />
          Themes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Design Themes
          </DialogTitle>
        </DialogHeader>
        
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 pb-2 border-b">
          {PRESET_CATEGORIES.map(category => {
            const IconComponent = iconMap[category.icon]
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1",
                  selectedCategory === category.id
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {IconComponent && <IconComponent className="h-4 w-4" />}
                {category.name}
              </button>
            )
          })}
        </div>
        
        {/* Presets grid */}
        <div className="h-[400px] overflow-y-auto pr-4">
          <div className="grid grid-cols-3 gap-3 py-2">
            {filteredPresets.map(preset => (
              <PresetCard
                key={preset.id}
                preset={preset}
                onSelect={handleSelectPreset}
                isSelected={appliedPresetId === preset.id}
              />
            ))}
          </div>
        </div>
        
        {/* Tip */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t flex items-center justify-center gap-1">
          <Lightbulb className="h-3 w-3" />
          Tip: You can always customize colors and styles after applying a theme
        </div>
      </DialogContent>
    </Dialog>
  )
}
