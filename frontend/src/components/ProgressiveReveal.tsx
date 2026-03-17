'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  title: string;
  content: string;
  delay: number;
  icon?: React.ReactNode;
}

interface ProgressiveRevealProps {
  sections: Section[];
  isComplete: boolean;
  className?: string;
  onSectionReveal?: (sectionId: string) => void;
  revealSpeed?: number;
}

export function ProgressiveReveal({
  sections,
  isComplete,
  className,
  onSectionReveal,
  revealSpeed = 50
}: ProgressiveRevealProps) {
  const [revealedSections, setRevealedSections] = useState<Set<string>>(new Set());
  const [isRevealing, setIsRevealing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isComplete && !isRevealing) {
      startProgressiveReveal();
    }
  }, [isComplete, isRevealing]);

  const startProgressiveReveal = () => {
    setIsRevealing(true);
    setRevealedSections(new Set());

    sections.forEach((section, index) => {
      const delay = section.delay || (index * 200);
      
      timeoutRef.current = setTimeout(() => {
        setRevealedSections(prev => {
          const newSet = new Set(prev);
          newSet.add(section.id);
          onSectionReveal?.(section.id);
          return newSet;
        });

        if (index === sections.length - 1) {
          setTimeout(() => setIsRevealing(false), 300);
        }
      }, delay);
    });
  };

  const reset = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setRevealedSections(new Set());
    setIsRevealing(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={cn('space-y-6', className)}>
      {sections.map((section, index) => {
        const isRevealed = revealedSections.has(section.id);
        const isPreviousRevealed = index === 0 || revealedSections.has(sections[index - 1].id);
        
        return (
          <div
            key={section.id}
            className={cn(
              "transition-all duration-700 ease-out",
              "transform-gpu",
              isRevealed
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-4 scale-95",
              !isRevealed && isPreviousRevealed && "animate-pulse"
            )}
            style={{
              transitionDelay: isRevealed ? `${index * 100}ms` : '0ms'
            }}
          >
            <div className={cn(
              "bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6",
              "shadow-sm hover:shadow-md transition-shadow duration-300",
              isRevealed && "ring-2 ring-zinc-100 dark:ring-zinc-800"
            )}>
              <div className="flex items-start gap-3">
                {section.icon && (
                  <div className="flex-shrink-0 w-6 h-6 text-zinc-500 dark:text-zinc-400 mt-1">
                    {section.icon}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
                    {section.title}
                  </h3>
                  <div className="prose prose-zinc dark:prose-invert max-w-none">
                    <div 
                      className="text-zinc-700 dark:text-zinc-300 leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: section.content.replace(/\n/g, '<br />') 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {isRevealing && (
        <div className="flex justify-center py-4">
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-zinc-300 dark:bg-zinc-600 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProgressiveReveal;
