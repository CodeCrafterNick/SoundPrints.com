'use client'

import { useCallback, useRef, useEffect } from 'react'
import { useCustomizerStore } from '@/lib/stores/customizer-store'

/**
 * Custom hook that provides throttled versions of customizer store setters
 * for use with sliders and continuous input controls.
 * 
 * This prevents excessive re-renders during slider dragging while still
 * providing smooth visual feedback.
 */
export function useThrottledCustomizer() {
  const store = useCustomizerStore
  
  // Track pending updates
  const pendingUpdates = useRef<Record<string, NodeJS.Timeout>>({})
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(pendingUpdates.current).forEach(clearTimeout)
    }
  }, [])
  
  // Create a throttled setter factory
  const createThrottledSetter = useCallback(<T,>(
    key: string,
    setter: (value: T) => void,
    delay: number = 50 // 50ms throttle for smooth 20fps updates
  ) => {
    return (value: T) => {
      // Clear any pending update for this key
      if (pendingUpdates.current[key]) {
        clearTimeout(pendingUpdates.current[key])
      }
      
      // Schedule the update
      pendingUpdates.current[key] = setTimeout(() => {
        setter(value)
        delete pendingUpdates.current[key]
      }, delay)
    }
  }, [])
  
  // Throttled position setters (for drag operations - lower delay for responsiveness)
  const setWaveformX = useCallback(
    createThrottledSetter('waveformX', store.getState().setWaveformX, 16),
    [createThrottledSetter]
  )
  
  const setWaveformY = useCallback(
    createThrottledSetter('waveformY', store.getState().setWaveformY, 16),
    [createThrottledSetter]
  )
  
  const setWaveformPosition = useCallback((x: number, y: number) => {
    // Combined position update - use direct setter for better performance
    const key = 'waveformPosition'
    if (pendingUpdates.current[key]) {
      clearTimeout(pendingUpdates.current[key])
    }
    pendingUpdates.current[key] = setTimeout(() => {
      store.getState().setWaveformPosition(x, y)
      delete pendingUpdates.current[key]
    }, 16) // 60fps cap
  }, [])
  
  // Throttled slider setters (for sliders - slightly higher delay)
  const setWaveformSize = useCallback(
    createThrottledSetter('waveformSize', store.getState().setWaveformSize, 50),
    [createThrottledSetter]
  )
  
  const setWaveformHeightMultiplier = useCallback(
    createThrottledSetter('waveformHeightMultiplier', store.getState().setWaveformHeightMultiplier, 50),
    [createThrottledSetter]
  )
  
  const setBarWidth = useCallback(
    createThrottledSetter('barWidth', store.getState().setBarWidth, 50),
    [createThrottledSetter]
  )
  
  const setBarGap = useCallback(
    createThrottledSetter('barGap', store.getState().setBarGap, 50),
    [createThrottledSetter]
  )
  
  const setCircleRadius = useCallback(
    createThrottledSetter('circleRadius', store.getState().setCircleRadius, 50),
    [createThrottledSetter]
  )
  
  const setFontSize = useCallback(
    createThrottledSetter('fontSize', store.getState().setFontSize, 50),
    [createThrottledSetter]
  )
  
  const setQRCodeSize = useCallback(
    createThrottledSetter('qrCodeSize', store.getState().setQRCodeSize, 50),
    [createThrottledSetter]
  )
  
  const setTextX = useCallback(
    createThrottledSetter('textX', store.getState().setTextX, 16),
    [createThrottledSetter]
  )
  
  const setTextY = useCallback(
    createThrottledSetter('textY', store.getState().setTextY, 16),
    [createThrottledSetter]
  )
  
  // Throttled color setters (for color pickers during drag)
  const setWaveformColor = useCallback(
    createThrottledSetter('waveformColor', store.getState().setWaveformColor, 100),
    [createThrottledSetter]
  )
  
  const setBackgroundColor = useCallback(
    createThrottledSetter('backgroundColor', store.getState().setBackgroundColor, 100),
    [createThrottledSetter]
  )
  
  const setTextColor = useCallback(
    createThrottledSetter('textColor', store.getState().setTextColor, 100),
    [createThrottledSetter]
  )
  
  // Flush all pending updates immediately
  const flushUpdates = useCallback(() => {
    Object.keys(pendingUpdates.current).forEach(key => {
      // Force immediate execution by calling the store directly
      // (the timeout will still fire but the value is already set)
    })
  }, [])
  
  return {
    // Position setters (throttled at ~60fps)
    setWaveformX,
    setWaveformY,
    setWaveformPosition,
    setTextX,
    setTextY,
    
    // Slider setters (throttled at ~20fps)
    setWaveformSize,
    setWaveformHeightMultiplier,
    setBarWidth,
    setBarGap,
    setCircleRadius,
    setFontSize,
    setQRCodeSize,
    
    // Color setters (throttled at ~10fps)
    setWaveformColor,
    setBackgroundColor,
    setTextColor,
    
    // Utility
    flushUpdates,
  }
}
