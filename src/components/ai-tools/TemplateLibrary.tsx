import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Library, Search, Copy, FileText, Mail, Share2, ShoppingCart, 
  Heart, GraduationCap, Briefcase, Rocket, Globe, Utensils,
  Building2, Dumbbell, Palette, Code, Megaphone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Template {
  id: string;
  title: string;
  description: string;
  category: 'blog' | 'social' | 'email' | 'product';
  industry: string;
  content: string;
  tags: string[];
}

const industries = [
  { id: 'all', label: 'All Industries', icon: Globe },
  { id: 'tech', label: 'Technology', icon: Code },
  { id: 'marketing', label: 'Marketing', icon: Megaphone },
  { id: 'ecommerce', label: 'E-commerce', icon: ShoppingCart },
  { id: 'health', label: 'Health & Wellness', icon: Heart },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'finance', label: 'Finance', icon: Briefcase },
  { id: 'startup', label: 'Startups', icon: Rocket },
  { id: 'food', label: 'Food & Beverage', icon: Utensils },
  { id: 'realestate', label: 'Real Estate', icon: Building2 },
  { id: 'fitness', label: 'Fitness', icon: Dumbbell },
  { id: 'creative', label: 'Creative Agency', icon: Palette },
];

const contentTypes = [
  { id: 'all', label: 'All Types', icon: Library },
  { id: 'blog', label: 'Blog Posts', icon: FileText },
  { id: 'social', label: 'Social Media', icon: Share2 },
  { id: 'email', label: 'Emails', icon: Mail },
  { id: 'product', label: 'Product Copy', icon: ShoppingCart },
];

