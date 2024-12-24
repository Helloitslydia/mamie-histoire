-- Vérifier si le bucket existe, sinon le créer
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'les_audios_records'
    ) THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('les_audios_records', 'les_audios_records', true);
    END IF;
END $$;

-- Vérifier si la table existe, sinon la créer
CREATE TABLE IF NOT EXISTS public.les_histoires (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    audio_url TEXT NOT NULL,
    duration INTEGER
);

-- Activer RLS
ALTER TABLE public.les_histoires ENABLE ROW LEVEL SECURITY;

-- Supprimer toutes les anciennes politiques
DROP POLICY IF EXISTS "mamie_lecture_histoires" ON public.les_histoires;
DROP POLICY IF EXISTS "mamie_creation_histoires" ON public.les_histoires;
DROP POLICY IF EXISTS "mamie_gestion_audios" ON storage.objects;

-- Recréer les politiques
CREATE POLICY "mamie_lecture_histoires" ON public.les_histoires
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "mamie_creation_histoires" ON public.les_histoires
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "mamie_gestion_audios" ON storage.objects
    FOR ALL
    TO public
    USING (bucket_id = 'les_audios_records')
    WITH CHECK (bucket_id = 'les_audios_records');

-- Donner les permissions
GRANT ALL ON public.les_histoires TO anon;
GRANT ALL ON public.les_histoires TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Afficher les tables et buckets existants pour vérification
SELECT 'Tables existantes:' as info;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

SELECT 'Buckets existants:' as info;
SELECT * FROM storage.buckets;
