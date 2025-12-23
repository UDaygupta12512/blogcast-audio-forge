import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Loader2, Copy, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const EmailWriter = () => {
  const [purpose, setPurpose] = useState('');
  const [recipient, setRecipient] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [emailType, setEmailType] = useState('professional');
  const [generatedEmail, setGeneratedEmail] = useState({ subject: '', body: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!purpose.trim()) {
      toast({ title: "Purpose required", description: "Please describe the email purpose", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-writing', {
        body: { 
          type: 'email',
          purpose,
          recipient,
          keyPoints,
          emailType
        }
      });

      if (error) throw error;
      setGeneratedEmail({ subject: data.subject, body: data.body });
      toast({ title: "Email generated!", description: "Your professional email is ready" });
    } catch (error) {
      console.error('Error generating email:', error);
      toast({ title: "Generation failed", description: "Failed to generate email", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyAll = () => {
    const fullEmail = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
    navigator.clipboard.writeText(fullEmail);
    toast({ title: "Copied!", description: "Email copied to clipboard" });
  };

  const openInMailClient = () => {
    const mailtoLink = `mailto:?subject=${encodeURIComponent(generatedEmail.subject)}&body=${encodeURIComponent(generatedEmail.body)}`;
    window.open(mailtoLink);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="glass border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-400" />
            Email Writer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email Purpose</Label>
            <Textarea
              placeholder="e.g., Follow up on a meeting, Request a proposal, Thank you note..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Recipient Type (optional)</Label>
            <Input
              placeholder="e.g., Potential client, Manager, Colleague"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Key Points to Include (optional)</Label>
            <Textarea
              placeholder="List any specific points, dates, or information to include..."
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              className="min-h-[60px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Email Style</Label>
            <Select value={emailType} onValueChange={setEmailType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="persuasive">Persuasive</SelectItem>
                <SelectItem value="apologetic">Apologetic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Generate Email
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="glass border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Generated Email</span>
            {generatedEmail.body && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyAll}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={openInMailClient}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {generatedEmail.body ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Subject</Label>
                <Input
                  value={generatedEmail.subject}
                  onChange={(e) => setGeneratedEmail(prev => ({ ...prev, subject: e.target.value }))}
                  className="font-semibold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Body</Label>
                <Textarea
                  value={generatedEmail.body}
                  onChange={(e) => setGeneratedEmail(prev => ({ ...prev, body: e.target.value }))}
                  className="min-h-[300px]"
                />
              </div>
            </div>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              <p>Your generated email will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailWriter;
