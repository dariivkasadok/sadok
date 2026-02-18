import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Palette, Type, Sun, Moon, RotateCcw, Image, Paintbrush, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { loadSettings, applyBackgroundSettings, applyThemeSettings, saveSettingsToDb, DEFAULT_SETTINGS } from "@/hooks/useAppSettings";

const fontOptions = [
  { name: "Nunito", value: "Nunito" },
  { name: "Inter", value: "Inter" },
  { name: "Roboto", value: "Roboto" },
  { name: "Open Sans", value: "Open Sans" },
  { name: "Montserrat", value: "Montserrat" },
];

const radiusOptions = [
  { name: "Без закруглення", value: "0rem" },
  { name: "Мале", value: "0.375rem" },
  { name: "Середнє (за замовч.)", value: "0.75rem" },
  { name: "Велике", value: "1rem" },
  { name: "Максимальне", value: "1.5rem" },
];

const Settings = () => {
  const [themeColor, setThemeColor] = useState(DEFAULT_SETTINGS.themeColor);
  const [font, setFont] = useState(DEFAULT_SETTINGS.font);
  const [radius, setRadius] = useState(DEFAULT_SETTINGS.radius);
  const [isDark, setIsDark] = useState(DEFAULT_SETTINGS.isDark);
  const [bgColor, setBgColor] = useState(DEFAULT_SETTINGS.bgColor);
  const [bgImage, setBgImage] = useState(DEFAULT_SETTINGS.bgImage);
  const [bgOpacity, setBgOpacity] = useState(DEFAULT_SETTINGS.bgOpacity);

  useEffect(() => {
    const s = loadSettings();
    setThemeColor(s.themeColor);
    setFont(s.font);
    setRadius(s.radius);
    setIsDark(s.isDark);
    setBgColor(s.bgColor);
    setBgImage(s.bgImage);
    setBgOpacity(s.bgOpacity);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/bmp", "image/webp", "image/gif", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      toast({ title: "Непідтримуваний формат", description: "Підтримуються: JPG, PNG, BMP, WebP, GIF, SVG", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Файл занадто великий", description: "Максимальний розмір: 5 МБ", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setBgImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const applySettings = async () => {
    const settings = { themeColor, font, radius, isDark, bgColor, bgImage, bgOpacity };
    applyThemeSettings(settings);
    applyBackgroundSettings(settings);
    localStorage.setItem("app-settings", JSON.stringify(settings));
    await saveSettingsToDb(settings);
    toast({ title: "Налаштування збережено" });
  };

  const resetSettings = async () => {
    applyThemeSettings(DEFAULT_SETTINGS);
    applyBackgroundSettings(DEFAULT_SETTINGS);
    localStorage.setItem("app-settings", JSON.stringify(DEFAULT_SETTINGS));
    await saveSettingsToDb(DEFAULT_SETTINGS);

    setThemeColor(DEFAULT_SETTINGS.themeColor);
    setFont(DEFAULT_SETTINGS.font);
    setRadius(DEFAULT_SETTINGS.radius);
    setIsDark(DEFAULT_SETTINGS.isDark);
    setBgColor(DEFAULT_SETTINGS.bgColor);
    setBgImage(DEFAULT_SETTINGS.bgImage);
    setBgOpacity(DEFAULT_SETTINGS.bgOpacity);

    toast({ title: "Налаштування скинуто до стандартних" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto space-y-6 px-6 py-8">
        <h1 className="text-3xl font-bold text-foreground">Налаштування</h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Color Theme */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Кольорова тема
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={themeColor || "#7c3aed"}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-lg border border-input"
                />
                <Input
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  placeholder="#7c3aed (за замовч.)"
                  className="flex-1"
                />
                {themeColor && (
                  <Button variant="ghost" size="icon" onClick={() => setThemeColor("")} title="Очистити">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {themeColor && (
                <div
                  className="h-12 rounded-xl border"
                  style={{ backgroundColor: themeColor }}
                />
              )}
            </CardContent>
          </Card>

          {/* Font */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5 text-primary" />
                Шрифт
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Основний шрифт</Label>
                <Select value={font} onValueChange={setFont}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        <span style={{ fontFamily: f.value }}>{f.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-lg font-bold" style={{ fontFamily: font }}>Попередній перегляд шрифту</p>
                <p className="text-sm text-muted-foreground" style={{ fontFamily: font }}>
                  Це текст для попереднього перегляду обраного шрифту. Абвгґдеєжзиіїйклмнопрстуфхцчшщьюя.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Dark Mode */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isDark ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
                Тема інтерфейсу
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border p-4">
                <div>
                  <p className="font-semibold">Темна тема</p>
                  <p className="text-sm text-muted-foreground">Перемкнути на темний режим</p>
                </div>
                <Switch checked={isDark} onCheckedChange={setIsDark} />
              </div>
            </CardContent>
          </Card>

          {/* Border Radius */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Заокруглення елементів
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Радіус заокруглення</Label>
                <Select value={radius} onValueChange={setRadius}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {radiusOptions.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3">
                {radiusOptions.map((r) => (
                  <div
                    key={r.value}
                    className={`h-12 w-12 border-2 transition-all ${
                      radius === r.value ? "border-primary bg-primary/10" : "border-border bg-muted"
                    }`}
                    style={{ borderRadius: r.value }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Background Color */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Paintbrush className="h-5 w-5 text-primary" />
                Колір фону
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={bgColor || "#f5f3ff"}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-lg border border-input"
                />
                <Input
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  placeholder="#f5f3ff"
                  className="flex-1"
                />
                {bgColor && (
                  <Button variant="ghost" size="icon" onClick={() => setBgColor("")} title="Очистити">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {bgColor && (
                <div
                  className="h-16 rounded-xl border"
                  style={{ backgroundColor: bgColor }}
                />
              )}
            </CardContent>
          </Card>

          {/* Background Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5 text-primary" />
                Фонове зображення
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Завантажити зображення (JPG, PNG, BMP, WebP, GIF, SVG — макс. 5 МБ)</Label>
                <Input
                  type="file"
                  accept=".jpg,.jpeg,.png,.bmp,.webp,.gif,.svg"
                  onChange={handleImageUpload}
                  className="cursor-pointer"
                />
              </div>
              {bgImage && (
                <div className="space-y-2">
                  <div
                    className="h-32 rounded-xl border bg-cover bg-center"
                    style={{ backgroundImage: `url(${bgImage})` }}
                  />
                  <Button variant="outline" size="sm" onClick={() => setBgImage("")} className="gap-1">
                    <X className="h-3 w-3" />
                    Видалити зображення
                  </Button>
                </div>
              )}

              {/* Opacity */}
              {(bgColor || bgImage) && (
                <div className="space-y-3 rounded-xl border p-4">
                  <div className="flex items-center justify-between">
                    <Label>Прозорість фону</Label>
                    <span className="text-sm font-semibold text-primary">{bgOpacity}%</span>
                  </div>
                  <Slider
                    value={[bgOpacity]}
                    onValueChange={([v]) => setBgOpacity(v)}
                    min={5}
                    max={100}
                    step={5}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={applySettings} size="lg" className="gap-2">
            <Palette className="h-4 w-4" />
            Застосувати налаштування
          </Button>
          <Button onClick={resetSettings} variant="outline" size="lg" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Скинути до стандартних
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Settings;
