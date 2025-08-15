import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../LoadingSpinner';

interface FramerWebsiteProps {
  url: string;
  title?: string;
  className?: string;
  onLoad?: () => void;
  onError?: (error: string) => void;
}

export const FramerWebsite: React.FC<FramerWebsiteProps> = ({
  url,
  title = 'Framer Website',
  className = '',
  onLoad,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    
    // Check if it's a project URL vs published URL
    if (url.includes('/projects/')) {
      setErrorMessage('This appears to be a Framer project URL, not a published website. Please publish your website first and use the published URL (e.g., https://your-site.framer.app)');
    } else {
      setErrorMessage('Failed to load the website. Please check the URL or try again later.');
    }
    
    onError?.('Failed to load website');
  };

  useEffect(() => {
    // Reset states when URL changes
    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');
  }, [url]);

  if (hasError) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[400px] p-8 text-center ${className}`}>
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold mb-2">Website Loading Error</h3>
        <p className="text-gray-600 mb-4 max-w-md">{errorMessage}</p>
        <div className="space-y-2">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
          <div className="text-sm text-gray-500">
            <p>Current URL: <code className="bg-gray-100 px-2 py-1 rounded">{url}</code></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="text-center">
            <div className="loader mb-4"></div>
            <p className="text-lg font-medium text-gray-600 dark:text-gray-400">Loading website...</p>
            <p className="text-sm text-gray-500 mt-2">URL: {url}</p>
          </div>
        </div>
      )}
      
      <iframe
        src={url}
        title={title}
        className="w-full h-full border-0"
        onLoad={handleLoad}
        onError={handleError}
        allow="fullscreen; camera; microphone; geolocation"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
      />
    </div>
  );
};
