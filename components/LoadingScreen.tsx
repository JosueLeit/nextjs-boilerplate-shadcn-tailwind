import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-50">
      <Loader2 className="h-12 w-12 text-pink-600 animate-spin mb-4" />
      <p className="text-lg font-medium text-gray-700">Carregando...</p>
    </div>
  );
} 