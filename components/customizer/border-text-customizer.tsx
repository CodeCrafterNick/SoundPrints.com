'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { 
  useCustomizerStore,
  type BorderTextSide,
  type BorderTextJustify
} from '@/lib/stores/customizer-store'
import { cn } from '@/lib/utils'
import { 
  ChevronDown,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ArrowUpFromLine,
  ArrowDownFromLine,
  ArrowLeftFromLine,
  ArrowRightFromLine,
  LetterText,
  Repeat,
  CaseSensitive
} from 'lucide-react'
import { ColorPickerInput } from './ui-components'

const FONT_FAMILIES = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Oswald', label: 'Oswald' },
  { value: 'Raleway', label: 'Raleway' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
]

const JUSTIFY_OPTIONS: { value: BorderTextJustify; label: string; icon: React.ReactNode }[] = [
  { value: 'start', label: 'Start', icon: <AlignLeft className="w-4 h-4" /> },
  { value: 'center', label: 'Center', icon: <AlignCenter className="w-4 h-4" /> },
  { value: 'end', label: 'End', icon: <AlignRight className="w-4 h-4" /> },
  { value: 'space-between', label: 'Space Between', icon: <AlignJustify className="w-4 h-4" /> },
  { value: 'space-around', label: 'Space Around', icon: <AlignJustify className="w-4 h-4" /> },
  { value: 'space-evenly', label: 'Space Evenly', icon: <AlignJustify className="w-4 h-4" /> },
]

const SIDE_OPTIONS: { value: BorderTextSide; label: string; icon: React.ReactNode }[] = [
  { value: 'top', label: 'Top', icon: <ArrowUpFromLine className="w-4 h-4" /> },
  { value: 'right', label: 'Right', icon: <ArrowRightFromLine className="w-4 h-4" /> },
  { value: 'bottom', label: 'Bottom', icon: <ArrowDownFromLine className="w-4 h-4" /> },
  { value: 'left', label: 'Left', icon: <ArrowLeftFromLine className="w-4 h-4" /> },
]

