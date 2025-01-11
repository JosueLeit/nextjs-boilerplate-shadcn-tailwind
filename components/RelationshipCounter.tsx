'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function RelationshipCounter() {
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState<string>('')

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

        setElapsedTime(`${years}a ${months}m ${days}d ${hours}h ${minutes}m ${seconds}s`)
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

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Cronômetro do Amor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
            <label htmlFor="start-date" className="text-sm font-medium text-gray-700">
            Quando o seu relacionamento começou?
          </label>
          <Input
            type="date"
            id="start-date"
            onChange={handleStartDateChange}
            max={new Date().toISOString().split('T')[0]}
            />
        </div>
        {startDate && (
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">Corações batendo juntos a..</p>
            <p className="text-3xl text-pink-500 font-bold text-primary">{elapsedTime}</p>
          </div>
        )}
        {!startDate && (
          <p className="text-center text-gray-500">Coloque a data do inicio do relacionamento para ver seu tempo juntos!</p>
        )}
      </CardContent>
    </Card>
  )
}

