'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { 
  SavedDesign, 
  SavedDesignListItem,
  SavedDesignState 
} from '@/lib/types/saved-design'
import { 
  createSavedDesign, 
  extractDesignState,
  generateDesignId 
} from '@/lib/types/saved-design'
import { useCustomizerStore } from './customizer-store'

const MAX_LOCAL_DESIGNS = 50 // Limit local storage designs to prevent quota issues
const LOCAL_STORAGE_KEY = 'soundprints-saved-designs'

interface SavedDesignsState {
  // Stored designs
  designs: SavedDesign[]
  
  // Current active design ID (if editing a saved design)
  activeDesignId: string | null
  
  // Loading states
  isLoading: boolean
  isSyncing: boolean
  
  // Cloud sync info
  lastCloudSyncAt: string | null
  cloudSyncError: string | null
  
  // Hydration state
  _hasHydrated: boolean
  setHasHydrated: (hasHydrated: boolean) => void
  
  // Actions
  saveCurrentDesign: (name?: string, thumbnailUrl?: string) => SavedDesign
  updateDesign: (id: string, updates: Partial<Omit<SavedDesign, 'id' | 'createdAt'>>) => void
  deleteDesign: (id: string) => void
  loadDesign: (id: string) => boolean
  duplicateDesign: (id: string) => SavedDesign | null
  
  // Save design from an order
  saveDesignFromOrder: (
    state: SavedDesignState, 
    orderId: string, 
    orderItemId: string, 
    name?: string,
    thumbnailUrl?: string
  ) => SavedDesign
  
  // Cloud sync actions
  syncDesignToCloud: (id: string, userId: string) => Promise<boolean>
  syncAllToCloud: (userId: string) => Promise<void>
  loadDesignsFromCloud: (userId: string) => Promise<void>
  
  // Import cloud designs (merge with local)
  importCloudDesigns: (cloudDesigns: SavedDesign[]) => void
  
  // List helpers
  getDesignsList: () => SavedDesignListItem[]
  getDesign: (id: string) => SavedDesign | undefined
  getDesignByOrderId: (orderId: string) => SavedDesign | undefined
  
  // Set active design (without loading into customizer)
  setActiveDesignId: (id: string | null) => void
  
  // Clear all local designs
  clearAllDesigns: () => void
}

