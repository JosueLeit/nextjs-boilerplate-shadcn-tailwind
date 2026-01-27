import React, { useState, useEffect } from 'react';

interface RelationshipTimerProps {
  startDate: string;
}

export default function RelationshipTimer({ startDate }: RelationshipTimerProps) {
  const [timeElapsed, setTimeElapsed] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeElapsed = () => {
      // Ajustar a data para meia-noite no fuso horário local
      const start = new Date(startDate + 'T00:00:00');
      const now = new Date();
      
      // Calcular anos e meses
      let years = now.getFullYear() - start.getFullYear();
      let months = now.getMonth() - start.getMonth();
      
      if (months < 0) {
        years--;
        months += 12;
      }
      
      // Calcular dias considerando o fuso horário
      const tempDate = new Date(start);
      tempDate.setFullYear(now.getFullYear());
      tempDate.setMonth(now.getMonth());
      
      let days = now.getDate() - tempDate.getDate();
      if (days < 0) {
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        days += lastDayOfMonth;
        months--;
        if (months < 0) {
          months = 11;
          years--;
        }
      }
      
      // Calcular horas, minutos e segundos
      const diffMs = now.getTime() - new Date(
        now.getFullYear() - years, 
        now.getMonth() - months, 
        now.getDate() - days, 
        start.getHours(), 
        start.getMinutes(), 
        start.getSeconds()
      ).getTime();
      
      const diffSecs = Math.floor(diffMs / 1000);
      const hours = Math.floor(diffSecs / 3600) % 24;
      const minutes = Math.floor(diffSecs / 60) % 60;
      const seconds = diffSecs % 60;
      
      setTimeElapsed({ years, months, days, hours, minutes, seconds });
    };
    
    // Calcular imediatamente
    calculateTimeElapsed();
    
    // Atualizar a cada segundo
    const timer = setInterval(calculateTimeElapsed, 1000);
    
    return () => clearInterval(timer);
  }, [startDate]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-center text-xl font-semibold text-gray-700 mb-3">
        Estamos juntos há
      </h2>
      <div className="flex flex-wrap justify-center gap-4">
        <TimeUnit value={timeElapsed.years} label="anos" />
        <TimeUnit value={timeElapsed.months} label="meses" />
        <TimeUnit value={timeElapsed.days} label="dias" />
        <TimeUnit value={timeElapsed.hours} label="horas" />
        <TimeUnit value={timeElapsed.minutes} label="minutos" />
        <TimeUnit value={timeElapsed.seconds} label="segundos" />
      </div>
      <p className="text-center text-sm text-gray-500 mt-4">
        Desde {new Date(startDate + 'T00:00:00').toLocaleDateString('pt-BR')}
      </p>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number, label: string }) {
  return (
    <div className="bg-pink-50 px-3 py-2 rounded-lg text-center min-w-[80px]">
      <div className="text-2xl font-bold text-pink-600">{value}</div>
      <div className="text-sm text-pink-700">{label}</div>
    </div>
  );
} 