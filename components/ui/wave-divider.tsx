'use client'

import { cn } from '@/lib/utils'

interface WaveDividerProps {
  variant?: 'soundwave' | 'wave' | 'curve' | 'tilt' | 'layered'
  fillColor?: string
  className?: string
  flip?: boolean
  height?: 'sm' | 'md' | 'lg'
  animate?: boolean
}

export function WaveDivider({
  variant = 'soundwave',
  fillColor = 'fill-white dark:fill-slate-900',
  className,
  flip = false,
  height = 'md',
  animate = false,
}: WaveDividerProps) {
  const heightClasses = {
    sm: 'h-[50px] md:h-[70px]',
    md: 'h-[70px] md:h-[100px]',
    lg: 'h-[100px] md:h-[150px]',
  }

  const WaveSVG = () => {
    switch (variant) {
      case 'soundwave':
        // Audio waveform style - looks like an actual sound wave visualization
        return (
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className={cn('w-full h-full', fillColor)}
          >
            {/* Soundwave bars pattern */}
            <path
              d="M0,120 L0,90 
                 L30,90 L30,60 L60,60 L60,75 L90,75 L90,45 L120,45 L120,70 
                 L150,70 L150,30 L180,30 L180,55 L210,55 L210,40 L240,40 L240,65
                 L270,65 L270,25 L300,25 L300,50 L330,50 L330,35 L360,35 L360,60
                 L390,60 L390,20 L420,20 L420,45 L450,45 L450,30 L480,30 L480,55
                 L510,55 L510,15 L540,15 L540,40 L570,40 L570,25 L600,25 L600,50
                 L630,50 L630,10 L660,10 L660,35 L690,35 L690,20 L720,20 L720,45
                 L750,45 L750,10 L780,10 L780,35 L810,35 L810,20 L840,20 L840,45
                 L870,45 L870,15 L900,15 L900,40 L930,40 L930,25 L960,25 L960,50
                 L990,50 L990,20 L1020,20 L1020,45 L1050,45 L1050,30 L1080,30 L1080,55
                 L1110,55 L1110,25 L1140,25 L1140,50 L1170,50 L1170,35 L1200,35 L1200,60
                 L1230,60 L1230,30 L1260,30 L1260,55 L1290,55 L1290,40 L1320,40 L1320,65
                 L1350,65 L1350,45 L1380,45 L1380,70 L1410,70 L1410,80 L1440,80 L1440,120 Z"
              className={fillColor}
            />
          </svg>
        )
      case 'wave':
        return (
          <svg
            viewBox="0 0 1440 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className={cn('w-full h-full', fillColor, animate && 'animate-wave')}
          >
            <path
              d="M0,50 C150,100 350,0 500,50 C650,100 850,0 1000,50 C1150,100 1350,0 1440,50 L1440,100 L0,100 Z"
              className={fillColor}
            />
          </svg>
        )
      case 'curve':
        return (
          <svg
            viewBox="0 0 1440 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className={cn('w-full h-full', fillColor)}
          >
            <path
              d="M0,100 Q720,0 1440,100 L1440,100 L0,100 Z"
              className={fillColor}
            />
          </svg>
        )
      case 'tilt':
        return (
          <svg
            viewBox="0 0 1440 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className={cn('w-full h-full', fillColor)}
          >
            <polygon points="0,100 1440,0 1440,100" className={fillColor} />
          </svg>
        )
      case 'layered':
        return (
          <svg
            viewBox="0 0 1440 150"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            {/* Back wave - lighter */}
            <path
              d="M0,60 C200,30 400,90 600,60 C800,30 1000,90 1200,60 C1300,45 1380,75 1440,60 L1440,150 L0,150 Z"
              className="fill-violet-200/50 dark:fill-violet-900/30"
            />
            {/* Middle wave */}
            <path
              d="M0,80 C240,50 360,110 600,80 C840,50 960,110 1200,80 C1320,65 1400,95 1440,80 L1440,150 L0,150 Z"
              className="fill-violet-100/70 dark:fill-violet-800/40"
            />
            {/* Front wave */}
            <path
              d="M0,100 C180,70 380,130 600,100 C820,70 980,130 1200,100 C1300,85 1370,115 1440,100 L1440,150 L0,150 Z"
              className={fillColor}
            />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div
      className={cn(
        'w-full overflow-hidden leading-none pointer-events-none',
        heightClasses[height],
        flip && 'rotate-180',
        className
      )}
    >
      <WaveSVG />
    </div>
  )
}

// Soundwave divider with gradient - the signature look
export function SoundwaveDivider({
  className,
  flip = false,
  height = 'md',
  colorScheme = 'violet',
}: {
  className?: string
  flip?: boolean
  height?: 'sm' | 'md' | 'lg'
  colorScheme?: 'violet' | 'cyan' | 'mixed'
}) {
  const heightClasses = {
    sm: 'h-[50px] md:h-[70px]',
    md: 'h-[70px] md:h-[100px]',
    lg: 'h-[100px] md:h-[150px]',
  }

  const gradientId = `soundwaveGrad-${Math.random().toString(36).substr(2, 9)}`
  
  const gradientColors = {
    violet: ['#8b5cf6', '#a855f7', '#c084fc'],
    cyan: ['#06b6d4', '#22d3ee', '#67e8f9'],
    mixed: ['#8b5cf6', '#a855f7', '#06b6d4'],
  }

  const colors = gradientColors[colorScheme]

  return (
    <div
      className={cn(
        'w-full overflow-hidden leading-none pointer-events-none',
        heightClasses[height],
        flip && 'rotate-180',
        className
      )}
    >
      <svg
        viewBox="0 0 1440 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors[0]} stopOpacity="0.3" />
            <stop offset="50%" stopColor={colors[1]} stopOpacity="0.2" />
            <stop offset="100%" stopColor={colors[2]} stopOpacity="0.3" />
          </linearGradient>
        </defs>
        {/* Soundwave visualization bars */}
        <path
          d="M0,120 L0,95 
             L20,95 L20,70 L40,70 L40,85 L60,85 L60,55 L80,55 L80,75 
             L100,75 L100,40 L120,40 L120,65 L140,65 L140,50 L160,50 L160,70
             L180,70 L180,35 L200,35 L200,60 L220,60 L220,45 L240,45 L240,65
             L260,65 L260,30 L280,30 L280,55 L300,55 L300,40 L320,40 L320,60
             L340,60 L340,25 L360,25 L360,50 L380,50 L380,35 L400,35 L400,55
             L420,55 L420,20 L440,20 L440,45 L460,45 L460,30 L480,30 L480,50
             L500,50 L500,15 L520,15 L520,40 L540,40 L540,25 L560,25 L560,45
             L580,45 L580,10 L600,10 L600,35 L620,35 L620,20 L640,20 L640,40
             L660,40 L660,8 L680,8 L680,32 L700,32 L700,18 L720,18 L720,38
             L740,38 L740,8 L760,8 L760,32 L780,32 L780,18 L800,18 L800,38
             L820,38 L820,10 L840,10 L840,35 L860,35 L860,20 L880,20 L880,40
             L900,40 L900,15 L920,15 L920,40 L940,40 L940,25 L960,25 L960,45
             L980,45 L980,20 L1000,20 L1000,45 L1020,45 L1020,30 L1040,30 L1040,50
             L1060,50 L1060,25 L1080,25 L1080,50 L1100,50 L1100,35 L1120,35 L1120,55
             L1140,55 L1140,30 L1160,30 L1160,55 L1180,55 L1180,40 L1200,40 L1200,60
             L1220,60 L1220,35 L1240,35 L1240,60 L1260,60 L1260,45 L1280,45 L1280,65
             L1300,65 L1300,50 L1320,50 L1320,70 L1340,70 L1340,55 L1360,55 L1360,75
             L1380,75 L1380,65 L1400,65 L1400,85 L1420,85 L1420,90 L1440,90 L1440,120 Z"
          fill={`url(#${gradientId})`}
        />
      </svg>
    </div>
  )
}

// Pre-styled gradient wave for consistent use across pages
export function GradientWaveDivider({
  className,
  flip = false,
  height = 'md',
}: {
  className?: string
  flip?: boolean
  height?: 'sm' | 'md' | 'lg'
}) {
  const heightClasses = {
    sm: 'h-[40px] md:h-[60px]',
    md: 'h-[60px] md:h-[100px]',
    lg: 'h-[80px] md:h-[140px]',
  }

  return (
    <div
      className={cn(
        'w-full overflow-hidden leading-none pointer-events-none',
        heightClasses[height],
        flip && 'rotate-180',
        className
      )}
    >
      <svg
        viewBox="0 0 1440 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(139, 92, 246)" />
            <stop offset="50%" stopColor="rgb(168, 85, 247)" />
            <stop offset="100%" stopColor="rgb(6, 182, 212)" />
          </linearGradient>
        </defs>
        <path
          d="M0,50 C150,100 350,0 500,50 C650,100 850,0 1000,50 C1150,100 1350,0 1440,50 L1440,100 L0,100 Z"
          fill="url(#waveGradient)"
          opacity="0.15"
        />
        <path
          d="M0,70 C200,30 400,110 720,70 C1040,30 1240,110 1440,70 L1440,100 L0,100 Z"
          fill="url(#waveGradient)"
          opacity="0.1"
        />
      </svg>
    </div>
  )
}
