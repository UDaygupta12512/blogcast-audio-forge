-- Allow anyone to view public podcasts
CREATE POLICY "Anyone can view public podcasts"
ON public.podcasts
FOR SELECT
USING (is_public = true);

-- Allow podcast owners to view analytics for public podcasts they don't own
CREATE POLICY "Anyone can view public podcast analytics"
ON public.podcast_analytics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM podcasts 
    WHERE podcasts.id = podcast_analytics.podcast_id 
    AND podcasts.is_public = true
  )
);