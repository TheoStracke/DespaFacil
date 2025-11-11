"use client"

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

interface FileDropzoneProps {
  onFileSelect: (file: File) => void
  accept?: Record<string, string[]>
  maxSize?: number
  selectedFile?: File | null
  onClear?: () => void
  disabled?: boolean
  className?: string
}

export function FileDropzone({
  onFileSelect,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg'],
    'application/pdf': ['.pdf'],
  },
  maxSize = 5 * 1024 * 1024, // 5MB default
  selectedFile,
  onClear,
  disabled = false,
  className,
}: FileDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0])
      }
    },
    [onFileSelect]
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled,
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className={cn('w-full', className)}>
      {selectedFile ? (
        <div className="flex items-center gap-3 p-4 bg-muted rounded-lg border-2 border-dashed border-muted-foreground/25">
          <File className="h-8 w-8 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          {onClear && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            'flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
            isDragActive && !isDragReject && 'border-primary bg-primary/5',
            isDragReject && 'border-destructive bg-destructive/5',
            !isDragActive && !isDragReject && 'border-muted-foreground/25 hover:border-primary/50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input {...getInputProps()} />
          <Upload className={cn(
            'h-10 w-10',
            isDragActive && !isDragReject && 'text-primary',
            isDragReject && 'text-destructive',
            !isDragActive && 'text-muted-foreground'
          )} />
          <div className="text-center">
            <p className="text-sm font-medium">
              {isDragActive
                ? isDragReject
                  ? 'Arquivo não permitido'
                  : 'Solte o arquivo aqui'
                : 'Arraste um arquivo ou clique para selecionar'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PDF ou imagem até {formatFileSize(maxSize)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
