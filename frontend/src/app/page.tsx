'use client';

import { useState, useEffect, useRef } from 'react';
import AntiGravityCanvas from '@/components/AntiGravityCanvas';

interface ClarifyingQuestion {
  id: string;
  question: string;
  type: 'select' | 'text' | 'multiselect';
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

interface UserAnswers {
  [key: string]: string | string[];
}

interface StructuredSection {
  id: string;
  title: string;
  content: string;
  isLocked: boolean;
  isGenerating: boolean;
  delay: number;
}

interface Action {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export default function ThinkBetterApp() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [selectedMode, setSelectedMode] = useState('idea');
  const [clarifyingQuestions, setClarifyingQuestions] = useState<ClarifyingQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [structuredSections, setStructuredSections] = useState<StructuredSection[]>([]);
  const [currentSection, setCurrentSection] = useState(0);
  const [needsClarification, setNeedsClarification] = useState(false);
  const [showOutput, setShowOutput] = useState(true);
  
  const featuresRef = useRef<HTMLDivElement>(null);

  // Generate clarifying questions based on vague input
  const getClarifyingQuestions = async (inputText: string, mode: string): Promise<ClarifyingQuestion[]> => {
    if (mode === 'idea') {
      return [
        {
          id: 'problem',
          question: 'What specific problem are you trying to solve?',
          type: 'text',
          placeholder: 'Describe the problem or opportunity...',
          required: true
        },
        {
          id: 'audience',
          question: 'Who is your target audience?',
          type: 'select',
          options: ['Consumers', 'Businesses', 'Developers', 'Students', 'Other'],
          required: true
        }
      ];
    } else if (mode === 'script') {
      return [
        {
          id: 'format',
          question: 'What format do you need?',
          type: 'select',
          options: ['Video Script', 'Podcast', 'Presentation', 'Article'],
          required: true
        }
      ];
    }
    return [];
  };

  // Check if clarification is needed
  const needsClarificationCheck = (inputText: string, mode: string) => {
    const vagueIndicators = ['idea', 'help me', 'something', 'create', 'make'];
    const isVague = vagueIndicators.some(indicator => 
      inputText.toLowerCase().includes(indicator)
    ) && inputText.length < 50;
    
    return isVague;
  };

  // Handle answer changes
  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Proceed to generation after clarification
  const proceedToGeneration = () => {
    const enhancedInput = `${input}\n\nAdditional context:\n${Object.entries(userAnswers).map(([key, value]) => 
      `${key}: ${Array.isArray(value) ? value.join(', ') : value}`
    ).join('\n')}`;
    
    generateStructuredOutput(enhancedInput);
    setNeedsClarification(false);
  };

  // Generate structured output
  const generateStructuredOutput = async (inputText: string) => {
    setIsGenerating(true);
    setError('');
    setStructuredSections([]);
    setCurrentSection(0);

    try {
      const response = await fetch('http://127.0.0.1:8000/generate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: inputText,
          mode: selectedMode,
          options: {}
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setOutput(result.output);
        parseStructuredOutput(result.output);
      } else {
        throw new Error(result.error || 'Generation failed');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError('Failed to generate response. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Parse AI response into structured sections
  const parseStructuredOutput = (content: string) => {
    const sections: StructuredSection[] = [];
    const lines = content.split('\n');
    let currentSection: Partial<StructuredSection> | null = null;
    let sectionContent = '';
    let sectionIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('##') || (line.length > 3 && line === line.toUpperCase() && !line.includes('HTTP'))) {
        if (currentSection && sectionContent.trim()) {
          sections.push({
            id: `section-${sectionIndex}`,
            title: currentSection.title || 'Section',
            content: sectionContent.trim(),
            isLocked: sectionIndex > 0,
            isGenerating: false,
            delay: sectionIndex * 500
          });
          sectionIndex++;
        }
        
        currentSection = {
          title: line.replace('##', '').replace('**', '').trim(),
        };
        sectionContent = '';
      } else if (line && currentSection) {
        sectionContent += line + '\n';
      }
    }
    
    if (currentSection && sectionContent.trim()) {
      sections.push({
        id: `section-${sectionIndex}`,
        title: currentSection.title || 'Section',
        content: sectionContent.trim(),
        isLocked: false,
        isGenerating: false,
        delay: sectionIndex * 500
      });
    }

    setStructuredSections(sections);
  };

  // Reveal next section
  const revealNextSection = () => {
    if (currentSection < structuredSections.length - 1) {
      setCurrentSection(prev => prev + 1);
      setStructuredSections(prev => prev.map((section, index) => 
        index === currentSection + 1 ? { ...section, isLocked: false } : section
      ));
    }
  };

  // Refine individual section
  const refineSection = async (sectionId: string) => {
    setStructuredSections(prev => prev.map(s => 
      s.id === sectionId ? { ...s, isGenerating: true } : s
    ));

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setStructuredSections(prev => prev.map(s => 
        s.id === sectionId ? { 
          ...s, 
          isGenerating: false,
          content: s.content + '\n\n[Refined with additional insights and analysis...]'
        } : s
      ));
    } catch (err) {
      console.error('Refinement error:', err);
      setStructuredSections(prev => prev.map(s => 
        s.id === sectionId ? { ...s, isGenerating: false } : s
      ));
    }
  };

  // Handle input change with validation
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (error) setError('');
  };

