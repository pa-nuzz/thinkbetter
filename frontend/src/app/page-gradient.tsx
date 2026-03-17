'use client';

import { useState } from 'react';

export default function ThinkBetterApp() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [selectedMode, setSelectedMode] = useState('idea');

  const testConnection = async () => {
    try {
      const response = await fetch('http://localhost:8000/', {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      console.log('Backend connection test:', response.status);
      return response.ok;
    } catch (err) {
      console.error('Backend connection test failed:', err);
      return false;
    }
  };

  const handleGenerate = async () => {
    if (!input.trim() || isGenerating) return;
    
    setIsGenerating(true);
    setError('');
    
    try {
      console.log('Generating with mode:', selectedMode, 'input:', input.trim());
      
      // Test connection first
      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('Cannot connect to backend server');
      }
      
      const response = await fetch('http://localhost:8000/generate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: input.trim(),
          mode: selectedMode
        }),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setOutput(data.output);
      } else {
        setError(data.message || 'Generation failed');
      }
    } catch (err) {
      console.error('Generation error details:', err);
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request timed out. The AI is taking too long to respond.');
      } else {
        setError(`Failed to connect to backend: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const modes = [
    { id: 'idea', label: 'Idea', icon: '💡' },
    { id: 'script', label: 'Script', icon: '📝' },
    { id: 'brainstorm', label: 'Brainstorm', icon: '🧠' },
    { id: 'prompt', label: 'Prompt', icon: '✨' }
  ];

  const actions = [
    { id: 'improve', label: 'Improve', icon: '🔄' },
    { id: 'simplify', label: 'Simplify', icon: '⚡' },
    { id: 'unique', label: 'Make it Unique', icon: '🌟' },
    { id: 'monetize', label: 'Add Monetization', icon: '💰' }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ 
            fontSize: '3.5rem', 
            fontWeight: '800', 
            color: 'white', 
            marginBottom: '1rem',
            textShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            letterSpacing: '-0.02em'
          }}>
            ThinkBetter
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            AI-powered idea enhancement and creative thinking. Transform your concepts into actionable insights.
          </p>
        </div>

        {/* Mode Selection */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            padding: '0.5rem', 
            borderRadius: '1rem',
            backdropFilter: 'blur(10px)'
          }}>
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                style={{
                  flex: 1,
                  borderRadius: '0.75rem',
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: selectedMode === mode.id ? '#764ba2' : 'rgba(255, 255, 255, 0.8)',
                  backgroundColor: selectedMode === mode.id ? 'white' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{mode.icon}</span>
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Section */}
        <div style={{ maxWidth: '48rem', margin: '0 auto', marginBottom: '2rem' }}>
          <div style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
            borderRadius: '1rem', 
            border: '1px solid rgba(255, 255, 255, 0.2)', 
            padding: '2rem',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '600', 
                color: '#374151', 
                marginBottom: '0.5rem' 
              }}>
                Describe your {selectedMode}
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Enter your ${selectedMode} here... be as detailed as possible for best results`}
                disabled={isGenerating}
                style={{
                  width: '100%',
                  resize: 'none',
                  borderRadius: '0.75rem',
                  border: '2px solid #e5e7eb',
                  padding: '1rem',
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  color: '#111827',
                  backgroundColor: isGenerating ? '#f9fafb' : 'white',
                  minHeight: '8rem',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#764ba2';
                  e.target.style.boxShadow = '0 0 0 3px rgba(118, 75, 162, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {input.length}/1000 characters
              </span>
              
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !input.trim()}
                style={{
                  borderRadius: '0.75rem',
                  padding: '0.875rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  background: isGenerating || !input.trim() 
                    ? 'linear-gradient(135deg, #9ca3af, #6b7280)' 
                    : 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  cursor: (isGenerating || !input.trim()) ? 'not-allowed' : 'pointer',
                  opacity: (isGenerating || !input.trim()) ? 0.6 : 1,
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  transform: (isGenerating || !input.trim()) ? 'none' : 'translateY(0)'
                }}
                onMouseOver={(e: any) => {
                  if (!isGenerating && input.trim()) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                  }
                }}
                onMouseOut={(e: any) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
              >
                {isGenerating ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ 
                      display: 'inline-block', 
                      width: '1rem', 
                      height: '1rem', 
                      border: '2px solid transparent', 
                      borderTop: '2px solid white', 
                      borderRadius: '50%', 
                      animation: 'spin 1s linear infinite' 
                    }}></span>
                    Generating...
                  </span>
                ) : `Generate ${selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)}`}
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{ maxWidth: '48rem', margin: '0 auto', marginBottom: '2rem' }}>
            <div style={{ 
              backgroundColor: '#fef2f2', 
              borderRadius: '0.75rem', 
              border: '1px solid #fecaca', 
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{ 
                width: '1rem', 
                height: '1rem', 
                backgroundColor: '#ef4444', 
                borderRadius: '50%',
                flexShrink: 0
              }}></div>
              <p style={{ color: '#b91c1c', fontSize: '0.875rem', margin: 0 }}>{error}</p>
            </div>
          </div>
        )}

        {/* Output Section */}
        {output && (
          <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
            <div style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              borderRadius: '1rem', 
              border: '1px solid rgba(255, 255, 255, 0.2)', 
              padding: '2rem',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>
                  {modes.find(m => m.id === selectedMode)?.icon}
                </span>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  color: '#111827', 
                  margin: 0 
                }}>
                  Generated {selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)}
                </h3>
              </div>
              
              <div style={{ 
                color: '#374151', 
                lineHeight: '1.7', 
                whiteSpace: 'pre-wrap',
                backgroundColor: '#f9fafb',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                border: '1px solid #e5e7eb',
                marginBottom: '1.5rem'
              }}>
                {output}
              </div>
              
              {/* Action Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {actions.map((action) => (
                  <button
                    key={action.id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1.25rem',
                      borderRadius: '0.75rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      backgroundColor: 'white',
                      color: '#374151',
                      border: '2px solid #e5e7eb',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e: any) => {
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.borderColor = '#764ba2';
                      e.target.style.color = '#764ba2';
                    }}
                    onMouseOut={(e: any) => {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.color = '#374151';
                    }}
                  >
                    <span>{action.icon}</span>
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isGenerating && (
          <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: '4rem', 
                height: '4rem', 
                backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                borderRadius: '50%', 
                marginBottom: '1.5rem',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ 
                  width: '2rem', 
                  height: '2rem', 
                  border: '3px solid rgba(255, 255, 255, 0.3)', 
                  borderTop: '3px solid white', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite' 
                }}></div>
              </div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: 'white', 
                marginBottom: '0.5rem',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                Generating your {selectedMode}...
              </h3>
              <p style={{ 
                fontSize: '1rem', 
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '0.5rem'
              }}>
                This usually takes 2-3 seconds
              </p>
              <p style={{ 
                fontSize: '0.875rem', 
                color: 'rgba(255, 255, 255, 0.6)'
              }}>
                Powered by AI with automatic fallback between providers
              </p>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
