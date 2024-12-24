-- Supprimer les anciennes tables et buckets si ils existent
DROP TABLE IF EXISTS public.histoires;
DROP TABLE IF EXISTS public.les_histoires;

-- Supprimer l'ancien bucket s'il existe
DO $$
BEGIN
    DELETE FROM storage.buckets WHERE id = 'audio-records';
    DELETE FROM storage.buckets WHERE id = 'les_audios_records';
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Créer le nouveau bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('les_audios_records', 'les_audios_records', true);

-- Créer la nouvelle table les_histoires
CREATE TABLE public.les_histoires (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    audio_url TEXT NOT NULL,
    duration INTEGER
);

-- Activer RLS (Row Level Security)
ALTER TABLE public.les_histoires ENABLE ROW LEVEL SECURITY;

-- Supprimer toutes les anciennes politiques
DROP POLICY IF EXISTS "mamie_histoire_read_policy" ON public.les_histoires;
DROP POLICY IF EXISTS "mamie_histoire_insert_policy" ON public.les_histoires;
DROP POLICY IF EXISTS "mamie_histoire_storage_policy" ON storage.objects;

-- Créer les nouvelles politiques pour la table les_histoires
CREATE POLICY "mamie_lecture_histoires" ON public.les_histoires
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "mamie_creation_histoires" ON public.les_histoires
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Créer la nouvelle politique pour le stockage
CREATE POLICY "mamie_gestion_audios" ON storage.objects
    FOR ALL
    TO public
    USING (bucket_id = 'les_audios_records')
    WITH CHECK (bucket_id = 'les_audios_records');

-- Donner les permissions nécessaires
GRANT ALL ON public.les_histoires TO anon;
GRANT ALL ON public.les_histoires TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
