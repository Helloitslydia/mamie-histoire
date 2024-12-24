-- Create the storage bucket for audio files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('audio-records', 'audio-records', true);

-- Allow public access to read files
CREATE POLICY "Give public access to audio files" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'audio-records');

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload audio files" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'audio-records' 
        AND auth.role() = 'authenticated'
    );

-- Allow users to update and delete their own files
CREATE POLICY "Allow users to update their own audio files" ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'audio-records' 
        AND auth.uid() = owner
    );

CREATE POLICY "Allow users to delete their own audio files" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'audio-records' 
        AND auth.uid() = owner
    );