export const useSavedDesignsStore = create<SavedDesignsState>()(
  persist(
    (set, get) => ({
      designs: [],
      activeDesignId: null,
      isLoading: false,
      isSyncing: false,
      lastCloudSyncAt: null,
      cloudSyncError: null,
      _hasHydrated: false,
      
      setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),
      
      // Save current customizer state as a new design
      saveCurrentDesign: (name, thumbnailUrl) => {
        const customizerState = useCustomizerStore.getState()
        const design = createSavedDesign(customizerState as unknown as Record<string, unknown>, name)
        
        if (thumbnailUrl) {
          design.thumbnailUrl = thumbnailUrl
        }
        
        set(state => {
          // Check if we're updating an existing design
          const existingIndex = state.designs.findIndex(d => d.id === state.activeDesignId)
          
          if (existingIndex >= 0 && state.activeDesignId) {
            // Update existing design
            const updated = [...state.designs]
            updated[existingIndex] = {
              ...updated[existingIndex],
              name: name || updated[existingIndex].name,
              state: design.state,
              thumbnailUrl: thumbnailUrl || updated[existingIndex].thumbnailUrl,
              updatedAt: new Date().toISOString(),
              isDirty: true,
            }
            return { designs: updated }
          } else {
            // Add new design, limit total count
            const newDesigns = [design, ...state.designs]
            if (newDesigns.length > MAX_LOCAL_DESIGNS) {
              // Remove oldest designs that aren't from orders
              const nonOrderDesigns = newDesigns.filter(d => !d.orderId)
              const orderDesigns = newDesigns.filter(d => d.orderId)
              
              while (nonOrderDesigns.length > MAX_LOCAL_DESIGNS - orderDesigns.length && nonOrderDesigns.length > 0) {
                nonOrderDesigns.pop()
              }
              
              return { 
                designs: [...nonOrderDesigns, ...orderDesigns].sort(
                  (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                ),
                activeDesignId: design.id 
              }
            }
            return { designs: newDesigns, activeDesignId: design.id }
          }
        })
        
        // Mark customizer as having no unsaved changes
        useCustomizerStore.getState().setHasUnsavedChanges(false)
        
        return design
      },
      
      // Update an existing design
      updateDesign: (id, updates) => {
        set(state => ({
          designs: state.designs.map(d => 
            d.id === id 
              ? { ...d, ...updates, updatedAt: new Date().toISOString(), isDirty: true }
              : d
          )
        }))
      },
      
      // Delete a design
      deleteDesign: (id) => {
        set(state => ({
          designs: state.designs.filter(d => d.id !== id),
          activeDesignId: state.activeDesignId === id ? null : state.activeDesignId
        }))
      },
      
      // Load a design into the customizer
      loadDesign: (id) => {
        const design = get().designs.find(d => d.id === id)
        if (!design) return false
        
        const customizerStore = useCustomizerStore.getState()
        
        // Apply all design state to customizer
        const state = design.state
        
        // Audio
        customizerStore.setAudioUrl(state.audioUrl)
        // Note: We can't restore the File object, only the URL
        
        // Waveform settings
        customizerStore.setWaveformColor(state.waveformColor)
        customizerStore.setWaveformUseGradient(state.waveformUseGradient)
        customizerStore.setWaveformGradientStops(state.waveformGradientStops)
        customizerStore.setWaveformGradientDirection(state.waveformGradientDirection)
        customizerStore.setWaveformStyle(state.waveformStyle)
        customizerStore.setWaveformSize(state.waveformSize)
        customizerStore.setWaveformHeightMultiplier(state.waveformHeightMultiplier)
        customizerStore.setWaveformPosition(state.waveformX, state.waveformY)
        customizerStore.setBarWidth(state.barWidth)
        customizerStore.setBarGap(state.barGap)
        if (state.barRounded !== undefined) {
          customizerStore.setBarRounded(state.barRounded)
        }
        customizerStore.setCircleRadius(state.circleRadius)
        customizerStore.setMirrorUseTwoColors(state.mirrorUseTwoColors)
        customizerStore.setMirrorSecondaryColor(state.mirrorSecondaryColor)
        customizerStore.setCanvasAspectRatio(state.canvasAspectRatio)
        
        // Image mask settings
        if (state.imageMaskImage !== undefined) {
          customizerStore.setImageMaskImage(state.imageMaskImage)
        }
        if (state.imageMaskShape !== undefined) {
          customizerStore.setImageMaskShape(state.imageMaskShape)
        }
        if (state.imageMaskFocalPoint !== undefined) {
          customizerStore.setImageMaskFocalPoint(state.imageMaskFocalPoint)
        }
        
        // Background
        customizerStore.setBackgroundColor(state.backgroundColor)
        customizerStore.setBackgroundUseGradient(state.backgroundUseGradient)
        customizerStore.setBackgroundGradientStops(state.backgroundGradientStops)
        customizerStore.setBackgroundGradientDirection(state.backgroundGradientDirection)
        customizerStore.setBackgroundImage(state.backgroundImage)
        customizerStore.setBackgroundImagePosition(state.backgroundImagePosition)
        customizerStore.setBackgroundFocalPoint(state.backgroundFocalPoint)
        
        // Text settings
        customizerStore.setShowText(state.showText)
        customizerStore.setCustomText(state.customText)
        customizerStore.setSongTitle(state.songTitle)
        customizerStore.setArtistName(state.artistName)
        customizerStore.setCustomDate(state.customDate)
        customizerStore.setTextColor(state.textColor)
        customizerStore.setTextUseGradient(state.textUseGradient)
        customizerStore.setTextGradientStops(state.textGradientStops)
        customizerStore.setTextGradientDirection(state.textGradientDirection)
        customizerStore.setTextPosition(state.textPosition)
        customizerStore.setTextX(state.textX)
        customizerStore.setTextY(state.textY)
        customizerStore.setFontSize(state.fontSize)
        customizerStore.setFontFamily(state.fontFamily)
        
        // QR Code
        customizerStore.setShowQRCode(state.showQRCode)
        customizerStore.setQRCodeUrl(state.qrCodeUrl)
        customizerStore.setQRCodePosition(state.qrCodePosition)
        customizerStore.setQRCodeSize(state.qrCodeSize)
        customizerStore.setQRCodeX(state.qrCodeX)
        customizerStore.setQRCodeY(state.qrCodeY)
        
        // Product selection
        customizerStore.setSelectedProduct(state.selectedProduct)
        customizerStore.setSelectedSize(state.selectedSize)
        
        // Audio duration and region
        customizerStore.setAudioDuration(state.audioDuration)
        customizerStore.setSelectedRegion(state.selectedRegion)
        
        // Artistic text
        customizerStore.setShowArtisticText(state.showArtisticText)
        customizerStore.setArtisticTextStyle(state.artisticTextStyle)
        customizerStore.setArtisticTextColor(state.artisticTextColor)
        customizerStore.setArtisticTextOpacity(state.artisticTextOpacity)
        
        // Restore text elements - need to clear existing first and add new ones
        // This requires direct state manipulation since there's no bulk setter
        const currentTextElements = useCustomizerStore.getState().textElements
        currentTextElements.forEach(el => customizerStore.removeTextElement(el.id))
        state.textElements.forEach(el => {
          customizerStore.addTextElement()
          const newId = useCustomizerStore.getState().textElements[
            useCustomizerStore.getState().textElements.length - 1
          ]?.id
          if (newId) {
            customizerStore.updateTextElement(newId, {
              text: el.text,
              x: el.x,
              y: el.y,
              fontSize: el.fontSize,
              fontFamily: el.fontFamily,
              color: el.color,
              useGradient: el.useGradient,
              gradientStops: el.gradientStops,
              gradientDirection: el.gradientDirection,
              visible: el.visible,
            })
          }
        })
        
        // Mark as no unsaved changes after loading
        customizerStore.setHasUnsavedChanges(false)
        
        // Set as active design
        set({ activeDesignId: id })
        
        return true
      },
      
      // Duplicate a design
      duplicateDesign: (id) => {
        const original = get().designs.find(d => d.id === id)
        if (!original) return null
        
        const now = new Date().toISOString()
        const duplicate: SavedDesign = {
          ...original,
          id: generateDesignId(),
          name: `${original.name} (Copy)`,
          createdAt: now,
          updatedAt: now,
          cloudId: undefined, // Don't copy cloud ID
          cloudSyncedAt: undefined,
          isDirty: true,
          orderId: undefined, // Don't copy order reference
          orderItemId: undefined,
        }
        
        set(state => ({
          designs: [duplicate, ...state.designs]
        }))
        
        return duplicate
      },
      
      // Save a design from an order (for order history)
      saveDesignFromOrder: (state, orderId, orderItemId, name, thumbnailUrl) => {
        const now = new Date().toISOString()
        
        const design: SavedDesign = {
          id: generateDesignId(),
          name: name || `Order ${orderId.slice(0, 8)}`,
          thumbnailUrl,
          state,
          createdAt: now,
          updatedAt: now,
          orderId,
          orderItemId,
        }
        
        set(storeState => ({
          designs: [design, ...storeState.designs]
        }))
        
        return design
      },
      
      // Sync a single design to cloud
      syncDesignToCloud: async (id, userId) => {
        const design = get().designs.find(d => d.id === id)
        if (!design) return false
        
        set({ isSyncing: true, cloudSyncError: null })
        
        try {
          const response = await fetch('/api/designs/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ design, userId }),
          })
          
          if (!response.ok) {
            throw new Error('Failed to sync design to cloud')
          }
          
          const result = await response.json()
          
          set(state => ({
            designs: state.designs.map(d => 
              d.id === id 
                ? { 
                    ...d, 
                    cloudId: result.cloudId,
                    cloudSyncedAt: new Date().toISOString(),
                    isDirty: false,
                  }
                : d
            ),
            isSyncing: false,
          }))
          
          return true
        } catch (error) {
          set({ 
            isSyncing: false, 
            cloudSyncError: error instanceof Error ? error.message : 'Sync failed'
          })
          return false
        }
      },
      
      // Sync all dirty designs to cloud
      syncAllToCloud: async (userId) => {
        const dirtyDesigns = get().designs.filter(d => d.isDirty || !d.cloudId)
        
        set({ isSyncing: true, cloudSyncError: null })
        
        try {
          for (const design of dirtyDesigns) {
            await get().syncDesignToCloud(design.id, userId)
          }
          
          set({ 
            lastCloudSyncAt: new Date().toISOString(),
            isSyncing: false 
          })
        } catch (error) {
          set({ 
            isSyncing: false,
            cloudSyncError: error instanceof Error ? error.message : 'Sync failed'
          })
        }
      },
      
      // Load designs from cloud
      loadDesignsFromCloud: async (userId) => {
        set({ isLoading: true, cloudSyncError: null })
        
        try {
          const response = await fetch(`/api/designs?userId=${userId}`)
          
          if (!response.ok) {
            throw new Error('Failed to load designs from cloud')
          }
          
          const result = await response.json()
          
          if (result.designs) {
            get().importCloudDesigns(result.designs)
          }
          
          set({ 
            isLoading: false,
            lastCloudSyncAt: new Date().toISOString()
          })
        } catch (error) {
          set({ 
            isLoading: false,
            cloudSyncError: error instanceof Error ? error.message : 'Load failed'
          })
        }
      },
      
      // Import cloud designs (merge with local, cloud takes precedence for conflicts)
      importCloudDesigns: (cloudDesigns) => {
        set(state => {
          const localMap = new Map(state.designs.map(d => [d.cloudId || d.id, d]))
          
          // Merge: cloud designs take precedence for same cloudId
          for (const cloudDesign of cloudDesigns) {
            const existingLocal = localMap.get(cloudDesign.cloudId || cloudDesign.id)
            
            if (existingLocal) {
              // If cloud is newer, use cloud version
              if (new Date(cloudDesign.updatedAt) > new Date(existingLocal.updatedAt)) {
                localMap.set(cloudDesign.cloudId || cloudDesign.id, {
                  ...cloudDesign,
                  id: existingLocal.id, // Keep local ID for consistency
                  cloudSyncedAt: new Date().toISOString(),
                  isDirty: false,
                })
              }
            } else {
              // New cloud design, add it
              localMap.set(cloudDesign.cloudId || cloudDesign.id, {
                ...cloudDesign,
                cloudSyncedAt: new Date().toISOString(),
                isDirty: false,
              })
            }
          }
          
          // Sort by updated date
          const merged = Array.from(localMap.values()).sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
          
          return { designs: merged }
        })
      },
      
      // Get a list of designs for display
      getDesignsList: () => {
        return get().designs.map(d => ({
          id: d.id,
          name: d.name,
          thumbnailUrl: d.thumbnailUrl,
          audioFileName: d.state.audioFileName,
          waveformStyle: d.state.waveformStyle,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
          isSyncedToCloud: !!d.cloudId && !d.isDirty,
          orderId: d.orderId,
        }))
      },
      
      // Get a specific design
      getDesign: (id) => {
        return get().designs.find(d => d.id === id)
      },
      
      // Get design by order ID
      getDesignByOrderId: (orderId) => {
        return get().designs.find(d => d.orderId === orderId)
      },
      
      // Set active design ID
      setActiveDesignId: (id) => {
        set({ activeDesignId: id })
      },
      
      // Clear all local designs
      clearAllDesigns: () => {
        set({ designs: [], activeDesignId: null })
      },
    }),
    {
      name: LOCAL_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        designs: state.designs,
        lastCloudSyncAt: state.lastCloudSyncAt,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
