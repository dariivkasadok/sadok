import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AppSettings {
  themeColor: string;
  font: string;
  radius: string;
  isDark: boolean;
  bgColor: string;
  bgImage: string;
  bgOpacity: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  themeColor: "",
  font: "Nunito",
  radius: "0.75rem",
  isDark: false,
  bgColor: "",
  bgImage: "",
  bgOpacity: 100,
};

export const loadSettings = (): AppSettings => {
  try {
    const saved = localStorage.getItem("app-settings");
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch {}
  return DEFAULT_SETTINGS;
};

export const saveSettingsToDb = async (settings: AppSettings) => {
  const { bgImage, ...dbSettings } = settings;
  await supabase
    .from("app_settings")
    .update({ value: JSON.parse(JSON.stringify(dbSettings)) })
    .eq("key", "global");
};

export const loadSettingsFromDb = async (): Promise<Partial<AppSettings>> => {
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "global")
    .single();
  if (data?.value && typeof data.value === "object") {
    return data.value as unknown as Partial<AppSettings>;
  }
  return {};
};

export const applyBackgroundSettings = (settings: AppSettings) => {
  const body = document.body;
  const hasBg = settings.bgColor || settings.bgImage;

  let overlay = document.getElementById("bg-overlay");

  if (hasBg) {
    document.documentElement.style.setProperty("--background", "0 0% 0% / 0");

    if (settings.bgImage) {
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "bg-overlay";
        overlay.style.cssText =
          "position:fixed;inset:0;z-index:-1;pointer-events:none;transition:opacity .3s";
        document.body.prepend(overlay);
      }
      overlay.style.opacity = String(settings.bgOpacity / 100);
      overlay.style.backgroundImage = `url(${settings.bgImage})`;
      overlay.style.backgroundSize = "cover";
      overlay.style.backgroundPosition = "center";

      body.style.backgroundImage = "";
      body.style.backgroundColor = "";
      body.style.backgroundSize = "";
      body.style.backgroundPosition = "";
      body.style.backgroundAttachment = "";
      body.style.opacity = "";
    } else {
      overlay?.remove();
      body.style.backgroundImage = "";
      body.style.backgroundColor = settings.bgColor;
      body.style.backgroundSize = "";
      body.style.backgroundPosition = "";
      body.style.backgroundAttachment = "";
      body.style.opacity = String(settings.bgOpacity / 100);
    }
  } else {
    overlay?.remove();
    body.style.backgroundImage = "";
    body.style.backgroundColor = "";
    body.style.backgroundSize = "";
    body.style.backgroundPosition = "";
    body.style.backgroundAttachment = "";
    body.style.opacity = "";
    document.documentElement.style.removeProperty("--background");
  }
};

export const applyThemeSettings = (settings: AppSettings) => {
  const root = document.documentElement;

  if (settings.themeColor) {
    const hsl = hexToHsl(settings.themeColor);
    root.style.setProperty("--primary", hsl);
    root.style.setProperty("--ring", hsl);
    const hue = hsl.split(" ")[0];
    root.style.setProperty("--accent", `${hue} 60% 92%`);
    root.style.setProperty("--secondary", `${hue} 50% 92%`);
  } else {
    root.style.removeProperty("--primary");
    root.style.removeProperty("--accent");
    root.style.removeProperty("--secondary");
    root.style.removeProperty("--ring");
  }

  root.style.setProperty("--radius", settings.radius);
  document.body.style.fontFamily = settings.font ? `"${settings.font}", sans-serif` : "";

  if (settings.isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};

const hexToHsl = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

export const useApplySettingsOnMount = () => {
  useEffect(() => {
    const init = async () => {
      // Load from DB first, merge with localStorage (for bgImage)
      const dbSettings = await loadSettingsFromDb();
      const localSettings = loadSettings();
      const merged = { ...DEFAULT_SETTINGS, ...dbSettings, bgImage: localSettings.bgImage };

      // Sync localStorage
      localStorage.setItem("app-settings", JSON.stringify(merged));

      applyThemeSettings(merged);
      applyBackgroundSettings(merged);
    };
    init();
  }, []);
};
