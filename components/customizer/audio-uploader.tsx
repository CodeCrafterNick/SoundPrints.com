'use client'

import { useCallback, useState, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileAudio, X, Loader2, Play, Pause, RotateCcw } from 'lucide-react'
import { useCustomizerStore } from '@/lib/stores/customizer-store'
import { Button } from '@/components/ui/button'

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB

export function AudioUploader() {
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  const audioFile = useCustomizerStore((state) => state.audioFile)
  const audioFileName = useCustomizerStore((state) => state.audioFileName)
  const audioFileSize = useCustomizerStore((state) => state.audioFileSize)
  const audioUrl = useCustomizerStore((state) => state.audioUrl)
  const waveformColor = useCustomizerStore((state) => state.waveformColor)
  const backgroundColor = useCustomizerStore((state) => state.backgroundColor)
  const setAudioFile = useCustomizerStore((state) => state.setAudioFile)
  const setAudioUrl = useCustomizerStore((state) => state.setAudioUrl)
  const reset = useCustomizerStore((state) => state.reset)

  // Initialize audio element when URL changes
  useEffect(() => {
    if (audioUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl)
      } else {
        audioRef.current.src = audioUrl
      }
      
      const audio = audioRef.current
      
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration)
      })
      
      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime)
      })
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false)
        setCurrentTime(0)
      })
      
      return () => {
        audio.pause()
        audio.removeEventListener('loadedmetadata', () => {})
        audio.removeEventListener('timeupdate', () => {})
        audio.removeEventListener('ended', () => {})
      }
    }
  }, [audioUrl])

  const togglePlay = () => {
    if (!audioRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    reset()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles[0]) {
      const file = acceptedFiles[0]
      if (file.size <= MAX_FILE_SIZE) {
        setIsLoading(true)
        try {
          // Upload to Supabase Storage
          const formData = new FormData()
          formData.append('file', file)
          
          const response = await fetch('/api/upload-audio', {
            method: 'POST',
            body: formData,
          })
          
          const responseData = await response.json()
          
          if (!response.ok) {
            throw new Error(responseData.error || 'Failed to upload audio')
          }
          
          const { url } = responseData
          
          // Store both the file (for metadata) and the permanent URL
          setAudioFile(file)
          setAudioUrl(url) // Set the permanent Supabase URL
        } catch (error) {
          console.error('Error uploading audio:', error)
          const errorMessage = error instanceof Error ? error.message : 'Failed to upload audio file. Please try again.'
          alert(errorMessage)
        } finally {
          setIsLoading(false)
        }
      } else {
        alert('File is too large. Maximum size is 25MB.')
      }
    }
  }, [setAudioFile, setAudioUrl])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.flac', '.m4a', '.ogg']
    },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    noClick: false,
    noKeyboard: false,
  })

  const removeFile = () => {
    setAudioFile(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // Show file info if we have an audio file, filename, or URL (for persisted state)
  if (audioFile || audioFileName || audioUrl) {
    // Helper to determine if a color is light or dark
    const isLightColor = (color: string) => {
      const hex = color.replace('#', '')
      const r = parseInt(hex.substr(0, 2), 16)
      const g = parseInt(hex.substr(2, 2), 16)
      const b = parseInt(hex.substr(4, 2), 16)
      const brightness = (r * 299 + g * 587 + b * 114) / 1000
      return brightness > 128
    }
    
    const textColor = isLightColor(backgroundColor) ? '#111827' : '#F9FAFB'
    const mutedTextColor = isLightColor(backgroundColor) ? '#6B7280' : '#9CA3AF'
    
    return (
      <div className="space-y-3">
        {/* Hidden input for Replace functionality */}
        <input {...getInputProps()} />
        <div 
          className="border-2 rounded-lg p-4 transition-colors"
          style={{ 
            backgroundColor: backgroundColor,
            borderColor: waveformColor + '80'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded"
                style={{ backgroundColor: waveformColor + '20' }}
              >
                <FileAudio className="h-6 w-6" style={{ color: waveformColor }} />
              </div>
              <div>
                <p className="font-medium text-sm" style={{ color: textColor }}>
                  {audioFile?.name || audioFileName || 'Audio file'}
                </p>
                <p className="text-xs" style={{ color: mutedTextColor }}>
                  {audioFile ? formatFileSize(audioFile.size) : audioFileSize ? formatFileSize(audioFileSize) : ''}
                  {duration > 0 && ` • ${formatTime(duration)}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* Play/Pause Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="h-8 w-8 hover:bg-white/10"
                style={{ color: waveformColor }}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              {/* Remove Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={removeFile}
                className="h-8 w-8 hover:bg-white/10"
                style={{ color: mutedTextColor }}
                title="Remove audio"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Progress bar */}
          {duration > 0 && (
            <div className="mt-3 space-y-1">
              <div 
                className="w-full h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: waveformColor + '30' }}
              >
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ 
                    width: `${(currentTime / duration) * 100}%`,
                    backgroundColor: waveformColor
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px]" style={{ color: mutedTextColor }}>
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={open}
            className="flex-1"
          >
            <Upload className="mr-2 h-4 w-4" />
            Replace
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            className="px-3"
            title="Reset and start over"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="border-2 border-primary/50 bg-primary/5 rounded-lg p-8 text-center">
        <Loader2 className="mx-auto h-10 w-10 mb-3 text-primary animate-spin" />
        <p className="font-medium mb-1">Processing audio file...</p>
        <p className="text-sm text-muted-foreground">
          This will only take a moment
        </p>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
        isDragActive
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-primary/5'
      }`}
    >
      <input {...getInputProps()} />
      <Upload className={`mx-auto h-10 w-10 mb-3 transition-colors ${
        isDragActive ? 'text-primary' : 'text-muted-foreground'
      }`} />
      <p className="font-medium mb-1">
        {isDragActive ? 'Drop your audio file here' : 'Upload Audio File'}
      </p>
      <p className="text-sm text-muted-foreground mb-2">
        Drag and drop or click to browse
      </p>
      <p className="text-xs text-muted-foreground">
        Supports MP3, WAV, FLAC, M4A, OGG (max 25MB)
      </p>
    </div>
  )
}
