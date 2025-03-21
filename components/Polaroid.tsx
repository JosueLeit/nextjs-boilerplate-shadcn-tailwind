import React, { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { X, Trash2, Edit, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { supabase } from '@/lib/supabaseClient'

interface PolaroidProps {
  imageUrl: string
  caption: string
  date: string
  onDelete?: () => void
  onEdit?: (newCaption: string, newDate: string) => void
  fileName?: string
}

const Polaroid: React.FC<PolaroidProps> = ({ imageUrl, caption, date, onDelete, onEdit, fileName }) => {
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState(caption);
  const [editedDate, setEditedDate] = useState(date);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const formattedDate = () => {
    try {
      return format(new Date(date), "d 'de' MMMM, yyyy", { locale: ptBR });
    } catch (error) {
      return date;
    }
  }

  const handleDelete = async () => {
    if (!fileName) return;
    
    try {
      setIsDeleting(true);
      
      // Extrair o nome do arquivo da URL
      const fileNameFromUrl = fileName;
      
      const { error } = await supabase.storage
        .from('vcinesquecivel')
        .remove([fileNameFromUrl]);
      
      if (error) throw error;
      
      if (onDelete) onDelete();
      setExpanded(false);
    } catch (error) {
      console.error('Erro ao deletar a imagem:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!fileName || !onEdit) return;
    
    try {
      setIsSaving(true);
      
      onEdit(editedCaption, editedDate);
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao editar a imagem:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <motion.div 
        className="bg-white p-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer rounded-sm"
        whileHover={{ rotate: 0, y: -5 }}
        initial={{ rotate: Math.random() * 6 - 3 }}
        layoutId={`polaroid-${imageUrl}`}
        onClick={() => setExpanded(true)}
      >
        <div className="w-full h-56 overflow-hidden rounded-sm mb-2 bg-gray-100">
          <img src={imageUrl} alt={caption} className="w-full h-full object-cover" />
        </div>
        <div className="p-2 text-center">
          <p className="font-handwriting text-base text-gray-800">{caption}</p>
          <p className="text-xs text-gray-500 mt-1 font-light">{formattedDate()}</p>
        </div>
      </motion.div>

      {expanded && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <motion.div 
            layoutId={`polaroid-${imageUrl}`}
            className="bg-white p-6 rounded-lg shadow-2xl max-w-2xl w-full"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex space-x-2">
                {!isEditing ? (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsEditing(true)}
                      disabled={!onEdit}
                    >
                      <Edit size={16} className="mr-1" /> Editar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={handleDelete}
                      disabled={isDeleting || !onDelete}
                    >
                      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 size={16} className="mr-1" />} 
                      {isDeleting ? 'Deletando...' : 'Deletar'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null} 
                      {isSaving ? 'Salvando...' : 'Salvar'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setIsEditing(false);
                        setEditedCaption(caption);
                        setEditedDate(date);
                      }}
                    >
                      Cancelar
                    </Button>
                  </>
                )}
              </div>
              <button 
                onClick={() => setExpanded(false)}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="w-full max-h-[70vh] overflow-hidden rounded-md">
              <img src={imageUrl} alt={caption} className="w-full h-full object-contain" />
            </div>
            <div className="p-4 text-center">
              {!isEditing ? (
                <>
                  <p className="font-handwriting text-xl">{caption}</p>
                  <p className="text-sm text-gray-600 mt-2">{formattedDate()}</p>
                </>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Legenda</label>
                    <input 
                      type="text" 
                      value={editedCaption} 
                      onChange={(e) => setEditedCaption(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                    <input 
                      type="date" 
                      value={editedDate} 
                      onChange={(e) => setEditedDate(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}

export default Polaroid
