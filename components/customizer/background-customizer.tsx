'use client'

import { useCustomizerStore } from '@/lib/stores/customizer-store'
import { Image as ImageIcon, Upload } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { useState } from 'react'

export function BackgroundCustomizer() {
  const backgroundImage = useCustomizerStore((state) => state.backgroundImage)
  const backgroundOpacity = useCustomizerStore((state) => state.backgroundOpacity)
  const setBackgroundImage = useCustomizerStore((state) => state.setBackgroundImage)
  const setBackgroundOpacity = useCustomizerStore((state) => state.setBackgroundOpacity)
  
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    
    // Convert to base64 for preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setBackgroundImage(reader.result as string)
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-muted-foreground" />
        <label className="text-sm font-semibold">Background Image</label>
      </div>

      {/* Upload Area */}
      <div className="space-y-4">
        <label className="block">
          <div className={`
            relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all hover:border-primary hover:bg-primary/5
            ${backgroundImage ? 'border-primary bg-primary/5' : 'border-border'}
          `}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />
            
            {uploading ? (
              <div className="space-y-2">
                <div className="animate-spin mx-auto w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </div>
            ) : backgroundImage ? (
              <div className="space-y-3">
                <div className="relative w-32 h-32 mx-auto rounded-lg overflow-hidden border">
                  <img
                    src={backgroundImage}
                    alt="Background preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-primary">Background image uploaded</p>
                  <p className="text-xs text-muted-foreground">Click to change image</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Upload background image</p>
                  <p className="text-xs text-muted-foreground">
                    Wedding photos, concert pics, or any image
                  </p>
                </div>
              </div>
            )}
          </div>
        </label>

        {backgroundImage && (
          <>
            {/* Opacity Control */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">Image Opacity</label>
                <span className="text-xs font-mono text-muted-foreground">{backgroundOpacity}%</span>
              </div>
              <Slider
                value={[backgroundOpacity]}
                onValueChange={(value) => setBackgroundOpacity(value[0])}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Lower opacity makes the waveform stand out more
              </p>
            </div>

            {/* Remove Image Button */}
            <button
              onClick={() => setBackgroundImage(null)}
              className="w-full py-2 px-4 border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition-colors text-sm font-medium"
            >
              Remove Background Image
            </button>
          </>
        )}
      </div>

      <div className="bg-muted/30 rounded-lg p-4 space-y-2">
        <p className="text-xs font-semibold">💡 Tips</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Use high-resolution images for best print quality</li>
          <li>Wedding photos and concert images work great</li>
          <li>Adjust opacity to balance image and waveform</li>
          <li>Recommended: Images with good contrast</li>
        </ul>
      </div>
    </div>
  )
}
