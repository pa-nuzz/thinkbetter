'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────
type Mode = 'idea' | 'script' | 'brainstorm' | 'prompt';
type Phase = 'input' | 'clarifying' | 'generating' | 'revealing' | 'done';
type QType = 'select' | 'text' | 'multiselect';

interface Question {
  id: string; text: string; type: QType;
  options?: string[]; placeholder?: string;
  skip?: (input: string) => boolean;
}
interface OutputSection { id: string; title: string; content: string; refined?: string; }
interface Answers { [key: string]: string | string[]; }

// ─── Mode Config ───────────────────────────────────────────────────────────
const MODES: Record<Mode, {
  label: string; icon: string; tagline: string; hint: string;
  sections: string[]; questions: Question[];
  systemPrompt: (input: string, answers: Answers) => string;
}> = {
  idea: {
    label: 'Idea', icon: '◈', tagline: 'Turn concepts into strategy',
    hint: 'Describe any idea — app, business, product, service, or concept…',
    sections: ['Refined Idea', 'Core Features', 'Unique Twist', 'Target Users', 'Monetization', 'MVP Plan'],
    questions: [
      { id: 'type', text: 'What type of idea is this?', type: 'select',
        options: ['Mobile App', 'Web App', 'SaaS', 'Physical Product', 'Service Business', 'Content / Media', 'Other'],
        skip: (i) => /mobile|web app|saas|physical|service|content|startup/i.test(i) },
      { id: 'problem', text: 'What core problem does it solve?', type: 'text',
        placeholder: 'e.g. People waste hours organising tasks manually…',
        skip: (i) => i.length > 80 || /solv|problem|fix|help|enable/i.test(i) },
      { id: 'platform', text: 'Target platform?', type: 'select',
        options: ['iOS', 'Android', 'Cross-platform', 'Web / Browser', 'Desktop', 'Not applicable'],
        skip: (i) => /ios|android|cross.platform|web app|desktop|n\/a/i.test(i) },
    ],
    systemPrompt: (input, a) => `You are ThinkBetter — a sharp, direct product strategist.

User idea: "${input}"
${a.type ? `Type: ${a.type}` : ''}${a.problem ? `\nCore problem: ${a.problem}` : ''}${a.platform ? `\nPlatform: ${a.platform}` : ''}

Return EXACTLY these 6 sections. Each heading on its own line starting with ##.

## Refined Idea
3–5 sentence elevator pitch. Specific, compelling, clear.

## Core Features
5–7 must-have features. Each as: **Feature Name** — one-line value explanation.

## Unique Twist
1–2 angles that create real differentiation. Be specific, not generic.

## Target Users
Primary persona. Age range, behaviour, pain points, current alternatives.

## Monetization
3–4 revenue models with brief pros/cons each.

## MVP Plan
3-phase build plan. Phase 1 (core loop, 4–6 weeks), Phase 2 (growth), Phase 3 (scale).

Rules: No filler. Every sentence specific to THIS idea.`,
  },
  script: {
    label: 'Script', icon: '◉', tagline: 'Craft words that land',
    hint: 'Describe what you want to say — YouTube video, pitch, podcast, talk…',
    sections: ['Hook', 'Main Script', 'Key Takeaways', 'Call to Action', 'Delivery Notes'],
    questions: [
      { id: 'format', text: 'What format is this for?', type: 'select',
        options: ['YouTube Video', 'Podcast Episode', 'Investor Pitch', 'Product Demo', 'Social Media Reel', 'Keynote / Talk', 'Sales Call', 'Other'],
        skip: (i) => /youtube|podcast|pitch|demo|reel|keynote|talk|sales/i.test(i) },
      { id: 'length', text: 'Approximate length?', type: 'select',
        options: ['Under 60 seconds', '1–3 minutes', '3–10 minutes', '10–20 minutes', '20+ minutes'] },
      { id: 'audience', text: 'Who is the audience?', type: 'text',
        placeholder: 'e.g. early-stage founders, gym beginners, tech recruiters…',
        skip: (i) => /audience|targeting|speaking to/i.test(i) },
    ],
    systemPrompt: (input, a) => `You are ThinkBetter — a professional scriptwriter.

Topic: "${input}"
${a.format ? `Format: ${a.format}` : ''}${a.length ? `\nLength: ${a.length}` : ''}${a.audience ? `\nAudience: ${a.audience}` : ''}

Return EXACTLY these 5 sections. Each heading starts with ##.

## Hook
Powerful opening (15–30 seconds). Write the actual ready-to-use hook text.

## Main Script
Full script body. Natural spoken language. Mark [PAUSE], [CUT TO:], *emphasis*.

## Key Takeaways
3–5 core messages. Punchy, memorable bullets.

## Call to Action
Clear, specific CTA. What should audience do immediately after?

## Delivery Notes
Tone, pacing, visual suggestions, energy cues.

Rules: Write actual script, not descriptions. Sound human.`,
  },
  brainstorm: {
    label: 'Brainstorm', icon: '◎', tagline: 'Explore every angle',
    hint: "Drop a topic, problem, or challenge and I'll explore it from every angle…",
    sections: ['Different Perspectives', 'Creative Solutions', 'Practical Improvements', 'Unexpected Ideas', 'Quick Wins', 'Next Steps'],
    questions: [
      { id: 'goal', text: "What's the main goal?", type: 'select',
        options: ['Generate new ideas', 'Solve a specific problem', 'Explore opportunities', 'Challenge assumptions', 'Plan a strategy', 'Creative exploration'] },
      { id: 'constraints', text: 'Any constraints?', type: 'multiselect',
        options: ['Low budget', 'Time-limited', 'Small team', 'Technical limits', 'Regulatory', 'No constraints'] },
    ],
    systemPrompt: (input, a) => `You are ThinkBetter — a creative strategist and systems thinker.

Topic: "${input}"
${a.goal ? `Goal: ${a.goal}` : ''}${a.constraints ? `\nConstraints: ${Array.isArray(a.constraints) ? a.constraints.join(', ') : a.constraints}` : ''}

Return EXACTLY these 6 sections. Each heading starts with ##.

## Different Perspectives
4 distinct lenses. One paragraph each. Be specific.

## Creative Solutions
6–8 distinct approaches. Each as **Bold title** — 2-sentence explanation.

## Practical Improvements
4–5 concrete enhancements achievable given constraints.

## Unexpected Ideas
2–3 surprising angles. Explain the logic behind each.

## Quick Wins
3–5 things doable in 2 weeks with minimal resources.

## Next Steps
Prioritised sequence. First, second, third — and why that order.

Rules: Avoid clichés. Every idea specific to THIS topic.`,
  },
  prompt: {
    label: 'Prompt', icon: '◇', tagline: 'Engineer better AI outputs',
    hint: 'Paste any AI prompt you want to improve, or describe what you need a prompt for…',
    sections: ['Enhanced Prompt', 'Variation 2', 'Variation 3', 'Usage Tips', 'Why This Works'],
    questions: [
      { id: 'model', text: 'Which AI model?', type: 'select',
        options: ['GPT-4 / ChatGPT', 'Claude (Anthropic)', 'Gemini', 'Llama / open-source', 'Any / Universal'],
        skip: (i) => /gpt|claude|gemini|llama|openai|anthropic/i.test(i) },
      { id: 'output_type', text: 'What should the AI output?', type: 'select',
        options: ['Written text / essay', 'Structured list / bullets', 'Code', 'Analysis / research', 'Creative content', 'JSON / structured data'],
        skip: (i) => /write|list|code|analys|creat|json|structur/i.test(i) },
    ],
    systemPrompt: (input, a) => `You are ThinkBetter — an expert prompt engineer.

Original: "${input}"
${a.model ? `Target model: ${a.model}` : ''}${a.output_type ? `\nOutput type: ${a.output_type}` : ''}

Return EXACTLY these 5 sections. Each heading starts with ##.

## Enhanced Prompt
Best, most complete version. Role, context, task, format, constraints. Copy-paste ready.

## Variation 2
Different approach — one sentence on what makes it different, then full prompt.

## Variation 3
Another variation using specific technique. One sentence on angle, then full prompt.

## Usage Tips
3–4 specific tips: temperature, system vs user prompt, iteration, common mistakes.

## Why This Works
Key prompt engineering principles used. Why effective for the target model.

Rules: Prompts must be immediately usable.`,
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────
function isVague(input: string, mode: Mode): boolean {
  const t = input.trim();
  if (t.length > 130) return false;
  const patterns = [/^i have (a|an) (idea|concept|thought)/i, /^(help me|can you|please) (with|create|make|build|write)/i, /^(something|some kind of)/i, /^(i want|i need|i'm thinking about)/i];
  if (patterns.some(p => p.test(t))) return true;
  if ((mode === 'idea' || mode === 'script') && t.split(' ').length < 10) return true;
  return false;
}
function getQuestions(input: string, mode: Mode): Question[] {
  return MODES[mode].questions.filter(q => !q.skip || !q.skip(input));
}
function parseSections(raw: string): OutputSection[] {
  const sections: OutputSection[] = [];
  let cur: { title: string; lines: string[] } | null = null;
  for (const line of raw.split('\n')) {
    const m = line.match(/^##\s+(.+)$/);
    if (m) { if (cur) sections.push({ id: cur.title, title: cur.title, content: cur.lines.join('\n').trim() }); cur = { title: m[1].trim(), lines: [] }; }
    else if (cur) cur.lines.push(line);
  }
  if (cur) sections.push({ id: cur.title, title: cur.title, content: cur.lines.join('\n').trim() });
  return sections.length ? sections : [{ id: 'result', title: 'Result', content: raw.trim() }];
}

// ─── Anti-Gravity Canvas (Boosted) ─────────────────────────────────────────
function AntiGravityCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pRef = useRef<{ x:number;y:number;ox:number;oy:number;vx:number;vy:number;r:number;c:string;baseA:number }[]>([]);
  const mRef = useRef({ x: -999, y: -999, on: false });
  const raf = useRef(0);

  const build = (w: number, h: number) => {
    pRef.current = Array.from({ length: Math.floor(w * h * 0.000105) }, () => {
      const x = Math.random() * w, y = Math.random() * h;
      const lime = Math.random() > 0.89;
      return { x, y, ox: x, oy: y, vx: 0, vy: 0,
        r: Math.random() * 1.9 + 0.35,
        c: lime ? '#E8FF5A' : '#ffffff',
        baseA: lime ? 0.78 : Math.random() * 0.36 + 0.14 };
    });
  };

  const tick = useCallback(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    ctx.clearRect(0, 0, cv.width, cv.height);
    const { x: mx, y: my, on } = mRef.current;
    for (const p of pRef.current) {
      if (on) {
        const dx = mx - p.x, dy = my - p.y, d = Math.sqrt(dx*dx+dy*dy);
        if (d < 135 && d > 0) { const f=(135-d)/135; p.vx -= dx/d*f*3.4; p.vy -= dy/d*f*3.4; }
      }
      p.vx += (p.ox-p.x)*0.053; p.vy += (p.oy-p.y)*0.053;
      p.vx *= 0.875; p.vy *= 0.875;
      p.x += p.vx; p.y += p.vy;
      const spd = Math.sqrt(p.vx*p.vx+p.vy*p.vy);
      ctx.globalAlpha = Math.min(p.baseA + spd*0.19, 0.96);
      ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    raf.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    const resize = () => {
      if (!wrapRef.current || !cvRef.current) return;
      const { width: w, height: h } = wrapRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio||1, 2);
      cvRef.current.width = w*dpr; cvRef.current.height = h*dpr;
      cvRef.current.style.width = `${w}px`; cvRef.current.style.height = `${h}px`;
      cvRef.current.getContext('2d')?.scale(dpr, dpr);
      build(w, h);
    };
    resize(); window.addEventListener('resize', resize);
    raf.current = requestAnimationFrame(tick);
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf.current); };
  }, [tick]);

  return (
    <div ref={wrapRef} style={{ position:'absolute', inset:0, background:'#060606' }}
      onMouseMove={e => { const r=wrapRef.current?.getBoundingClientRect(); if(r) mRef.current={x:e.clientX-r.left,y:e.clientY-r.top,on:true}; }}
      onMouseLeave={() => { mRef.current.on=false; }}>
      <canvas ref={cvRef} style={{ display:'block' }} />
    </div>
  );
}

// ─── Lamp Divider ─────────────────────────────────────────────────────────
function LampDivider({ mode }: { mode: Mode }) {
  const [on, setOn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), 100); return () => clearTimeout(t); }, []);
  const L = '#E8FF5A';
  const cw = on ? '34rem' : '8rem';

  return (
    <div style={{ position:'relative', width:'100%', height:260, overflow:'hidden', flexShrink:0 }}>
      {/* Left cone */}
      <div style={{
        position:'absolute', top:0, right:'50%',
        width:cw, height:220,
        backgroundImage:`conic-gradient(from 68deg at center top, ${L}60, ${L}28, transparent 48%)`,
        transition:'width 1.1s cubic-bezier(0.22,1,0.36,1)',
        overflow:'hidden',
      }}>
        <div style={{ position:'absolute', left:0, top:0, width:100, height:'100%', background:'linear-gradient(to right,#060606,transparent)', zIndex:2 }} />
        <div style={{ position:'absolute', bottom:0, left:0, width:'100%', height:100, background:'linear-gradient(to top,#060606,transparent)', zIndex:2 }} />
      </div>
      {/* Right cone */}
      <div style={{
        position:'absolute', top:0, left:'50%',
        width:cw, height:220,
        backgroundImage:`conic-gradient(from 292deg at center top, ${L}60, ${L}28, transparent 48%)`,
        transition:'width 1.1s cubic-bezier(0.22,1,0.36,1)',
        overflow:'hidden',
      }}>
        <div style={{ position:'absolute', right:0, top:0, width:100, height:'100%', background:'linear-gradient(to left,#060606,transparent)', zIndex:2 }} />
        <div style={{ position:'absolute', bottom:0, left:0, width:'100%', height:100, background:'linear-gradient(to top,#060606,transparent)', zIndex:2 }} />
      </div>
      {/* Wide ambient glow */}
      <div style={{
        position:'absolute', top:'-40%', left:'50%',
        transform:'translateX(-50%)',
        width: on ? '26rem' : '6rem',
        height:200,
        background:`radial-gradient(ellipse, ${L}14 0%, transparent 68%)`,
        filter:'blur(20px)',
        transition:'width 1.1s cubic-bezier(0.22,1,0.36,1)',
        pointerEvents:'none',
      }} />
      {/* Tight orb */}
      <div style={{
        position:'absolute', top:'-10%', left:'50%',
        transform:'translateX(-50%)',
        width:64, height:64,
        background:`radial-gradient(circle, ${L}70 0%, ${L}20 40%, transparent 70%)`,
        filter:'blur(8px)',
        borderRadius:'50%',
        animation:'lampPulse 3s ease-in-out infinite',
      }} />
      {/* Beam line */}
      <div style={{
        position:'absolute', top:0, left:'50%',
        transform:'translateX(-50%)',
        width: on ? '32rem' : '6rem',
        height:2,
        background:`linear-gradient(to right, transparent, ${L}aa, ${L}ff, ${L}aa, transparent)`,
        boxShadow:`0 0 16px ${L}77, 0 0 40px ${L}33`,
        transition:'width 1.1s cubic-bezier(0.22,1,0.36,1)',
      }} />
      {/* Content centered in lamp glow */}
      <div style={{
        position:'absolute', bottom:30, left:0, right:0,
        display:'flex', flexDirection:'column', alignItems:'center', gap:10,
        zIndex:10,
        opacity: on ? 1 : 0,
        transform: on ? 'translateY(0)' : 'translateY(14px)',
        transition:'opacity 0.7s ease 0.6s, transform 0.7s ease 0.6s',
      }}>
        <span style={{
          fontFamily:"'Bricolage Grotesque', sans-serif",
          fontSize:'clamp(2rem,4.5vw,3rem)',
          fontWeight:800, letterSpacing:'-0.04em',
          background:'linear-gradient(175deg,#fff 30%,rgba(255,255,255,0.42) 100%)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
        }}>Your Workspace</span>
        <span style={{ fontSize:12.5, color:'rgba(255,255,255,0.3)', letterSpacing:'0.08em', textTransform:'uppercase' as const }}>
          {MODES[mode].label} · {MODES[mode].tagline}
        </span>
      </div>
      {/* Floor fade */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:60, background:'linear-gradient(to bottom,transparent,#060606)', zIndex:5 }} />
    </div>
  );
}

