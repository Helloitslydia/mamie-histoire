'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Anon Key are required');
}

console.log('Initialisation Supabase avec URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

export default function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timer | null>(null);

  useEffect(() => {
    // Vérifier si le navigateur supporte l'API MediaRecorder
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Votre navigateur ne supporte pas l\'enregistrement audio.');
      return;
    }

    // Vérifier les permissions
    navigator.permissions.query({ name: 'microphone' as PermissionName })
      .then(permissionStatus => {
        console.log('Permission status:', permissionStatus.state);
        if (permissionStatus.state === 'denied') {
          setError('L\'accès au microphone a été refusé. Veuillez l\'autoriser dans les paramètres de votre navigateur.');
        }
      });
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      setError(null);
      setStatus('Demande d\'accès au microphone...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false
      });
      
      setStatus('Microphone accessible, démarrage de l\'enregistrement...');
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        console.log('Données audio disponibles:', e.data.size, 'bytes');
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        console.log('Enregistrement arrêté, création du blob...');
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        setStatus('Enregistrement terminé');
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error('Erreur MediaRecorder:', event);
        setError('Une erreur est survenue pendant l\'enregistrement');
      };

      mediaRecorderRef.current.start(1000); // Enregistrer par segments de 1 seconde
      setIsRecording(true);
      setRecordingTime(0);
      setStatus('Enregistrement en cours...');
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Erreur lors du démarrage de l\'enregistrement:', error);
      setError(
        error instanceof Error 
          ? error.message 
          : 'Erreur lors de l\'accès au microphone. Veuillez vérifier les permissions.'
      );
      setStatus('Erreur lors de l\'enregistrement');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        setStatus('Arrêt de l\'enregistrement...');
      } catch (error) {
        console.error('Erreur lors de l\'arrêt de l\'enregistrement:', error);
        setError('Erreur lors de l\'arrêt de l\'enregistrement');
      }
    }
  };

  const saveRecording = async () => {
    if (!audioURL || !title) return;

    try {
      console.log('Début de la sauvegarde...');
      setStatus('Préparation de l\'enregistrement...');
      
      // 1. Récupération du blob
      const response = await fetch(audioURL);
      const blob = await response.blob();
      console.log('Blob créé:', blob.size, 'bytes');
      
      // 2. Préparation du nom de fichier
      const fileName = `${Date.now()}-${title.replace(/\s+/g, '-')}.webm`;
      console.log('Nom du fichier:', fileName);
      
      // 3. Upload du fichier
      setStatus('Upload du fichier audio...');
      console.log('Tentative d\'upload vers le bucket les_audios_records...');
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('les_audios_records')
        .upload(fileName, blob, {
          cacheControl: '3600',
          contentType: 'audio/webm'
        });

      if (uploadError) {
        console.error('Erreur détaillée de l\'upload:', uploadError);
        throw new Error(`Erreur upload: ${uploadError.message}`);
      }

      console.log('Upload réussi:', uploadData);

      // 4. Génération de l'URL publique
      console.log('Génération de l\'URL publique...');
      const { data: { publicUrl } } = supabase.storage
        .from('les_audios_records')
        .getPublicUrl(fileName);

      console.log('URL publique générée:', publicUrl);

      // 5. Sauvegarde dans la base de données
      setStatus('Sauvegarde des informations...');
      console.log('Tentative d\'insertion dans les_histoires...');
      
      const { data: insertData, error: insertError } = await supabase
        .from('les_histoires')
        .insert({
          title,
          description,
          audio_url: publicUrl,
          duration: recordingTime,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Erreur détaillée de l\'insertion:', insertError);
        throw new Error(`Erreur base de données: ${insertError.message}`);
      }

      console.log('Insertion réussie:', insertData);

      // 6. Nettoyage et confirmation
      setTitle('');
      setDescription('');
      setAudioURL(null);
      setRecordingTime(0);
      setStatus('Enregistrement sauvegardé !');
      
      alert('Enregistrement sauvegardé avec succès !');
    } catch (error) {
      console.error('Erreur complète:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue lors de la sauvegarde');
      setStatus('Erreur lors de la sauvegarde');
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {error && (
        <div className="w-full p-4 bg-red-50 text-red-600 rounded-lg text-center">
          {error}
        </div>
      )}
      
      {status && (
        <div className="w-full p-4 bg-blue-50 text-blue-600 rounded-lg text-center">
          {status}
        </div>
      )}
      
      <div className="w-full space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
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
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
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
      </div>
      
      <div className="w-full flex flex-col items-center gap-4">
        {isRecording && (
          <div className="text-2xl font-semibold text-red-500">
            {formatTime(recordingTime)}
          </div>
        )}
        
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

      {audioURL && (
        <div className="w-full space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <audio src={audioURL} controls className="w-full" />
          </div>
          <button
            onClick={saveRecording}
            disabled={!title}
            className="w-full md:w-auto px-8 py-4 rounded-full font-medium text-lg bg-[#9377F2] hover:bg-[#8365f1] text-white transition-all transform hover:scale-105"
          >
            💾 Sauvegarder l'enregistrement
          </button>
        </div>
      )}
    </div>
  );
}
