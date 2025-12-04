'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useCustomizerStore } from '@/lib/stores/customizer-store'
import { AudioUploader } from '@/components/customizer/audio-uploader'
import { StyleCustomizer, WaveformPreviewIcon } from '@/components/customizer/style-customizer'
import { ColorCustomizer } from '@/components/customizer/color-customizer'
import { TextCustomizer } from '@/components/customizer/text-customizer'
import { BackgroundCustomizer } from '@/components/customizer/background-customizer'
import { QRCodeCustomizer } from '@/components/customizer/qrcode-customizer'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import {
  Music,
  Sparkles,
  Palette,
  Type,
  Image,
  QrCode,
  Download,
  Maximize,
  ChevronLeft,
  RotateCcw,
  Check,
} from 'lucide-react'

// Aspect ratio presets like WaveVisual
const ASPECT_RATIOS = [
  // Horizontal (landscape)
  { value: '36:24', label: '36" × 24"', width: 36, height: 24, group: 'horizontal' },
  { value: '24:18', label: '24" × 18"', width: 24, height: 18, group: 'horizontal' },
  { value: '24:16', label: '24" × 16"', width: 24, height: 16, group: 'horizontal' },
  { value: '20:16', label: '20" × 16"', width: 20, height: 16, group: 'horizontal' },
  { value: '16:12', label: '16" × 12"', width: 16, height: 12, group: 'horizontal' },
  { value: '14:11', label: '14" × 11"', width: 14, height: 11, group: 'horizontal' },
  // Square
  { value: '1:1', label: 'Square', width: 1, height: 1, group: 'square' },
  // Vertical (portrait)
  { value: '11:14', label: '11" × 14"', width: 11, height: 14, group: 'vertical' },
  { value: '12:16', label: '12" × 16"', width: 12, height: 16, group: 'vertical' },
  { value: '12:18', label: '12" × 18"', width: 12, height: 18, group: 'vertical' },
  { value: '16:20', label: '16" × 20"', width: 16, height: 20, group: 'vertical' },
  { value: '18:24', label: '18" × 24"', width: 18, height: 24, group: 'vertical' },
  { value: '24:36', label: '24" × 36"', width: 24, height: 36, group: 'vertical' },
]

type SidebarSection = 'audio' | 'style' | 'canvas' | 'background' | 'text' | 'qrcode' | 'download' | null

interface EditorSidebarProps {
  onContinue: () => void
  selectedWallArtSize: { width: number; height: number }
  setSelectedWallArtSize: (size: { width: number; height: number }) => void
}

