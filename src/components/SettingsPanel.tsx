import React from 'react';
import { X, Moon, Sun, Type, Palette, Languages, RotateCcw, Bold, Italic, Maximize } from 'lucide-react';
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
import { updateMetaThemeColor } from '@/utils/themeColors';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const arabicFonts: { value: ArabicFont; label: string; sample: string }[] = [
  { value: 'noorehuda', label: 'Noorehuda', sample: 'بِسۡمِ ٱللَّهِ' },
  { value: 'uthmani', label: 'Usmani (Uthmanic)', sample: 'بِسۡمِ ٱللَّهِ' },
  { value: 'indopak', label: 'Indo-Pak', sample: 'بِسۡمِ ٱللَّهِ' },
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
  { value: 'pure-black', label: 'Pure Black', className: 'bg-black border border-white/20' },
  { value: 'pure-white', label: 'Pure White', className: 'bg-white border border-gray-200' },
  { value: 'ivory-creme', label: 'Ivory Creme', className: 'bg-[#DAC0A7]' },
  { value: 'bright-creme', label: 'Bright Creme', className: 'bg-[#FFFCD8] border border-gray-200' },
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
  const { settings, updateSettings } = useQuranStore();

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
      'theme-teal', 'theme-indigo', 'theme-pure-black', 'theme-pure-white',
      'theme-ivory-creme', 'theme-bright-creme', 'theme-deep-sea-green', 'theme-forest'
    );

    // Add new theme class if not green (green is default)
    if (theme !== 'green') {
      document.documentElement.classList.add(`theme-${theme}`);
    }
  };

  const handleNightModeToggle = () => {
    const newNightMode = !settings.nightMode;
    updateSettings({ nightMode: newNightMode });

    // Auto-adjust font colors for better readability
    if (newNightMode) {
      document.documentElement.classList.add('dark');
      // Set lighter colors for dark mode if using dark colors
      if (fontColorsLight.includes(settings.arabicFontColor)) {
        const index = fontColorsLight.indexOf(settings.arabicFontColor);
        if (index !== -1) {
          updateSettings({ arabicFontColor: fontColorsDark[index] });
        }
      }
      if (fontColorsLight.includes(settings.translationFontColor)) {
        const index = fontColorsLight.indexOf(settings.translationFontColor);
        if (index !== -1) {
          updateSettings({ translationFontColor: fontColorsDark[index] });
        }
      }
    } else {
      document.documentElement.classList.remove('dark');
      // Set darker colors for light mode if using light colors
      if (fontColorsDark.includes(settings.arabicFontColor)) {
        const index = fontColorsDark.indexOf(settings.arabicFontColor);
        if (index !== -1) {
          updateSettings({ arabicFontColor: fontColorsLight[index] });
        }
      }
      if (fontColorsDark.includes(settings.translationFontColor)) {
        const index = fontColorsDark.indexOf(settings.translationFontColor);
        if (index !== -1) {
          updateSettings({ translationFontColor: fontColorsLight[index] });
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

    // Remove theme classes
    document.documentElement.classList.remove(
      'theme-blue', 'theme-purple', 'theme-gold-rose', 'theme-orange', 'theme-brown',
      'theme-dark-green', 'theme-dark-blue', 'theme-maroon', 'theme-red',
      'theme-teal', 'theme-indigo', 'theme-pure-black', 'theme-pure-white',
      'theme-ivory-creme', 'theme-bright-creme', 'theme-deep-sea-green', 'theme-forest', 'dark'
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

  const getArabicFontClass = (font: ArabicFont): string => {
    switch (font) {
      case 'uthmani': return 'font-uthmani';
      case 'indopak': return 'font-indopak';
      default: return 'font-noorehuda';
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
                      <span className="font-medium">{font.label}</span>
                    </div>
                    <span
                      className={cn("text-xl", getArabicFontClass(font.value))}
                      dir="rtl"
                    >
                      {font.sample}
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
                className={cn("mt-3 text-center text-primary", getArabicFontClass(settings.arabicFont))}
                style={{
                  fontSize: `${settings.arabicFontSize}px`,
                  fontWeight: settings.arabicFontBold ? 'bold' : 'normal',
                  wordBreak: 'normal',
                  overflowWrap: 'normal',
                }}
                dir="rtl"
              >
                بِسۡمِ ٱللَّهِ
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

            {/* Translation Font */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Type className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Translation Font</h3>
              </div>
              <RadioGroup
                value={settings.translationFont}
                onValueChange={(value) => updateSettings({ translationFont: value as TranslationFont })}
                className="space-y-2"
              >
                {translationFonts.map((font) => (
                  <label
                    key={font.value}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                      settings.translationFont === font.value
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    )}
                  >
                    <RadioGroupItem value={font.value} />
                    <span
                      className="font-medium"
                      style={{ fontFamily: getTranslationFontFamily(font.value) }}
                    >
                      {font.label}
                    </span>
                  </label>
                ))}
              </RadioGroup>
            </section>

            {/* Translation Font Size */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <Label className="font-semibold">Translation Font Size</Label>
                <span className="text-sm text-muted-foreground">{settings.translationFontSize}px</span>
              </div>
              <Slider
                value={[settings.translationFontSize]}
                onValueChange={([value]) => updateSettings({ translationFontSize: value })}
                min={12}
                max={100}
                step={1}
                className="w-full"
              />
              <p
                className="mt-3 text-center"
                style={{
                  fontSize: `${settings.translationFontSize}px`,
                  fontFamily: getTranslationFontFamily(settings.translationFont),
                  fontWeight: settings.translationFontBold || settings.translationFontStyle === 'bold-italic' ? 'bold' : 'normal',
                  fontStyle: settings.translationFontStyle === 'italic' || settings.translationFontStyle === 'bold-italic' ? 'italic' : 'normal',
                  wordBreak: 'normal',
                  overflowWrap: 'normal',
                }}
              >
                In the name of Allah
              </p>
            </section>

            {/* Translation Text Bold */}
            <section>
              <div className="flex items-center justify-between p-3 rounded-lg border-2 border-border">
                <div className="flex items-center gap-3">
                  <Bold className="h-5 w-5 text-primary" />
                  <Label className="font-semibold cursor-pointer">Bold Translation Text</Label>
                </div>
                <Switch
                  checked={settings.translationFontBold}
                  onCheckedChange={(checked) => updateSettings({ translationFontBold: checked })}
                />
              </div>
            </section>

            {/* Translation Font Style (Italic options) */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Italic className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Translation Font Style</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {translationFontStyles.map((style) => (
                  <button
                    key={style.value}
                    onClick={() => updateSettings({ translationFontStyle: style.value })}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                      settings.translationFontStyle === style.value
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    )}
                  >
                    <span className="text-lg">{style.icon}</span>
                    <span className="text-xs font-medium">{style.label}</span>
                  </button>
                ))}
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

            {/* Translation Font Color */}
            <section>
              <Label className="font-semibold block mb-4">Translation Font Color</Label>
              <div className="flex flex-wrap gap-2">
                {fontColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateSettings({ translationFontColor: color })}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110",
                      settings.translationFontColor === color
                        ? "ring-2 ring-offset-2 ring-primary"
                        : "border-border"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
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
