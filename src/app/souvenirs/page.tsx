'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

interface Histoire {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  audio_url: string;
  duration: number;
}

export default function Souvenirs() {
  const [souvenirs, setSouvenirs] = useState<Histoire[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const fetchSouvenirs = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('les_histoires')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setSouvenirs(data || []);
      } catch (err) {
        console.error('Erreur lors de la récupération des souvenirs:', err);
        setError('Impossible de charger les souvenirs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSouvenirs();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-6xl font-bold text-center mb-6 text-gray-900 tracking-tight">
          Mamie Vouziers
        </h1>
        <p className="text-center text-gray-600 mb-12 text-xl font-light tracking-wide">
          Les histoires de Mamie Vouziers ❤️
        </p>

        <div className="max-w-4xl mx-auto space-y-6 min-h-[300px] relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-transparent">
              <div className="space-y-4 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-r-purple-400"></div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
              <p className="text-red-500 text-lg font-light">
                {error}
              </p>
            </div>
          ) : souvenirs.length === 0 ? (
            <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
              <p className="text-gray-500 text-lg font-light">
                Aucun souvenir enregistré pour le moment.
              </p>
            </div>
          ) : (
            souvenirs.map((souvenir) => (
              <div 
                key={souvenir.id} 
                className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 transform transition-all duration-300 ease-out hover:shadow-xl border border-purple-50 hover:translate-y-[-2px]"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-medium text-gray-800 mb-2">
                      {souvenir.title}
                    </h2>
                    <p className="text-sm text-gray-500 font-light">
                      Enregistré le {formatDate(souvenir.created_at)}
                    </p>
                    {souvenir.duration && (
                      <p className="text-sm text-gray-500 font-light">
                        Durée: {formatDuration(souvenir.duration)}
                      </p>
                    )}
                  </div>
                </div>

                {souvenir.description && (
                  <p className="text-gray-600 mb-4 font-light">
                    {souvenir.description}
                  </p>
                )}

                <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4">
                  <audio 
                    controls 
                    className="w-full"
                    src={souvenir.audio_url}
                  >
                    Votre navigateur ne supporte pas la lecture audio
                  </audio>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
