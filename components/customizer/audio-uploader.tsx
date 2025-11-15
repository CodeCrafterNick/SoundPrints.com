'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileAudio, X, Loader2 } from 'lucide-react'
import { useCustomizerStore } from '@/lib/stores/customizer-store'
import { Button } from '@/components/ui/button'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export function AudioUploader() {
  const [isLoading, setIsLoading] = useState(false)
  const audioFile = useCustomizerStore((state) => state.audioFile)
  const audioFileName = useCustomizerStore((state) => state.audioFileName)
  const audioFileSize = useCustomizerStore((state) => state.audioFileSize)
  const setAudioFile = useCustomizerStore((state) => state.setAudioFile)
  const setAudioUrl = useCustomizerStore((state) => state.setAudioUrl)

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
          
          if (!response.ok) {
            throw new Error('Failed to upload audio')
          }
          
          const { url } = await response.json()
          
          // Store both the file (for metadata) and the permanent URL
          setAudioFile(file)
          setAudioUrl(url) // Set the permanent Supabase URL
        } catch (error) {
          console.error('Error uploading audio:', error)
          alert('Failed to upload audio file. Please try again.')
        } finally {
          setIsLoading(false)
        }
      } else {
        alert('File is too large. Maximum size is 50MB.')
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

  if (audioFile || audioFileName) {
    return (
      <div className="space-y-3">
        <div className="border-2 border-primary/50 bg-primary/5 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded">
                <FileAudio className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{audioFile?.name || audioFileName}</p>
                <p className="text-xs text-muted-foreground">
                  {audioFile ? formatFileSize(audioFile.size) : audioFileSize ? formatFileSize(audioFileSize) : ''}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={removeFile}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={open}
          className="w-full"
        >
          <Upload className="mr-2 h-4 w-4" />
          Replace Audio File
        </Button>
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
        Supports MP3, WAV, FLAC, M4A, OGG (max 50MB)
      </p>
    </div>
  )
}
