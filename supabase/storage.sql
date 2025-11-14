-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-files', 'audio-files', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('print-files', 'print-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for audio-files bucket

-- Anyone can view audio files (public bucket)
CREATE POLICY "Public audio files are viewable by everyone" ON storage.objects
  FOR SELECT USING (bucket_id = 'audio-files');

-- Authenticated users can upload audio files
CREATE POLICY "Authenticated users can upload audio files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'audio-files' 
    AND auth.role() = 'authenticated'
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

-- Anyone can view print files (public bucket)
CREATE POLICY "Public print files are viewable by everyone" ON storage.objects
  FOR SELECT USING (bucket_id = 'print-files');

-- Service role can upload print files
CREATE POLICY "Service role can upload print files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'print-files');

-- Service role can update print files
CREATE POLICY "Service role can update print files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'print-files');
