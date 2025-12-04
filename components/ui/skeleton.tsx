import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Preset skeleton for the customizer sidebar
function CustomizerSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {/* Audio upload area skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
      
      {/* Style options skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>
      
      {/* Slider skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    </div>
  )
}

// Canvas area skeleton
function CanvasSkeleton() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[400px] bg-gray-50 rounded-lg">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="w-64 h-80 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    </div>
  )
}

// Product mockup skeleton
function MockupSkeleton() {
  return (
    <div className="relative aspect-[3/4] w-full max-w-md mx-auto">
      <Skeleton className="w-full h-full rounded-lg" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1/2 h-1/2">
          <Skeleton className="w-full h-full rounded" />
        </div>
      </div>
    </div>
  )
}

// Preset preview skeleton
function PresetSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square rounded-lg" />
      ))}
    </div>
  )
}

export { Skeleton, CustomizerSkeleton, CanvasSkeleton, MockupSkeleton, PresetSkeleton }
