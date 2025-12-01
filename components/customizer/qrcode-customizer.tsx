'use client'

import { useCustomizerStore } from '@/lib/stores/customizer-store'
import { QrCode, ExternalLink } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import QRCodeLib from 'qrcode'

export function QRCodeCustomizer() {
  const showQRCode = useCustomizerStore((state) => state.showQRCode)
  const qrCodeUrl = useCustomizerStore((state) => state.qrCodeUrl)
  const qrCodePosition = useCustomizerStore((state) => state.qrCodePosition)
  const qrCodeSize = useCustomizerStore((state) => state.qrCodeSize)
  const qrCodeX = useCustomizerStore((state) => state.qrCodeX)
  const qrCodeY = useCustomizerStore((state) => state.qrCodeY)
  const setShowQRCode = useCustomizerStore((state) => state.setShowQRCode)
  const setQRCodeUrl = useCustomizerStore((state) => state.setQRCodeUrl)
  const setQRCodePosition = useCustomizerStore((state) => state.setQRCodePosition)
  const setQRCodeSize = useCustomizerStore((state) => state.setQRCodeSize)
  const setQRCodeX = useCustomizerStore((state) => state.setQRCodeX)
  const setQRCodeY = useCustomizerStore((state) => state.setQRCodeY)

  // QR Code preview
  const [qrPreviewUrl, setQrPreviewUrl] = useState<string | null>(null)

  // Generate QR code preview when URL changes
  useEffect(() => {
    if (!qrCodeUrl || !showQRCode) {
      setQrPreviewUrl(null)
      return
    }

    // Validate URL
    try {
      new URL(qrCodeUrl)
    } catch {
      setQrPreviewUrl(null)
      return
    }

    // Generate QR code
    QRCodeLib.toDataURL(qrCodeUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    }).then(url => {
      setQrPreviewUrl(url)
    }).catch(() => {
      setQrPreviewUrl(null)
    })
  }, [qrCodeUrl, showQRCode])

  const positions = [
    { value: 'top-left' as const, label: 'Top Left' },
    { value: 'top-right' as const, label: 'Top Right' },
    { value: 'bottom-left' as const, label: 'Bottom Left' },
    { value: 'bottom-right' as const, label: 'Bottom Right' },
  ]

  return (
    <div className="space-y-5">
      {/* Toggle */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <QrCode className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-sm">Add QR Code</span>
        </div>
        <button
          onClick={() => setShowQRCode(!showQRCode)}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            showQRCode ? 'bg-gray-900' : 'bg-gray-300'
          )}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm',
              showQRCode ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
      </div>

      {showQRCode && (
        <div className="space-y-5">
          {/* URL Input */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              QR Code Link
            </label>
            <input
              type="url"
              value={qrCodeUrl}
              onChange={(e) => setQRCodeUrl(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all"
              placeholder="https://spotify.com/track/..."
            />
            <p className="text-xs text-gray-500">
              Link to Spotify, YouTube, or any URL
            </p>
          </div>

          {/* QR Code Preview */}
          {qrPreviewUrl && (
            <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <img 
                  src={qrPreviewUrl} 
                  alt="QR Code Preview" 
                  className="w-24 h-24 rounded-lg border border-gray-200 bg-white"
                />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <p className="text-xs font-medium text-gray-700">Preview</p>
                <p className="text-xs text-gray-500 truncate">
                  {qrCodeUrl}
                </p>
                <a
                  href={qrCodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Test Link
                </a>
              </div>
            </div>
          )}

          {/* Size Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Size</label>
              <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{qrCodeSize}%</span>
            </div>
            <Slider
              value={[qrCodeSize]}
              onValueChange={(value) => setQRCodeSize(value[0])}
              min={3}
              max={20}
              step={1}
              className="w-full"
            />
          </div>

          {/* Quick Position Presets */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quick Position</label>
            <div className="grid grid-cols-2 gap-2">
              {positions.map((pos) => (
                <button
                  key={pos.value}
                  onClick={() => setQRCodePosition(pos.value)}
                  className={cn(
                    'py-2 px-3 rounded-lg border-2 text-xs font-medium transition-all',
                    qrCodePosition === pos.value
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  )}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fine Position Controls */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fine-tune Position</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">Horizontal</span>
                  <span className="text-[10px] font-mono text-gray-400">{qrCodeX}%</span>
                </div>
                <Slider
                  value={[qrCodeX]}
                  onValueChange={(value) => setQRCodeX(value[0])}
                  min={5}
                  max={95}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">Vertical</span>
                  <span className="text-[10px] font-mono text-gray-400">{qrCodeY}%</span>
                </div>
                <Slider
                  value={[qrCodeY]}
                  onValueChange={(value) => setQRCodeY(value[0])}
                  min={5}
                  max={95}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 rounded-lg p-3 space-y-1">
            <p className="text-xs font-semibold text-blue-900">📱 Scannable QR Code</p>
            <p className="text-xs text-blue-700">
              Scan to listen to the audio or visit your link. Perfect for gifts!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
