import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  variant?: 'full' | 'icon' | 'horizontal' | 'stacked'
  theme?: 'light' | 'dark' | 'auto'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showTagline?: boolean
}

const sizes = {
  sm: { icon: 24, text: 'text-lg', tagline: 'text-[8px]' },
  md: { icon: 32, text: 'text-xl', tagline: 'text-[10px]' },
  lg: { icon: 40, text: 'text-2xl', tagline: 'text-xs' },
  xl: { icon: 56, text: 'text-4xl', tagline: 'text-sm' },
}

// Waveform Icon SVG
function WaveformIcon({ 
  size = 32, 
  className,
  primaryColor = 'currentColor',
  secondaryColor = 'currentColor',
}: { 
  size?: number
  className?: string
  primaryColor?: string
  secondaryColor?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circle */}
      <circle cx="24" cy="24" r="22" fill={primaryColor} opacity="0.1" />
      
      {/* Waveform bars */}
      <rect x="8" y="20" width="3" height="8" rx="1.5" fill={primaryColor} />
      <rect x="13" y="16" width="3" height="16" rx="1.5" fill={primaryColor} />
      <rect x="18" y="12" width="3" height="24" rx="1.5" fill={primaryColor} />
      <rect x="23" y="8" width="3" height="32" rx="1.5" fill={secondaryColor} />
      <rect x="28" y="12" width="3" height="24" rx="1.5" fill={primaryColor} />
      <rect x="33" y="16" width="3" height="16" rx="1.5" fill={primaryColor} />
      <rect x="38" y="20" width="3" height="8" rx="1.5" fill={primaryColor} />
    </svg>
  )
}

// Alternative circular waveform icon
function CircularWaveformIcon({ 
  size = 32, 
  className,
  primaryColor = 'currentColor',
}: { 
  size?: number
  className?: string
  primaryColor?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer ring */}
      <circle cx="24" cy="24" r="22" stroke={primaryColor} strokeWidth="2" opacity="0.2" />
      <circle cx="24" cy="24" r="18" stroke={primaryColor} strokeWidth="2" opacity="0.3" />
      
      {/* Waveform circle with bars pointing inward */}
      <path
        d="M24 6 L24 10 M24 38 L24 42 M6 24 L10 24 M38 24 L42 24"
        stroke={primaryColor}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M11.5 11.5 L14.5 14.5 M33.5 33.5 L36.5 36.5 M11.5 36.5 L14.5 33.5 M33.5 14.5 L36.5 11.5"
        stroke={primaryColor}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      
      {/* Center dot */}
      <circle cx="24" cy="24" r="4" fill={primaryColor} />
    </svg>
  )
}

// Minimal S logo icon
function SLetterIcon({ 
  size = 32, 
  className,
  primaryColor = 'currentColor',
}: { 
  size?: number
  className?: string
  primaryColor?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Stylized S with waveform elements */}
      <path
        d="M32 14C32 10.6863 29.3137 8 26 8H20C16.6863 8 14 10.6863 14 14V16C14 19.3137 16.6863 22 20 22H28C31.3137 22 34 24.6863 34 28V32C34 35.3137 31.3137 38 28 38H22C18.6863 38 16 35.3137 16 32"
        stroke={primaryColor}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Sound wave accents */}
      <circle cx="8" cy="24" r="2" fill={primaryColor} opacity="0.5" />
      <circle cx="40" cy="24" r="2" fill={primaryColor} opacity="0.5" />
    </svg>
  )
}

