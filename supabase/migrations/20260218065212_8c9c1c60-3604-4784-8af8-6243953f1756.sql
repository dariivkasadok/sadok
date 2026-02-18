
CREATE TABLE public.app_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on app_settings"
ON public.app_settings
FOR ALL
USING (true)
WITH CHECK (true);

-- Insert default settings row
INSERT INTO public.app_settings (key, value)
VALUES ('global', '{"themeColor":"","font":"Nunito","radius":"0.75rem","isDark":false,"bgColor":"","bgImage":"","bgOpacity":100}'::jsonb);

-- Trigger for updated_at
CREATE TRIGGER update_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
