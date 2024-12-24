'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [status, setStatus] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string>('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const supabaseRef = useRef<any>(null);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      setError('Configuration Supabase manquante');
      return;
    }

    try {
      supabaseRef.current = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false
        }
      });
    } catch (err) {
      setError('Erreur lors de l\'initialisation de Supabase');
      console.error('Erreur Supabase:', err);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      chunksRef.current = [];
      setError('');
      setStatus('Démarrage de l\'enregistrement...');

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        setStatus('Enregistrement terminé');
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setDuration(0);
      
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      setStatus('Enregistrement en cours...');
    } catch (error) {
      console.error('Erreur lors du démarrage de l\'enregistrement:', error);
      setError('Impossible d\'accéder au microphone. Veuillez vérifier les permissions.');
      setStatus('Erreur');
    }
  };

  const stopRecording = async () => {
    try {
      setStatus('Arrêt de l\'enregistrement...');
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setIsRecording(false);
      }
    } catch (error) {
      console.error('Erreur lors de l\'arrêt de l\'enregistrement:', error);
      setError('Erreur lors de l\'arrêt de l\'enregistrement');
      setStatus('Erreur');
    }
  };

  const saveRecording = async () => {
    if (!audioBlob || !title || !supabaseRef.current) {
      setError('Impossible de sauvegarder l\'enregistrement. Veuillez réessayer.');
      return;
    }

    try {
      setStatus('Enregistrement en cours de sauvegarde...');
      setError('');

      // Créer un nom de fichier unique
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}_${title.replace(/\s+/g, '_')}.webm`;

      // Upload du fichier audio
      const { data: uploadData, error: uploadError } = await supabaseRef.current.storage
        .from('les_audios_records')
        .upload(fileName, audioBlob);

      if (uploadError) throw uploadError;

      // Récupérer l'URL publique
      const { data: { publicUrl } } = await supabaseRef.current.storage
        .from('les_audios_records')
        .getPublicUrl(fileName);

      // Sauvegarder les métadonnées dans la base de données
      const { error: dbError } = await supabaseRef.current
        .from('les_histoires')
        .insert([
          {
            title,
            description: description || null,
            audio_url: publicUrl,
            duration: duration
          }
        ]);

      if (dbError) throw dbError;

      setStatus('Enregistrement sauvegardé avec succès!');
      setAudioBlob(null);
      setTitle('');
      setDescription('');
      setDuration(0);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setError('Erreur lors de la sauvegarde de l\'enregistrement');
      setStatus('Erreur');
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg text-center">
          {error}
        </div>
      )}

      {status && (
        <div className="text-gray-600 text-center">
          {status}
          {isRecording && duration > 0 && (
            <span className="ml-2">
              ({Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')})
            </span>
          )}
        </div>
      )}

      {!audioBlob ? (
        <div className="flex justify-center">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-full md:w-auto px-8 py-4 rounded-full font-medium text-lg transition-all transform hover:scale-105 ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                : 'bg-[#9377F2] hover:bg-[#8365f1] text-white'
            }`}
          >
            {isRecording ? '⏹️ Arrêter l\'enregistrement' : '🎤 Commencer l\'enregistrement'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-gray-700">
              Titre de l'histoire
            </label>
            <input
              id="title"
              type="text"
              placeholder="Titre de l'histoire"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#9377F2] focus:ring-2 focus:ring-[#9377F2] transition-colors mb-4"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-gray-700">
              Description (optionnelle)
            </label>
            <textarea
              id="description"
              placeholder="Description (optionnelle)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#9377F2] focus:ring-2 focus:ring-[#9377F2] transition-colors mb-4 h-24 resize-none"
            />
          </div>

          <audio src={URL.createObjectURL(audioBlob)} controls className="w-full" />

          <div className="flex justify-center">
            <button
              onClick={saveRecording}
              disabled={!title}
              className="w-full md:w-auto px-8 py-4 rounded-full font-medium text-lg bg-[#9377F2] hover:bg-[#8365f1] text-white transition-all transform hover:scale-105"
            >
              💾 Sauvegarder l'enregistrement
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
