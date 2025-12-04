'use client'

import { cn } from '@/lib/utils'
import { type LucideIcon } from 'lucide-react'
import { Check, Wand2, Eye, ShoppingCart, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type BuilderStep = 'design' | 'preview' | 'finalize'

interface BuilderStepperProps {
  currentStep: BuilderStep
  onStepChange: (step: BuilderStep) => void
  canProceed: boolean // Whether the user has completed enough to move forward
  onContinue?: () => void // Direct continue handler
}

const steps: { id: BuilderStep; label: string; description: string; icon: LucideIcon }[] = [
  { id: 'design', label: 'Design', description: 'Upload & customize', icon: Wand2 },
  { id: 'preview', label: 'Preview', description: 'Choose product', icon: Eye },
  { id: 'finalize', label: 'Finalize', description: 'Complete order', icon: ShoppingCart },
]

export function BuilderStepper({ currentStep, onStepChange, canProceed, onContinue }: BuilderStepperProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStep)
  const isLastStep = currentIndex === steps.length - 1
  const nextStep = steps[currentIndex + 1]
  
  const getStepStatus = (stepIndex: number): 'completed' | 'current' | 'upcoming' => {
    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'current'
    return 'upcoming'
  }
  
  const canNavigateToStep = (stepIndex: number) => {
    // Can always go back
    if (stepIndex < currentIndex) return true
    // Can only go forward if canProceed
    if (stepIndex === currentIndex + 1) return canProceed
    // Can't skip steps
    return false
  }

  const handleContinue = () => {
    if (onContinue) {
      onContinue()
    } else if (nextStep && canProceed) {
      onStepChange(nextStep.id)
    }
  }

  return (
    <div className="w-full flex items-center gap-4">
      {/* Desktop Stepper - Expanded with progress bar */}
      <nav aria-label="Progress" className="hidden md:flex flex-1 items-center">
        <ol className="flex items-center w-full">
          {steps.map((step, stepIdx) => {
            const status = getStepStatus(stepIdx)
            const Icon = step.icon
            const canClick = canNavigateToStep(stepIdx) || status === 'completed' || status === 'current'
            const isLast = stepIdx === steps.length - 1
            
            return (
              <li key={step.id} className={cn("flex items-center", !isLast && "flex-1")}>
                <button
                  onClick={() => canClick && onStepChange(step.id)}
                  disabled={!canClick}
                  className={cn(
                    "flex items-center gap-3 group transition-all",
                    !canClick && "cursor-not-allowed opacity-50"
                  )}
                >
                  {/* Step circle */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0",
                      status === 'completed' ? "bg-rose-500 text-white" :
                      status === 'current' ? "bg-rose-500 text-white ring-4 ring-rose-100 shadow-lg shadow-rose-500/25" :
                      "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                    )}
                  >
                    {status === 'completed' ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  
                  {/* Step text */}
                  <div className="text-left">
                    <span
                      className={cn(
                        "text-sm font-semibold block leading-tight",
                        status === 'current' ? "text-gray-900" :
                        status === 'completed' ? "text-gray-700" : "text-gray-400"
                      )}
                    >
                      {step.label}
                    </span>
                    <span
                      className={cn(
                        "text-xs leading-tight",
                        status === 'current' ? "text-gray-500" :
                        status === 'completed' ? "text-gray-400" : "text-gray-300"
                      )}
                    >
                      {step.description}
                    </span>
                  </div>
                </button>
                
                {/* Connector */}
                {!isLast && (
                  <div className="flex-1 mx-4">
                    <div 
                      className={cn(
                        "h-1 rounded-full transition-all",
                        stepIdx < currentIndex ? "bg-rose-500" : "bg-gray-200"
                      )}
                    />
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
      
      {/* Mobile Stepper - Progress dots with current step indicator */}
      <nav aria-label="Progress" className="md:hidden flex-1">
        <div className="flex items-center gap-3">
          {/* Current step indicator */}
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
              {(() => {
                const Icon = steps[currentIndex].icon
                return <Icon className="w-4 h-4" />
              })()}
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-900 block leading-tight">
                {steps[currentIndex].label}
              </span>
              <span className="text-xs text-gray-500">
                Step {currentIndex + 1} of {steps.length}
              </span>
            </div>
          </div>
          
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((step, stepIdx) => {
              const status = getStepStatus(stepIdx)
              return (
                <button
                  key={step.id}
                  onClick={() => {
                    const canClick = canNavigateToStep(stepIdx) || status === 'completed' || status === 'current'
                    if (canClick) onStepChange(step.id)
                  }}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all",
                    status === 'current' ? "bg-rose-500 w-6" :
                    status === 'completed' ? "bg-rose-500" : "bg-gray-300"
                  )}
                />
              )
            })}
          </div>
        </div>
      </nav>
      
      {/* Continue Button - Always visible */}
      {!isLastStep && (
        <Button
          onClick={handleContinue}
          disabled={!canProceed}
          className={cn(
            "shrink-0 gap-2 shadow-lg transition-all",
            canProceed 
              ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25" 
              : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
          )}
          size="default"
        >
          <span className="hidden sm:inline">Continue to {nextStep?.label}</span>
          <span className="sm:hidden">Next</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}
