import React, {useState, useEffect, useRef} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { Button } from './ui/button';
import { Loader2, X, AlertCircle, Pause, Play, XCircle, RefreshCw } from 'lucide-react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import {
  compressImage,
  formatFileSize,
  needsCompression,
  isHeicFile,
  CompressionResult
} from '@/lib/compressionUtils';
import {
  createUpload,
  UploadController,
  formatSpeed,
  getUploadErrorMessage,
  calculateETA
} from '@/lib/uploadUtils';
import { useUploadSettingsStore } from '@/lib/store/settingsStore';

interface FormData {
  image: File | null
  imagePreview: string | null
  caption: string
  date: string
}

interface CompressionState {
  isCompressing: boolean
  result: CompressionResult | null
  skipCompression: boolean
}

interface UploadProgress {
  percentage: number
  speed: number
  bytesUploaded: number
  bytesTotal: number
  isPaused: boolean
  error: Error | null
  canRetry: boolean
}

const initialFormData: FormData = {
  image: null,
  imagePreview: null,
  caption: '',
  date: ''
}

const initialCompressionState: CompressionState = {
  isCompressing: false,
  result: null,
  skipCompression: false
}

const initialUploadProgress: UploadProgress = {
  percentage: 0,
  speed: 0,
  bytesUploaded: 0,
  bytesTotal: 0,
  isPaused: false,
  error: null,
  canRetry: false
}

const steps = ['Upload Image', 'Add details', 'Confirm']