export function EditorSidebar({ 
  onContinue, 
  selectedWallArtSize,
  setSelectedWallArtSize 
}: EditorSidebarProps) {
  const [activeSection, setActiveSection] = useState<SidebarSection>('audio')
  
  // Store values
  const audioUrl = useCustomizerStore((state) => state.audioUrl)
  const waveformStyle = useCustomizerStore((state) => state.waveformStyle)
  const waveformColor = useCustomizerStore((state) => state.waveformColor)
  const backgroundColor = useCustomizerStore((state) => state.backgroundColor)
  const backgroundImage = useCustomizerStore((state) => state.backgroundImage)
  const barWidth = useCustomizerStore((state) => state.barWidth)
  const barGap = useCustomizerStore((state) => state.barGap)
  const circleRadius = useCustomizerStore((state) => state.circleRadius)
  const waveformHeightMultiplier = useCustomizerStore((state) => state.waveformHeightMultiplier)
  const canvasAspectRatio = useCustomizerStore((state) => state.canvasAspectRatio)
  const setBarWidth = useCustomizerStore((state) => state.setBarWidth)
  const setBarGap = useCustomizerStore((state) => state.setBarGap)
  const setCircleRadius = useCustomizerStore((state) => state.setCircleRadius)
  const setWaveformHeightMultiplier = useCustomizerStore((state) => state.setWaveformHeightMultiplier)
  const setCanvasAspectRatio = useCustomizerStore((state) => state.setCanvasAspectRatio)
  
  const isCircular = ['circular', 'soundwave'].includes(waveformStyle)

  const sidebarItems = [
    { id: 'audio' as const, icon: Music, label: 'Audio', hasContent: !!audioUrl },
    { id: 'style' as const, icon: Sparkles, label: 'Sound Wave', disabled: !audioUrl },
    { id: 'canvas' as const, icon: Maximize, label: 'Canvas Size', disabled: !audioUrl },
    { id: 'background' as const, icon: Image, label: 'Background', disabled: !audioUrl },
    { id: 'text' as const, icon: Type, label: 'Text', disabled: !audioUrl },
    { id: 'qrcode' as const, icon: QrCode, label: 'QR Code', disabled: !audioUrl },
    { id: 'download' as const, icon: Download, label: 'Download', disabled: !audioUrl },
  ]

  const handleSectionClick = (section: SidebarSection) => {
    if (activeSection === section) {
      setActiveSection(null)
    } else {
      setActiveSection(section)
    }
  }

  return (
    <div className="flex h-full">
      {/* Icon Sidebar - Always visible */}
      <div className="w-16 bg-gray-900 flex flex-col items-center py-3 gap-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id
          const isDisabled = item.disabled
          
          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && handleSectionClick(item.id)}
              disabled={isDisabled}
              className={cn(
                "w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all",
                isActive 
                  ? "bg-white text-gray-900" 
                  : isDisabled
                    ? "text-gray-600 cursor-not-allowed"
                    : "text-gray-400 hover:text-white hover:bg-gray-800",
                item.hasContent && !isActive && "text-emerald-400"
              )}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-medium leading-tight">{item.label}</span>
            </button>
          )
        })}
      </div>

      {/* Expandable Panel */}
      <div 
        className={cn(
          "bg-white border-r border-gray-200 overflow-hidden transition-all duration-300 ease-in-out",
          activeSection ? "w-80" : "w-0"
        )}
      >
        {activeSection && (
          <div className="w-80 h-full flex flex-col">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">
                {sidebarItems.find(i => i.id === activeSection)?.label}
              </h2>
              <button
                onClick={() => setActiveSection(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                title="Close panel"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeSection === 'audio' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">Audio Source:</p>
                  <AudioUploader />
                </div>
              )}

              {activeSection === 'style' && (
                <div className="space-y-6">
                  <StyleCustomizer />
                  
                  {/* Bar Settings - Like WaveVisual */}
                  <div className="pt-4 border-t border-gray-100 space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700">Waveform Settings</h3>
                    
                    {/* Bar Thickness */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Bar thickness</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            ({barWidth})
                          </span>
                          <button
                            onClick={() => setBarWidth(3)}
                            className="text-xs text-rose-500 hover:text-rose-600"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                      <Slider
                        value={[barWidth]}
                        onValueChange={(v) => setBarWidth(v[0])}
                        min={1}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Space Between Bars */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Space between bars</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            ({barGap})
                          </span>
                          <button
                            onClick={() => setBarGap(1)}
                            className="text-xs text-rose-500 hover:text-rose-600"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                      <Slider
                        value={[barGap]}
                        onValueChange={(v) => setBarGap(v[0])}
                        min={0}
                        max={5}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Height */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Height</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            ({waveformHeightMultiplier})
                          </span>
                          <button
                            onClick={() => setWaveformHeightMultiplier(100)}
                            className="text-xs text-rose-500 hover:text-rose-600"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                      <Slider
                        value={[waveformHeightMultiplier]}
                        onValueChange={(v) => setWaveformHeightMultiplier(v[0])}
                        min={50}
                        max={300}
                        step={10}
                        className="w-full"
                      />
                    </div>

                    {/* Circle-specific controls */}
                    {isCircular && (
                      <>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Circle radius</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                ({circleRadius})
                              </span>
                              <button
                                onClick={() => setCircleRadius(80)}
                                className="text-xs text-rose-500 hover:text-rose-600"
                              >
                                Reset
                              </button>
                            </div>
                          </div>
                          <Slider
                            value={[circleRadius]}
                            onValueChange={(v) => setCircleRadius(v[0])}
                            min={20}
                            max={200}
                            step={5}
                            className="w-full"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {activeSection === 'canvas' && (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-gray-700">Select aspect ratio</p>
                  <div className="space-y-2">
                    {ASPECT_RATIOS.map((ratio) => {
                      const isSelected = canvasAspectRatio === ratio.value
                      return (
                        <button
                          key={ratio.value}
                          onClick={() => {
                            setCanvasAspectRatio(ratio.value)
                            // Update wall art size based on base size
                            const baseSize = 12 // inches
                            const w = ratio.width
                            const h = ratio.height
                            if (w >= h) {
                              setSelectedWallArtSize({ 
                                width: baseSize, 
                                height: Math.round(baseSize * (h / w)) 
                              })
                            } else {
                              setSelectedWallArtSize({ 
                                width: Math.round(baseSize * (w / h)), 
                                height: baseSize 
                              })
                            }
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all",
                            isSelected
                              ? "border-rose-500 bg-rose-50"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          <span className={cn(
                            "text-sm font-medium",
                            isSelected ? "text-rose-700" : "text-gray-700"
                          )}>
                            {ratio.label}
                          </span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-rose-500" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">
                      Canvas sizes represent ratios of the width to height.
                      For example, 2×1 indicates that the width will be twice the height.
                    </p>
                  </div>
                </div>
              )}

              {activeSection === 'background' && (
                <div className="space-y-4">
                  <ColorCustomizer />
                  <div className="pt-4 border-t border-gray-100">
                    <BackgroundCustomizer />
                  </div>
                </div>
              )}

              {activeSection === 'text' && (
                <TextCustomizer />
              )}

              {activeSection === 'qrcode' && (
                <QRCodeCustomizer />
              )}

              {activeSection === 'download' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Preview your design and continue to checkout to download in different formats and resolutions.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Export Resolution:</span>
                      <span className="font-medium text-gray-900">
                        {selectedWallArtSize.width * 300}px × {selectedWallArtSize.height * 300}px
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Print Size:</span>
                      <span className="font-medium text-gray-900">
                        {selectedWallArtSize.width}" × {selectedWallArtSize.height}"
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={onContinue}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white"
                    disabled={!audioUrl}
                  >
                    Continue to checkout
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
