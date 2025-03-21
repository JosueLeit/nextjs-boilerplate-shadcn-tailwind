import React, {useState, useEffect} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { Button } from './ui/button';
import { Loader2, X, AlertCircle } from 'lucide-react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';

interface FormData {
  image: File | null
  caption: string
  date: string
}

const initialFormData: FormData = {
  image: null,
  caption: '',
  date: ''
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

  useEffect(() => {
    // Verificar se já existem fotos no storage
    const checkPhotosExistence = async () => {
      try {
        const { data, error } = await supabase
          .storage
          .from('vcinesquecivel')
          .list('');
          
        if (error) throw error;
        
        // Filtrar apenas arquivos de imagem
        const photos = data?.filter(file => file.name.match(/\.(jpg|jpeg|png|gif)$/i));
        setIsFirstPhoto(photos?.length === 0);
        
        // Se já existe uma data de início, usá-la
        if (existingStartDate) {
          setStartDate(existingStartDate);
        }
      } catch (err) {
        console.error("Erro ao verificar fotos existentes:", err);
        // Por precaução, considerar que não é a primeira foto
        setIsFirstPhoto(false);
      }
    };
    
    checkPhotosExistence();
  }, [existingStartDate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files && e.target.files[0]) {
      setFormData({...formData, image: e.target.files[0]});
      setImageError(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>{
    const {name, value} = e.target
    setFormData({...formData, [name]: value});
  }

  const handleUpload = async () => {
    if(!formData.image || !formData.caption || !formData.date) return;

    setIsUploading(true);
    setError(null);

    const file = formData.image
    const fileExt = file.name.split('.').pop();
    
    // Garantir que a data está no formato YYYY-MM-DD
    const date = formData.date;
    // Remover caracteres especiais e espaços da legenda para o nome do arquivo
    const safeCaption = formData.caption.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
    
    const fileName = `${date}-${safeCaption}.${fileExt}`

    try {
      const { error } = await supabase.storage
      .from('vcinesquecivel')
      .upload(fileName, file)

      if (error) throw error
      
      // Se é a primeira foto e não tem data de início, vá para o passo de confirmar
      // Caso contrário, finalize o upload
      if (isFirstPhoto && !existingStartDate) {
        setCurrentStep(currentStep + 1);
      } else {
        // Finalizar usando a data existente ou vazia
        onComplete(existingStartDate || '');
      }
    } catch (error: any) {
      console.error('Error uploading file:', error)
      setError(error.message || 'Erro ao fazer upload da imagem. Tente novamente.')
    } finally {
      setIsUploading(false);
    }
  }

  const handleSubmit = () => {
    onComplete(startDate)
  }

  const handleClose = () => {
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
              
              {formData.image && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Arquivo selecionado:</p>
                  <p className="text-sm font-medium truncate">{formData.image.name}</p>
                </div>
              )}
              
              <Button 
                onClick={handleNextStep}
                className="w-full"
              >
                Próximo
              </Button>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
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
              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={()=> setCurrentStep(0)}>Voltar</Button>
                <Button 
                  onClick={handleUpload} 
                  disabled={isUploading || !formData.caption || !formData.date}
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :'Enviar'} 
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
                <Label htmlFor="startDate" className="block mb-2 font-medium">Quando começou sua história?</Label>
                <p className="text-sm text-gray-500 mb-3">Esta data será usada para calcular há quanto tempo vocês estão juntos</p>
                <Input 
                  id="startDate" 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  className="w-full"
                />
                {!startDate && (
                  <p className="text-xs text-red-500 mt-1">Por favor, selecione a data de início</p>
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