  // Handle generation
  const handleGenerate = async () => {
    if (!input.trim() || input.trim().length < 10 || input.trim().length > 1000) {
      setError('Input must be between 10 and 1000 characters');
      return;
    }

    if (needsClarificationCheck(input, selectedMode)) {
      const questions = await getClarifyingQuestions(input, selectedMode);
      setClarifyingQuestions(questions);
      setNeedsClarification(true);
      return;
    }

    await generateStructuredOutput(input);
  };

  // Handle action buttons
  const handleAction = async (action: string) => {
    if (action === 'improve') {
      await refineSection(structuredSections[0]?.id || '');
    }
  };

  // Scroll to features
  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleGenerate();
      }
      
      if (e.key >= '1' && e.key <= '4') {
        const modeIndex = parseInt(e.key) - 1;
        const modes = ['idea', 'script', 'brainstorm', 'prompt'];
        if (modeIndex < modes.length) {
          setSelectedMode(modes[modeIndex]);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const modes = [
    { id: 'idea', label: 'Idea' },
    { id: 'script', label: 'Script' },
    { id: 'brainstorm', label: 'Brainstorm' },
    { id: 'prompt', label: 'Prompt' }
  ];

  const actions: Action[] = [
    { id: 'improve', label: 'Improve', icon: '↻', description: 'Make it better' },
    { id: 'simplify', label: 'Simplify', icon: '↓', description: 'Make it simpler' },
    { id: 'unique', label: 'Make Unique', icon: '✦', description: 'Add unique twist' },
    { id: 'monetize', label: 'Add Monetization', icon: '$', description: 'Business model' }
  ];

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Section with Anti-Gravity */}
      <section className="relative min-h-screen flex items-center justify-center">
        <AntiGravityCanvas />
        
        <div className="relative z-10 text-center space-y-8 px-4">
          <div className="inline-block">
            <span className="px-4 py-2 border border-white/20 rounded-full text-xs font-mono text-white/60 tracking-widest uppercase bg-white/5 backdrop-blur-sm">
              Advanced AI Assistant
            </span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 tracking-tighter">
            Think<br/>Better
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg text-white/80 font-light leading-relaxed">
            Transform your ideas with intelligent analysis and strategic insights. 
            Experience the power of sophisticated AI-driven thinking.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={scrollToFeatures}
              className="px-8 py-4 bg-white text-black rounded-lg font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              Get Started
            </button>
            
            <div className="flex gap-2">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => {
                    setSelectedMode(mode.id);
                    scrollToFeatures();
                  }}
                  className="px-4 py-2 bg-white/10 text-white/80 rounded-lg font-medium hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20"
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          <div className="animate-bounce mt-12">
            <svg className="w-6 h-6 text-white/60 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="relative min-h-screen">
        <AntiGravityCanvas />
        
        <div className="relative z-10 min-h-screen flex flex-col px-4 py-20">
          {/* Header */}
          <header className="relative z-20 p-8">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/20">
                  <span className="font-bold text-white text-xl">T</span>
                </div>
                <span className="text-white font-medium tracking-wide text-xl">ThinkBetter</span>
              </div>
              
              <nav className="hidden md:flex space-x-8 text-sm font-medium text-white/70">
                <a href="#" className="hover:text-white transition-colors">Features</a>
                <a href="#" className="hover:text-white transition-colors">About</a>
                <a href="#" className="hover:text-white transition-colors">Contact</a>
              </nav>
            </div>
          </header>

          {/* Main Content */}
          <main className="relative flex-1 flex items-center justify-center">
            <div className="max-w-6xl w-full space-y-8">
              
              {/* Mode Selection */}
              <div className="text-center space-y-6">
                <h2 className="text-4xl font-bold text-white">Choose Your Mode</h2>
                <p className="text-white/60 max-w-2xl mx-auto">
                  Select the type of assistance you need and let our AI help you think better
                </p>

