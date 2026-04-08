import React, { useState, useMemo } from 'react';
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { 
  PenLine, 
  Sparkles, 
  Copy, 
  Check, 
  Loader2, 
  Layout, 
  Type as TypeIcon, 
  Hash, 
  Settings2,
  ChevronRight,
  FileCode,
  FileText,
  Briefcase,
  FileStack,
  Globe
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { SEO_KIT_SERVICES, SEO_KIT_STATIC_PAGES } from '../constants/seoKit';
import { BRS_COMPANY_INFO, BRS_PRODUCT_DETAILS, BRS_INTERNAL_LINKS, BRS_EXTERNAL_LINKS } from '../constants/productData';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface GeneratedBlog {
  title: string;
  alternativeHeadlines: string[];
  content: string;
  metaDescription: string;
  keywords: string[];
}

const HUMANIZATION_RULES = `
STRICT WRITING STYLE & SEO RULES:
1. TONE: Conversational, humanized, and friendly, but not overly casual. Speak like a real blogger, not an AI.
2. SENTENCES: Use short sentences and simple words. Remove all academic language and corporate jargon.
3. TRANSITIONS: Remove obvious transition words like "moreover," "however," and "although." Use ideas to naturally connect content.
4. PERSONALITY: Add personality through word choice, casual asides, and brief commentary. Keep it subtle but frequent.
5. AUTHENTICITY: Add 3-5 personal stories, examples, or anecdotes. Focus on authentic experiences that build trust. Do not invent fake stories.
6. AI PATTERNS: Systematically remove predictable AI patterns, repeated sentence structures, and unnecessary clarifications.
7. E-E-A-T: Showcase real experience (e.g., "As a Trichy-based manufacturer since 1989..."). Mention specific Trichy locations like Thillai Nagar, Cantonment, and EVR Road.
8. STRUCTURE: 
   - Start with the H1 Title.
   - Immediately follow with a Featured Image (use high-quality placeholders from Unsplash/Pexels/Pixabay/Burst/StockSnap/Gratisography/Rawpixels).
   - Immediately after the Featured Image, add the (toc) shortcode.
   - Use H1 only once. Use H2, H3, H4 in a logical hierarchy.
   - Minimum 12+ detailed sections.
   - Minimum 1,800 - 3,000+ words for strong authority.
9. CONTENT: Include relevant statistics, quotes, and practical tips. Use bullets, numbered lists, and bold key phrases.
10. KEYWORDS: 
    - Natural density: 0.6–1.0% (NEVER exceed 1.0%).
    - Mandatory placements: Title, Meta Description, H1, First 100 words, at least one H2 or H3, naturally every 150-200 words, and the last paragraph.
    - LOCATION RULE: Everywhere the word "Trichy" appears, you MUST write it as "Trichy, Tamil Nadu, India".
11. IMAGES: 
    - Minimum 5+ unique images per page.
    - Sources: Pexels, Unsplash, Pixabay, Burst by Shopify, StockSnap, Gratisography, Rawpixels.
    - NO REPEATS: Ensure no images are repeated across any posts or pages.
    - IMAGE VARIATION RULE: For each image, use a different specific search term related to the section content (e.g., "stainless steel texture", "neon night city", "modern office reception", "luxury hotel lobby", "digital electronics workshop"). NEVER use the same search term twice.
    - FEATURED IMAGE: Must be HIGHLY SPECIFIC to the blog post title (e.g., if the title mentions "Titanium Gold", the image must show gold metal; if "Neon", it must show neon).
    - Each image must have alt text with the focus keyword, a caption, and CTA text below it.
12. LINKING STRATEGY: 
    - Minimum 15+ internal links to existing blog posts.
    - Minimum 10+ internal links to static pages.
    - Minimum 20+ authoritative external links (Google, Bing, Wikipedia, ArchDaily, Dezeen, etc.).
13. FAQ: Include 15 detailed FAQs with answers at the end.
14. CLOSING: Finish with a friendly, emotional closing paragraph that leaves a strong human impression.
15. CTA: Include WhatsApp buttons for Bennir Raja (94867 50872) and Johni Beski (9786602301) and email brssiigns.try@gmail.com.
`;

export default function BlogGenerator() {
  // Mode State
  const [mode, setMode] = useState<'custom' | 'seo-kit'>('seo-kit');
  const [pageType, setPageType] = useState<'blog' | 'static'>('blog');
  
  // Custom Mode State
  const [topic, setTopic] = useState('Why LED Sign Boards are the Future of Retail in Trichy');
  const [niche, setNiche] = useState('Signage & Branding');
  const [tone, setTone] = useState('Professional');
  const [keywords, setKeywords] = useState('');

  // SEO Kit State
  const [selectedServiceIndex, setSelectedServiceIndex] = useState(0);
  const [selectedTitleIndex, setSelectedTitleIndex] = useState(0);
  const [selectedStaticPageIndex, setSelectedStaticPageIndex] = useState(0);
  const [postNumber, setPostNumber] = useState(1);

  // Common State
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedBlog | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [viewMode, setViewMode] = useState<'preview' | 'html' | 'markdown'>('preview');

  const selectedService = useMemo(() => SEO_KIT_SERVICES[selectedServiceIndex], [selectedServiceIndex]);
  const selectedStaticPage = useMemo(() => SEO_KIT_STATIC_PAGES[selectedStaticPageIndex], [selectedStaticPageIndex]);

  const generateBlog = async () => {
    setIsGenerating(true);
    try {
      let prompt = "";
      let systemInstruction = "";

      const commonStyle = `
<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Exo+2:wght@700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

<style>
.brs-post-wrapper { color: #e8f4ff; line-height: 1.9; font-size: 16px; font-family: 'Inter', sans-serif; background: #010409; padding: 40px; border-radius: 24px; max-width: 1000px; margin: 0 auto; border: 1px solid rgba(0, 212, 255, 0.1); }
.brs-post-wrapper h1, .brs-post-wrapper h2, .brs-post-wrapper h3, .brs-post-wrapper h4 { margin-top: 50px !important; text-transform: none !important; font-family: 'Exo 2', sans-serif; color: #fff; font-weight: 800; }
.brs-post-wrapper h1 { font-size: clamp(2.2rem, 5vw, 3.8rem); margin-top: 0 !important; color: #00d4ff; border-bottom: 3px solid #ff2d55; padding-bottom: 20px; }
.brs-post-wrapper h2 { font-size: 2.2rem; color: #00ff88; border-left: 5px solid #ff2d55; padding-left: 20px; }
.brs-post-wrapper h3 { font-size: 1.8rem; color: #f5c842; }
.brs-internal-link { color: #00d4ff; text-decoration: none; font-weight: 600; border-bottom: 1px dashed #00d4ff; transition: 0.2s; }
.brs-internal-link:hover { color: #fff; border-bottom-style: solid; background: rgba(0,212,255,0.1); }
.brs-img-container { margin: 50px 0; text-align: center; }
.brs-img-container img { width: 100%; border-radius: 24px; border: 1px solid rgba(0, 212, 255, 0.2); box-shadow: 0 20px 50px rgba(0,0,0,0.6); }
.brs-img-caption { font-size: 14px; color: #8aadcc; margin-top: 15px; font-style: italic; }
.brs-toc { background: rgba(255,255,255,0.02); border: 1px solid rgba(0,212,255,0.15); padding: 30px; border-radius: 20px; margin: 50px 0; }
.brs-highlight-box { background: #060f24; border-left: 6px solid #ff2d55; padding: 35px; border-radius: 0 20px 20px 0; margin: 50px 0; }
.brs-faq-item { border-bottom: 1px solid rgba(255,255,255,0.05); padding: 20px 0; }
.brs-faq-q { cursor: pointer; font-weight: 700; font-family: 'Rajdhani', sans-serif; font-size: 18px; display: flex; justify-content: space-between; color: #fff; }
.brs-faq-a { padding-top: 15px; color: #8aadcc; display: none; }
.brs-faq-item.active .brs-faq-a { display: block; }
.brs-cta-block { background: linear-gradient(135deg, #060f24, #0a1f3a); padding: 60px; border-radius: 30px; text-align: center; margin-top: 80px; border: 1px solid rgba(0,212,255,0.2); }
.brs-cta-btn { display: inline-block; background: #ff2d55; color: #fff !important; padding: 20px 45px; border-radius: 60px; font-weight: 800; font-family: 'Rajdhani', sans-serif; text-decoration: none !important; font-size: 1.3rem; margin: 15px; box-shadow: 0 10px 20px rgba(255,45,85,0.3); }
.brs-cta-btn:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(255,45,85,0.5); }
</style>
`;

      if (mode === 'custom') {
        systemInstruction = "You are an expert SEO copywriter.";
        prompt = `Write a complete, engaging 1200-1500 word SEO-optimized blog post.
        
        Topic: ${topic}
        Niche: ${niche}
        Tone: ${tone}
        Target Keywords: ${keywords}
        
        Requirements:
        - Catchy title and 3-5 alternative headlines
        - Introduction with hook
        - Well-structured sections with subheadings (H2/H3)
        - Bullet points, numbered lists where appropriate
        - Conclusion with call-to-action
        - Include relevant keywords naturally for SEO
        - Add meta description (150-160 characters)`;
      } else {
        // SEO KIT MODE
        const companyInfo = JSON.stringify(BRS_COMPANY_INFO, null, 2);
        const internalLinks = BRS_INTERNAL_LINKS.join('\n');
        const externalLinks = BRS_EXTERNAL_LINKS.join('\n');

        if (pageType === 'static') {
          const page = selectedStaticPage;
          systemInstruction = `You are an expert SEO copywriter and Blogger developer for BRS SIIGNS Trichy, Tamil Nadu, India. Create a complete ready-to-paste HTML page for Blogger using the exact SEO Next Premium template style. Start your entire response with this exact header block only:

<!-- 
================================================================
BRS SIGNS TRICHY — ${page.name.toUpperCase()} PAGE
Focus Keyword: ${page.focusKeyword}
Target Word Count: 1,200+ Words | 8 Images | 25+ Links | 15 FAQ
================================================================
-->

Then immediately output this exact code block without any extra text:
${commonStyle}`;

          prompt = `Create a full SEO-optimized static page for BRS SIIGNS Trichy, Tamil Nadu, India using the exact page name and primary focus keyword below. 
          
          ${HUMANIZATION_RULES}

          IMAGE VARIATION INSTRUCTION: This is page #${Math.floor(Math.random() * 1000)}. Use unique search terms for images that you haven't used in previous generations.

          Company Information to include:
          ${companyInfo}

          Internal Links for linking:
          ${internalLinks}

          External Authoritative Links for linking:
          ${externalLinks}

          Follow every rule from On-Page SEO Master Guide v2.0. Ensure the HTML structure is: H1 -> Featured Image -> (toc) -> Content. 
          
          Use unique high-quality stock images from the specified sources. Each image must have perfect alt text containing the focus keyword and a caption + CTA text below it. Add minimum 15 internal links to posts, 10 to pages, and 20+ authoritative external links. For Contact page include a working HTML contact form. End with strong CTA block. Output only the HTML inside the div class brs-post-wrapper. No extra explanation.

Page Name = ${page.name}
Primary Focus Keyword = ${page.focusKeyword}`;
        } else {
          const service = selectedService as any;
          const title = service.titles[selectedTitleIndex];
          
          // Map service name to product details key
          const productKeyMap: Record<string, string> = {
            "LED Neon Signs": "ledNeon",
            "Acrylic Edge Lit Signs": "acrylicEdgeLit",
            "3D Metal Letters": "metalLetters",
            "Vinyl Flex Banners & Hoardings": "vinylFlexShield",
            "LED Running Display Boards": "ledRunningDisplays",
            "Modular Signage Systems": "modularSignage",
            "Custom Mementos": "customMementos"
          };
          const productDetailKey = productKeyMap[service.name];
          const productSpecifics = productDetailKey ? JSON.stringify((BRS_PRODUCT_DETAILS as any)[productDetailKey], null, 2) : "";

          systemInstruction = `You are an expert SEO copywriter and Blogger developer for BRS SIIGNS Trichy, Tamil Nadu, India. Create a complete ready-to-paste HTML blog post for Blogger using the exact SEO Next Premium template style. Start your entire response with this exact header block only:

<!-- 
================================================================
BRS SIGNS TRICHY — BLOG POST #${postNumber}: ${service.name}
"${title}"
Focus Keyword: ${service.focusKeyword}
Target Word Count: 2,200+ Words | 12+ Sections | 45+ Links | 15 FAQ | 5+ Images
Labels: ${service.name}, Trichy, Signage
Description: SEO optimized guide for ${service.name} in Trichy, Tamil Nadu, India.
================================================================
-->

Then immediately output this exact code block without any extra text:
${commonStyle}`;

          prompt = `Create a full 2,200+ word SEO blog post using the product specifics and company profile provided below. 
          
          ${HUMANIZATION_RULES}

          IMAGE VARIATION INSTRUCTION: This is blog post #${postNumber}. Use unique search terms for images that you haven't used in previous generations. For the featured image, choose a visual concept that is distinct from other posts in the ${service.name} category.

          Product Specifics (Pain points, benefits, technical specs):
          ${productSpecifics}

          Company Information:
          ${companyInfo}

          Internal Links for linking:
          ${internalLinks}

          External Authoritative Links for linking:
          ${externalLinks}

          Ensure the HTML structure is: H1 -> Featured Image -> (toc) -> Content. Include pain-points vs benefits tables, lifespan comparison tables, technical specs from the provided data. 
          
          Use unique stock images from the specified sources. Each image must have alt text with focus keyword + caption + CTA text below. Minimum 12+ detailed sections + introduction + final verdict. Minimum 15 internal links to posts, 10 to pages, and 20+ authoritative external links. Add 15 detailed FAQ at the end. End with strong CTA block. Output only the HTML inside the div class brs-post-wrapper. No extra explanation.

Product Name = ${service.name}
Focus Keyword = ${service.focusKeyword}
Short-tail Keywords = ${service.shortTailKeywords?.join(', ')}
Long-tail Keywords = ${service.longTailKeywords?.join(', ')}
Post Number = #${postNumber}
SEO Title = ${title}`;
        }
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              alternativeHeadlines: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              },
              content: { type: Type.STRING, description: "The full blog post content. If in SEO Kit mode, this should be the FULL HTML including style and link tags." },
              metaDescription: { type: Type.STRING },
              keywords: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              }
            },
            required: ["title", "alternativeHeadlines", "content", "metaDescription", "keywords"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      setResult(data);
      // If in SEO Kit mode, default to HTML view
      if (mode === 'seo-kit') setViewMode('html');
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus('copied');
    setTimeout(() => setCopyStatus('idle'), 2000);
  };

  const getHtmlContent = (content: string) => {
    // If it already looks like HTML (starts with <!-- or <), return as is
    if (content.trim().startsWith('<!--') || content.trim().startsWith('<')) {
      return content;
    }
    
    // Otherwise convert markdown to HTML
    return content
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/<\/li>\n<li>/gim, '</li><li>')
      .replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>')
      .replace(/\n\n/gim, '</p><p>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar / Input Section */}
      <aside className="w-full lg:w-[400px] bg-white border-r border-gray-200 p-6 lg:h-screen lg:overflow-y-auto flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-accent/20">
            <PenLine size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Blog Architect</h1>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">SEO Engine v3.1</p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex p-1 bg-gray-100 rounded-xl mb-8">
          <button 
            onClick={() => setMode('seo-kit')}
            className={cn(
              "flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2",
              mode === 'seo-kit' ? "bg-white shadow-sm text-brand-primary" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Sparkles size={14} /> SEO Kit
          </button>
          <button 
            onClick={() => setMode('custom')}
            className={cn(
              "flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2",
              mode === 'custom' ? "bg-white shadow-sm text-brand-primary" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Settings2 size={14} /> Custom
          </button>
        </div>

        <div className="space-y-6 flex-1">
          {mode === 'custom' ? (
            <>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <TypeIcon size={14} /> Topic / Subject
                </label>
                <textarea 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. The Future of Sustainable Architecture in 2026"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent outline-none transition-all min-h-[100px] resize-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <Layout size={14} /> Niche
                  </label>
                  <select 
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-accent"
                  >
                    <option>Signage & Branding</option>
                    <option>Local Business</option>
                    <option>Technology</option>
                    <option>Finance</option>
                    <option>Travel</option>
                    <option>Health</option>
                    <option>Lifestyle</option>
                    <option>Business</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <Sparkles size={14} /> Tone
                  </label>
                  <select 
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-accent"
                  >
                    <option>Conversational</option>
                    <option>Professional</option>
                    <option>Enthusiastic</option>
                    <option>Informative</option>
                    <option>Witty</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <Hash size={14} /> Keywords (Optional)
                </label>
                <input 
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g. green building, smart cities"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-accent"
                />
              </div>
            </>
          ) : (
            <>
              {/* SEO KIT UI */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <FileStack size={14} /> Page Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setPageType('blog')}
                      className={cn(
                        "py-2 rounded-lg text-xs font-bold border transition-all",
                        pageType === 'blog' ? "bg-brand-primary text-white border-brand-primary" : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
                      )}
                    >
                      Blog Post
                    </button>
                    <button 
                      onClick={() => setPageType('static')}
                      className={cn(
                        "py-2 rounded-lg text-xs font-bold border transition-all",
                        pageType === 'static' ? "bg-brand-primary text-white border-brand-primary" : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
                      )}
                    >
                      Static Page
                    </button>
                  </div>
                </div>

                {pageType === 'blog' ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                        <Briefcase size={14} /> Service Category
                      </label>
                      <select 
                        value={selectedServiceIndex}
                        onChange={(e) => {
                          setSelectedServiceIndex(Number(e.target.value));
                          setSelectedTitleIndex(0);
                        }}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-accent"
                      >
                        {SEO_KIT_SERVICES.map((s, i) => (
                          <option key={i} value={i}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                        <TypeIcon size={14} /> Target Title
                      </label>
                      <select 
                        value={selectedTitleIndex}
                        onChange={(e) => setSelectedTitleIndex(Number(e.target.value))}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-accent"
                      >
                        {selectedService.titles.map((t, i) => (
                          <option key={i} value={i}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                        <Hash size={14} /> Post Number
                      </label>
                      <input 
                        type="number"
                        value={postNumber}
                        onChange={(e) => setPostNumber(Number(e.target.value))}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-accent"
                      />
                    </div>

                    <div className="p-4 bg-brand-accent/5 rounded-2xl border border-brand-accent/10 space-y-2">
                      <div className="flex items-center gap-2 text-brand-accent">
                        <Globe size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">SEO Focus</span>
                      </div>
                      <p className="text-xs text-gray-600 font-medium leading-relaxed">
                        {selectedService.focusKeyword}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                        <Layout size={14} /> Select Page
                      </label>
                      <select 
                        value={selectedStaticPageIndex}
                        onChange={(e) => setSelectedStaticPageIndex(Number(e.target.value))}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-accent"
                      >
                        {SEO_KIT_STATIC_PAGES.map((p, i) => (
                          <option key={i} value={i}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="p-4 bg-brand-accent/5 rounded-2xl border border-brand-accent/10 space-y-2">
                      <div className="flex items-center gap-2 text-brand-accent">
                        <Globe size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">SEO Focus</span>
                      </div>
                      <p className="text-xs text-gray-600 font-medium leading-relaxed">
                        {selectedStaticPage.focusKeyword}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          <div className="pt-4">
            <button 
              onClick={generateBlog}
              disabled={isGenerating || (mode === 'custom' && !topic)}
              className={cn(
                "w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 shadow-xl",
                isGenerating || (mode === 'custom' && !topic)
                  ? "bg-gray-300 cursor-not-allowed shadow-none" 
                  : "bg-brand-primary hover:bg-black active:scale-[0.98] shadow-brand-primary/20"
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Architecting...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate {mode === 'seo-kit' ? (pageType === 'blog' ? 'Post' : 'Page') : 'Post'}
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-auto pt-8 border-t border-gray-100">
          <div className="flex items-center gap-3 text-gray-400">
            <Settings2 size={16} />
            <span className="text-xs font-medium uppercase tracking-widest">Powered by Gemini 3.1 Pro</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-brand-paper h-screen overflow-y-auto p-4 lg:p-12">
        {!result && !isGenerating && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-gray-100">
              <PenLine size={40} className="text-gray-300" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Ready to write?</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                {mode === 'seo-kit' 
                  ? "Select a service and title from the SEO Kit to generate a high-ranking post for BRS SIIGNS Trichy."
                  : "Enter a topic on the left to generate a high-quality, SEO-optimized blog post with advanced reasoning."}
              </p>
            </div>
          </div>
        )}

        {isGenerating && (
          <div className="h-full flex flex-col items-center justify-center space-y-8">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-brand-accent/10 border-t-brand-accent rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="text-brand-accent animate-pulse" size={32} />
              </div>
            </div>
            <div className="text-center space-y-3">
              <h3 className="text-xl font-bold animate-pulse">Thinking Deeply...</h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">
                Gemini is researching the topic, structuring the narrative, and optimizing for SEO.
              </p>
            </div>
          </div>
        )}

        {result && !isGenerating && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Meta Info */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-accent">Generated Output</span>
                  <h2 className="text-3xl font-serif font-bold leading-tight">{result.title}</h2>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
                  <button 
                    onClick={() => setViewMode('preview')}
                    className={cn(
                      "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                      viewMode === 'preview' ? "bg-white shadow-sm text-brand-primary" : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    <Layout size={14} /> Preview
                  </button>
                  <button 
                    onClick={() => setViewMode('markdown')}
                    className={cn(
                      "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                      viewMode === 'markdown' ? "bg-white shadow-sm text-brand-primary" : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    <FileText size={14} /> Markdown
                  </button>
                  <button 
                    onClick={() => setViewMode('html')}
                    className={cn(
                      "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                      viewMode === 'html' ? "bg-white shadow-sm text-brand-primary" : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    <FileCode size={14} /> HTML
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-50">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Meta Description</h4>
                  <p className="text-sm text-gray-600 leading-relaxed italic bg-brand-paper/50 p-4 rounded-2xl border border-gray-100">
                    "{result.metaDescription}"
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Alternative Headlines</h4>
                  <ul className="space-y-2">
                    {result.alternativeHeadlines.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <ChevronRight size={16} className="text-brand-accent shrink-0 mt-0.5" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                <div className="flex flex-wrap gap-2">
                  {result.keywords.map((k, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-500 rounded-full">
                      {k}
                    </span>
                  ))}
                </div>
                <button 
                  onClick={() => copyToClipboard(viewMode === 'html' ? getHtmlContent(result.content) : result.content)}
                  className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl text-xs font-bold hover:bg-black transition-all active:scale-95 shadow-lg shadow-brand-primary/20"
                >
                  {copyStatus === 'copied' ? <Check size={16} /> : <Copy size={16} />}
                  {copyStatus === 'copied' ? 'Copied!' : `Copy ${viewMode.toUpperCase()}`}
                </button>
              </div>
            </div>

            {/* Content Preview */}
            <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 min-h-[600px]">
              {viewMode === 'preview' && (
                <div className="markdown-body">
                  {/* If it's HTML, we should probably use an iframe or dangerouslySetInnerHTML, but for preview we'll try to render markdown */}
                  {result.content.trim().startsWith('<!--') ? (
                    <div className="text-center py-20 space-y-4">
                      <FileCode size={48} className="mx-auto text-gray-200" />
                      <p className="text-gray-500 text-sm">HTML Preview is not available for SEO Kit templates. Please use the <strong>HTML</strong> tab to view and copy the code.</p>
                    </div>
                  ) : (
                    <ReactMarkdown>{result.content}</ReactMarkdown>
                  )}
                </div>
              )}
              {viewMode === 'markdown' && (
                <pre className="text-sm font-mono text-gray-700 whitespace-pre-wrap bg-gray-50 p-8 rounded-2xl border border-gray-100 overflow-x-auto">
                  {result.content}
                </pre>
              )}
              {viewMode === 'html' && (
                <pre className="text-sm font-mono text-gray-700 whitespace-pre-wrap bg-gray-50 p-8 rounded-2xl border border-gray-100 overflow-x-auto">
                  {getHtmlContent(result.content)}
                </pre>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
