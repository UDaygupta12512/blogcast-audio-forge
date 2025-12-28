-- Create analytics events table to track podcast interactions
CREATE TABLE public.podcast_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  podcast_id UUID NOT NULL REFERENCES public.podcasts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('play', 'pause', 'complete', 'skip', 'share', 'download')),
  listen_duration INTEGER DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_agent TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT
);

-- Create index for faster queries
CREATE INDEX idx_podcast_analytics_podcast_id ON public.podcast_analytics(podcast_id);
CREATE INDEX idx_podcast_analytics_user_id ON public.podcast_analytics(user_id);
CREATE INDEX idx_podcast_analytics_timestamp ON public.podcast_analytics(timestamp);
CREATE INDEX idx_podcast_analytics_event_type ON public.podcast_analytics(event_type);

-- Enable RLS
ALTER TABLE public.podcast_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics
CREATE POLICY "Users can view analytics for their own podcasts"
ON public.podcast_analytics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.podcasts
    WHERE podcasts.id = podcast_analytics.podcast_id
    AND podcasts.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can insert analytics events"
ON public.podcast_analytics
FOR INSERT
WITH CHECK (true);

-- Create podcast series table
CREATE TABLE public.podcast_series (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.podcast_series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own series"
ON public.podcast_series
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own series"
ON public.podcast_series
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own series"
ON public.podcast_series
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own series"
ON public.podcast_series
FOR DELETE
USING (auth.uid() = user_id);

-- Add series_id to podcasts table
ALTER TABLE public.podcasts ADD COLUMN series_id UUID REFERENCES public.podcast_series(id) ON DELETE SET NULL;
ALTER TABLE public.podcasts ADD COLUMN episode_number INTEGER;
ALTER TABLE public.podcasts ADD COLUMN is_public BOOLEAN DEFAULT false;
ALTER TABLE public.podcasts ADD COLUMN rss_enabled BOOLEAN DEFAULT false;

-- Create podcast comments table
CREATE TABLE public.podcast_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  podcast_id UUID NOT NULL REFERENCES public.podcasts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.podcast_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments on public podcasts"
ON public.podcast_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.podcasts
    WHERE podcasts.id = podcast_comments.podcast_id
    AND podcasts.is_public = true
  )
);

CREATE POLICY "Authenticated users can create comments"
ON public.podcast_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON public.podcast_comments
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.podcast_comments
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for series updated_at
CREATE TRIGGER update_podcast_series_updated_at
BEFORE UPDATE ON public.podcast_series
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for comments updated_at
CREATE TRIGGER update_podcast_comments_updated_at
BEFORE UPDATE ON public.podcast_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();