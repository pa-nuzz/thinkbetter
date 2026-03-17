'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  Lightbulb, 
  Rocket, 
  Users, 
  DollarSign, 
  Target,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import ProgressiveReveal from './ProgressiveReveal';
import OutputActions from './OutputActions';
import { useApp } from '@/lib/store';

interface Section {
  id: string;
  title: string;
  content: string;
  icon: React.ReactNode;
  delay: number;
}

interface EnhancedOutputAreaProps {
  output: string;
  isGenerating: boolean;
  mode: string;
  onAction: (action: string) => Promise<void>;
  className?: string;
}

export function EnhancedOutputArea({
  output,
  isGenerating,
  mode,
  onAction,
  className
}: EnhancedOutputAreaProps) {
  const { preferences } = useApp();
  const [sections, setSections] = useState<Section[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (output && !isGenerating) {
      parseAndStructureOutput();
    }
  }, [output, isGenerating]);

  const parseAndStructureOutput = () => {
    const parsedSections = parseOutputToSections(output, mode);
    setSections(parsedSections);
    
    // Start progressive reveal after a short delay
    setTimeout(() => setIsComplete(true), 100);
  };

  const parseOutputToSections = (content: string, currentMode: string): Section[] => {
    const lines = content.split('\n');
    const sections: Section[] = [];
    let currentSection: Partial<Section> | null = null;
    let sectionContent = '';
    let sectionIndex = 0;

    const getIconForSection = (title: string): React.ReactNode => {
      const titleLower = title.toLowerCase();
      
      if (titleLower.includes('refined') || titleLower.includes('idea')) {
        return <Lightbulb className="w-5 h-5" />;
      } else if (titleLower.includes('feature')) {
        return <Target className="w-5 h-5" />;
      } else if (titleLower.includes('twist') || titleLower.includes('unique')) {
        return <Rocket className="w-5 h-5" />;
      } else if (titleLower.includes('user') || titleLower.includes('target')) {
        return <Users className="w-5 h-5" />;
      } else if (titleLower.includes('monetiz') || titleLower.includes('revenue')) {
        return <DollarSign className="w-5 h-5" />;
      } else if (titleLower.includes('mvp') || titleLower.includes('plan')) {
        return <Rocket className="w-5 h-5" />;
      } else if (titleLower.includes('hook')) {
        return <Target className="w-5 h-5" />;
      } else if (titleLower.includes('script')) {
        return <Target className="w-5 h-5" />;
      } else if (titleLower.includes('ending')) {
        return <Rocket className="w-5 h-5" />;
      } else if (titleLower.includes('perspective') || titleLower.includes('solution')) {
        return <Lightbulb className="w-5 h-5" />;
      } else if (titleLower.includes('improved') || titleLower.includes('prompt')) {
        return <Target className="w-5 h-5" />;
      } else {
        return <Lightbulb className="w-5 h-5" />;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detect section headers (lines with **, ##, or all caps)
      if (
        (line.startsWith('**') && line.endsWith('**')) ||
        line.startsWith('##') ||
        line.startsWith('#') ||
        (line.length > 3 && line === line.toUpperCase() && !line.includes('HTTP'))
      ) {
        // Save previous section
        if (currentSection && sectionContent.trim()) {
          sections.push({
            id: `section-${sectionIndex}`,
            title: currentSection.title || 'Section',
            content: sectionContent.trim(),
            icon: currentSection.icon || <Lightbulb className="w-5 h-5" />,
            delay: sectionIndex * 300
          });
          sectionIndex++;
        }
        
        // Start new section
        const cleanTitle = line.replace(/\*\*/g, '').replace(/#/g, '').trim();
        currentSection = {
          title: cleanTitle,
          icon: getIconForSection(cleanTitle)
        };
        sectionContent = '';
      } else if (line && currentSection) {
        // Add content to current section
        sectionContent += line + '\n';
      } else if (line && !currentSection) {
        // Content before any section - create default section
        currentSection = {
          title: 'Overview',
          icon: <Lightbulb className="w-5 h-5" />
        };
        sectionContent = line + '\n';
      }
    }
    
    // Add the last section
    if (currentSection && sectionContent.trim()) {
      sections.push({
        id: `section-${sectionIndex}`,
        title: currentSection.title || 'Section',
        content: sectionContent.trim(),
        icon: currentSection.icon || <Lightbulb className="w-5 h-5" />,
        delay: sectionIndex * 300
      });
    }
    
    return sections.length > 0 ? sections : [{
      id: 'section-0',
      title: 'Result',
      content: content,
      icon: <Lightbulb className="w-5 h-5" />,
      delay: 0
    }];
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleAction = async (action: string) => {
    await onAction(action);
    // Reset for new content
    setIsComplete(false);
    setSections([]);
    setExpandedSections(new Set());
  };

  if (isGenerating) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full">
              <div className="w-6 h-6 border-2 border-zinc-300 dark:border-zinc-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                Generating your {mode}...
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                This usually takes 2-3 seconds
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!output) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-zinc-50 dark:bg-zinc-900 rounded-full">
            <Lightbulb className="w-6 h-6 text-zinc-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
              Ready to generate
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Enter your input above and click generate to see results here
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Progressive Reveal */}
      <ProgressiveReveal
        sections={sections}
        isComplete={isComplete}
        onSectionReveal={(sectionId) => {
          // Auto-expand sections as they're revealed
          if (preferences.showProgressiveReveal) {
            setExpandedSections(prev => new Set([...prev, sectionId]));
          }
        }}
        revealSpeed={preferences.revealSpeed || 20}
      />

      {/* Action Buttons */}
      {isComplete && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
          <OutputActions
            onAction={handleAction}
            isGenerating={isGenerating}
            currentMode={mode}
          />
        </div>
      )}
    </div>
  );
}

export default EnhancedOutputArea;
