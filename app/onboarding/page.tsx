'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Calendar, Camera, Check, Loader2, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { completeOnboarding, supabase } from '@/lib/supabaseClient'
import { toast } from '@/components/ui/use-toast'

const steps = [
  { id: 'welcome', title: 'Bem-vindo', icon: Heart },
  { id: 'date', title: 'Data Especial', icon: Calendar },
  { id: 'photo', title: 'Primeira Memória', icon: Camera },
  { id: 'complete', title: 'Pronto!', icon: Check },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [relationshipDate, setRelationshipDate] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [photoDate, setPhotoDate] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleComplete = async () => {
    if (!user?.id || !relationshipDate) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos obrigatórios.',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)

    try {
      // Upload photo if selected
      if (selectedFile && caption && photoDate) {
        const fileExt = selectedFile.name.split('.').pop()
        const safeCaption = caption
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')

        const fileName = `${photoDate}-${safeCaption}.${fileExt}`
        const fullPath = `${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('vcinesquecivel')
          .upload(fullPath, selectedFile)

        if (uploadError) {
          console.error('[ONBOARDING] Erro no upload:', uploadError)
          // Continue even if upload fails - we can add photo later
        }
      }

      // Complete onboarding
      await completeOnboarding(user.id, relationshipDate)

      toast({
        title: 'Tudo pronto!',
        description: 'Sua linha do tempo foi criada com sucesso.'
      })

      router.push('/')
    } catch (error: any) {
      console.error('[ONBOARDING] Erro:', error)
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível completar o cadastro.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true // Welcome
      case 1: return !!relationshipDate // Date
      case 2: return true // Photo is optional
      case 3: return true // Complete
      default: return false
    }
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex flex-col items-center justify-center p-4">
      {/* Progress indicator */}
      <div className="mb-8 flex items-center space-x-2">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                index <= currentStep
                  ? 'bg-pink-500 text-white'
                  : 'bg-white text-gray-400 border-2 border-gray-200'
              }`}
            >
              <step.icon className="w-5 h-5" />
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-1 rounded transition-all ${
                  index < currentStep ? 'bg-pink-500' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Content card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md min-h-[400px] flex flex-col">
        <AnimatePresence mode="wait" custom={currentStep}>
          <motion.div
            key={currentStep}
            custom={currentStep}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            {/* Step 0: Welcome */}
            {currentStep === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mb-6">
                  <Heart className="w-10 h-10 text-pink-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                  Bem-vindo ao FavoritePerson
                </h1>
                <p className="text-gray-600 mb-6">
                  Vamos criar sua linha do tempo de memórias especiais.
                  Em poucos passos você terá seu mural de fotos pronto!
                </p>
              </div>
            )}

            {/* Step 1: Relationship Date */}
            {currentStep === 1 && (
              <div className="flex-1 flex flex-col">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-pink-500" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    Quando tudo começou?
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Selecione a data em que o relacionamento começou.
                    Isso será usado para calcular quanto tempo vocês estão juntos.
                  </p>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <Label htmlFor="relationshipDate" className="mb-2 font-medium">
                    Data do relacionamento
                  </Label>
                  <Input
                    id="relationshipDate"
                    type="date"
                    value={relationshipDate}
                    onChange={(e) => setRelationshipDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="text-center text-lg"
                  />
                </div>
              </div>
            )}

            {/* Step 2: First Photo */}
            {currentStep === 2 && (
              <div className="flex-1 flex flex-col">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-8 h-8 text-pink-500" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    Sua primeira memória
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Adicione sua primeira foto especial. Você pode pular e adicionar depois.
                  </p>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <Label htmlFor="photo" className="mb-2 block font-medium">
                      Foto (opcional)
                    </Label>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                    {selectedFile && (
                      <p className="text-sm text-green-600 mt-1">
                        {selectedFile.name}
                      </p>
                    )}
                  </div>
                  {selectedFile && (
                    <>
                      <div>
                        <Label htmlFor="caption" className="mb-2 block font-medium">
                          Legenda
                        </Label>
                        <Input
                          id="caption"
                          type="text"
                          value={caption}
                          onChange={(e) => setCaption(e.target.value)}
                          placeholder="Descreva esse momento..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="photoDate" className="mb-2 block font-medium">
                          Data da foto
                        </Label>
                        <Input
                          id="photoDate"
                          type="date"
                          value={photoDate}
                          onChange={(e) => setPhotoDate(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Complete */}
            {currentStep === 3 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <Check className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Tudo pronto!
                </h2>
                <p className="text-gray-600 mb-6">
                  Sua linha do tempo está configurada. Clique em "Começar" para
                  ver seu mural de memórias e adicionar mais fotos.
                </p>
                <div className="bg-pink-50 rounded-lg p-4 w-full">
                  <p className="text-sm text-pink-700">
                    <strong>Dica:</strong> Você poderá gerar um QR Code para
                    compartilhar suas memórias com pessoas especiais!
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0 || isLoading}
            className={currentStep === 0 ? 'invisible' : ''}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed() || isLoading}
              className="bg-pink-500 hover:bg-pink-600"
            >
              Próximo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={isLoading}
              className="bg-pink-500 hover:bg-pink-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  Começar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
