-- Create storage buckets (PRIVATE - only accessible by authenticated users)
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-files', 'audio-files', false)
ON CONFLICT (id) DO UPDATE SET public = false;

INSERT INTO storage.buckets (id, name, public)
VALUES ('print-files', 'print-files', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Storage policies for audio-files bucket

-- Users can only view their own audio files
CREATE POLICY "Users can view own audio files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'audio-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Authenticated users can upload audio files to their own folder
CREATE POLICY "Authenticated users can upload audio files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'audio-files' 
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own audio files
CREATE POLICY "Users can update own audio files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'audio-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own audio files
CREATE POLICY "Users can delete own audio files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'audio-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for print-files bucket

-- Users can only view their own print files
CREATE POLICY "Users can view own print files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'print-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Service role can upload print files (for order processing)
CREATE POLICY "Service role can upload print files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'print-files');

-- Service role can update print files
CREATE POLICY "Service role can update print files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'print-files');
