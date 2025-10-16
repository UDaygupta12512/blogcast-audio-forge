-- Create podcast collaborations table
CREATE TABLE public.podcast_collaborations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_one_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_two_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  podcast_one_id UUID NOT NULL REFERENCES public.podcasts(id) ON DELETE CASCADE,
  podcast_two_id UUID NOT NULL REFERENCES public.podcasts(id) ON DELETE CASCADE,
  collab_podcast_id UUID REFERENCES public.podcasts(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.podcast_collaborations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own collaborations"
ON public.podcast_collaborations
FOR SELECT
USING (auth.uid() = creator_one_id OR auth.uid() = creator_two_id);

CREATE POLICY "Users can create collaboration requests"
ON public.podcast_collaborations
FOR INSERT
WITH CHECK (auth.uid() = creator_one_id);

CREATE POLICY "Users can update their collaborations"
ON public.podcast_collaborations
FOR UPDATE
USING (auth.uid() = creator_one_id OR auth.uid() = creator_two_id);

-- Trigger for updated_at
CREATE TRIGGER update_podcast_collaborations_updated_at
BEFORE UPDATE ON public.podcast_collaborations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create community challenges table
CREATE TABLE public.community_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  theme TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active challenges"
ON public.community_challenges
FOR SELECT
USING (is_active = true);

CREATE POLICY "Authenticated users can create challenges"
ON public.community_challenges
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their own challenges"
ON public.community_challenges
FOR UPDATE
USING (auth.uid() = created_by);

-- Trigger for updated_at
CREATE TRIGGER update_community_challenges_updated_at
BEFORE UPDATE ON public.community_challenges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create challenge submissions table
CREATE TABLE public.challenge_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.community_challenges(id) ON DELETE CASCADE,
  podcast_id UUID NOT NULL REFERENCES public.podcasts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, podcast_id)
);

-- Enable RLS
ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view submissions for active challenges"
ON public.challenge_submissions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM community_challenges 
    WHERE community_challenges.id = challenge_submissions.challenge_id 
    AND community_challenges.is_active = true
  )
);

CREATE POLICY "Users can submit their own podcasts to challenges"
ON public.challenge_submissions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own submissions"
ON public.challenge_submissions
FOR DELETE
USING (auth.uid() = user_id);