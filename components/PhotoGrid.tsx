import React from 'react';
import { Photo } from '@/types';
import Polaroid from './Polaroid';

interface PhotoGridProps {
  photos: Photo[];
  onDeletePhoto: (id: string) => void;
}

export default function PhotoGrid({ photos, onDeletePhoto }: PhotoGridProps) {
  // Organizar fotos por ano e mês
  const organizedPhotos = photos.reduce((acc, photo) => {
    try {
      // Garantir que a data é válida
      let date = new Date(photo.date);
      
      // Verificar se é uma data válida
      if (isNaN(date.getTime())) {
        // Tentar parse em outro formato
        if (photo.date.includes('/')) {
          const parts = photo.date.split('/');
          if (parts.length === 3) {
            // Formato DD/MM/YYYY
            date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          }
        }
        
        // Se ainda for inválida, usar a data atual como fallback
        if (isNaN(date.getTime())) {
          console.error(`Data inválida para foto: ${photo.id}, data: ${photo.date}`);
          date = new Date(); // Fallback para data atual
        }
      }
      
      const year = date.getFullYear();
      const month = date.getMonth();
      
      if (!acc[year]) {
        acc[year] = {};
      }
      
      if (!acc[year][month]) {
        acc[year][month] = [];
      }
      
      acc[year][month].push(photo);
    } catch (error) {
      console.error(`Erro ao processar foto: ${photo.id}`, error);
      // Se houver erro, colocar em um grupo especial
      if (!acc[9999]) {
        acc[9999] = {};
      }
      if (!acc[9999][0]) {
        acc[9999][0] = [];
      }
      acc[9999][0].push(photo);
    }
    
    return acc;
  }, {} as Record<number, Record<number, Photo[]>>);
  
  // Meses em português
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Ordenar os anos em ordem decrescente (mais recente primeiro)
  const sortedYears = Object.keys(organizedPhotos)
    .map(Number)
    .filter(year => year !== 9999) // Remover o ano especial de erro
    .sort((a, b) => b - a);

  // Verificar se temos fotos com problemas de data
  const hasProblematicPhotos = organizedPhotos[9999] && organizedPhotos[9999][0]?.length > 0;

  return (
    <div className="space-y-12">
      {sortedYears.map(year => (
        <div key={year} className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b">{year}</h2>
          
          {Object.keys(organizedPhotos[year])
            .map(Number)
            .sort((a, b) => b - a) // Ordenar meses em ordem decrescente
            .map(month => (
              <div key={`${year}-${month}`} className="mb-8">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">{monthNames[month]}</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {organizedPhotos[year][month].map(photo => (
                    <Polaroid 
                      key={photo.id} 
                      photo={photo} 
                      onDelete={() => onDeletePhoto(photo.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      ))}
      
      {/* Exibir fotos com problemas de data, se houver */}
      {hasProblematicPhotos && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b text-amber-600">
            Outras Fotos
            <span className="ml-2 text-sm font-normal text-amber-500">(datas não reconhecidas)</span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {organizedPhotos[9999][0].map(photo => (
              <Polaroid 
                key={photo.id} 
                photo={photo} 
                onDelete={() => onDeletePhoto(photo.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 