export default function PhotoUploadForm({onComplete, existingStartDate}: {
  onComplete: (startDate: string) => void,
  existingStartDate?: string
}){
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [startDate, setStartDate] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isFirstPhoto, setIsFirstPhoto] = useState(false);
  const [compression, setCompression] = useState<CompressionState>(initialCompressionState);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>(initialUploadProgress);
  const uploadControllerRef = useRef<UploadController | null>(null);
  const { user } = useAuth();

  // Get settings from store
  const { autoCompress, compressionQuality, maxDimension } = useUploadSettingsStore();

  useEffect(() => {
    // Verificar se ja existem fotos no storage
    const checkPhotosExistence = async () => {
      try {
        if (!user?.id) {
          console.error('[UPLOAD] Usuario nao autenticado');
          return;
        }

        const { data, error } = await supabase
          .storage
          .from('vcinesquecivel')
          .list(user.id);

        if (error) throw error;

        // Filtrar apenas arquivos de imagem
        const photos = data?.filter(file => file.name.match(/\.(jpg|jpeg|png|gif)$/i));
        setIsFirstPhoto(photos?.length === 0);

        // Se ja existe uma data de inicio, usa-la
        if (existingStartDate) {
          setStartDate(existingStartDate);
        }
      } catch (err) {
        console.error("[UPLOAD] Erro ao verificar fotos existentes:", err);
        // Por precaucao, considerar que nao e a primeira foto
        setIsFirstPhoto(false);
      }
    };

    checkPhotosExistence();
  }, [existingStartDate, user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (uploadControllerRef.current) {
        uploadControllerRef.current.abort();
      }
    };
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Revoke previous preview URL to avoid memory leaks
      if (formData.imagePreview) {
        URL.revokeObjectURL(formData.imagePreview);
      }
      const previewUrl = URL.createObjectURL(file);
      setFormData({...formData, image: file, imagePreview: previewUrl});
      setImageError(null);

      // Reset compression and upload state when new file is selected
      setCompression(initialCompressionState);
      setUploadProgress(initialUploadProgress);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>{
    const {name, value} = e.target
    setFormData({...formData, [name]: value});
  }

  const handleSkipCompressionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompression(prev => ({ ...prev, skipCompression: e.target.checked, result: null }));
  }

  const handlePauseUpload = () => {
    if (uploadControllerRef.current) {
      uploadControllerRef.current.pause();
      setUploadProgress(prev => ({ ...prev, isPaused: true }));
    }
  };

  const handleResumeUpload = () => {
    if (uploadControllerRef.current) {
      uploadControllerRef.current.resume();
      setUploadProgress(prev => ({ ...prev, isPaused: false }));
    }
  };

  const handleCancelUpload = () => {
    if (uploadControllerRef.current) {
      uploadControllerRef.current.abort();
      uploadControllerRef.current = null;
    }
    setIsUploading(false);
    setUploadProgress(initialUploadProgress);
    setError(null);
  };

  const handleRetryUpload = () => {
    setUploadProgress(prev => ({ ...prev, error: null, canRetry: false }));
    setError(null);
    handleUpload();
  };

  const handleUpload = async () => {
    if(!formData.image || !formData.caption || !formData.date || !user?.id) {
      setError('Todos os campos sao obrigatorios');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(initialUploadProgress);

    try {
      let fileToUpload = formData.image;

      // Compress image if auto-compress is enabled and user hasn't opted to skip
      if (autoCompress && !compression.skipCompression) {
        const shouldCompress = needsCompression(fileToUpload) || isHeicFile(fileToUpload);

        if (shouldCompress) {
          setCompression(prev => ({ ...prev, isCompressing: true }));

          console.log('[UPLOAD] Iniciando compressao:', {
            originalSize: formatFileSize(fileToUpload.size),
            fileName: fileToUpload.name
          });

          const compressionResult = await compressImage(fileToUpload, {
            initialQuality: compressionQuality,
            maxWidthOrHeight: maxDimension
          });

          setCompression(prev => ({
            ...prev,
            isCompressing: false,
            result: compressionResult
          }));

          if (compressionResult.wasCompressed) {
            fileToUpload = compressionResult.file;
            console.log('[UPLOAD] Compressao concluida:', {
              originalSize: formatFileSize(compressionResult.originalSize),
              compressedSize: formatFileSize(compressionResult.compressedSize),
              reduction: `${Math.round((1 - compressionResult.compressedSize / compressionResult.originalSize) * 100)}%`
            });
          }
        }
      }

      console.log('[UPLOAD] Iniciando upload com tus:', {
        caption: formData.caption,
        date: formData.date,
        userId: user.id,
        fileSize: formatFileSize(fileToUpload.size)
      });

      // Get the file extension from the file to upload (may have changed after compression)
      const fileExtension = fileToUpload.name.split('.').pop() || 'jpg';
      const fileName = `${formData.date}-${formData.caption}.${fileExtension}`;

      // Set initial progress with total bytes
      setUploadProgress(prev => ({
        ...prev,
        bytesTotal: fileToUpload.size
      }));

      // Create tus upload
      const uploadController = createUpload({
        file: fileToUpload,
        userId: user.id,
        fileName,
        onProgress: (percentage, speed, bytesUploaded, bytesTotal) => {
          setUploadProgress(prev => ({
            ...prev,
            percentage,
            speed,
            bytesUploaded,
            bytesTotal
          }));
        },
        onSuccess: () => {
          console.log('[UPLOAD] Upload concluido com sucesso');
          uploadControllerRef.current = null;
          setIsUploading(false);
          setUploadProgress(prev => ({ ...prev, percentage: 100 }));

          // Se e a primeira foto e nao tem data de inicio, va para o passo de confirmar
          // Caso contrario, finalize o upload
          if (isFirstPhoto && !existingStartDate) {
            setCurrentStep(currentStep + 1);
          } else {
            // Finalizar usando a data existente ou vazia
            onComplete(existingStartDate || '');
          }
        },
        onError: (error) => {
          console.error('[UPLOAD] Erro no upload:', error);
          const friendlyMessage = getUploadErrorMessage(error);
          setError(friendlyMessage);
          setUploadProgress(prev => ({
            ...prev,
            error,
            canRetry: true
          }));
          setIsUploading(false);
        }
      });

      uploadControllerRef.current = uploadController;
      uploadController.start();

    } catch (error: any) {
      console.error('[UPLOAD] Erro no upload:', error);
      setError(error.message || 'Erro ao fazer upload da imagem. Tente novamente.');
      setIsUploading(false);
      setCompression(prev => ({ ...prev, isCompressing: false }));
    }
  }

  const handleSubmit = () => {
    onComplete(startDate);
  }

  const handleClose = () => {
    // Abort any ongoing upload
    if (uploadControllerRef.current) {
      uploadControllerRef.current.abort();
      uploadControllerRef.current = null;
    }
    onComplete('');
  }

  const handleNextStep = () => {
    if (!formData.image) {
      setImageError('Por favor, selecione uma imagem para continuar');
      return;
    }
    setCurrentStep(1);
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity:0, scale:0.8 }
  }

  // Check if current file needs compression (for UI display)
  const fileNeedsCompression = formData.image &&
    (needsCompression(formData.image) || isHeicFile(formData.image));

  // Get file being uploaded (after compression if applicable)
  const uploadingFile = compression.result?.wasCompressed
    ? compression.result.file
    : formData.image;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full"
        >
          <div className="flex justify-between items-center mb-6 pb-3 border-b">
            <h2 className="text-2xl font-bold text-pink-600">{steps[currentStep]}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              title="Fechar e cancelar upload"
              disabled={isUploading && !uploadProgress.isPaused}
            >
              <X className="h-6 w-6"/>
            </Button>
          </div>

          {currentStep === 0 && (
            <div className="space-y-5">
              {imageError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{imageError}</AlertDescription>
                </Alert>
              )}

              {formData.imagePreview ? (
                <div className="relative">
                  <img
                    src={formData.imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <Label
                    htmlFor="image"
                    className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg cursor-pointer hover:bg-white transition-colors text-sm font-medium text-pink-600"
                  >
                    Trocar foto
                  </Label>
                  <Input id="image" type="file" onChange={handleFileChange} accept="image/*" className="hidden"/>
                </div>
              ) : (
                <div className={`p-6 border-2 border-dashed ${imageError ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'} rounded-lg text-center`}>
                  <Label htmlFor="image" className="block mb-2 font-medium cursor-pointer">
                    <div className="flex flex-col items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 ${imageError ? 'text-red-400' : 'text-gray-400'} mb-3`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className={`text-sm ${imageError ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                        {imageError ? 'Selecione uma imagem para continuar' : 'Clique para selecionar uma foto'}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">Arraste e solte ou clique para navegar</span>
                    </div>
                  </Label>
                  <Input id="image" type="file" onChange={handleFileChange} accept="image/*" className="hidden"/>
                </div>
              )}

              {formData.image && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Arquivo selecionado:</p>
                  <p className="text-sm font-medium truncate">{formData.image.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Tamanho: {formatFileSize(formData.image.size)}
                    {fileNeedsCompression && autoCompress && !compression.skipCompression && (
                      <span className="text-blue-600 ml-2">(sera otimizado)</span>
                    )}
                  </p>
                </div>
              )}

              <Button
                onClick={handleNextStep}
                className="w-full"
              >
                Proximo
              </Button>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>{error}</span>
                    {uploadProgress.canRetry && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRetryUpload}
                        className="ml-2 text-red-600 hover:text-red-700"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Tentar novamente
                      </Button>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Compression Status */}
              {compression.isCompressing && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <span className="text-blue-800 font-medium">Otimizando imagem...</span>
                  </div>
                  {formData.image && (
                    <p className="text-sm text-blue-600 mt-2">
                      {formData.image.name}
                    </p>
                  )}
                </div>
              )}

              {/* Upload Progress UI */}
              {isUploading && !compression.isCompressing && (
                <div className="p-4 bg-pink-50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-pink-800 font-medium">
                      {uploadProgress.isPaused ? 'Upload pausado' : 'Enviando foto...'}
                    </span>
                    <span className="text-pink-800 font-bold text-lg">{uploadProgress.percentage}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-pink-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="h-full bg-pink-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress.percentage}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>

                  {/* File info and speed */}
                  <div className="text-sm text-pink-700 space-y-1">
                    <p className="truncate font-medium">
                      {uploadingFile?.name} ({formatFileSize(uploadProgress.bytesTotal)})
                    </p>
                    <div className="flex justify-between text-xs">
                      <span>
                        Velocidade: {uploadProgress.isPaused ? '--' : formatSpeed(uploadProgress.speed)}
                      </span>
                      <span>
                        Tempo restante: {uploadProgress.isPaused ? '--' : calculateETA(
                          uploadProgress.bytesTotal - uploadProgress.bytesUploaded,
                          uploadProgress.speed
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Control buttons */}
                  <div className="flex gap-2 pt-2">
                    {uploadProgress.isPaused ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResumeUpload}
                        className="flex-1"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Retomar
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePauseUpload}
                        className="flex-1"
                      >
                        <Pause className="h-4 w-4 mr-1" />
                        Pausar
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelUpload}
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {/* Compression Result */}
              {compression.result && compression.result.wasCompressed && !isUploading && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">Imagem otimizada!</p>
                  <p className="text-xs text-green-600 mt-1">
                    Original: {formatFileSize(compression.result.originalSize)} -&gt;
                    Otimizado: {formatFileSize(compression.result.compressedSize)}
                    <span className="ml-2 text-green-700 font-medium">
                      ({Math.round((1 - compression.result.compressedSize / compression.result.originalSize) * 100)}% menor)
                    </span>
                  </p>
                </div>
              )}

              {/* Form fields - hidden during upload */}
              {!isUploading && (
                <>
                  <div>
                    <Label htmlFor="caption" className="block mb-1">Legenda</Label>
                    <Input
                      id="caption"
                      name="caption"
                      onChange={handleInputChange}
                      value={formData.caption}
                      placeholder="Descreva esse momento especial"
                      className="w-full"
                    />
                    {!formData.caption && formData.date && (
                      <p className="text-xs text-red-500 mt-1">Por favor, adicione uma legenda</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="date" className="block mb-1">Data</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      onChange={handleInputChange}
                      value={formData.date}
                      className="w-full"
                    />
                    {!formData.date && formData.caption && (
                      <p className="text-xs text-red-500 mt-1">Por favor, selecione a data</p>
                    )}
                  </div>

                  {/* Skip Compression Option */}
                  {fileNeedsCompression && autoCompress && (
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        id="skipCompression"
                        checked={compression.skipCompression}
                        onChange={handleSkipCompressionChange}
                        className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                      />
                      <Label htmlFor="skipCompression" className="text-sm text-gray-700 cursor-pointer">
                        Enviar original (usa mais armazenamento)
                      </Label>
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-between pt-2">
                <Button
                  variant="outline"
                  onClick={()=> setCurrentStep(0)}
                  disabled={isUploading}
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || compression.isCompressing || !formData.caption || !formData.date}
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  {compression.isCompressing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Otimizando...
                    </>
                  ) : isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : 'Enviar'}
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-5 py-2">
              <div className="bg-green-50 p-4 rounded-lg text-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-green-800 font-medium">Foto enviada com sucesso!</p>
                <p className="text-sm text-green-600 mt-1">Agora vamos finalizar configurando sua linha do tempo</p>
              </div>

              <div>
                <Label htmlFor="startDate" className="block mb-2 font-medium">Quando comecou sua historia?</Label>
                <p className="text-sm text-gray-500 mb-3">Esta data sera usada para calcular ha quanto tempo voces estao juntos</p>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full"
                />
                {!startDate && (
                  <p className="text-xs text-red-500 mt-1">Por favor, selecione a data de inicio</p>
                )}
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!startDate}
                className="w-full bg-pink-600 hover:bg-pink-700"
              >
                Concluir
              </Button>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full mx-1 ${index === currentStep ? 'bg-pink-500': 'bg-gray-300'}`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
