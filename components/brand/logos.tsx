'use client'

import { useEffect, useState } from 'react'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'light' | 'dark'
}

const sizeMap = {
  sm: { icon: 24, text: 'text-lg' },
  md: { icon: 32, text: 'text-xl' },
  lg: { icon: 48, text: 'text-3xl' },
  xl: { icon: 64, text: 'text-4xl' },
}

/**
 * Primary Logo - Full horizontal logo with icon and wordmark
 */
export function LogoPrimary({ className = '', size = 'md', variant = 'dark' }: LogoProps) {
  const { icon, text } = sizeMap[size]
  const textColor = variant === 'dark' ? 'text-gray-900' : 'text-white'
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 32 32" width={icon} height={icon}>
        {/* Waveform bars */}
        {Array.from({ length: 5 }).map((_, i) => {
          const heights = [12, 20, 16, 22, 14]
          const height = heights[i]
          return (
            <rect
              key={i}
              x={i * 6 + 3}
              y={16 - height / 2}
              width="4"
              height={height}
              rx="2"
              className="fill-rose-500"
            />
          )
        })}
      </svg>
      <span className={`font-bold ${text} ${textColor}`}>SoundPrints</span>
    </div>
  )
}

/**
 * Icon Only Logo - Just the waveform icon
 */
export function LogoIcon({ className = '', size = 'md' }: LogoProps) {
  const iconSize = sizeMap[size].icon
  
  return (
    <svg viewBox="0 0 32 32" width={iconSize} height={iconSize} className={className}>
      {Array.from({ length: 5 }).map((_, i) => {
        const heights = [12, 20, 16, 22, 14]
        const height = heights[i]
        return (
          <rect
            key={i}
            x={i * 6 + 3}
            y={16 - height / 2}
            width="4"
            height={height}
            rx="2"
            className="fill-rose-500"
          />
        )
      })}
    </svg>
  )
}

/**
 * Wordmark Only Logo - Just the text
 */
export function LogoWordmark({ className = '', size = 'md', variant = 'dark' }: LogoProps) {
  const { text } = sizeMap[size]
  const textColor = variant === 'dark' ? 'text-gray-900' : 'text-white'
  
  return (
    <span className={`font-bold ${text} ${textColor} ${className}`}>
      <span className="text-rose-500">Sound</span>Prints
    </span>
  )
}

/**
 * Badge Logo - Circular badge version for stamps and merchandise
 */
export function LogoBadge({ className = '', size = 'md' }: LogoProps) {
  const iconSize = sizeMap[size].icon * 2
  
  return (
    <svg viewBox="0 0 100 100" width={iconSize} height={iconSize} className={className}>
      {/* Outer circle */}
      <circle cx="50" cy="50" r="48" fill="none" className="stroke-rose-500" strokeWidth="2" />
      
      {/* Inner circle */}
      <circle cx="50" cy="50" r="40" className="fill-rose-500" />
      
      {/* Waveform in center */}
      <g transform="translate(25, 35)">
        {Array.from({ length: 5 }).map((_, i) => {
          const heights = [15, 25, 20, 28, 18]
          const height = heights[i]
          return (
            <rect
              key={i}
              x={i * 10}
              y={15 - height / 2}
              width="6"
              height={height}
              rx="3"
              fill="white"
            />
          )
        })}
      </g>
      
      {/* Text around circle */}
      <defs>
        <path id="topArc" d="M 15, 50 a 35,35 0 1,1 70,0" fill="none" />
        <path id="bottomArc" d="M 85, 50 a 35,35 0 1,1 -70,0" fill="none" />
      </defs>
      
      <text className="fill-gray-900 text-[8px] font-bold uppercase tracking-wider">
        <textPath href="#topArc" startOffset="50%" textAnchor="middle">
          SoundPrints
        </textPath>
      </text>
      <text className="fill-gray-500 text-[6px] uppercase tracking-wider">
        <textPath href="#bottomArc" startOffset="50%" textAnchor="middle">
          Est. 2024
        </textPath>
      </text>
    </svg>
  )
}

/**
 * Stacked Logo - Vertical layout with icon above text
 */
export function LogoStacked({ className = '', size = 'md', variant = 'dark' }: LogoProps) {
  const { icon, text } = sizeMap[size]
  const textColor = variant === 'dark' ? 'text-gray-900' : 'text-white'
  
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <svg viewBox="0 0 32 32" width={icon * 1.5} height={icon * 1.5}>
        {Array.from({ length: 5 }).map((_, i) => {
          const heights = [12, 20, 16, 22, 14]
          const height = heights[i]
          return (
            <rect
              key={i}
              x={i * 6 + 3}
              y={16 - height / 2}
              width="4"
              height={height}
              rx="2"
              className="fill-rose-500"
            />
          )
        })}
      </svg>
      <span className={`font-bold ${text} ${textColor}`}>SoundPrints</span>
    </div>
  )
}

/**
 * Animated Logo - Waveform with animation for loading screens
 */
export function LogoAnimated({ className = '', size = 'md' }: LogoProps) {
  const [bars, setBars] = useState([12, 20, 16, 22, 14])
  
  useEffect(() => {
    const interval = setInterval(() => {
      setBars(prev => prev.map((_, i) => {
        const time = Date.now() / 300
        return 10 + Math.sin(time + i * 0.5) * 10
      }))
    }, 50)
    return () => clearInterval(interval)
  }, [])
  
  const iconSize = sizeMap[size].icon * 1.5
  
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <svg viewBox="0 0 32 32" width={iconSize} height={iconSize}>
        {bars.map((height, i) => (
          <rect
            key={i}
            x={i * 6 + 3}
            y={16 - height / 2}
            width="4"
            height={height}
            rx="2"
            className="fill-rose-500 transition-all duration-100"
          />
        ))}
      </svg>
      <span className="text-sm text-gray-500 animate-pulse">Loading...</span>
    </div>
  )
}

/**
 * Monochrome Logo - Single color version for printing
 */
export function LogoMonochrome({ className = '', size = 'md', color = 'currentColor' }: LogoProps & { color?: string }) {
  const iconSize = sizeMap[size].icon
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 32 32" width={iconSize} height={iconSize}>
        {Array.from({ length: 5 }).map((_, i) => {
          const heights = [12, 20, 16, 22, 14]
          const height = heights[i]
          return (
            <rect
              key={i}
              x={i * 6 + 3}
              y={16 - height / 2}
              width="4"
              height={height}
              rx="2"
              fill={color}
            />
          )
        })}
      </svg>
      <span className={`font-bold ${sizeMap[size].text}`} style={{ color }}>SoundPrints</span>
    </div>
  )
}

/**
 * Gradient Logo - With gradient fill for marketing materials
 */
export function LogoGradient({ className = '', size = 'lg' }: LogoProps) {
  const { icon, text } = sizeMap[size]
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg viewBox="0 0 32 32" width={icon} height={icon}>
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
        {Array.from({ length: 5 }).map((_, i) => {
          const heights = [12, 20, 16, 22, 14]
          const height = heights[i]
          return (
            <rect
              key={i}
              x={i * 6 + 3}
              y={16 - height / 2}
              width="4"
              height={height}
              rx="2"
              fill="url(#logoGradient)"
            />
          )
        })}
      </svg>
      <span className={`font-bold ${text} bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 bg-clip-text text-transparent`}>
        SoundPrints
      </span>
    </div>
  )
}
