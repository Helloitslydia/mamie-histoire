-- Supprimer la table si elle existe
DROP TABLE IF EXISTS public.histoires;

-- Créer la table histoires
CREATE TABLE public.histoires (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    audio_url TEXT NOT NULL,
    duration INTEGER
);

-- Activer RLS (Row Level Security)
ALTER TABLE public.histoires ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Enable read access for all users" ON public.histoires;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.histoires;

-- Créer de nouvelles politiques pour la table histoires
CREATE POLICY "mamie_histoire_read_policy" ON public.histoires
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "mamie_histoire_insert_policy" ON public.histoires
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Supprimer les anciennes politiques de storage
DROP POLICY IF EXISTS "Give public access to audio files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload audio files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to audio files" ON storage.objects;

-- Créer une nouvelle politique de storage
CREATE POLICY "mamie_histoire_storage_policy" ON storage.objects
    FOR ALL
    TO public
    USING (bucket_id = 'audio-records')
    WITH CHECK (bucket_id = 'audio-records');

-- Donner les permissions nécessaires
GRANT ALL ON public.histoires TO anon;
GRANT ALL ON public.histoires TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
