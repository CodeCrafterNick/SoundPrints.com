'use client'

import { useCustomizerStore } from '@/lib/stores/customizer-store'
import { Type, AlignCenter } from 'lucide-react'
import { Slider } from '@/components/ui/slider'

export function TextCustomizer() {
  const songTitle = useCustomizerStore((state) => state.songTitle)
  const artistName = useCustomizerStore((state) => state.artistName)
  const customDate = useCustomizerStore((state) => state.customDate)
  const customText = useCustomizerStore((state) => state.customText)
  const textColor = useCustomizerStore((state) => state.textColor)
  const showText = useCustomizerStore((state) => state.showText)
  const textPosition = useCustomizerStore((state) => state.textPosition)
  const fontSize = useCustomizerStore((state) => state.fontSize)
  
  const setSongTitle = useCustomizerStore((state) => state.setSongTitle)
  const setArtistName = useCustomizerStore((state) => state.setArtistName)
  const setCustomDate = useCustomizerStore((state) => state.setCustomDate)
  const setCustomText = useCustomizerStore((state) => state.setCustomText)
  const setTextColor = useCustomizerStore((state) => state.setTextColor)
  const setShowText = useCustomizerStore((state) => state.setShowText)
  const setTextPosition = useCustomizerStore((state) => state.setTextPosition)
  const setFontSize = useCustomizerStore((state) => state.setFontSize)

  return (
    <div className="space-y-6">
      {/* Show Text Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-muted-foreground" />
          <label className="text-sm font-semibold">Add Text</label>
        </div>
        <button
          onClick={() => setShowText(!showText)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            showText ? 'bg-primary' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              showText ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {showText && (
        <>
          {/* Song Title */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Song Title</label>
            <input
              type="text"
              value={songTitle}
              onChange={(e) => setSongTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm bg-background shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="e.g., Our Song"
            />
          </div>

          {/* Artist Name */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Artist Name</label>
            <input
              type="text"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm bg-background shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="e.g., Your Favorite Artist"
            />
          </div>

          {/* Custom Date */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Date (Optional)</label>
            <input
              type="text"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm bg-background shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="e.g., June 15, 2024"
            />
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Custom Message</label>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm bg-background shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              placeholder="e.g., Our first dance..."
              rows={3}
            />
          </div>

          {/* Text Position */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlignCenter className="w-4 h-4 text-muted-foreground" />
              <label className="text-xs font-medium text-muted-foreground">Text Position</label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['top', 'center', 'bottom'] as const).map((position) => (
                <button
                  key={position}
                  onClick={() => setTextPosition(position)}
                  className={`py-2 px-3 rounded-lg border-2 text-xs font-medium transition-all capitalize ${
                    textPosition === position
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {position}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Font Size</label>
              <span className="text-xs font-mono text-muted-foreground">{fontSize}px</span>
            </div>
            <Slider
              value={[fontSize]}
              onValueChange={(value) => setFontSize(value[0])}
              min={12}
              max={72}
              step={1}
              className="w-full"
            />
          </div>

          {/* Text Color */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Text Color</label>
            <div className="relative">
              <input
                type="text"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm font-mono bg-background shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="#000000"
              />
              <div 
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded border shadow-sm"
                style={{ backgroundColor: textColor }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
