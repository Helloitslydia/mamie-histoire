-- Update policies for histoires table to allow public access
DROP POLICY IF EXISTS "Allow users to view all histoires" ON histoires;
DROP POLICY IF EXISTS "Allow authenticated users to insert histoires" ON histoires;
DROP POLICY IF EXISTS "Allow users to update their own histoires" ON histoires;

CREATE POLICY "Allow public access to histoires" ON histoires
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Update storage policies for public access
DROP POLICY IF EXISTS "Give public access to audio files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload audio files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own audio files" ON storage.objects;

CREATE POLICY "Allow public access to audio files" ON storage.objects
    FOR ALL
    USING (bucket_id = 'audio-records')
    WITH CHECK (bucket_id = 'audio-records');
