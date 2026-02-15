import React from 'react';
import { X, Moon, Sun, Type, Palette, Languages, RotateCcw, Bold, Italic, Maximize, Highlighter, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { useQuranStore, defaultSettings } from '@/store/quranStore';
import type { ArabicFont, ThemeColor, TranslationFont, TranslationDisplay, TranslationFontStyle } from '@/types/quran';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { updateMetaThemeColor, THEME_ARABIC_COLORS } from '@/utils/themeColors';
import { highlightColors } from '@/lib/colors';
import { getArabicTextForFont } from '@/lib/arabicTextUtils';
import { getArabicFontClass } from '@/lib/fontUtils';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const arabicFonts: { value: ArabicFont; label: string; sample: string }[] = [
  { value: 'noorehuda', label: 'Noorehuda', sample: 'بِسۡمِ ٱللَّهِ' },
  { value: 'uthmani', label: 'Usmani (Uthmanic)', sample: 'بِسۡمِ ٱللَّهِ' },
  { value: 'indopak', label: 'Indo-Pak', sample: 'بِسْمِ اللهِ' },
];

const translationFonts: { value: TranslationFont; label: string }[] = [
  { value: 'default', label: 'System Default' },
  { value: 'times-new-roman', label: 'Times New Roman' },
  { value: 'georgia', label: 'Georgia' },
  { value: 'libre-baskerville', label: 'Libre Baskerville' },
  { value: 'eb-garamond', label: 'EB Garamond' },
];

const translationFontStyles: { value: TranslationFontStyle; label: string; icon: React.ReactNode }[] = [
  { value: 'normal', label: 'Normal', icon: <span className="font-normal">Aa</span> },
  { value: 'italic', label: 'Italic', icon: <span className="italic">Aa</span> },
  { value: 'bold-italic', label: 'Bold Italic', icon: <span className="font-bold italic">Aa</span> },
];

const translationDisplayOptions: { value: TranslationDisplay; label: string }[] = [
  { value: 'all', label: 'Show All Translations' },
  { value: 'luganda', label: 'Luganda Only' },
  { value: 'english', label: 'English Only' },
  { value: 'off', label: 'Hide Translations' },
];

const themeColors: { value: ThemeColor; label: string; className: string }[] = [
  { value: 'green', label: 'Green', className: 'bg-green-600' },
  { value: 'dark-green', label: 'Dark Green', className: 'bg-green-800' },
  { value: 'blue', label: 'Blue', className: 'bg-blue-600' },
  { value: 'dark-blue', label: 'Dark Blue', className: 'bg-blue-800' },
  { value: 'purple', label: 'Purple', className: 'bg-purple-600' },
  { value: 'maroon', label: 'Maroon', className: 'bg-rose-800' },
  { value: 'red', label: 'Red', className: 'bg-red-600' },
  { value: 'gold-rose', label: 'Gold Rose', className: 'bg-amber-500' },
  { value: 'orange', label: 'Orange', className: 'bg-orange-500' },
  { value: 'brown', label: 'Brown', className: 'bg-amber-800' },
  { value: 'teal', label: 'Teal', className: 'bg-teal-600' },
  { value: 'indigo', label: 'Indigo', className: 'bg-indigo-600' },
  { value: 'deep-sea-green', label: 'Deep Sea', className: 'bg-[#095859]' },
  { value: 'forest', label: 'Forest', className: 'bg-[#0B6623]' },
];

// Light mode font colors - 10 colors
const fontColorsLight = [
  '#166534', // Green
  '#1e40af', // Blue
  '#7c3aed', // Purple
  '#c2410c', // Orange
  '#92400e', // Brown
  '#000000', // Black
  '#be185d', // Pink
  '#0d9488', // Teal
  '#dc2626', // Red
  '#ca8a04', // Yellow/Gold
];

// Dark mode font colors - 10 colors (lighter variants)
const fontColorsDark = [
  '#4ade80', // Light Green
  '#60a5fa', // Light Blue
  '#a78bfa', // Light Purple
  '#fb923c', // Light Orange
  '#fbbf24', // Light Yellow/Brown
  '#f1f5f9', // Light Gray
  '#f472b6', // Light Pink
  '#2dd4bf', // Light Teal
  '#f87171', // Light Red
  '#facc15', // Light Yellow/Gold
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, clearAllHighlights, clearLastReadPosition } = useQuranStore();

  // Get appropriate font colors based on night mode
  const fontColors = settings.nightMode ? fontColorsDark : fontColorsLight;

  const handleThemeChange = (theme: ThemeColor) => {
    updateSettings({ themeColor: theme });

    // Update meta theme-color tag for Android status bar
    updateMetaThemeColor(theme);

    // Remove all theme classes first
    document.documentElement.classList.remove(
      'theme-blue', 'theme-purple', 'theme-gold-rose', 'theme-orange', 'theme-brown',
      'theme-dark-green', 'theme-dark-blue', 'theme-maroon', 'theme-red',
      'theme-teal', 'theme-indigo', 'theme-deep-sea-green', 'theme-forest'
    );

    // Add new theme class if not green (green is default)
    if (theme !== 'green') {
      document.documentElement.classList.add(`theme-${theme}`);
    }

    // Automatically update Arabic font color to match theme
    const recommendedColors = THEME_ARABIC_COLORS[theme];
    const newArabicColor = settings.nightMode ? recommendedColors.dark : recommendedColors.light;
    updateSettings({ arabicFontColor: newArabicColor });
  };

  const handleNightModeToggle = () => {
    const newNightMode = !settings.nightMode;
    updateSettings({ nightMode: newNightMode });

    // Auto-adjust font colors for better readability
    if (newNightMode) {
      document.documentElement.classList.add('dark');

      // 1. Check if Arabic color matches theme default
      const themeDefaults = THEME_ARABIC_COLORS[settings.themeColor];
      if (settings.arabicFontColor === themeDefaults.light) {
        updateSettings({ arabicFontColor: themeDefaults.dark });
      }
      // 2. Fall back to global color swap logic
      else if (fontColorsLight.includes(settings.arabicFontColor)) {
        const index = fontColorsLight.indexOf(settings.arabicFontColor);
        if (index !== -1) {
          updateSettings({ arabicFontColor: fontColorsDark[index] });
        }
      }

      // Toggle Luganda color
      if (fontColorsLight.includes(settings.lugandaFontColor)) {
        const index = fontColorsLight.indexOf(settings.lugandaFontColor);
        if (index !== -1) {
          updateSettings({ lugandaFontColor: fontColorsDark[index] });
        }
      }
      // Toggle English color
      if (fontColorsLight.includes(settings.englishFontColor)) {
        const index = fontColorsLight.indexOf(settings.englishFontColor);
        if (index !== -1) {
          updateSettings({ englishFontColor: fontColorsDark[index] });
        }
      }
      // Toggle Transliteration color
      if (fontColorsLight.includes(settings.transliterationFontColor)) {
        const index = fontColorsLight.indexOf(settings.transliterationFontColor);
        if (index !== -1) {
          updateSettings({ transliterationFontColor: fontColorsDark[index] });
        }
      }
    } else {
      document.documentElement.classList.remove('dark');

      // 1. Check if Arabic color matches theme default
      const themeDefaults = THEME_ARABIC_COLORS[settings.themeColor];
      if (settings.arabicFontColor === themeDefaults.dark) {
        updateSettings({ arabicFontColor: themeDefaults.light });
      }
      // 2. Fall back to global color swap logic
      else if (fontColorsDark.includes(settings.arabicFontColor)) {
        const index = fontColorsDark.indexOf(settings.arabicFontColor);
        if (index !== -1) {
          updateSettings({ arabicFontColor: fontColorsLight[index] });
        }
      }

      // Toggle Luganda color
      if (fontColorsDark.includes(settings.lugandaFontColor)) {
        const index = fontColorsDark.indexOf(settings.lugandaFontColor);
        if (index !== -1) {
          updateSettings({ lugandaFontColor: fontColorsLight[index] });
        }
      }
      // Toggle English color
      if (fontColorsDark.includes(settings.englishFontColor)) {
        const index = fontColorsDark.indexOf(settings.englishFontColor);
        if (index !== -1) {
          updateSettings({ englishFontColor: fontColorsLight[index] });
        }
      }
      // Toggle Transliteration color
      if (fontColorsDark.includes(settings.transliterationFontColor)) {
        const index = fontColorsDark.indexOf(settings.transliterationFontColor);
        if (index !== -1) {
          updateSettings({ transliterationFontColor: fontColorsLight[index] });
        }
      }
    }
  };

  const handleFullscreenToggle = (checked: boolean) => {
    try {
      if (checked) {
        document.documentElement.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen mode: ${err.message}`);
        });
        updateSettings({ fullscreen: true });
      } else {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(err => {
            console.error(`Error attempting to exit fullscreen mode: ${err.message}`);
          });
        }
        updateSettings({ fullscreen: false });
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
      updateSettings({ fullscreen: checked });
    }
  };

  const handleResetSettings = () => {
    // Reset all settings to default
    updateSettings(defaultSettings);

    // Clear all per-verse highlight colors and last read position
    clearAllHighlights();
    clearLastReadPosition();

    // Remove theme classes
    document.documentElement.classList.remove(
      'theme-blue', 'theme-purple', 'theme-gold-rose', 'theme-orange', 'theme-brown',
      'theme-dark-green', 'theme-dark-blue', 'theme-maroon', 'theme-red',
      'theme-teal', 'theme-indigo', 'theme-deep-sea-green', 'theme-forest', 'dark'
    );

    toast({
      title: "Settings Reset",
      description: "All settings have been restored to default values.",
    });
  };

  const getTranslationFontFamily = (font: TranslationFont): string => {
    switch (font) {
      case 'times-new-roman': return '"Times New Roman", Times, serif';
      case 'georgia': return 'Georgia, serif';
      case 'libre-baskerville': return '"Libre Baskerville", Georgia, serif';
      case 'eb-garamond': return '"EB Garamond", Georgia, serif';
      default: return 'system-ui, sans-serif';
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border shadow-xl animate-slide-in-right flex flex-col">
        <div className="sticky top-0 bg-card z-10 px-0 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-semibold px-4">Settings</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-8">
            {/* Fullscreen Mode */}
            <section>
              <div className="flex items-center justify-between p-3 rounded-lg border-2 border-border mb-4">
                <div className="flex items-center gap-3">
                  <Maximize className="h-5 w-5 text-primary" />
                  <Label className="font-semibold cursor-pointer">Fullscreen Mode</Label>
                </div>
                <Switch
                  checked={settings.fullscreen}
                  onCheckedChange={handleFullscreenToggle}
                />
              </div>
            </section>



            {/* Night Mode */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                {settings.nightMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
                <h3 className="font-semibold">Display Mode</h3>
              </div>
              <Button
                variant={settings.nightMode ? "default" : "outline"}
                onClick={handleNightModeToggle}
                className="w-full"
              >
                {settings.nightMode ? (
                  <>
                    <Moon className="h-4 w-4 mr-2" /> Night Mode Enabled
                  </>
                ) : (
                  <>
                    <Sun className="h-4 w-4 mr-2" /> Day Mode Enabled
                  </>
                )}
              </Button>
            </section>

            {/* Theme Colors */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Palette className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Theme Color</h3>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {themeColors.map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => handleThemeChange(theme.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                      settings.themeColor === theme.value
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    )}
                  >
                    <div className={cn("w-8 h-8 rounded-full", theme.className)} />
                    <span className="text-xs font-medium">{theme.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Colored Backgrounds */}
            <section>
              <div className="flex items-center justify-between p-3 rounded-lg border-2 border-border mb-4">
                <div className="flex items-center gap-3">
                  <Palette className="h-5 w-5 text-primary" />
                  <Label className="font-semibold cursor-pointer">Colored Card Backgrounds</Label>
                </div>
                <Switch
                  checked={settings.coloredBackground}
                  onCheckedChange={(checked) => updateSettings({ coloredBackground: checked })}
                />
              </div>
            </section>

            {/* Verse Card Highlight */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Highlighter className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Verse Card Highlight (Surah View)</h3>
              </div>
              <div className="grid grid-cols-5 gap-3 mb-4">
                <button
                  onClick={() => updateSettings({ verseHighlightColor: null })}
                  className={cn(
                    "flex flex-col items-center gap-2 p-2 rounded-lg border-2 transition-all",
                    settings.verseHighlightColor === null
                      ? "border-primary bg-primary/10"
                      : "border-border"
                  )}
                >
                  <div className="w-8 h-8 rounded-full border border-dashed border-foreground/50 flex items-center justify-center">
                    <X className="h-4 w-4 text-foreground/50" />
                  </div>
                  <span className="text-[10px] font-medium">None</span>
                </button>
                {highlightColors.map((hc) => (
                  <button
                    key={hc.color}
                    onClick={() => updateSettings({ verseHighlightColor: hc.color })}
                    className={cn(
                      "flex flex-col items-center gap-2 p-2 rounded-lg border-2 transition-all",
                      settings.verseHighlightColor === hc.color
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    )}
                  >
                    <div className={cn("w-8 h-8 rounded-full", hc.className)} />
                    <span className="text-[10px] font-medium">{hc.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Colored App Background */}
            <section>
              <div className="flex items-center justify-between p-3 rounded-lg border-2 border-border mb-4">
                <div className="flex items-center gap-3">
                  <Palette className="h-5 w-5 text-primary" />
                  <Label className="font-semibold cursor-pointer">Colored App Background</Label>
                </div>
                <Switch
                  checked={settings.coloredAppBackground}
                  onCheckedChange={(checked) => updateSettings({ coloredAppBackground: checked })}
                />
              </div>
            </section>

            {/* Translation Display */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Languages className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Translation Display</h3>
              </div>
              <RadioGroup
                value={settings.translationDisplay}
                onValueChange={(value) => updateSettings({ translationDisplay: value as TranslationDisplay })}
                className="space-y-2"
              >
                {translationDisplayOptions.map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                      settings.translationDisplay === option.value
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    )}
                  >
                    <RadioGroupItem value={option.value} />
                    <span className="font-medium">{option.label}</span>
                  </label>
                ))}
              </RadioGroup>
            </section>

            {/* Arabic Font */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Type className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Arabic Font</h3>
              </div>
              <RadioGroup
                value={settings.arabicFont}
                onValueChange={(value) => updateSettings({ arabicFont: value as ArabicFont })}
                className="space-y-3"
              >
                {arabicFonts.map((font) => (
                  <label
                    key={font.value}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all",
                      settings.arabicFont === font.value
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={font.value} />
                      <span className="font-medium text-base">{font.label}</span>
                    </div>
                    <span
                      className={cn("text-2xl", getArabicFontClass(font.value))}
                      dir="rtl"
                    >
                      {getArabicTextForFont(font.sample, font.value)}
                    </span>
                  </label>
                ))}
              </RadioGroup>
            </section>

            {/* Arabic Font Size */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <Label className="font-semibold">Arabic Font Size</Label>
                <span className="text-sm text-muted-foreground">{settings.arabicFontSize}px</span>
              </div>
              <Slider
                value={[settings.arabicFontSize]}
                onValueChange={([value]) => updateSettings({ arabicFontSize: value })}
                min={18}
                max={100}
                step={1}
                className="w-full"
              />
              <p
                className={cn("mt-4 text-center transition-all duration-300", getArabicFontClass(settings.arabicFont))}
                style={{
                  fontSize: `${settings.arabicFontSize}px`,
                  fontWeight: settings.arabicFontBold ? 'bold' : 'normal',
                  color: settings.arabicFontColor,
                  lineHeight: 1.5,
                }}
                dir="rtl"
              >
                {getArabicTextForFont('بِسۡمِ ٱللَّهِ الرَّحْمٰنِ الرَّحِيْمِ', settings.arabicFont)}
              </p>
            </section>

            {/* Arabic Text Bold */}
            <section>
              <div className="flex items-center justify-between p-3 rounded-lg border-2 border-border">
                <div className="flex items-center gap-3">
                  <Bold className="h-5 w-5 text-primary" />
                  <Label className="font-semibold cursor-pointer">Bold Arabic Text</Label>
                </div>
                <Switch
                  checked={settings.arabicFontBold}
                  onCheckedChange={(checked) => updateSettings({ arabicFontBold: checked })}
                />
              </div>
            </section>

            {/* Arabic Font Color */}
            <section>
              <Label className="font-semibold block mb-4">Arabic Font Color</Label>
              <div className="flex flex-wrap gap-2">
                {fontColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateSettings({ arabicFontColor: color })}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110",
                      settings.arabicFontColor === color
                        ? "ring-2 ring-offset-2 ring-primary"
                        : "border-border"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </section>

            {/* Luganda Font Settings */}
            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                <Languages className="h-5 w-5" />
                Luganda Font Settings
              </h3>

              <div className="space-y-6">
                <section>
                  <Label className="font-semibold block mb-3 text-sm italic">Font Family</Label>
                  <RadioGroup
                    value={settings.lugandaFont}
                    onValueChange={(value) => updateSettings({ lugandaFont: value as TranslationFont })}
                    className="grid grid-cols-1 gap-2"
                  >
                    {translationFonts.map((font) => (
                      <label key={font.value} className={cn("flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer", settings.lugandaFont === font.value ? "border-primary bg-primary/5" : "border-border")}>
                        <RadioGroupItem value={font.value} />
                        <span className="text-sm" style={{ fontFamily: getTranslationFontFamily(font.value) }}>{font.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </section>

                <section>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm italic">Font Size</Label>
                    <span className="text-xs text-muted-foreground">{settings.lugandaFontSize}px</span>
                  </div>
                  <Slider value={[settings.lugandaFontSize]} onValueChange={([v]) => updateSettings({ lugandaFontSize: v })} min={12} max={80} step={1} />
                </section>

                <div className="flex items-center justify-between p-2 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <Bold className="h-4 w-4 text-primary" />
                    <Label className="text-sm cursor-pointer">Bold Text</Label>
                  </div>
                  <Switch checked={settings.lugandaFontBold} onCheckedChange={(v) => updateSettings({ lugandaFontBold: v })} />
                </div>

                <section>
                  <Label className="text-sm block mb-2 italic">Font Style</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {translationFontStyles.map((s) => (
                      <button key={s.value} onClick={() => updateSettings({ lugandaFontStyle: s.value })} className={cn("flex flex-col items-center gap-1 p-2 rounded-lg border transition-all", settings.lugandaFontStyle === s.value ? "border-primary bg-primary/5" : "border-border")}>
                        <span className="text-sm">{s.icon}</span>
                        <span className="text-[10px]">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <Label className="text-sm block mb-2 italic">Text Color</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {fontColors.map((color) => (
                      <button key={color} onClick={() => updateSettings({ lugandaFontColor: color })} className={cn("w-6 h-6 rounded-full border transition-transform hover:scale-110", settings.lugandaFontColor === color ? "ring-2 ring-offset-1 ring-primary" : "border-border")} style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </section>

                <p
                  className="mt-3 p-3 text-center"
                  style={{
                    fontSize: `${settings.lugandaFontSize}px`,
                    fontFamily: getTranslationFontFamily(settings.lugandaFont),
                    color: settings.lugandaFontColor,
                    fontWeight: settings.lugandaFontBold || settings.lugandaFontStyle === 'bold-italic' ? 'bold' : 'normal',
                    fontStyle: settings.lugandaFontStyle === 'italic' || settings.lugandaFontStyle === 'bold-italic' ? 'italic' : 'normal',
                  }}
                >
                  Mu linnya lya Allah
                </p>
              </div>
            </div>

            {/* English Font Settings */}
            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                <Languages className="h-5 w-5" />
                English Font Settings
              </h3>

              <div className="space-y-6">
                <section>
                  <Label className="font-semibold block mb-3 text-sm italic">Font Family</Label>
                  <RadioGroup
                    value={settings.englishFont}
                    onValueChange={(value) => updateSettings({ englishFont: value as TranslationFont })}
                    className="grid grid-cols-1 gap-2"
                  >
                    {translationFonts.map((font) => (
                      <label key={font.value} className={cn("flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer", settings.englishFont === font.value ? "border-primary bg-primary/5" : "border-border")}>
                        <RadioGroupItem value={font.value} />
                        <span className="text-sm" style={{ fontFamily: getTranslationFontFamily(font.value) }}>{font.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </section>

                <section>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm italic">Font Size</Label>
                    <span className="text-xs text-muted-foreground">{settings.englishFontSize}px</span>
                  </div>
                  <Slider value={[settings.englishFontSize]} onValueChange={([v]) => updateSettings({ englishFontSize: v })} min={12} max={80} step={1} />
                </section>

                <div className="flex items-center justify-between p-2 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <Bold className="h-4 w-4 text-primary" />
                    <Label className="text-sm cursor-pointer">Bold Text</Label>
                  </div>
                  <Switch checked={settings.englishFontBold} onCheckedChange={(v) => updateSettings({ englishFontBold: v })} />
                </div>

                <section>
                  <Label className="text-sm block mb-2 italic">Font Style</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {translationFontStyles.map((s) => (
                      <button key={s.value} onClick={() => updateSettings({ englishFontStyle: s.value })} className={cn("flex flex-col items-center gap-1 p-2 rounded-lg border transition-all", settings.englishFontStyle === s.value ? "border-primary bg-primary/5" : "border-border")}>
                        <span className="text-sm">{s.icon}</span>
                        <span className="text-[10px]">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <Label className="text-sm block mb-2 italic">Text Color</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {fontColors.map((color) => (
                      <button key={color} onClick={() => updateSettings({ englishFontColor: color })} className={cn("w-6 h-6 rounded-full border transition-transform hover:scale-110", settings.englishFontColor === color ? "ring-2 ring-offset-1 ring-primary" : "border-border")} style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </section>

                <p
                  className="mt-3 p-3 text-center"
                  style={{
                    fontSize: `${settings.englishFontSize}px`,
                    fontFamily: getTranslationFontFamily(settings.englishFont),
                    color: settings.englishFontColor,
                    fontWeight: settings.englishFontBold || settings.englishFontStyle === 'bold-italic' ? 'bold' : 'normal',
                    fontStyle: settings.englishFontStyle === 'italic' || settings.englishFontStyle === 'bold-italic' ? 'italic' : 'normal',
                  }}
                >
                  In the name of Allah
                </p>
              </div>
            </div>

            {/* Transliteration Font Settings */}
            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                <Languages className="h-5 w-5" />
                Transliteration Font Settings
              </h3>

              <div className="space-y-6">
                <section>
                  <Label className="font-semibold block mb-3 text-sm italic">Font Family</Label>
                  <RadioGroup
                    value={settings.transliterationFont}
                    onValueChange={(value) => updateSettings({ transliterationFont: value as TranslationFont })}
                    className="grid grid-cols-1 gap-2"
                  >
                    {translationFonts.map((font) => (
                      <label key={font.value} className={cn("flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer", settings.transliterationFont === font.value ? "border-primary bg-primary/5" : "border-border")}>
                        <RadioGroupItem value={font.value} />
                        <span className="text-sm" style={{ fontFamily: getTranslationFontFamily(font.value) }}>{font.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </section>

                <section>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm italic">Font Size</Label>
                    <span className="text-xs text-muted-foreground">{settings.transliterationFontSize}px</span>
                  </div>
                  <Slider value={[settings.transliterationFontSize]} onValueChange={([v]) => updateSettings({ transliterationFontSize: v })} min={12} max={80} step={1} />
                </section>

                <div className="flex items-center justify-between p-2 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <Bold className="h-4 w-4 text-primary" />
                    <Label className="text-sm cursor-pointer">Bold Text</Label>
                  </div>
                  <Switch checked={settings.transliterationFontBold} onCheckedChange={(v) => updateSettings({ transliterationFontBold: v })} />
                </div>

                <section>
                  <Label className="text-sm block mb-2 italic">Font Style</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {translationFontStyles.map((s) => (
                      <button key={s.value} onClick={() => updateSettings({ transliterationFontStyle: s.value })} className={cn("flex flex-col items-center gap-1 p-2 rounded-lg border transition-all", settings.transliterationFontStyle === s.value ? "border-primary bg-primary/5" : "border-border")}>
                        <span className="text-sm">{s.icon}</span>
                        <span className="text-[10px]">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <Label className="text-sm block mb-2 italic">Text Color</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {fontColors.map((color) => (
                      <button key={color} onClick={() => updateSettings({ transliterationFontColor: color })} className={cn("w-6 h-6 rounded-full border transition-transform hover:scale-110", settings.transliterationFontColor === color ? "ring-2 ring-offset-1 ring-primary" : "border-border")} style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </section>

                <p
                  className="mt-3 p-3 text-center"
                  style={{
                    fontSize: `${settings.transliterationFontSize}px`,
                    fontFamily: getTranslationFontFamily(settings.transliterationFont),
                    color: settings.transliterationFontColor,
                    fontWeight: settings.transliterationFontBold || settings.transliterationFontStyle === 'bold-italic' ? 'bold' : 'normal',
                    fontStyle: settings.transliterationFontStyle === 'italic' || settings.transliterationFontStyle === 'bold-italic' ? 'italic' : 'normal',
                  }}
                >
                  Bismillaahir Rahmaanir Raheem
                </p>
              </div>
            </div>

            {/* Transliteration Settings Section */}
            <div className="border-t border-border my-6 pt-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Languages className="h-5 w-5 text-primary" />
                Transliteration Settings
              </h3>

              <div className="space-y-8">
                {/* Show Transliteration Toggle */}
                <section>
                  <div className="flex items-center justify-between p-3 rounded-lg border-2 border-border">
                    <div className="flex items-center gap-3">
                      <Label className="font-semibold cursor-pointer">Show Transliteration</Label>
                    </div>
                    <Switch
                      checked={settings.showTransliteration}
                      onCheckedChange={(checked) => updateSettings({ showTransliteration: checked })}
                    />
                  </div>
                </section>


              </div>
            </div>

            {/* Bookmark Section Swapping */}
            <section>
              <div className="flex items-center justify-between p-3 rounded-lg border-2 border-border mb-4">
                <div className="flex items-center gap-3">
                  <ArrowLeftRight className="h-5 w-5 text-primary" />
                  <Label className="font-semibold cursor-pointer">Swap Single and Collections Bookmarks</Label>
                </div>
                <Switch
                  checked={settings.swapBookmarksAndCollections}
                  onCheckedChange={(checked) => updateSettings({ swapBookmarksAndCollections: checked })}
                />
              </div>
            </section>

            {/* Reset Settings Button - At the end */}
            <section className="pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={handleResetSettings}
                className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <RotateCcw className="h-4 w-4 mr-2" /> Reset All Settings
              </Button>
            </section>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
