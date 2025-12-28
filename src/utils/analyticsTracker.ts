import { supabase } from '@/integrations/supabase/client';

type EventType = 'play' | 'pause' | 'complete' | 'skip' | 'share' | 'download';

export const trackPodcastEvent = async (
  podcastId: string,
  eventType: EventType,
  listenDuration: number = 0
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get device and user agent info
    const userAgent = navigator.userAgent;
    const deviceType = /mobile/i.test(userAgent) ? 'Mobile' : 
                      /tablet/i.test(userAgent) ? 'Tablet' : 'Desktop';

    // Track the event
    await supabase.from('podcast_analytics').insert({
      podcast_id: podcastId,
      user_id: user?.id || null,
      event_type: eventType,
      listen_duration: listenDuration,
      user_agent: userAgent,
      device_type: deviceType,
      // Country and city would ideally come from IP geolocation service
      country: null,
      city: null,
    });

    console.log(`Tracked ${eventType} event for podcast ${podcastId}`);
  } catch (error) {
    console.error('Error tracking podcast event:', error);
  }
};
