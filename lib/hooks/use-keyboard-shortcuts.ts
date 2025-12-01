'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useCustomizerStore } from '@/lib/stores/customizer-store'
import { toast } from 'sonner'

interface UseKeyboardShortcutsOptions {
  onPlayPause?: () => void
  nudgeAmount?: number
  enabled?: boolean
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { 
    onPlayPause, 
    nudgeAmount = 1,
    enabled = true 
  } = options
  
  const undo = useCustomizerStore(state => state.undo)
  const redo = useCustomizerStore(state => state.redo)
  const canUndo = useCustomizerStore(state => state.canUndo)
  const canRedo = useCustomizerStore(state => state.canRedo)
  const textX = useCustomizerStore(state => state.textX)
  const textY = useCustomizerStore(state => state.textY)
  const setTextX = useCustomizerStore(state => state.setTextX)
  const setTextY = useCustomizerStore(state => state.setTextY)
  const qrCodeX = useCustomizerStore(state => state.qrCodeX)
  const qrCodeY = useCustomizerStore(state => state.qrCodeY)
  const setQRCodeX = useCustomizerStore(state => state.setQRCodeX)
  const setQRCodeY = useCustomizerStore(state => state.setQRCodeY)
  const showText = useCustomizerStore(state => state.showText)
  const showQRCode = useCustomizerStore(state => state.showQRCode)
  
  // Track which element should receive arrow key nudges
  const nudgeTarget = useRef<'text' | 'qr' | null>(null)
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return
    
    // Don't trigger shortcuts when typing in inputs
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return
    }
    
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    const modKey = isMac ? e.metaKey : e.ctrlKey
    
    // Undo: Cmd/Ctrl + Z
    if (modKey && e.key === 'z' && !e.shiftKey) {
      e.preventDefault()
      if (canUndo) {
        undo()
        toast.success('Undo', { duration: 1000 })
      }
      return
    }
    
    // Redo: Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y
    if ((modKey && e.key === 'z' && e.shiftKey) || (modKey && e.key === 'y')) {
      e.preventDefault()
      if (canRedo) {
        redo()
        toast.success('Redo', { duration: 1000 })
      }
      return
    }
    
    // Play/Pause: Space
    if (e.key === ' ' && onPlayPause) {
      e.preventDefault()
      onPlayPause()
      return
    }
    
    // Arrow key nudging
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      // Determine nudge target
      if (nudgeTarget.current === null) {
        // Auto-select based on what's visible
        if (showText) nudgeTarget.current = 'text'
        else if (showQRCode) nudgeTarget.current = 'qr'
        else return
      }
      
      e.preventDefault()
      
      // Larger nudge with shift
      const amount = e.shiftKey ? nudgeAmount * 5 : nudgeAmount
      
      if (nudgeTarget.current === 'text' && showText) {
        switch (e.key) {
          case 'ArrowUp':
            setTextY(Math.max(0, textY - amount))
            break
          case 'ArrowDown':
            setTextY(Math.min(100, textY + amount))
            break
          case 'ArrowLeft':
            setTextX(Math.max(0, textX - amount))
            break
          case 'ArrowRight':
            setTextX(Math.min(100, textX + amount))
            break
        }
      } else if (nudgeTarget.current === 'qr' && showQRCode) {
        switch (e.key) {
          case 'ArrowUp':
            setQRCodeY(Math.max(0, qrCodeY - amount))
            break
          case 'ArrowDown':
            setQRCodeY(Math.min(100, qrCodeY + amount))
            break
          case 'ArrowLeft':
            setQRCodeX(Math.max(0, qrCodeX - amount))
            break
          case 'ArrowRight':
            setQRCodeX(Math.min(100, qrCodeX + amount))
            break
        }
      }
      return
    }
    
    // Tab to switch nudge target
    if (e.key === 'Tab' && (showText || showQRCode)) {
      if (showText && showQRCode) {
        e.preventDefault()
        nudgeTarget.current = nudgeTarget.current === 'text' ? 'qr' : 'text'
        toast.info(`Now nudging: ${nudgeTarget.current === 'text' ? 'Text' : 'QR Code'}`, { 
          duration: 1000 
        })
      }
      return
    }
  }, [
    enabled, canUndo, canRedo, undo, redo, onPlayPause,
    textX, textY, setTextX, setTextY,
    qrCodeX, qrCodeY, setQRCodeX, setQRCodeY,
    showText, showQRCode, nudgeAmount
  ])
  
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
  
  return {
    setNudgeTarget: (target: 'text' | 'qr' | null) => {
      nudgeTarget.current = target
    }
  }
}
