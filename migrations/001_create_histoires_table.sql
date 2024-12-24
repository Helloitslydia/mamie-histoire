-- Create Histoires table
CREATE TABLE histoires (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    audio_url TEXT NOT NULL,
    duration INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    description TEXT,
    tags TEXT[]
);

-- Enable Row Level Security
ALTER TABLE histoires ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to view all records
CREATE POLICY "Allow users to view all histoires" ON histoires
    FOR SELECT
    USING (true);

-- Create policy to allow authenticated users to insert their own records
CREATE POLICY "Allow authenticated users to insert histoires" ON histoires
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow users to update their own records
CREATE POLICY "Allow users to update their own histoires" ON histoires
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_histoires_updated_at
    BEFORE UPDATE ON histoires
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
