'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface RelationshipTimerProps {
  initialDate?: string;
  className?: string;
}

export default function RelationshipTimer({ initialDate, className = "" }: RelationshipTimerProps) {
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState<{
    years: number;
    months: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null)

  useEffect(() => {
    if (initialDate) {
      setStartDate(new Date(initialDate));
    }
  }, [initialDate]);

  useEffect(() => {
    if (startDate) {
      const timer = setInterval(() => {
        const now = new Date()
        const difference = now.getTime() - startDate.getTime()

        const years = Math.floor(difference / (1000 * 60 * 60 * 24 * 365.25))
        const months = Math.floor((difference % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44))
        const days = Math.floor((difference % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setElapsedTime({ years, months, days, hours, minutes, seconds })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [startDate])

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value)
    if (!isNaN(date.getTime())) {
      setStartDate(date)
    }
  }

  const formatTimeFull = () => {
    if (!elapsedTime) return '';
    
    const { years, months, days, hours, minutes, seconds } = elapsedTime;
    const parts = [];
    
    if (years > 0) parts.push(`${years} ${years === 1 ? 'ano' : 'anos'}`);
    if (months > 0) parts.push(`${months} ${months === 1 ? 'mês' : 'meses'}`);
    if (days > 0) parts.push(`${days} ${days === 1 ? 'dia' : 'dias'}`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}min`);
    parts.push(`${seconds}s`);
    
    // Mostrar todas as unidades de tempo, mantendo o formato de cronômetro
    return parts.join(', ');
  }

  if (!initialDate && !startDate) {
    return (
      <div className={`${className} inline-flex items-center`}>
        <Input
          type="date"
          id="start-date"
          onChange={handleStartDateChange}
          max={new Date().toISOString().split('T')[0]}
          className="w-40"
          placeholder="Escolha uma data"
        />
      </div>
    );
  }

  return (
    <div className={`${className} inline-flex items-center`}>
      {elapsedTime && (
        <p className="text-gray-600 font-medium">
          <span className="font-bold">{formatTimeFull()}</span>
        </p>
      )}
    </div>
  );
}

