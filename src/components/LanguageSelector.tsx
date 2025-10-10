import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Globe } from 'lucide-react';

export const SUPPORTED_LANGUAGES = {
  'en-US': { name: 'English (US)', flag: '🇺🇸' },
  'en-GB': { name: 'English (UK)', flag: '🇬🇧' },
  'es-ES': { name: 'Spanish', flag: '🇪🇸' },
  'fr-FR': { name: 'French', flag: '🇫🇷' },
  'de-DE': { name: 'German', flag: '🇩🇪' },
  'it-IT': { name: 'Italian', flag: '🇮🇹' },
  'pt-BR': { name: 'Portuguese', flag: '🇧🇷' },
  'ja-JP': { name: 'Japanese', flag: '🇯🇵' },
  'ko-KR': { name: 'Korean', flag: '🇰🇷' },
  'zh-CN': { name: 'Chinese', flag: '🇨🇳' },
  'hi-IN': { name: 'Hindi', flag: '🇮🇳' },
  'ar-SA': { name: 'Arabic', flag: '🇸🇦' },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

interface LanguageSelectorProps {
  selectedLanguage: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange
}) => {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Globe className="w-4 h-4" />
        Podcast Language
      </Label>
      <Select value={selectedLanguage} onValueChange={(val) => onLanguageChange(val as SupportedLanguage)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(SUPPORTED_LANGUAGES).map(([code, { name, flag }]) => (
            <SelectItem key={code} value={code}>
              <span className="flex items-center gap-2">
                <span>{flag}</span>
                <span>{name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Content will be narrated in the selected language
      </p>
    </div>
  );
};

export default LanguageSelector;