const templates: Template[] = [
  // Tech Templates
  {
    id: 'tech-blog-1',
    title: 'Product Launch Announcement',
    description: 'Announce your new tech product with impact',
    category: 'blog',
    industry: 'tech',
    content: `# Introducing [Product Name]: The Future of [Industry]

We're thrilled to announce the launch of [Product Name], our revolutionary solution that's set to transform how you [main benefit].

## What Makes [Product Name] Different?

After [X months/years] of development, we've created something truly special:

- **[Feature 1]**: [Brief description of benefit]
- **[Feature 2]**: [Brief description of benefit]
- **[Feature 3]**: [Brief description of benefit]

## The Problem We Solved

[Describe the pain point your target audience faces and how your product addresses it]

## Early Access & Pricing

Be among the first to experience [Product Name]. Sign up for early access today and receive [special offer].

[CTA Button: Get Early Access]

---

*Questions? Reach out to our team at [email]*`,
    tags: ['launch', 'announcement', 'product'],
  },
  {
    id: 'tech-social-1',
    title: 'Feature Highlight Thread',
    description: 'Twitter/X thread template for product features',
    category: 'social',
    industry: 'tech',
    content: `🧵 Thread: [X] game-changing features in [Product Name] that will blow your mind:

1/ [Feature 1]
[One-liner benefit]
[Brief explanation of how it works]

2/ [Feature 2]
[One-liner benefit]
[Brief explanation of how it works]

3/ [Feature 3]
[One-liner benefit]
[Brief explanation of how it works]

4/ But wait, there's more...
[Bonus feature or upcoming feature teaser]

5/ Ready to try it yourself?
[Link to product]
[Special offer if any]

Like & RT if you found this helpful! 🔄`,
    tags: ['twitter', 'thread', 'features'],
  },
  {
    id: 'tech-email-1',
    title: 'Beta Invitation Email',
    description: 'Invite users to test your new product',
    category: 'email',
    industry: 'tech',
    content: `Subject: You're invited: Exclusive beta access to [Product Name]

Hi [First Name],

You've been selected for exclusive beta access to [Product Name]!

As one of our valued community members, we want you to be among the first to experience what we've been building.

**What you'll get:**
• Early access to all features
• Direct line to our product team
• [Special perk for beta users]
• Your feedback will shape the final product

**Getting started is easy:**
1. Click the button below
2. Create your account
3. Start exploring!

[CTA: Claim Your Beta Access]

This invitation expires in 48 hours, so don't wait!

Questions? Just reply to this email.

Best,
[Your Name]
[Company]`,
    tags: ['beta', 'invitation', 'onboarding'],
  },
  // Marketing Templates
  {
    id: 'marketing-blog-1',
    title: 'Case Study Template',
    description: 'Showcase client success stories',
    category: 'blog',
    industry: 'marketing',
    content: `# How [Client Name] Achieved [X% Result] with [Your Solution]

## The Challenge

[Client Name], a [brief description], faced a significant challenge: [describe the problem they were trying to solve].

> "[Quote from client about their initial struggle]"
> — [Client Name], [Title]

## The Solution

After evaluating several options, [Client Name] chose to partner with us because [reason].

**Our approach included:**
- [Strategy/tactic 1]
- [Strategy/tactic 2]
- [Strategy/tactic 3]

## The Results

Within [timeframe], [Client Name] saw remarkable improvements:

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| [Metric 1] | [X] | [Y] | +[Z]% |
| [Metric 2] | [X] | [Y] | +[Z]% |
| [Metric 3] | [X] | [Y] | +[Z]% |

> "[Quote from client about results]"
> — [Client Name], [Title]

## Key Takeaways

1. [Lesson learned]
2. [Best practice discovered]
3. [Recommendation for others]

---

*Want similar results? [Contact us today](link)*`,
    tags: ['case study', 'success story', 'results'],
  },
  {
    id: 'marketing-social-1',
    title: 'LinkedIn Thought Leadership',
    description: 'Establish authority with insights',
    category: 'social',
    industry: 'marketing',
    content: `I've spent [X years] in [industry], and here's what I wish someone told me on day one:

𝟭. [Insight 1]
[Brief explanation]

𝟮. [Insight 2]
[Brief explanation]

𝟯. [Insight 3]
[Brief explanation]

𝟰. [Insight 4]
[Brief explanation]

𝟱. [Insight 5]
[Brief explanation]

The truth is: [Summarizing statement that ties it all together]

What would you add to this list? 👇

---
♻️ Repost if this resonated with you
🔔 Follow me for more insights on [topic]`,
    tags: ['linkedin', 'thought leadership', 'insights'],
  },
  // E-commerce Templates
  {
    id: 'ecommerce-email-1',
    title: 'Abandoned Cart Recovery',
    description: 'Win back customers who left items behind',
    category: 'email',
    industry: 'ecommerce',
    content: `Subject: Forget something? Your cart misses you 🛒

Hi [First Name],

Looks like you left some great items in your cart. Don't worry – we saved them for you!

**Your items are waiting:**
[Product Image] [Product Name] - $[Price]
[Product Image] [Product Name] - $[Price]

**Why complete your order today?**
✓ Free shipping on orders over $[X]
✓ Easy 30-day returns
✓ Secure checkout

[CTA: Complete Your Order]

Still thinking about it? Here's a little nudge:
Use code COMEBACK[X] for [X]% off your order!
*Valid for the next 24 hours*

Need help? Our team is ready to assist.

Happy shopping!
[Brand Name]

P.S. These items are selling fast – grab them before they're gone!`,
    tags: ['cart', 'recovery', 'discount'],
  },
  {
    id: 'ecommerce-product-1',
    title: 'Product Description',
    description: 'Compelling product page copy',
    category: 'product',
    industry: 'ecommerce',
    content: `**[Product Name]**

[One-line value proposition that captures the essence]

---

### Why You'll Love It

[Emotional benefit statement that connects with customer desires]

**Key Features:**
• [Feature 1]: [Benefit explanation]
• [Feature 2]: [Benefit explanation]
• [Feature 3]: [Benefit explanation]
• [Feature 4]: [Benefit explanation]

---

### Specifications
- Material: [Details]
- Dimensions: [Details]
- Weight: [Details]
- Included: [What's in the box]

---

### What Customers Say

⭐⭐⭐⭐⭐ "[Short testimonial]" – [Customer Name]

---

### Satisfaction Guaranteed

[Return policy / warranty information]

**[Price]** | [CTA: Add to Cart]`,
    tags: ['product', 'description', 'sales'],
  },
  // Health Templates
  {
    id: 'health-blog-1',
    title: 'Wellness Guide',
    description: 'Educational health content',
    category: 'blog',
    industry: 'health',
    content: `# [X] Science-Backed Ways to [Health Goal]

*Disclaimer: This content is for informational purposes only. Always consult with a healthcare professional before making changes to your health routine.*

## Introduction

[Hook that connects with reader's health journey and goals]

## 1. [Tip/Strategy 1]

**The Science:** [Brief explanation of research]

**How to Apply It:**
- [Actionable step]
- [Actionable step]
- [Actionable step]

## 2. [Tip/Strategy 2]

**The Science:** [Brief explanation of research]

**How to Apply It:**
- [Actionable step]
- [Actionable step]

## 3. [Tip/Strategy 3]

**The Science:** [Brief explanation of research]

**How to Apply It:**
- [Actionable step]
- [Actionable step]

## Quick-Start Checklist

- [ ] [First step to take today]
- [ ] [Second step]
- [ ] [Third step]

## Conclusion

[Encouraging closing that motivates action]

---

*Have questions? [Book a consultation](link) with our team.*`,
    tags: ['wellness', 'health', 'guide'],
  },
  // Education Templates
  {
    id: 'education-email-1',
    title: 'Course Launch Sequence',
    description: 'Promote your online course',
    category: 'email',
    industry: 'education',
    content: `Subject: [Course Name] is LIVE! 🎉 (Special launch pricing inside)

Hi [First Name],

The moment you've been waiting for is here!

**[Course Name] is officially open for enrollment!**

I created this course because [personal story/reason]. After helping [X] students achieve [result], I've packed everything into this comprehensive program.

**What You'll Learn:**
✅ Module 1: [Topic] - [Outcome]
✅ Module 2: [Topic] - [Outcome]
✅ Module 3: [Topic] - [Outcome]
✅ Module 4: [Topic] - [Outcome]
✅ BONUS: [Bonus content]

**Launch Special (48 hours only):**
Regular Price: $[X]
Your Price: $[Y] (Save [Z]%!)

[CTA: Enroll Now & Save]

**What students are saying:**
"[Testimonial]" – [Student Name]

Don't wait – this special pricing expires in 48 hours!

To your success,
[Your Name]

P.S. Not sure if this is right for you? [Book a free call](link) and let's chat!`,
    tags: ['course', 'launch', 'education'],
  },
  // Finance Templates
  {
    id: 'finance-social-1',
    title: 'Financial Tips Carousel',
    description: 'Instagram carousel for financial advice',
    category: 'social',
    industry: 'finance',
    content: `📊 INSTAGRAM CAROUSEL: [X] Money Mistakes to Avoid in [Year]

---
SLIDE 1 (Cover):
[X] Money Mistakes Costing You Thousands
💰 Swipe to protect your wallet →

---
SLIDE 2:
Mistake #1: [Mistake]
❌ [What people do wrong]
✅ [What to do instead]

---
SLIDE 3:
Mistake #2: [Mistake]
❌ [What people do wrong]
✅ [What to do instead]

---
SLIDE 4:
Mistake #3: [Mistake]
❌ [What people do wrong]
✅ [What to do instead]

---
SLIDE 5:
Mistake #4: [Mistake]
❌ [What people do wrong]
✅ [What to do instead]

---
SLIDE 6 (CTA):
Ready to take control of your finances?
📲 Link in bio for your free [resource]
💬 DM "MONEY" for more tips
🔔 Follow @[handle] for daily insights

---
CAPTION:
Which of these mistakes have you made? (No judgment – we've all been there! 🙋‍♀️)

Drop a [emoji] in the comments if you're ready to level up your money game!

#financetips #moneymindset #financialfreedom #investing`,
    tags: ['instagram', 'carousel', 'finance'],
  },
  // Startup Templates
  {
    id: 'startup-email-1',
    title: 'Investor Update',
    description: 'Monthly update email for investors',
    category: 'email',
    industry: 'startup',
    content: `Subject: [Company] Investor Update – [Month Year]

Hi [Investor Name],

Here's our monthly update on [Company]'s progress.

**📈 Key Metrics**
| Metric | Last Month | This Month | Change |
|--------|------------|------------|--------|
| MRR | $[X] | $[Y] | [+/-Z]% |
| Active Users | [X] | [Y] | [+/-Z]% |
| [Custom Metric] | [X] | [Y] | [+/-Z]% |

**🎯 Highlights**
- [Achievement 1]
- [Achievement 2]
- [Achievement 3]

**🚧 Challenges**
- [Challenge 1]: [How we're addressing it]
- [Challenge 2]: [How we're addressing it]

**👀 What's Next**
- [Priority 1 for next month]
- [Priority 2 for next month]
- [Priority 3 for next month]

**💰 Runway**
[X] months at current burn rate

**🙏 Asks**
1. [Specific ask/intro needed]
2. [Specific ask/intro needed]

Thanks for your continued support!

Best,
[Founder Name]
CEO, [Company]`,
    tags: ['investor', 'update', 'startup'],
  },
  // Food & Beverage Templates
  {
    id: 'food-social-1',
    title: 'Restaurant Social Post',
    description: 'Mouth-watering food content',
    category: 'social',
    industry: 'food',
    content: `🍽️ [Dish Name] - Our chef's latest masterpiece!

[Poetic/appetizing description of the dish]

Made with:
🌿 [Ingredient 1] - [origin/quality]
🧀 [Ingredient 2] - [origin/quality]
🍅 [Ingredient 3] - [origin/quality]

Available [timeframe: tonight only / this weekend / all week]!

📍 [Restaurant Name]
📞 Reserve: [Phone] or link in bio
⏰ [Hours]

Tag someone you'd share this with! 👇

#[restaurant] #foodie #[city]eats #[cuisine]food #finedining`,
    tags: ['restaurant', 'food', 'instagram'],
  },
  // Real Estate Templates
  {
    id: 'realestate-email-1',
    title: 'New Listing Announcement',
    description: 'Property listing email',
    category: 'email',
    industry: 'realestate',
    content: `Subject: Just Listed: Stunning [X] Bed Home in [Neighborhood] 🏡

Hi [First Name],

I'm excited to share this incredible new listing that just hit the market!

**[Property Address]**
[City, State ZIP]

📐 [X] Beds | [X] Baths | [X,XXX] Sq Ft
💰 Listed at $[Price]

**What Makes This Home Special:**
✨ [Feature 1 - e.g., Gourmet kitchen with marble counters]
✨ [Feature 2 - e.g., Primary suite with spa bathroom]
✨ [Feature 3 - e.g., Private backyard oasis]
✨ [Feature 4 - e.g., Walking distance to top-rated schools]

**Neighborhood Highlights:**
• [X] min to [landmark/downtown]
• Near [popular amenity]
• [School district info]

[CTA: Schedule a Private Showing]

This one won't last long! Contact me to arrange your private tour.

Best,
[Agent Name]
[Phone]
[Email]
[Brokerage]`,
    tags: ['listing', 'property', 'realestate'],
  },
  // Fitness Templates
  {
    id: 'fitness-blog-1',
    title: 'Workout Guide',
    description: 'Complete workout routine',
    category: 'blog',
    industry: 'fitness',
    content: `# The Ultimate [X]-Week [Goal] Workout Plan

*Perfect for: [Fitness level] | Equipment needed: [List] | Time: [X] min/session*

## Overview

This [X]-week program is designed to help you [specific goal]. By following this plan consistently, you can expect to [expected results].

## Week 1-2: Foundation Phase

### Day 1: [Body Part/Focus]
| Exercise | Sets | Reps | Rest |
|----------|------|------|------|
| [Exercise 1] | 3 | 12 | 60s |
| [Exercise 2] | 3 | 10 | 60s |
| [Exercise 3] | 3 | 15 | 45s |

### Day 2: [Body Part/Focus]
[Similar table structure]

### Day 3: Active Recovery
- [Activity 1]: [Duration]
- [Activity 2]: [Duration]

## Pro Tips

💡 **Form First:** [Tip about proper form]
💡 **Nutrition:** [Brief nutrition advice]
💡 **Rest:** [Recovery recommendation]

## Track Your Progress

- [ ] Week 1 completed
- [ ] Week 2 completed
- [ ] [Milestone measurement]

---

*Need personalized guidance? [Book a session](link) with our trainers.*`,
    tags: ['workout', 'fitness', 'training'],
  },
  // Creative Agency Templates
  {
    id: 'creative-email-1',
    title: 'Project Proposal',
    description: 'Creative project proposal',
    category: 'email',
    industry: 'creative',
    content: `Subject: Creative Proposal for [Project Name] | [Your Agency]

Hi [Client Name],

Thank you for the opportunity to present our vision for [Project Name]. We're excited about the possibilities!

---

**PROJECT UNDERSTANDING**

Based on our conversation, your key objectives are:
1. [Objective 1]
2. [Objective 2]
3. [Objective 3]

---

**OUR APPROACH**

*Phase 1: Discovery ([Timeframe])*
- [Deliverable/Activity]
- [Deliverable/Activity]

*Phase 2: Creative Development ([Timeframe])*
- [Deliverable/Activity]
- [Deliverable/Activity]

*Phase 3: Execution ([Timeframe])*
- [Deliverable/Activity]
- [Deliverable/Activity]

---

**INVESTMENT**

| Phase | Deliverables | Investment |
|-------|--------------|------------|
| Phase 1 | [Summary] | $[X] |
| Phase 2 | [Summary] | $[X] |
| Phase 3 | [Summary] | $[X] |
| **Total** | | **$[Total]** |

Payment terms: [Terms]

---

**NEXT STEPS**

1. Review this proposal
2. [Schedule a call] to discuss any questions
3. Sign off and kick-off!

Looking forward to bringing this vision to life!

Best,
[Your Name]
[Agency Name]`,
    tags: ['proposal', 'creative', 'project'],
  },
];

