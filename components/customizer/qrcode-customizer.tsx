'use client'

import { useCustomizerStore } from '@/lib/stores/customizer-store'
import { QrCode } from 'lucide-react'

export function QRCodeCustomizer() {
  const showQRCode = useCustomizerStore((state) => state.showQRCode)
  const qrCodeUrl = useCustomizerStore((state) => state.qrCodeUrl)
  const qrCodePosition = useCustomizerStore((state) => state.qrCodePosition)
  const setShowQRCode = useCustomizerStore((state) => state.setShowQRCode)
  const setQRCodeUrl = useCustomizerStore((state) => state.setQRCodeUrl)
  const setQRCodePosition = useCustomizerStore((state) => state.setQRCodePosition)

  const positions = [
    { value: 'top-left' as const, label: 'Top Left' },
    { value: 'top-right' as const, label: 'Top Right' },
    { value: 'bottom-left' as const, label: 'Bottom Left' },
    { value: 'bottom-right' as const, label: 'Bottom Right' },
  ]

  return (
    <div className="space-y-6">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <QrCode className="w-4 h-4 text-muted-foreground" />
          <label className="text-sm font-semibold">Add QR Code</label>
        </div>
        <button
          onClick={() => setShowQRCode(!showQRCode)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            showQRCode ? 'bg-primary' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              showQRCode ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {showQRCode && (
        <>
          {/* URL Input */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              QR Code Link (Optional)
            </label>
            <input
              type="url"
              value={qrCodeUrl}
              onChange={(e) => setQRCodeUrl(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm bg-background shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="https://spotify.com/track/..."
            />
            <p className="text-xs text-muted-foreground">
              Link to Spotify, YouTube, or any URL. Leave empty to link to audio playback.
            </p>
          </div>

          {/* Position */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">QR Code Position</label>
            <div className="grid grid-cols-2 gap-2">
              {positions.map((pos) => (
                <button
                  key={pos.value}
                  onClick={() => setQRCodePosition(pos.value)}
                  className={`py-2 px-3 rounded-lg border-2 text-xs font-medium transition-all ${
                    qrCodePosition === pos.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-blue-900 dark:text-blue-100">
              📱 Scannable QR Code
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              People can scan the QR code on your print to listen to the audio or visit your link.
              Perfect for wedding gifts, anniversaries, or sharing memories!
            </p>
          </div>
        </>
      )}
    </div>
  )
}
