import { KonvaWaveformTest } from '@/components/products/konva-waveform-test'

export default function TestKonvaPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Konva Waveform Drag Test</h1>
      <p className="text-muted-foreground mb-4">
        This tests whether Konva&apos;s layer-based rendering provides smooth 60fps dragging.
        The waveform is on a separate layer from the background, so dragging shouldn&apos;t
        cause any re-rendering.
      </p>
      <KonvaWaveformTest />
    </div>
  )
}