interface TemplateLibraryProps {
  onSelectTemplate?: (template: Template) => void;
}

const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onSelectTemplate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const { toast } = useToast();

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = 
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesIndustry = selectedIndustry === 'all' || template.industry === selectedIndustry;
    const matchesType = selectedType === 'all' || template.category === selectedType;
    
    return matchesSearch && matchesIndustry && matchesType;
  });

  const copyTemplate = (template: Template) => {
    navigator.clipboard.writeText(template.content);
    toast({
      title: "Template copied!",
      description: "Paste it in your editor and customize",
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'blog': return FileText;
      case 'social': return Share2;
      case 'email': return Mail;
      case 'product': return ShoppingCart;
      default: return FileText;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'blog': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'social': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      case 'email': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'product': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Library className="w-5 h-5 text-purple-400" />
            Template Library
          </CardTitle>
          <CardDescription>
            Pre-made templates for different industries and use cases. Click to copy and customize.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Industry Filter */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Industry</p>
            <ScrollArea className="w-full">
              <div className="flex gap-2 pb-2">
                {industries.map((industry) => (
                  <Button
                    key={industry.id}
                    variant={selectedIndustry === industry.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedIndustry(industry.id)}
                    className="flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <industry.icon className="w-3.5 h-3.5" />
                    {industry.label}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Content Type Filter */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Content Type</p>
            <div className="flex flex-wrap gap-2">
              {contentTypes.map((type) => (
                <Button
                  key={type.id}
                  variant={selectedType === type.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type.id)}
                  className="flex items-center gap-1.5"
                >
                  <type.icon className="w-3.5 h-3.5" />
                  {type.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => {
          const CategoryIcon = getCategoryIcon(template.category);
          return (
            <Card 
              key={template.id} 
              className="glass border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] cursor-pointer group"
              onClick={() => copyTemplate(template)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-base line-clamp-1">{template.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {template.description}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyTemplate(template);
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge 
                    variant="outline" 
                    className={`flex items-center gap-1 ${getCategoryColor(template.category)}`}
                  >
                    <CategoryIcon className="w-3 h-3" />
                    {template.category}
                  </Badge>
                  <Badge variant="secondary" className="capitalize">
                    {industries.find(i => i.id === template.industry)?.label || template.industry}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {template.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs opacity-60">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <Card className="glass border-0 shadow-xl">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Library className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No templates found matching your criteria.<br />
              Try adjusting your filters or search query.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TemplateLibrary;
