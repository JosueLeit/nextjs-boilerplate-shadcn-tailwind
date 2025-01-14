import React, {useState} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { Button } from './ui/button';
import { Loader2, X } from 'lucide-react';
import { Label } from './ui/label';
import { Input } from './ui/input';

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

export default function PhotoUploadForm({onComplete}: { onComplete: (startDate: string) => void}){
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [startDate, setStartDate] = useState('');
  const [isUploading, setIsUploading] = useState(false);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files && e.target.files[0]) {
      setFormData({...formData, image: e.target.files[0]});
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>{
    const {name, value} = e.target
    setFormData({...formData, [name]: value});
  }

  const handleUpload = async () => {
    if(!formData.image || !formData.caption || !formData.date) return;

    setIsUploading(true);

    const file = formData.image
    const fileExt = file.name.split('.').pop();
    const fileName = `${formData.date}-${formData.caption}.${fileExt}`

    try {
      const { error } = await supabase.storage
      .from('vcinesquecivel')
      .upload(fileName, file)

      if (error) throw error
      setCurrentStep(currentStep +1)
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setIsUploading(false);
    }
  }

  const handleSubmit = () => {
    onComplete(startDate)
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity:0, scale:0.8 }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{steps[currentStep]}</h2>
            <Button 
              variant="ghost"
              size="icon"
              onClick={() => setCurrentStep(0)}
            >
              <X className="h-6 w-6"/>
            </Button>
          </div>

          {currentStep === 0 && (
            <div className="space-y-4">
              <Label htmlFor="image">Upload Image</Label>
              <Input id="image" type="file" onChange={handleFileChange} accept="image/*"/>
              <Button onClick={() => setCurrentStep(1)} disabled={!formData.image}>Next</Button>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="caption">Caption</Label>
                <Input id="caption" name="caption" onChange={handleInputChange} value={formData.caption} placeholder="Enter caption"/>
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" onChange={handleInputChange} value={formData.date}/>
              </div>
              <div className="flex justify-between">
                <Button onClick={()=> setCurrentStep(0)}>Back</Button>
                <Button onClick={handleUpload} disabled={isUploading || !formData.caption || !formData.date}>
                  {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :'Upload'} 
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              {/* <div>
                <Label htmlFor="startDate">When did your relationship start?</Label>
                <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div> */}
                 {/* <Button onClick={handleSubmit} disabled={!startDate}>Complete</Button> */}
                 <Button onClick={handleSubmit}>Complete</Button>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full mx-1 ${index === currentStep ? 'bg-blue-500': 'bg-gray-300'}`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
