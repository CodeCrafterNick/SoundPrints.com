'use client'

import { useCustomizerStore } from '@/lib/stores/customizer-store'
import { Button } from '@/components/ui/button'
import { Undo2, Redo2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface UndoRedoToolbarProps {
  className?: string
  variant?: 'horizontal' | 'vertical'
}

export function UndoRedoToolbar({ className, variant = 'horizontal' }: UndoRedoToolbarProps) {
  const undo = useCustomizerStore(state => state.undo)
  const redo = useCustomizerStore(state => state.redo)
  const canUndo = useCustomizerStore(state => state.canUndo)
  const canRedo = useCustomizerStore(state => state.canRedo)
  
  const handleUndo = () => {
    if (canUndo) {
      undo()
      toast.success('Undo', { duration: 1000 })
    }
  }
  
  const handleRedo = () => {
    if (canRedo) {
      redo()
      toast.success('Redo', { duration: 1000 })
    }
  }
  
  // Determine if Mac for shortcut display
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const modKey = isMac ? '⌘' : 'Ctrl+'
  
  if (variant === 'vertical') {
    return (
      <div className={cn("flex flex-col items-center gap-1", className)}>
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          className={cn(
            "w-12 h-10 rounded-xl flex items-center justify-center transition-all",
            canUndo 
              ? "text-gray-400 hover:text-white hover:bg-gray-800"
              : "text-gray-600 cursor-not-allowed opacity-50"
          )}
          title={`Undo (${modKey}Z)`}
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          onClick={handleRedo}
          disabled={!canRedo}
          className={cn(
            "w-12 h-10 rounded-xl flex items-center justify-center transition-all",
            canRedo 
              ? "text-gray-400 hover:text-white hover:bg-gray-800"
              : "text-gray-600 cursor-not-allowed opacity-50"
          )}
          title={`Redo (${modKey}⇧Z)`}
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </div>
    )
  }
  
  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-1", className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUndo}
              disabled={!canUndo}
              className="h-8 w-8 p-0"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Undo ({modKey}Z)</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRedo}
              disabled={!canRedo}
              className="h-8 w-8 p-0"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Redo ({modKey}⇧Z)</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
