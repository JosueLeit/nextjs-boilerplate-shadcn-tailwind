'use client'

import React, { useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Download, RefreshCw, Copy, Check, X } from 'lucide-react'
import { Button } from './ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog'

interface QRCodeGeneratorProps {
  shareToken: string
  onRegenerate?: () => Promise<void>
  onClose: () => void
}

export default function QRCodeGenerator({ shareToken, onRegenerate, onClose }: QRCodeGeneratorProps) {
  const qrRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false)

  // Generate the share URL
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/share/${shareToken}`
    : `/share/${shareToken}`

  const handleDownload = () => {
    if (!qrRef.current) return

    const svg = qrRef.current.querySelector('svg')
    if (!svg) return

    // Create a canvas to convert SVG to PNG
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width * 2
      canvas.height = img.height * 2
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const link = document.createElement('a')
      link.download = 'favoriteperson-qrcode.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleRegenerate = async () => {
    if (!onRegenerate) return

    setIsRegenerating(true)
    try {
      await onRegenerate()
      setShowRegenerateConfirm(false)
    } catch (error) {
      console.error('Failed to regenerate:', error)
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Compartilhar Memórias</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center mb-6">
          <div
            ref={qrRef}
            className="bg-white p-4 rounded-xl border-2 border-gray-100 shadow-inner"
          >
            <QRCodeSVG
              value={shareUrl}
              size={200}
              level="H"
              includeMargin
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>
          <p className="text-sm text-gray-500 mt-4 text-center">
            Escaneie o QR code para ver as memórias
          </p>
        </div>

        {/* Share URL */}
        <div className="bg-gray-50 rounded-lg p-3 mb-6">
          <p className="text-xs text-gray-500 mb-1">Link de compartilhamento:</p>
          <div className="flex items-center gap-2">
            <code className="text-sm text-gray-700 flex-1 truncate">
              {shareUrl}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyLink}
              className="shrink-0"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleDownload}
            className="w-full bg-pink-500 hover:bg-pink-600"
          >
            <Download className="w-4 h-4 mr-2" />
            Baixar QR Code
          </Button>

          {onRegenerate && (
            <Button
              variant="outline"
              onClick={() => setShowRegenerateConfirm(true)}
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Gerar Novo Link
            </Button>
          )}
        </div>

        {/* Info */}
        <p className="text-xs text-gray-400 text-center mt-4">
          Qualquer pessoa com este link poderá ver suas memórias.
          Gere um novo link para revogar o acesso anterior.
        </p>
      </div>

      {/* Regenerate Confirmation Dialog */}
      <AlertDialog open={showRegenerateConfirm} onOpenChange={setShowRegenerateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gerar novo link?</AlertDialogTitle>
            <AlertDialogDescription>
              Ao gerar um novo link, o link anterior deixará de funcionar.
              Pessoas que tinham o link antigo não poderão mais acessar suas memórias.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRegenerating}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="bg-pink-500 hover:bg-pink-600"
            >
              {isRegenerating ? 'Gerando...' : 'Gerar Novo Link'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