export function BorderTextCustomizer() {
  const [isOpen, setIsOpen] = useState(true)
  
  const { 
    borderText,
    setBorderText,
    setBorderTextEnabled,
    setBorderTextSides,
    setBorderTextJustify,
    setBorderTextHeight
  } = useCustomizerStore()
  
  const toggleSide = (side: BorderTextSide) => {
    const currentSides = borderText.sides
    if (currentSides.includes(side)) {
      // Remove side (but keep at least one)
      if (currentSides.length > 1) {
        setBorderTextSides(currentSides.filter(s => s !== side))
      }
    } else {
      // Add side
      setBorderTextSides([...currentSides, side])
    }
  }
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between p-4 h-auto rounded hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <LetterText className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="font-medium text-sm">Border Text</div>
              <div className="text-xs text-muted-foreground">
                {borderText.enabled ? `${borderText.sides.length} sides active` : 'Disabled'}
              </div>
            </div>
          </div>
          <ChevronDown className={cn(
            "h-5 w-5 transition-transform",
            isOpen && "rotate-180"
          )} />
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="px-4 pb-4 space-y-5">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="border-text-enabled" className="text-sm">Enable Border Text</Label>
          <Switch
            id="border-text-enabled"
            checked={borderText.enabled}
            onCheckedChange={setBorderTextEnabled}
          />
        </div>
        
        {borderText.enabled && (
          <>
            {/* Text Input */}
            <div className="space-y-2">
              <Label className="text-sm">Text</Label>
              <Textarea
                value={borderText.text}
                onChange={(e) => setBorderText({ text: e.target.value })}
                placeholder="Enter text to wrap around border..."
                className="min-h-[80px] resize-none rounded text-sm"
              />
            </div>
            
            {/* Continuous Wrap Toggle */}
            <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
              <div className="space-y-0.5">
                <Label htmlFor="border-text-continuous" className="text-sm font-medium">Continuous Wrap</Label>
                <p className="text-xs text-muted-foreground">Text flows around all sides as one continuous string</p>
              </div>
              <Switch
                id="border-text-continuous"
                checked={borderText.continuous}
                onCheckedChange={(continuous) => setBorderText({ continuous })}
              />
            </div>
            
            {/* Break Words Toggle - Only show when continuous is enabled */}
            {borderText.continuous && (
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                <div className="space-y-0.5">
                  <Label htmlFor="border-text-break-words" className="text-sm font-medium">Break Words</Label>
                  <p className="text-xs text-muted-foreground">Use hyphens to break words at corners</p>
                </div>
                <Switch
                  id="border-text-break-words"
                  checked={borderText.breakWords}
                  onCheckedChange={(breakWords) => setBorderText({ breakWords })}
                />
              </div>
            )}
            
            {/* Side Selection */}
            <div className="space-y-2">
              <Label className="text-sm">{borderText.continuous ? 'Wrap Direction' : 'Sides to Wrap'}</Label>
              <div className="grid grid-cols-4 gap-2">
                {SIDE_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={borderText.sides.includes(option.value) ? 'default' : 'outline'}
                    size="sm"
                    className="flex flex-col gap-1.5 h-auto py-3 rounded"
                    onClick={() => toggleSide(option.value)}
                  >
                    {option.icon}
                    <span className="text-xs">{option.label}</span>
                  </Button>
                ))}
              </div>
              {borderText.continuous && (
                <p className="text-xs text-muted-foreground">Select sides to include in the continuous wrap (clockwise from top)</p>
              )}
            </div>
            
            {/* Justify Selection */}
            <div className="space-y-2">
              <Label className="text-sm">Text Justify</Label>
              <Select
                value={borderText.justify}
                onValueChange={(value) => setBorderTextJustify(value as BorderTextJustify)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select justify" />
                </SelectTrigger>
                <SelectContent>
                  {JUSTIFY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {option.icon}
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Height/Width Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Band Height</Label>
                <span className="text-xs text-muted-foreground">{borderText.height}%</span>
              </div>
              <Slider
                value={[borderText.height]}
                onValueChange={([value]) => setBorderTextHeight(value)}
                min={2}
                max={15}
                step={0.5}
              />
            </div>
            
            {/* Font Size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Font Size</Label>
                <span className="text-xs text-muted-foreground">{borderText.fontSize}px</span>
              </div>
              <Slider
                value={[borderText.fontSize]}
                onValueChange={([value]) => setBorderText({ fontSize: value })}
                min={8}
                max={48}
                step={1}
              />
            </div>
            
            {/* Letter Spacing */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Letter Spacing</Label>
                <span className="text-xs text-muted-foreground">{borderText.letterSpacing}px</span>
              </div>
              <Slider
                value={[borderText.letterSpacing]}
                onValueChange={([value]) => setBorderText({ letterSpacing: value })}
                min={0}
                max={20}
                step={1}
              />
            </div>
            
            {/* Margin from Edge */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Margin from Edge</Label>
                <span className="text-xs text-muted-foreground">{borderText.margin}%</span>
              </div>
              <Slider
                value={[borderText.margin]}
                onValueChange={([value]) => setBorderText({ margin: value })}
                min={0}
                max={10}
                step={0.5}
              />
            </div>
            
            {/* Font Family */}
            <div className="space-y-2">
              <Label className="text-sm">Font Family</Label>
              <Select
                value={borderText.fontFamily}
                onValueChange={(value) => setBorderText({ fontFamily: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_FAMILIES.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: font.value }}>{font.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Color */}
            <div className="space-y-2">
              <Label className="text-sm">Text Color</Label>
              <ColorPickerInput
                color={borderText.color}
                onChange={(color) => setBorderText({ color })}
              />
            </div>
            
            {/* Options Row */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="border-text-repeat"
                  checked={borderText.repeat}
                  onCheckedChange={(repeat) => setBorderText({ repeat })}
                />
                <Label htmlFor="border-text-repeat" className="text-sm flex items-center gap-1">
                  <Repeat className="w-3 h-3" />
                  Repeat
                </Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  id="border-text-uppercase"
                  checked={borderText.uppercase}
                  onCheckedChange={(uppercase) => setBorderText({ uppercase })}
                />
                <Label htmlFor="border-text-uppercase" className="text-sm flex items-center gap-1">
                  <CaseSensitive className="w-3 h-3" />
                  Uppercase
                </Label>
              </div>
            </div>
          </>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}