// ─── Rich Content ──────────────────────────────────────────────────────────
function RichContent({ text }: { text: string }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <div key={i} style={{ height:4 }} />;
        const bb = line.match(/^[-•*]\s+\*\*(.+?)\*\*\s*[-—]\s*(.+)$/);
        if (bb) return (
          <div key={i} style={{ display:'flex', gap:11, paddingLeft:2 }}>
            <span style={{ color:'#E8FF5A', flexShrink:0, fontSize:7, marginTop:6 }}>◆</span>
            <span style={{ fontSize:14, lineHeight:1.8, color:'rgba(255,255,255,0.76)' }}>
              <strong style={{ color:'#fff', fontWeight:600 }}>{bb[1]}</strong>
              <span style={{ color:'rgba(255,255,255,0.35)' }}> — </span>
              {bb[2]}
            </span>
          </div>
        );
        const b = line.match(/^[-•*]\s+(.+)$/);
        if (b) return (
          <div key={i} style={{ display:'flex', gap:11, paddingLeft:2 }}>
            <span style={{ width:4, height:4, borderRadius:'50%', background:'rgba(232,255,90,0.7)', flexShrink:0, marginTop:9 }} />
            <span style={{ fontSize:14, lineHeight:1.8, color:'rgba(255,255,255,0.76)' }}>{b[1]}</span>
          </div>
        );
        const n = line.match(/^(\d+)[.)]\s+(.+)$/);
        if (n) return (
          <div key={i} style={{ display:'flex', gap:12, paddingLeft:2 }}>
            <span style={{ color:'#E8FF5A', fontSize:11, fontWeight:700, flexShrink:0, minWidth:16, marginTop:3 }}>{n[1]}.</span>
            <span style={{ fontSize:14, lineHeight:1.8, color:'rgba(255,255,255,0.76)' }}>{n[2]}</span>
          </div>
        );
        if (/^Phase \d+/i.test(line)) return <p key={i} style={{ color:'rgba(255,255,255,0.9)', fontWeight:600, fontSize:13, margin:'8px 0 2px' }}>{line}</p>;
        return <p key={i} style={{ fontSize:14, lineHeight:1.85, color:'rgba(255,255,255,0.68)', margin:0 }}>{line}</p>;
      })}
    </div>
  );
}

