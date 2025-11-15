'use client'

import { useCustomizerStore } from '@/lib/stores/customizer-store'
import { Image as ImageIcon, Upload, X } from 'lucide-react'
import { useState, useRef } from 'react'

export function BackgroundCustomizer() {
  const backgroundImage = useCustomizerStore((state) => state.backgroundImage)
  const backgroundFocalPoint = useCustomizerStore((state) => state.backgroundFocalPoint)
  const setBackgroundImage = useCustomizerStore((state) => state.setBackgroundImage)
  const setBackgroundFocalPoint = useCustomizerStore((state) => state.setBackgroundFocalPoint)
  
  const [uploading, setUploading] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    
    // Convert to base64 for preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setBackgroundImage(reader.result as string)
      setBackgroundFocalPoint(null) // Reset focal point when new image uploaded
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleFocalPointClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current) return
    
    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    console.log('🎯 Setting focal point:', { x, y })
    setBackgroundFocalPoint({ x, y })
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
            {/* Focal Point Picker - Always Visible */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-muted-foreground">Focal Point</label>
              
              <div className="space-y-2">
                <div className="relative rounded-lg overflow-hidden border-2 border-primary">
                  <img
                    ref={imageRef}
                    src={backgroundImage}
                    alt="Click to set focal point"
                    className="w-full h-64 object-cover cursor-crosshair"
                    onClick={handleFocalPointClick}
                  />
                  {backgroundFocalPoint && (
                    <div
                      className="absolute w-8 h-8 -ml-4 -mt-4 pointer-events-none"
                      style={{
                        left: `${backgroundFocalPoint.x}%`,
                        top: `${backgroundFocalPoint.y}%`,
                      }}
                    >
                      <div className="absolute inset-0 rounded-full border-2 border-white shadow-lg" />
                      <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1 h-1 bg-primary rounded-full" />
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {backgroundFocalPoint 
                    ? 'Click on the image to change the focal point' 
                    : 'Click on the image where you want to center the view'}
                </p>
              </div>
            </div>

            {/* Remove Image Button */}
            <button
              onClick={() => {
                setBackgroundImage(null)
                setBackgroundFocalPoint(null)
              }}
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
          <li>Position controls help focus on important parts</li>
          <li>Recommended: Images with good contrast</li>
        </ul>
      </div>
    </div>
  )
}
