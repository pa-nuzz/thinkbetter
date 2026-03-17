'use client';

import { useCallback, useState } from 'react';
import { useApp } from '@/lib/store';
import { apiClient } from '@/lib/api';
import { GenerateRequest, GenerateResponse } from '@/types/api';

export function useGeneration() {
  const { 
    currentMode, 
    input, 
    output, 
    setInput, 
    setOutput, 
    setGenerating, 
    isGenerating,
    addToHistory,
    settings 
  } = useApp();
  
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    if (!input.trim() || isGenerating) {
      return;
    }

    setError(null);
    setGenerating(true);

    try {
      const request: GenerateRequest = {
        mode: currentMode,
        input: input.trim(),
        options: getModeSpecificOptions()
      };

      // Use the main generate endpoint with fallback
      const response = await apiClient.generateContent(request);
      
      setOutput(response.output);
      
      // Add to history
      addToHistory({
        id: Date.now().toString(),
        mode: currentMode,
        input: input.trim(),
        output: response.output,
        timestamp: new Date(),
        tokensUsed: response.tokens_used,
        generationTime: response.generation_time
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Generation failed';
      setError(errorMessage);
      console.error('Generation error:', err);
    } finally {
      setGenerating(false);
    }
  }, [input, isGenerating, currentMode, setGenerating, setOutput, addToHistory, settings]);

  const handleAction = useCallback(async (action: string) => {
    if (!output.trim() || isGenerating) {
      return;
    }

    setError(null);
    setGenerating(true);

    try {
      // Create action-specific request
      const actionRequest = {
        input: output.trim(),
        mode: currentMode,
        options: {
          ...getModeSpecificOptions(),
          action: action,
          previous_output: output
        }
      };

      const response = await apiClient.generateContent(actionRequest);
      
      setOutput(response.output);
      
      // Add to history with action annotation
      addToHistory({
        id: Date.now().toString(),
        mode: currentMode,
        input: `${action.toUpperCase()}: ${output.trim()}`,
        output: response.output,
        timestamp: new Date(),
        tokensUsed: response.tokens_used,
        generationTime: response.generation_time
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Action failed';
      setError(errorMessage);
      console.error('Action error:', err);
    } finally {
      setGenerating(false);
    }
  }, [output, isGenerating, currentMode, setGenerating, setOutput, addToHistory, settings]);

  const getModeSpecificOptions = () => {
    switch (currentMode) {
      case 'idea':
        return {
          category: settings.ideaSettings.defaultCategory,
          tone: settings.ideaSettings.defaultTone
        };
      case 'script':
        return {
          script_type: settings.scriptSettings.defaultScriptType
        };
      case 'brainstorm':
        return {
          quantity: settings.brainstormSettings.defaultQuantity
        };
      case 'prompt':
        return {
          target_model: settings.promptSettings.defaultTargetModel,
          enhancement_type: settings.promptSettings.defaultEnhancementType
        };
      default:
        return {};
    }
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setInput('');
    setOutput('');
    setError(null);
  }, [setInput, setOutput]);

  return {
    generate,
    handleAction,
    error,
    clearError,
    reset,
    isGenerating,
    input,
    output,
    currentMode
  };
}