// ─── Question Input ────────────────────────────────────────────────────────
function QInput({ q, value, onChange }: { q:Question; value:string|string[]; onChange:(v:string|string[])=>void }) {
  if (q.type==='text') return (
    <input type="text" placeholder={q.placeholder} value={(value as string)||''}
      onChange={e=>onChange(e.target.value)}
      style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'11px 14px', fontSize:14, color:'#F0F0F0', fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const, transition:'border 0.15s' }}
      onFocus={e=>{e.target.style.borderColor='rgba(232,255,90,0.45)';}}
      onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.1)';}} />
  );
  const multi = q.type==='multiselect';
  const arr = (value as string[])||[];
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
      {q.options!.map(opt => {
        const sel = multi ? arr.includes(opt) : value===opt;
        return (
          <button key={opt} onClick={()=>multi?onChange(sel?arr.filter(x=>x!==opt):[...arr,opt]):onChange(opt)}
            style={{ padding:'8px 15px', borderRadius:8, fontSize:13, fontWeight:500, border:`1px solid ${sel?'#E8FF5A':'rgba(255,255,255,0.1)'}`, background:sel?'rgba(232,255,90,0.09)':'rgba(255,255,255,0.03)', color:sel?'#E8FF5A':'rgba(255,255,255,0.5)', cursor:'pointer', transition:'all 0.13s', fontFamily:'inherit' }}>
            {multi&&sel&&<span style={{marginRight:5}}>✓</span>}{opt}
          </button>
        );
      })}
    </div>
  );
}

