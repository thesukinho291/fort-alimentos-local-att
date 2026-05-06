
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert events" ON public.analytics_events FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can read events" ON public.analytics_events FOR SELECT TO public USING (true);

CREATE INDEX idx_analytics_event_type ON public.analytics_events (event_type);
CREATE INDEX idx_analytics_created_at ON public.analytics_events (created_at);
