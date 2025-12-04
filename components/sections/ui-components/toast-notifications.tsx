'use client'

import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  
  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { ...toast, id }])
    
    const duration = toast.duration ?? 5000
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration)
    }
  }, [])
  
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])
  
  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

function ToastContainer() {
  const { toasts, removeToast } = useToast()
  
  if (toasts.length === 0) return null
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [isExiting, setIsExiting] = useState(false)
  
  const handleClose = () => {
    setIsExiting(true)
    setTimeout(onClose, 200)
  }
  
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  }
  
  const colors = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
  }
  
  const iconColors = {
    success: 'text-emerald-500',
    error: 'text-red-500',
    info: 'text-blue-500',
    warning: 'text-amber-500',
  }
  
  const Icon = icons[toast.type]
  
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-200 ${
        colors[toast.type]
      } ${isExiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}
    >
      <Icon className={`h-5 w-5 flex-shrink-0 ${iconColors[toast.type]}`} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{toast.title}</p>
        {toast.message && (
          <p className="text-sm opacity-80 mt-0.5">{toast.message}</p>
        )}
      </div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// Standalone toast components for demo purposes
export function ToastSuccess({ title, message }: { title: string; message?: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-800 shadow-lg">
      <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
      <div>
        <p className="font-semibold text-sm">{title}</p>
        {message && <p className="text-sm opacity-80 mt-0.5">{message}</p>}
      </div>
    </div>
  )
}

export function ToastError({ title, message }: { title: string; message?: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border bg-red-50 border-red-200 text-red-800 shadow-lg">
      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
      <div>
        <p className="font-semibold text-sm">{title}</p>
        {message && <p className="text-sm opacity-80 mt-0.5">{message}</p>}
      </div>
    </div>
  )
}

export function ToastInfo({ title, message }: { title: string; message?: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border bg-blue-50 border-blue-200 text-blue-800 shadow-lg">
      <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
      <div>
        <p className="font-semibold text-sm">{title}</p>
        {message && <p className="text-sm opacity-80 mt-0.5">{message}</p>}
      </div>
    </div>
  )
}

export function ToastWarning({ title, message }: { title: string; message?: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border bg-amber-50 border-amber-200 text-amber-800 shadow-lg">
      <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
      <div>
        <p className="font-semibold text-sm">{title}</p>
        {message && <p className="text-sm opacity-80 mt-0.5">{message}</p>}
      </div>
    </div>
  )
}
