import React, { useState } from 'react';
import { Sparkles, Image, RefreshCw, Download, CheckCircle } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App = () => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('minimal');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedLogo, setSelectedLogo] = useState(null);

  const generateLogo = async () => {
    if (!prompt.trim()) {
      console.error('Please enter a description for your logo');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-vZJwTEc9nv2U4kPmCR559KW07QZOOiEbXk39Th9oNqBS5BYw',
        },
        body: JSON.stringify({
          text_prompts: [{ 
            text: `Logo design: ${prompt}, style: ${style}, minimalist, professional, vector art, high quality, logo on white background` 
          }],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          samples: 1,
          steps: 30,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate logo');
      }

      const data = await response.json();

      if (data.artifacts && data.artifacts.length > 0) {
        const base64Image = data.artifacts[0].base64;
        const imageUrl = `data:image/png;base64,${base64Image}`;

        const newResult = {
          id: `logo-${Date.now()}`,
          imageUrl: imageUrl,
          prompt: `${prompt} (${style} style)`,
          timestamp: new Date(),
        };

        setResults(prev => [newResult, ...prev]);
        setSelectedLogo(newResult.id);
        alert('Your logo has been generated!');
      } else {
        throw new Error('No image was generated');
      }
    } catch (error) {
      console.error('Error generating logo:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate logo. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (imageUrl) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `logo-genius-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert('Logo downloaded successfully!');
  };

  const styleOptions = [
    { id: 'minimal', name: 'Minimal' },
    { id: 'modern', name: 'Modern' },
    { id: 'abstract', name: 'Abstract' },
    { id: 'geometric', name: 'Geometric' },
    { id: 'vintage', name: 'Vintage' },
    { id: 'tech', name: 'Tech' },
  ];

  return (
    <div className="logo-generator-container">
      <div className="logo-generator-content">
        {/* Form Section */}
        <div className="logo-form-section">
          <h1 className="logo-title">
            <Sparkles className="title-icon" />
            Create Your Logo
          </h1>

          <div className="form-container">
            {/* Logo Description Input */}
            <div className="form-group">
              <label htmlFor="prompt" className="form-label">Describe your logo</label>
              <textarea
                id="prompt"
                rows={4}
                className="form-textarea"
                placeholder="E.g., A modern tech company logo with blue and purple colors..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              ></textarea>
            </div>

            {/* Style Selection */}
            <div className="form-group">
              <label className="form-label">Style</label>
              <div className="style-grid">
                {styleOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`style-button ${style === option.id ? 'active' : ''}`}
                    onClick={() => setStyle(option.id)}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              className="generate-button"
              onClick={generateLogo}
              disabled={isGenerating || !prompt.trim()}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="button-icon spinning" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="button-icon" />
                  <span>Generate Logo</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview Section */}
        <div className="logo-preview-section">
          <h2 className="preview-title">Preview</h2>

          {/* Result Preview */}
          {results.length > 0 ? (
            <div className="preview-container">
              <div className="preview-image-container">
                <img
                  src={results[0].imageUrl}
                  alt="Generated logo"
                  className="preview-image"
                />
              </div>

              {/* Download/Regenerate Buttons */}
              <div className="preview-actions">
                <button
                  onClick={() => handleDownload(results[0].imageUrl)}
                  className="action-button download-button"
                >
                  <Download className="button-icon-small" />
                  <span>Download</span>
                </button>

                <button
                  onClick={generateLogo}
                  className="action-button regenerate-button"
                  disabled={isGenerating}
                >
                  <RefreshCw className={`button-icon-small ${isGenerating ? 'spinning' : ''}`} />
                  <span>Regenerate</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-preview">
              <Image className="empty-preview-icon" />
              <p className="empty-preview-text">Your generated logo will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Logo History Section */}
      {results.length > 0 && (
        <div className="logo-history-section">
          <h2 className="history-title">Your Logo History</h2>
          <div className="history-grid">
            {results.map((result) => (
              <div
                key={result.id}
                className={`history-item ${selectedLogo === result.id ? 'selected' : ''}`}
                onClick={() => setSelectedLogo(result.id)}
              >
                <img
                  src={result.imageUrl}
                  alt={result.prompt}
                  className="history-image"
                />
                <div className="history-overlay">
                  <p className="history-prompt">{result.prompt}</p>
                </div>
                {selectedLogo === result.id && (
                  <div className="selected-indicator">
                    <CheckCircle className="selected-icon" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;