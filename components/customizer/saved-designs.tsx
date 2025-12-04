'use client'

import { useState, useEffect } from 'react'
import { useSavedDesignsStore } from '@/lib/stores/saved-designs-store'
import { useUser } from '@clerk/nextjs'
import { 
  FolderOpen, 
  Save, 
  Trash2, 
  Copy, 
  CloudOff, 
  Cloud, 
  Clock, 
  Music,
  ShoppingBag,
  ChevronRight,
  X,
  Loader2,
  Plus,
  Edit2,
  Check
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import type { SavedDesignListItem } from '@/lib/types/saved-design'

interface SavedDesignsDrawerProps {
  isOpen: boolean
  onClose: () => void
  onNewDesign: () => void
  onSaveCurrentDesign: (name?: string) => void
}

export function SavedDesignsDrawer({ 
  isOpen, 
  onClose, 
  onNewDesign,
  onSaveCurrentDesign 
}: SavedDesignsDrawerProps) {
  const { user, isLoaded: isUserLoaded } = useUser()
  const {
    designs,
    activeDesignId,
    isLoading,
    isSyncing,
    _hasHydrated,
    getDesignsList,
    loadDesign,
    deleteDesign,
    duplicateDesign,
    syncAllToCloud,
    loadDesignsFromCloud,
  } = useSavedDesignsStore()
  
  const [designsList, setDesignsList] = useState<SavedDesignListItem[]>([])
  const [editingNameId, setEditingNameId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  
  // Load designs list when store hydrates
  useEffect(() => {
    if (_hasHydrated) {
      setDesignsList(getDesignsList())
    }
  }, [_hasHydrated, designs, getDesignsList])
  
  // Sync with cloud when user is authenticated
  useEffect(() => {
    if (isUserLoaded && user && _hasHydrated) {
      loadDesignsFromCloud(user.id)
    }
  }, [isUserLoaded, user, _hasHydrated, loadDesignsFromCloud])
  
  const handleLoadDesign = (id: string) => {
    const success = loadDesign(id)
    if (success) {
      onClose()
    }
  }
  
  const handleDeleteDesign = (id: string) => {
    if (confirmDeleteId === id) {
      deleteDesign(id)
      setConfirmDeleteId(null)
    } else {
      setConfirmDeleteId(id)
      // Auto-clear confirm after 3 seconds
      setTimeout(() => setConfirmDeleteId(null), 3000)
    }
  }
  
  const handleDuplicateDesign = (id: string) => {
    duplicateDesign(id)
  }
  
  const handleSyncToCloud = async () => {
    if (user) {
      await syncAllToCloud(user.id)
    }
  }
  
  const startEditingName = (id: string, currentName: string) => {
    setEditingNameId(id)
    setEditingName(currentName)
  }
  
  const saveEditedName = (id: string) => {
    if (editingName.trim()) {
      useSavedDesignsStore.getState().updateDesign(id, { name: editingName.trim() })
    }
    setEditingNameId(null)
    setEditingName('')
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative ml-auto w-full max-w-md bg-white shadow-xl flex flex-col h-full animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Saved Designs</h2>
              <p className="text-sm text-gray-500">{designsList.length} designs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Actions Bar */}
        <div className="p-3 border-b bg-gray-50 flex gap-2">
          <button
            onClick={onNewDesign}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            New Design
          </button>
          <button
            onClick={() => onSaveCurrentDesign()}
            className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm"
          >
            <Save className="w-4 h-4" />
            Save Current
          </button>
          {user && (
            <button
              onClick={handleSyncToCloud}
              disabled={isSyncing}
              className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm disabled:opacity-50"
              title="Sync to cloud"
            >
              {isSyncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Cloud className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
        
        {/* Designs List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
            </div>
          ) : designsList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <FolderOpen className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">No saved designs yet</h3>
              <p className="text-sm text-gray-500 mb-4">
                Create your first design and save it to access it anytime
              </p>
              <button
                onClick={onNewDesign}
                className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Create Design
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {designsList.map((design) => (
                <div
                  key={design.id}
                  className={cn(
                    "p-4 hover:bg-gray-50 transition-colors",
                    activeDesignId === design.id && "bg-rose-50"
                  )}
                >
                  <div className="flex gap-3">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                      {design.thumbnailUrl ? (
                        <img 
                          src={design.thumbnailUrl} 
                          alt={design.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      {editingNameId === design.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEditedName(design.id)
                              if (e.key === 'Escape') setEditingNameId(null)
                            }}
                            className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
                            autoFocus
                          />
                          <button
                            onClick={() => saveEditedName(design.id)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900 truncate">{design.name}</h3>
                          <button
                            onClick={() => startEditingName(design.id, design.name)}
                            className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit2 className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        {design.audioFileName && (
                          <span className="flex items-center gap-1 truncate max-w-[150px]">
                            <Music className="w-3 h-3" />
                            {design.audioFileName}
                          </span>
                        )}
                        {design.orderId && (
                          <span className="flex items-center gap-1 text-green-600">
                            <ShoppingBag className="w-3 h-3" />
                            Order
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(design.updatedAt), { addSuffix: true })}
                        </span>
                        {design.isSyncedToCloud ? (
                          <span className="flex items-center gap-1 text-green-500">
                            <Cloud className="w-3 h-3" />
                            Synced
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-gray-400">
                            <CloudOff className="w-3 h-3" />
                            Local
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleLoadDesign(design.id)}
                        className="p-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors"
                        title="Load design"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicateDesign(design.id)}
                        className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleDeleteDesign(design.id)}
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          confirmDeleteId === design.id 
                            ? "bg-red-500 text-white hover:bg-red-600" 
                            : "hover:bg-gray-200"
                        )}
                        title={confirmDeleteId === design.id ? "Click again to confirm" : "Delete"}
                      >
                        <Trash2 className={cn(
                          "w-4 h-4",
                          confirmDeleteId === design.id ? "text-white" : "text-gray-500"
                        )} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        {!user && designsList.length > 0 && (
          <div className="p-4 border-t bg-blue-50">
            <div className="flex items-start gap-3">
              <CloudOff className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Sign in to sync</p>
                <p className="text-xs text-blue-700">
                  Your designs are saved locally. Sign in to sync them across devices.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Compact saved designs button for the editor toolbar
interface SavedDesignsButtonProps {
  onClick: () => void
}

export function SavedDesignsButton({ onClick }: SavedDesignsButtonProps) {
  const { designs, _hasHydrated } = useSavedDesignsStore()
  const count = _hasHydrated ? designs.length : 0
  
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
    >
      <FolderOpen className="w-4 h-4 text-gray-600" />
      <span className="text-sm font-medium text-gray-700">Designs</span>
      {count > 0 && (
        <span className="px-1.5 py-0.5 text-xs font-medium bg-rose-100 text-rose-600 rounded-full">
          {count}
        </span>
      )}
    </button>
  )
}

// Save dialog for naming a new design
interface SaveDesignDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string) => void
  defaultName?: string
}

export function SaveDesignDialog({ 
  isOpen, 
  onClose, 
  onSave, 
  defaultName = '' 
}: SaveDesignDialogProps) {
  const [name, setName] = useState(defaultName)
  
  useEffect(() => {
    if (isOpen) {
      setName(defaultName || `Design - ${new Date().toLocaleDateString()}`)
    }
  }, [isOpen, defaultName])
  
  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim())
      onClose()
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Save Design</h2>
        
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Design Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          placeholder="Enter a name for your design"
          autoFocus
        />
        
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
