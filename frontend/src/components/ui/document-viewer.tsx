'use client'

import { useState, useEffect } from 'react'
import { X, Download, ZoomIn, ZoomOut, RotateCw, FileText } from 'lucide-react'
import { Button } from './button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog'
import * as XLSX from 'xlsx'

interface DocumentViewerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentUrl: string
  documentName: string
  documentType: string
  onDownload?: () => void
}

export function DocumentViewer({
  open,
  onOpenChange,
  documentUrl,
  documentName,
  documentType,
  onDownload,
}: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [spreadsheetHtml, setSpreadsheetHtml] = useState<string>('')
  const [loadingSpreadsheet, setLoadingSpreadsheet] = useState(false)

  // Reset zoom and rotation when document changes
  useEffect(() => {
    setZoom(100)
    setRotation(0)
  }, [documentUrl])

  const isPDF = documentType === 'application/pdf'
  const isImage = documentType.startsWith('image/')
  const isExcel = documentType.includes('spreadsheet') || documentType.includes('excel') || documentType.includes('csv')
  const isWord = documentType.includes('word') || documentType.includes('msword') || documentType.includes('document')

  // Carregar e processar planilha quando o documento for Excel/CSV
  useEffect(() => {
    if (isExcel && documentUrl) {
      loadSpreadsheet()
    }
  }, [isExcel, documentUrl])

  const loadSpreadsheet = async () => {
    try {
      setLoadingSpreadsheet(true)
      
      // Buscar o blob do documento
      const response = await fetch(documentUrl)
      const arrayBuffer = await response.arrayBuffer()
      
      // Ler a planilha
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      
      // Converter a primeira sheet para HTML
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      const html = XLSX.utils.sheet_to_html(worksheet, {
        id: 'spreadsheet-table',
        editable: false,
      })
      
      setSpreadsheetHtml(html)
    } catch (error) {
      console.error('Erro ao carregar planilha:', error)
      setSpreadsheetHtml('<p>Erro ao carregar planilha. Faça o download para visualizar.</p>')
    } finally {
      setLoadingSpreadsheet(false)
    }
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50))
  const handleRotate = () => setRotation(prev => (prev + 90) % 360)

  const renderContent = () => {
    if (isPDF) {
      return (
        <div className="w-full h-full bg-gray-100 dark:bg-gray-900">
          <embed
            src={documentUrl}
            type="application/pdf"
            className="w-full h-full"
          />
        </div>
      )
    }

    if (isImage) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 overflow-auto p-4">
          <img
            src={documentUrl}
            alt={documentName}
            className="max-w-full max-h-full object-contain"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease-in-out',
            }}
          />
        </div>
      )
    }

    if (isWord) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-8">
          <FileText className="h-24 w-24 text-blue-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Documento Word</h3>
          <p className="text-muted-foreground text-center mb-4">
            Visualização de documentos Word não está disponível no navegador.
          </p>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Faça o download para abrir no Microsoft Word ou Google Docs.
          </p>
          {onDownload && (
            <Button onClick={onDownload} className="mt-2">
              <Download className="h-4 w-4 mr-2" />
              Baixar Documento
            </Button>
          )}
        </div>
      )
    }

    if (isExcel) {
      return (
        <div className="w-full h-full bg-gray-100 dark:bg-gray-900 overflow-auto p-4">
          {loadingSpreadsheet ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
              <p className="text-muted-foreground">Carregando planilha...</p>
            </div>
          ) : spreadsheetHtml ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <style>{`
                #spreadsheet-table {
                  width: 100%;
                  border-collapse: collapse;
                  font-size: 13px;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                #spreadsheet-table td, #spreadsheet-table th {
                  border: 1px solid #e5e7eb;
                  padding: 8px 12px;
                  text-align: left;
                  white-space: nowrap;
                }
                #spreadsheet-table th {
                  background-color: #f3f4f6;
                  font-weight: 600;
                  position: sticky;
                  top: 0;
                  z-index: 10;
                }
                #spreadsheet-table tr:nth-child(even) {
                  background-color: #f9fafb;
                }
                #spreadsheet-table tr:hover {
                  background-color: #f3f4f6;
                }
                .dark #spreadsheet-table {
                  color: #e5e7eb;
                }
                .dark #spreadsheet-table td, .dark #spreadsheet-table th {
                  border-color: #374151;
                }
                .dark #spreadsheet-table th {
                  background-color: #1f2937;
                }
                .dark #spreadsheet-table tr:nth-child(even) {
                  background-color: #111827;
                }
                .dark #spreadsheet-table tr:hover {
                  background-color: #1f2937;
                }
              `}</style>
              <div dangerouslySetInnerHTML={{ __html: spreadsheetHtml }} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <FileText className="h-24 w-24 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Planilha</h3>
              <p className="text-muted-foreground text-center mb-4">
                Não foi possível carregar a visualização.
              </p>
              {onDownload && (
                <Button onClick={onDownload} className="mt-2">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Planilha
                </Button>
              )}
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <FileText className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Pré-visualização não disponível para este tipo de arquivo
          </p>
          {onDownload && (
            <Button onClick={onDownload} className="mt-4">
              <Download className="h-4 w-4 mr-2" />
              Baixar Documento
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
        {/* Header com controles */}
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold truncate max-w-md">
              {documentName}
            </DialogTitle>
            
            <div className="flex items-center gap-2">
              {/* Controles de zoom e rotação (apenas para imagens) */}
              {isImage && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomOut}
                    disabled={zoom <= 50}
                    title="Diminuir zoom"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  
                  <span className="text-sm font-medium min-w-[60px] text-center">
                    {zoom}%
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomIn}
                    disabled={zoom >= 200}
                    title="Aumentar zoom"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRotate}
                    title="Girar imagem"
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Botão de download */}
              {onDownload && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDownload}
                  title="Baixar documento"
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}

              {/* Botão de fechar */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                title="Fechar"
                className="ml-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Área de visualização */}
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  )
}