// ─── Mode Card ─────────────────────────────────────────────────────────────
function ModeCard({ mode, modeKey, active, onClick }: { mode:typeof MODES[Mode]; modeKey:Mode; active:boolean; onClick:()=>void }) {
  return (
    <button onClick={onClick} style={{
      display:'flex', alignItems:'flex-start', gap:14,
      padding:'16px 18px', borderRadius:14, textAlign:'left' as const,
      border:`1px solid ${active?'rgba(232,255,90,0.35)':'rgba(255,255,255,0.07)'}`,
      background:active?'rgba(232,255,90,0.06)':'rgba(255,255,255,0.02)',
      cursor:'pointer', transition:'all 0.18s', fontFamily:'inherit',
      width:'100%',
    }}
    onMouseOver={e=>{if(!active){const el=e.currentTarget as HTMLElement;el.style.borderColor='rgba(255,255,255,0.14)';el.style.background='rgba(255,255,255,0.04)';}}}
    onMouseOut={e=>{if(!active){const el=e.currentTarget as HTMLElement;el.style.borderColor='rgba(255,255,255,0.07)';el.style.background='rgba(255,255,255,0.02)';}}}
    >
      <span style={{ fontSize:22, lineHeight:1, color:active?'#E8FF5A':'rgba(255,255,255,0.3)', flexShrink:0, marginTop:1 }}>{mode.icon}</span>
      <div style={{ minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
          <span style={{ fontSize:13.5, fontWeight:700, color:active?'#fff':'rgba(255,255,255,0.6)', letterSpacing:'-0.01em' }}>{mode.label}</span>
          {active && <span style={{ width:5, height:5, borderRadius:'50%', background:'#E8FF5A', display:'inline-block' }} />}
        </div>
        <span style={{ fontSize:11.5, color:active?'rgba(255,255,255,0.45)':'rgba(255,255,255,0.25)', lineHeight:1.4, display:'block' }}>{mode.tagline}</span>
      </div>
    </button>
  );
}

// ─── Section Card ──────────────────────────────────────────────────────────
const REFINE = [{ id:'improve', label:'Improve' }, { id:'simplify', label:'Simplify' }, { id:'unique', label:'Make Unique' }, { id:'expand', label:'Expand' }];

function SectionCard({ section, index, isLast, hasMore, onNext, onRefine, isRefining }: {
  section:OutputSection; index:number; isLast:boolean; hasMore:boolean;
  onNext:()=>void; onRefine:(id:string,action:string)=>void; isRefining:string|null;
}) {
  const content = section.refined || section.content;
  const [copied, setCopied] = useState(false);
  const num = String(index + 1).padStart(2, '0');

  return (
    <div style={{
      display:'flex', gap:0,
      background:'rgba(255,255,255,0.025)',
      border:'1px solid rgba(255,255,255,0.07)',
      borderRadius:16, overflow:'hidden',
      animation:'sectionIn 0.5s cubic-bezier(0.22,1,0.36,1) both',
    }}>
      {/* Left number column */}
      <div style={{
        width:56, flexShrink:0,
        display:'flex', flexDirection:'column', alignItems:'center',
        padding:'22px 0 18px',
        borderRight:'1px solid rgba(255,255,255,0.06)',
        background:'rgba(255,255,255,0.015)',
      }}>
        <span style={{
          fontFamily:"'Bricolage Grotesque', sans-serif",
          fontSize:11, fontWeight:800, letterSpacing:'0.08em',
          color:'rgba(232,255,90,0.55)',
          writingMode:'vertical-rl' as const,
          textTransform:'uppercase' as const,
        }}>{num}</span>
      </div>

      {/* Content */}
      <div style={{ flex:1, minWidth:0 }}>
        {/* Card header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 22px 0' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:'#fff', letterSpacing:'-0.02em', margin:0 }}>{section.title}</h3>
            {section.refined && (
              <span style={{ fontSize:9.5, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase' as const, padding:'2px 7px', borderRadius:4, background:'rgba(232,255,90,0.1)', border:'1px solid rgba(232,255,90,0.25)', color:'#E8FF5A' }}>Refined</span>
            )}
          </div>
          <button onClick={()=>{navigator.clipboard.writeText(content);setCopied(true);setTimeout(()=>setCopied(false),1600);}}
            style={{ padding:'4px 10px', borderRadius:6, border:'1px solid rgba(255,255,255,0.07)', background:'transparent', color:copied?'#E8FF5A':'rgba(255,255,255,0.2)', fontSize:11, cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s', flexShrink:0 }}>
            {copied?'✓':'Copy'}
          </button>
        </div>

        {/* Divider */}
        <div style={{ height:1, background:'rgba(255,255,255,0.05)', margin:'14px 22px' }} />

        {/* Body */}
        <div style={{ padding:'0 22px 18px' }}>
          {isRefining===section.id ? (
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 0', color:'rgba(255,255,255,0.4)', fontSize:13 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" style={{ animation:'spin 0.9s linear infinite', flexShrink:0 }}>
                <circle cx="7" cy="7" r="5.5" stroke="#E8FF5A" strokeWidth="1.4" strokeDasharray="20" strokeDashoffset="10" strokeLinecap="round" fill="none" />
              </svg>
              Refining…
            </div>
          ) : <RichContent text={content} />}
        </div>

        {/* Footer actions */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 22px', borderTop:'1px solid rgba(255,255,255,0.05)', flexWrap:'wrap', gap:8 }}>
          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
            {REFINE.map(a => (
              <button key={a.id} onClick={()=>onRefine(section.id,a.id)} disabled={!!isRefining}
                style={{ padding:'5px 12px', borderRadius:7, fontSize:11.5, fontWeight:600, border:'1px solid rgba(255,255,255,0.07)', background:'rgba(255,255,255,0.02)', color:'rgba(255,255,255,0.38)', cursor:isRefining?'not-allowed':'pointer', transition:'all 0.14s', fontFamily:'inherit', opacity:isRefining?0.4:1 }}
                onMouseOver={e=>{if(!isRefining){const el=e.currentTarget as HTMLElement;el.style.borderColor='rgba(232,255,90,0.3)';el.style.color='#E8FF5A';}}}
                onMouseOut={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='rgba(255,255,255,0.07)';el.style.color='rgba(255,255,255,0.38)';}}>
                {a.label}
              </button>
            ))}
          </div>
          {isLast&&hasMore&&(
            <button onClick={onNext} style={{ padding:'7px 18px', borderRadius:9, fontSize:13, fontWeight:700, border:'1px solid rgba(232,255,90,0.45)', background:'rgba(232,255,90,0.08)', color:'#E8FF5A', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:7, transition:'all 0.15s' }}>
              Next <span style={{ fontSize:15 }}>→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function ThinkBetter() {
  const [mode, setMode] = useState<Mode>('idea');
  const [phase, setPhase] = useState<Phase>('input');
  const [input, setInput] = useState('');
  const [answers, setAnswers] = useState<Answers>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sections, setSections] = useState<OutputSection[]>([]);
  const [revealCount, setRevealCount] = useState(0);
  const [error, setError] = useState('');
  const [isRefining, setIsRefining] = useState<string|null>(null);
  const appRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const meta = MODES[mode];

  useEffect(() => {
    if (phase!=='input') { setPhase('input'); setSections([]); setRevealCount(0); setAnswers({}); setError(''); }
  }, [mode]); // eslint-disable-line

  const scrollToApp = () => appRef.current?.scrollIntoView({ behavior:'smooth', block:'start' });

  const handleSubmit = () => {
    const t = input.trim();
    if (!t||t.length<8) return;
    setError('');
    if (isVague(t, mode)) {
      const qs = getQuestions(t, mode);
      if (qs.length) { setQuestions(qs); setPhase('clarifying'); setTimeout(scrollToApp,80); return; }
    }
    runGenerate({});
  };

  const runGenerate = async (ans: Answers) => {
    setPhase('generating'); setSections([]); setRevealCount(0); setError('');
    setTimeout(scrollToApp, 60);
    try {
      const res = await fetch('http://127.0.0.1:8000/generate/', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ input: meta.systemPrompt(input.trim(), ans), mode }),
      });
      if (!res.ok) throw new Error(`Server ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message||'Generation failed');
      const parsed = parseSections(data.output);
      setSections(parsed); setRevealCount(1); setPhase('revealing');
    } catch (e: any) {
      setError(e.message||'Could not reach backend.');
      setPhase(questions.length?'clarifying':'input');
    }
  };

  const revealNext = () => {
    const next = revealCount+1; setRevealCount(next);
    if (next>=sections.length) setPhase('done');
    setTimeout(()=>document.getElementById(`sec-${revealCount}`)?.scrollIntoView({behavior:'smooth',block:'nearest'}),80);
  };

  const handleRefine = async (secId: string, action: string) => {
    const sec = sections.find(s=>s.id===secId); if(!sec) return;
    setIsRefining(secId);
    const prompts: Record<string,string> = {
      improve:`Improve this, more insightful, specific, and actionable. Keep format:\n\n${sec.content}`,
      simplify:`Rewrite this cleaner, more direct, remove all fluff:\n\n${sec.content}`,
      unique:`Rewrite this more distinctive, creative, differentiated:\n\n${sec.content}`,
      expand:`Expand with significantly more depth, concrete examples:\n\n${sec.content}`,
    };
    try {
      const res = await fetch('http://127.0.0.1:8000/generate/', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({input:prompts[action],mode}) });
      const data = await res.json();
      if (data.success) setSections(prev=>prev.map(s=>s.id===secId?{...s,refined:data.output}:s));
    } catch {} finally { setIsRefining(null); }
  };

  const reset = () => { setPhase('input'); setInput(''); setSections([]); setRevealCount(0); setAnswers({}); setError(''); setTimeout(()=>taRef.current?.focus(),100); };

  useEffect(() => {
    const h=(e:KeyboardEvent)=>{ if((e.ctrlKey||e.metaKey)&&e.key==='Enter'&&phase==='input'){e.preventDefault();handleSubmit();} };
    window.addEventListener('keydown',h); return ()=>window.removeEventListener('keydown',h);
  }, [input,mode,phase]); // eslint-disable-line

  const visible = sections.slice(0, revealCount);
  const hasMore = revealCount < sections.length;
  const inputOk = input.trim().length>=8 && input.length<=1500;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth;background:#060606}
        body{background:#060606;font-family:'DM Sans',-apple-system,sans-serif;color:#F0F0F0;-webkit-font-smoothing:antialiased}
        textarea,input,button{font-family:inherit} textarea{caret-color:#E8FF5A}
        textarea::placeholder,input::placeholder{color:rgba(255,255,255,0.2)}
        textarea:focus,input:focus,button{outline:none}
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.09);border-radius:2px}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes sectionIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes breathe{0%,100%{opacity:0.8}50%{opacity:1}}
        @keyframes lampPulse{0%,100%{opacity:0.7;transform:translateX(-50%) scale(1)}50%{opacity:1;transform:translateX(-50%) scale(1.15)}}
      `}</style>

      {/* ══ HERO ══════════════════════════════════════════════════════ */}
      <section style={{ position:'relative', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
        <AntiGravityCanvas />
        <div style={{ position:'relative', zIndex:10, textAlign:'center', padding:'0 24px', maxWidth:580, animation:'fadeUp 0.65s ease forwards' }}>
          <div style={{ marginBottom:26, display:'flex', justifyContent:'center' }}>
            <span style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'5px 14px', borderRadius:999, border:'1px solid rgba(232,255,90,0.25)', background:'rgba(232,255,90,0.06)', fontSize:10.5, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase' as const, color:'#E8FF5A' }}>
              <span style={{ width:5, height:5, borderRadius:'50%', background:'#E8FF5A', display:'inline-block' }} />
              AI Thinking Engine
            </span>
          </div>
          <h1 style={{ fontFamily:"'Bricolage Grotesque', sans-serif", fontSize:'clamp(4rem,13vw,9.5rem)', fontWeight:800, lineHeight:0.87, letterSpacing:'-0.04em', background:'linear-gradient(175deg,#fff 20%,rgba(255,255,255,0.38) 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:22 }}>
            Think<br />Better
          </h1>
          <p style={{ fontSize:'clamp(0.93rem,2vw,1.1rem)', color:'rgba(255,255,255,0.45)', lineHeight:1.75, marginBottom:38, maxWidth:440, margin:'0 auto 38px' }}>
            Clarify before you generate. Structured output, one section at a time. Ideas, scripts, brainstorms, prompts.
          </p>
          <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap', marginBottom:22 }}>
            {(Object.entries(MODES) as [Mode, typeof MODES[Mode]][]).map(([k, m]) => (
              <button key={k} onClick={()=>{ setMode(k); scrollToApp(); }}
                style={{ padding:'9px 18px', borderRadius:9, fontSize:12.5, fontWeight:600, border:`1px solid ${k===mode?'rgba(232,255,90,0.4)':'rgba(255,255,255,0.1)'}`, background:k===mode?'rgba(232,255,90,0.08)':'rgba(255,255,255,0.04)', color:k===mode?'#E8FF5A':'rgba(255,255,255,0.5)', transition:'all 0.15s', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', gap:7 }}>
                <span style={{ fontSize:13, opacity:0.7 }}>{m.icon}</span>{m.label}
              </button>
            ))}
          </div>
          <button onClick={scrollToApp}
            style={{ padding:'13px 38px', borderRadius:11, border:'none', background:'#E8FF5A', color:'#060606', fontSize:14, fontWeight:800, letterSpacing:'0.01em', transition:'all 0.15s' }}
            onMouseOver={e=>{const el=e.currentTarget as HTMLElement;el.style.transform='translateY(-2px)';el.style.boxShadow='0 12px 32px rgba(232,255,90,0.25)';}}
            onMouseOut={e=>{const el=e.currentTarget as HTMLElement;el.style.transform='';el.style.boxShadow='';}}
          >Get Started</button>
        </div>
        <div onClick={scrollToApp} style={{ position:'absolute', bottom:32, left:'50%', transform:'translateX(-50%)', zIndex:10, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:5, color:'rgba(255,255,255,0.2)', fontSize:10.5, letterSpacing:'0.12em', textTransform:'uppercase' as const, animation:'breathe 2.8s ease-in-out infinite' }}>
          scroll
          <svg width="11" height="11" fill="none" viewBox="0 0 11 11"><path d="M5.5 1v9M1 6.5l4.5 4 4.5-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </section>

      {/* ══ WORKSPACE ═══════════════════════════════════════════════ */}
      <div ref={appRef} style={{ background:'#060606', minHeight:'100vh' }}>
        <LampDivider mode={mode} />

        {/* ── Main layout: sidebar + content ── */}
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px 120px', display:'grid', gridTemplateColumns:'220px 1fr', gap:32, alignItems:'start' }}>

          {/* ── Sidebar ── */}
          <div style={{ position:'sticky', top:32, display:'flex', flexDirection:'column', gap:8 }}>
            {/* Mode cards */}
            <p style={{ fontSize:10.5, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase' as const, color:'rgba(255,255,255,0.25)', marginBottom:4, paddingLeft:2 }}>Mode</p>
            {(Object.entries(MODES) as [Mode, typeof MODES[Mode]][]).map(([k, m]) => (
              <ModeCard key={k} modeKey={k} mode={m} active={mode===k} onClick={()=>setMode(k)} />
            ))}

            {/* Divider */}
            {(phase==='revealing'||phase==='done') && (
              <>
                <div style={{ height:1, background:'rgba(255,255,255,0.06)', margin:'8px 0' }} />
                <p style={{ fontSize:10.5, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase' as const, color:'rgba(255,255,255,0.25)', marginBottom:4, paddingLeft:2 }}>Progress</p>
                {sections.map((s, i) => (
                  <div key={s.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 8px', borderRadius:7, background:i<revealCount?'rgba(232,255,90,0.05)':'transparent' }}>
                    <span style={{ width:16, height:16, borderRadius:4, border:`1px solid ${i<revealCount?'rgba(232,255,90,0.4)':'rgba(255,255,255,0.1)'}`, background:i<revealCount?'rgba(232,255,90,0.1)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:8, color:i<revealCount?'#E8FF5A':'rgba(255,255,255,0.2)', fontWeight:800 }}>
                      {i<revealCount?'✓':String(i+1)}
                    </span>
                    <span style={{ fontSize:11.5, color:i<revealCount?'rgba(255,255,255,0.6)':'rgba(255,255,255,0.2)', lineHeight:1.3, fontWeight:i<revealCount?500:400 }}>{s.title}</span>
                  </div>
                ))}
                <div style={{ height:1, background:'rgba(255,255,255,0.06)', margin:'8px 0' }} />
                <button onClick={reset} style={{ padding:'9px 12px', borderRadius:9, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.02)', color:'rgba(255,255,255,0.4)', fontSize:12.5, fontWeight:600, cursor:'pointer', fontFamily:'inherit', textAlign:'left' as const, transition:'all 0.15s' }}
                  onMouseOver={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='rgba(255,255,255,0.15)';el.style.color='rgba(255,255,255,0.7)';}}
                  onMouseOut={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='rgba(255,255,255,0.08)';el.style.color='rgba(255,255,255,0.4)';}}>
                  ← New session
                </button>
              </>
            )}
          </div>

          {/* ── Main content ── */}
          <div style={{ minWidth:0 }}>

            {/* ── INPUT ── */}
            {phase==='input' && (
              <div style={{ animation:'fadeUp 0.4s ease' }}>
                {/* Big composer card */}
                <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:18, overflow:'hidden', marginBottom:14 }}>
                  {/* Composer top label */}
                  <div style={{ padding:'16px 22px 0', display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:19, color:'rgba(232,255,90,0.7)' }}>{meta.icon}</span>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.7)', letterSpacing:'-0.01em' }}>{meta.label}</div>
                      <div style={{ fontSize:11.5, color:'rgba(255,255,255,0.25)' }}>{meta.tagline}</div>
                    </div>
                  </div>
                  <div style={{ height:1, background:'rgba(255,255,255,0.05)', margin:'14px 0 0' }} />
                  <textarea ref={taRef} value={input} onChange={e=>setInput(e.target.value)} placeholder={meta.hint} rows={7}
                    style={{ width:'100%', background:'transparent', border:'none', resize:'none', color:'#F0F0F0', fontSize:15.5, lineHeight:1.8, padding:'20px 24px' }} />
                  {/* Status bar */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 22px 14px', borderTop:'1px solid rgba(255,255,255,0.05)', background:'rgba(0,0,0,0.2)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                      <span style={{ fontSize:11.5, color:input.length>1500?'#ff5a5a':'rgba(255,255,255,0.2)', fontWeight:500 }}>
                        {input.length}<span style={{ color:'rgba(255,255,255,0.12)' }}> / 1500</span>
                      </span>
                      {input.trim().length>0&&input.trim().length<8&&(
                        <span style={{ fontSize:11.5, color:'rgba(255,150,60,0.7)' }}>Input too short</span>
                      )}
                      {inputOk&&(
                        <span style={{ fontSize:11.5, color:'rgba(255,255,255,0.18)', display:'flex', alignItems:'center', gap:5 }}>
                          <span style={{ fontSize:9 }}>⌘</span>↵ to generate
                        </span>
                      )}
                    </div>
                    <button onClick={handleSubmit} disabled={!inputOk}
                      style={{ padding:'9px 24px', borderRadius:10, border:'none', background:inputOk?'#E8FF5A':'rgba(255,255,255,0.07)', color:inputOk?'#060606':'rgba(255,255,255,0.2)', fontSize:13, fontWeight:800, transition:'all 0.15s', cursor:inputOk?'pointer':'not-allowed', letterSpacing:'0.01em' }}>
                      Continue →
                    </button>
                  </div>
                </div>
                {/* Output pipeline preview */}
                <div style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 4px' }}>
                  <span style={{ fontSize:11, color:'rgba(255,255,255,0.2)', letterSpacing:'0.06em', textTransform:'uppercase' as const, marginRight:4 }}>Will generate</span>
                  {meta.sections.map((s, i) => (
                    <span key={s} style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontSize:12, color:'rgba(255,255,255,0.28)', padding:'2px 9px', borderRadius:5, border:'1px solid rgba(255,255,255,0.07)', background:'rgba(255,255,255,0.02)' }}>{s}</span>
                      {i<meta.sections.length-1&&<span style={{ color:'rgba(255,255,255,0.1)', fontSize:10 }}>→</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ── CLARIFYING ── */}
            {phase==='clarifying' && (
              <div style={{ animation:'fadeUp 0.4s ease' }}>
                {/* Input echo */}
                <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderLeft:'2px solid rgba(232,255,90,0.4)', borderRadius:12, padding:'14px 18px', marginBottom:28, display:'flex', gap:14 }}>
                  <span style={{ fontSize:10.5, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' as const, color:'rgba(255,255,255,0.2)', flexShrink:0, paddingTop:2 }}>Input</span>
                  <span style={{ fontSize:14, color:'rgba(255,255,255,0.6)', lineHeight:1.65 }}>{input}</span>
                </div>
                <div style={{ marginBottom:24 }}>
                  <h3 style={{ fontFamily:"'Bricolage Grotesque', sans-serif", fontSize:22, fontWeight:700, color:'#fff', marginBottom:8 }}>A few quick questions</h3>
                  <p style={{ fontSize:14, color:'rgba(255,255,255,0.4)', lineHeight:1.6 }}>Helps me give focused, specific output — not generic advice.</p>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  {questions.map((q, i) => (
                    <div key={q.id} style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'18px 20px', animation:`fadeUp ${0.3+i*0.08}s ease both` }}>
                      <div style={{ display:'flex', gap:11, marginBottom:14 }}>
                        <span style={{ width:22, height:22, borderRadius:6, flexShrink:0, background:'rgba(232,255,90,0.1)', border:'1px solid rgba(232,255,90,0.22)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10.5, fontWeight:800, color:'#E8FF5A' }}>{i+1}</span>
                        <span style={{ fontSize:14, fontWeight:500, color:'#fff', lineHeight:1.5 }}>{q.text}</span>
                      </div>
                      <QInput q={q} value={answers[q.id]||''} onChange={v=>setAnswers(prev=>({...prev,[q.id]:v}))} />
                    </div>
                  ))}
                </div>
                {error&&<div style={{ background:'rgba(255,50,50,0.07)', border:'1px solid rgba(255,80,80,0.2)', borderRadius:9, padding:'11px 15px', fontSize:13, color:'#ff5a5a', marginTop:16 }}>⚠ {error}</div>}
                <div style={{ display:'flex', gap:9, marginTop:22, flexWrap:'wrap' }}>
                  <button onClick={()=>runGenerate(answers)} style={{ padding:'11px 26px', borderRadius:10, border:'none', background:'#E8FF5A', color:'#060606', fontSize:13, fontWeight:800 }}>Generate {meta.label} →</button>
                  <button onClick={()=>runGenerate({})} style={{ padding:'11px 20px', borderRadius:10, border:'1px solid rgba(255,255,255,0.12)', background:'transparent', color:'rgba(255,255,255,0.5)', fontSize:13, fontWeight:600 }}>Skip questions</button>
                  <button onClick={reset} style={{ padding:'11px 16px', borderRadius:10, border:'1px solid rgba(255,255,255,0.07)', background:'rgba(255,255,255,0.02)', color:'rgba(255,255,255,0.3)', fontSize:13, fontWeight:600 }}>← Back</button>
                </div>
              </div>
            )}

            {/* ── GENERATING ── */}
            {phase==='generating' && (
              <div style={{ textAlign:'center', padding:'80px 24px', animation:'fadeUp 0.4s ease' }}>
                <div style={{ width:56, height:56, margin:'0 auto 24px' }}>
                  <svg width="56" height="56" viewBox="0 0 56 56" style={{ animation:'spin 1.1s linear infinite' }}>
                    <circle cx="28" cy="28" r="24" stroke="rgba(232,255,90,0.1)" strokeWidth="2" fill="none" />
                    <path d="M28 4a24 24 0 0 1 24 24" stroke="#E8FF5A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                  </svg>
                </div>
                <h3 style={{ fontFamily:"'Bricolage Grotesque', sans-serif", fontSize:24, fontWeight:700, color:'#fff', marginBottom:10 }}>
                  Thinking through your {meta.label.toLowerCase()}…
                </h3>
                <p style={{ fontSize:14, color:'rgba(255,255,255,0.4)', lineHeight:1.65, maxWidth:380, margin:'0 auto' }}>
                  Building {meta.sections.length} structured sections. Usually 3–7 seconds.
                </p>
              </div>
            )}

            {/* ── REVEALING / DONE ── */}
            {(phase==='revealing'||phase==='done') && (
              <div style={{ animation:'fadeUp 0.4s ease' }}>
                {/* Top bar */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:10 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:10.5, fontWeight:700, letterSpacing:'0.11em', textTransform:'uppercase' as const, display:'inline-flex', alignItems:'center', gap:6, padding:'4px 11px', borderRadius:999, border:'1px solid rgba(232,255,90,0.3)', background:'rgba(232,255,90,0.06)', color:'#E8FF5A' }}>
                      <span style={{ width:5, height:5, borderRadius:'50%', background:'#E8FF5A', display:'inline-block' }} />
                      {meta.label}
                    </span>
                    <span style={{ fontSize:12, color:'rgba(255,255,255,0.25)' }}>{revealCount} of {sections.length}</span>
                  </div>
                  <button onClick={()=>{const all=sections.map(s=>`## ${s.title}\n\n${s.refined||s.content}`).join('\n\n---\n\n');navigator.clipboard.writeText(all);}}
                    style={{ padding:'5px 12px', borderRadius:7, border:'1px solid rgba(255,255,255,0.08)', background:'transparent', color:'rgba(255,255,255,0.25)', fontSize:11.5, cursor:'pointer', fontFamily:'inherit' }}>
                    Copy all
                  </button>
                </div>

                {/* Progress glyphs */}
                <div style={{ display:'flex', gap:4, marginBottom:24 }}>
                  {sections.map((_,i) => (
                    <div key={i} style={{ flex:1, height:2, borderRadius:2, background:i<revealCount?'#E8FF5A':'rgba(255,255,255,0.07)', transition:'background 0.4s ease', boxShadow:i<revealCount?'0 0 10px rgba(232,255,90,0.45)':undefined }} />
                  ))}
                </div>

                {/* Input echo */}
                <div style={{ background:'rgba(255,255,255,0.02)', borderLeft:'2px solid rgba(232,255,90,0.3)', borderRadius:8, padding:'9px 14px', marginBottom:20, fontSize:13.5, color:'rgba(255,255,255,0.45)' }}>
                  <span style={{ fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' as const, color:'rgba(255,255,255,0.2)', marginRight:8 }}>Input</span>
                  {input.length>120?input.slice(0,120)+'…':input}
                </div>

                {/* Section cards */}
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {visible.map((sec,i)=>(
                    <div key={sec.id} id={`sec-${i}`}>
                      <SectionCard section={sec} index={i} isLast={i===visible.length-1} hasMore={hasMore} onNext={revealNext} onRefine={handleRefine} isRefining={isRefining} />
                    </div>
                  ))}
                </div>

                {/* Done state */}
                {phase==='done'&&(
                  <div style={{ marginTop:24, padding:'28px 24px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, textAlign:'center', animation:'fadeUp 0.4s ease' }}>
                    <span style={{ display:'block', fontSize:24, marginBottom:12, opacity:0.7 }}>✦</span>
                    <h3 style={{ fontFamily:"'Bricolage Grotesque', sans-serif", fontSize:19, fontWeight:700, color:'#fff', marginBottom:8 }}>All {sections.length} sections generated</h3>
                    <p style={{ fontSize:14, color:'rgba(255,255,255,0.4)', marginBottom:22 }}>Use the refinement buttons on any section to go deeper.</p>
                    <div style={{ display:'flex', gap:9, justifyContent:'center', flexWrap:'wrap' }}>
                      <button onClick={reset} style={{ padding:'10px 26px', borderRadius:10, border:'none', background:'#E8FF5A', color:'#060606', fontSize:13, fontWeight:800 }}>Start new →</button>
                      <button onClick={()=>{setSections([]);setRevealCount(0);setPhase('input');}} style={{ padding:'10px 18px', borderRadius:10, border:'1px solid rgba(255,255,255,0.12)', background:'transparent', color:'rgba(255,255,255,0.5)', fontSize:13, fontWeight:600 }}>Edit input</button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>{/* end main content */}
        </div>{/* end grid */}
      </div>{/* end workspace */}
    </>
  );
}