export function Logo({
  className,
  variant = 'full',
  theme = 'auto',
  size = 'md',
  showTagline = false,
}: LogoProps) {
  const sizeConfig = sizes[size]
  
  const textColorClass = theme === 'light' 
    ? 'text-white' 
    : theme === 'dark' 
      ? 'text-gray-900' 
      : ''

  const primaryColorClass = theme === 'light'
    ? 'text-white'
    : 'text-primary'

  if (variant === 'icon') {
    return (
      <div className={cn('inline-flex items-center justify-center', className)}>
        <WaveformIcon 
          size={sizeConfig.icon} 
          className={primaryColorClass}
          primaryColor="currentColor"
        />
      </div>
    )
  }

  if (variant === 'horizontal') {
    return (
      <div className={cn('inline-flex items-center gap-2', className)}>
        <WaveformIcon 
          size={sizeConfig.icon} 
          className={primaryColorClass}
          primaryColor="currentColor"
        />
        <div className="flex flex-col">
          <span className={cn('font-bold leading-tight tracking-tight', sizeConfig.text, textColorClass)}>
            Sound<span className={primaryColorClass}>Prints</span>
          </span>
          {showTagline && (
            <span className={cn('text-muted-foreground', sizeConfig.tagline)}>
              Turn Sound Into Art
            </span>
          )}
        </div>
      </div>
    )
  }

  if (variant === 'stacked') {
    return (
      <div className={cn('inline-flex flex-col items-center text-center', className)}>
        <WaveformIcon 
          size={sizeConfig.icon * 1.5} 
          className={primaryColorClass}
          primaryColor="currentColor"
        />
        <span className={cn('font-bold leading-tight tracking-tight mt-2', sizeConfig.text, textColorClass)}>
          Sound<span className={primaryColorClass}>Prints</span>
        </span>
        {showTagline && (
          <span className={cn('text-muted-foreground mt-1', sizeConfig.tagline)}>
            Turn Sound Into Art
          </span>
        )}
      </div>
    )
  }

  // Default: full (same as horizontal for now)
  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <WaveformIcon 
        size={sizeConfig.icon} 
        className={primaryColorClass}
        primaryColor="currentColor"
      />
      <span className={cn('font-bold leading-tight tracking-tight', sizeConfig.text, textColorClass)}>
        Sound<span className={primaryColorClass}>Prints</span>
      </span>
    </div>
  )
}

// Export icon components for direct use
export { WaveformIcon, CircularWaveformIcon, SLetterIcon }

// Standalone SVG exports for external use
export function LogoSVG({ 
  width = 200, 
  height = 50,
  primaryColor = '#e11d48',
  textColor = '#111827',
}: {
  width?: number
  height?: number
  primaryColor?: string
  textColor?: string
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Icon */}
      <rect x="4" y="21" width="3" height="8" rx="1.5" fill={primaryColor} />
      <rect x="9" y="17" width="3" height="16" rx="1.5" fill={primaryColor} />
      <rect x="14" y="13" width="3" height="24" rx="1.5" fill={primaryColor} />
      <rect x="19" y="9" width="3" height="32" rx="1.5" fill={primaryColor} />
      <rect x="24" y="13" width="3" height="24" rx="1.5" fill={primaryColor} />
      <rect x="29" y="17" width="3" height="16" rx="1.5" fill={primaryColor} />
      <rect x="34" y="21" width="3" height="8" rx="1.5" fill={primaryColor} />
      
      {/* Text */}
      <text x="45" y="32" fontFamily="system-ui, sans-serif" fontSize="20" fontWeight="700" fill={textColor}>
        Sound
      </text>
      <text x="105" y="32" fontFamily="system-ui, sans-serif" fontSize="20" fontWeight="700" fill={primaryColor}>
        Prints
      </text>
    </svg>
  )
}

export function IconOnlySVG({ 
  size = 48,
  primaryColor = '#e11d48',
}: {
  size?: number
  primaryColor?: string
}) {
  const scale = size / 48
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="24" cy="24" r="22" fill={primaryColor} opacity="0.1" />
      <rect x="8" y="20" width="3" height="8" rx="1.5" fill={primaryColor} />
      <rect x="13" y="16" width="3" height="16" rx="1.5" fill={primaryColor} />
      <rect x="18" y="12" width="3" height="24" rx="1.5" fill={primaryColor} />
      <rect x="23" y="8" width="3" height="32" rx="1.5" fill={primaryColor} />
      <rect x="28" y="12" width="3" height="24" rx="1.5" fill={primaryColor} />
      <rect x="33" y="16" width="3" height="16" rx="1.5" fill={primaryColor} />
      <rect x="38" y="20" width="3" height="8" rx="1.5" fill={primaryColor} />
    </svg>
  )
}
