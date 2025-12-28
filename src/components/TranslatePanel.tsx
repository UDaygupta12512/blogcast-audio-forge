import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Languages, Loader2, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TranslatePanelProps {
  script: string;
  onTranslated?: (translatedScript: string, language: string) => void;
}

const languages = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese (Mandarin)' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ru', name: 'Russian' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'tr', name: 'Turkish' },
  { code: 'sv', name: 'Swedish' },
];

const TranslatePanel: React.FC<TranslatePanelProps> = ({ script, onTranslated }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedScript, setTranslatedScript] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!selectedLanguage) {
      toast.error('Please select a target language');
      return;
    }

    if (!script) {
      toast.error('No script to translate');
      return;
    }

    setIsTranslating(true);
    try {
      const language = languages.find(l => l.code === selectedLanguage);
      
      const { data, error } = await supabase.functions.invoke('translate-podcast', {
        body: { 
          script, 
          targetLanguage: selectedLanguage,
          targetLanguageName: language?.name 
        }
      });

      if (error) throw error;

      setTranslatedScript(data.translatedScript);
      onTranslated?.(data.translatedScript, selectedLanguage);
      toast.success(`Translated to ${language?.name}!`);
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Failed to translate. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(translatedScript);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-4 glass border-white/10">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Languages className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Auto-Translate</h3>
        </div>

        <div className="flex gap-2">
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            onClick={handleTranslate} 
            disabled={isTranslating || !selectedLanguage}
          >
            {isTranslating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Translating...
              </>
            ) : (
              'Translate'
            )}
          </Button>
        </div>

        {translatedScript && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Translated Script</span>
              <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="max-h-40 overflow-y-auto p-3 bg-background/50 rounded-lg text-sm">
              {translatedScript}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TranslatePanel;