                {/* Mode Buttons */}
                <div className="flex justify-center gap-4 pt-8">
                  {modes.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setSelectedMode(mode.id)}
                      className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                        selectedMode === mode.id
                          ? 'bg-white text-black shadow-lg'
                          : 'bg-white/10 text-white/80 hover:bg-white/20 backdrop-blur-sm border border-white/20'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clarifying Questions */}
              {needsClarification && (
                <div className="max-w-2xl mx-auto bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 p-8 space-y-6">
                  <h3 className="text-xl font-semibold text-white mb-6">
                    A few questions to better assist you:
                  </h3>
                  
                  {clarifyingQuestions.map((q) => (
                    <div key={q.id} className="space-y-2">
                      <label className="block text-sm font-medium text-white/80">
                        {q.question}
                        {q.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      
                      {q.type === 'select' ? (
                        <select
                          value={(userAnswers[q.id] as string) || ''}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          className="w-full px-4 py-3 bg-black/50 border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 backdrop-blur-sm"
                          required={q.required}
                        >
                          <option value="" className="text-black">Select an option</option>
                          {q.options?.map((option) => (
                            <option key={option} value={option} className="text-black">{option}</option>
                          ))}
                        </select>
                      ) : (
                        <textarea
                          value={(userAnswers[q.id] as string) || ''}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          placeholder={q.placeholder}
                          className="w-full px-4 py-3 bg-black/50 border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 resize-none backdrop-blur-sm"
                          rows={3}
                          required={q.required}
                        />
                      )}
                    </div>
                  ))}
                  
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={proceedToGeneration}
                      disabled={Object.keys(userAnswers).length < clarifyingQuestions.filter(q => q.required).length}
                      className="px-6 py-3 bg-white text-black rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200"
                    >
                      Continue to Generation
                    </button>
                    <button
                      onClick={() => setNeedsClarification(false)}
                      className="px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              )}

              {/* Input Section */}
              {!needsClarification && (
                <div className="max-w-3xl mx-auto">
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 p-8">
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-white/80 mb-3">
                        Describe your {selectedMode}
                      </label>
                      <textarea
                        value={input}
                        onChange={handleInputChange}
                        placeholder={`Enter your ${selectedMode} here... Be as detailed as possible for best results.`}
                        disabled={isGenerating}
                        className="w-full resize-none rounded-lg bg-black/50 border border-white/30 px-4 py-3 text-base leading-relaxed text-white placeholder-white/40 focus:outline-none focus:border-white/60 transition-colors backdrop-blur-sm"
                        rows={6}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-medium ${
                        input.length > 1000 
                          ? 'text-red-400' 
                          : input.length > 800 
                          ? 'text-yellow-400' 
                          : 'text-white/60'
                      }`}>
                        {input.length}/1000 characters
                        {input.length > 1000 && ' (too long)'}
                        {input.length < 10 && input.length > 0 && ' (too short)'}
                      </span>
                      
                      <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !input.trim() || input.trim().length < 10 || input.trim().length > 1000}
                        className="px-8 py-3 bg-white text-black rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                        title="Press Ctrl+Enter to generate"
                      >
                        {isGenerating ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                            Generating...
                          </span>
                        ) : `Generate ${selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)}`}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="max-w-3xl mx-auto">
                  <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-red-400 text-xl">⚠</span>
                      <div>
                        <h3 className="text-red-300 font-medium">Error</h3>
                        <p className="text-red-200 text-sm">{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Structured Output */}
              {structuredSections.length > 0 && showOutput && (
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-white">Generated Analysis</h3>
                    <button
                      onClick={() => setShowOutput(false)}
                      className="p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors border border-white/20"
                    >
                      <span className="text-white/60">✕</span>
                    </button>
                  </div>
                  
                  {structuredSections.map((section, index) => (
                    <div
                      key={section.id}
                      className={`bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 p-8 transition-all duration-500 ${
                        section.isLocked ? 'opacity-50' : 'opacity-100'
                      }`}
                      style={{
                        animationDelay: `${section.delay}ms`,
                        animation: index <= currentSection ? 'fadeInUp 0.6s ease-out' : 'none'
                      }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-xl font-semibold text-white">{section.title}</h4>
                        {!section.isLocked && (
                          <div className="flex gap-2">
                            {actions.map((action) => (
                              <button
                                key={action.id}
                                onClick={() => handleAction(action.id)}
                                disabled={section.isGenerating}
                                className="px-3 py-1 bg-white/10 text-white/80 text-sm rounded-md hover:bg-white/20 transition-colors disabled:opacity-50 backdrop-blur-sm border border-white/20"
                                title={action.description}
                              >
                                {action.icon} {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="prose prose-invert max-w-none">
                        <div className="text-white/80 leading-relaxed whitespace-pre-wrap">
                          {section.isGenerating ? (
                            <div className="flex items-center gap-2 text-white/60">
                              <div className="w-4 h-4 border-2 border-white/40 border-t-transparent rounded-full animate-spin"></div>
                              Refining...
                            </div>
                          ) : (
                            section.content
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {currentSection < structuredSections.length - 1 && (
                    <div className="text-center">
                      <button
                        onClick={revealNextSection}
                        className="px-8 py-3 bg-white text-black rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                      >
                        Reveal Next Section
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Loading State */}
              {isGenerating && !structuredSections.length && (
                <div className="max-w-3xl mx-auto text-center">
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 p-12">
                    <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Analyzing your {selectedMode}...
                    </h3>
                    <p className="text-white/60">
                      This typically takes 2-3 seconds
                    </p>
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* Footer */}
          <footer className="relative p-6 text-center">
            <p className="text-white/40 text-sm">
              Press 1-4 to switch modes • Ctrl+Enter to generate
            </p>
          </footer>
        </div>
      </section>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
