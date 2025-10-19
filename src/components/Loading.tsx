import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-timeline-bg">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-8">
          {/* Outer ring */}
          <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
          
          {/* Spinning ring */}
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
          
          {/* Inner pulsing circle */}
          <div className="absolute inset-4 bg-blue-500/30 rounded-full animate-pulse"></div>
          
          {/* Center dot */}
          <div className="absolute inset-8 bg-blue-400 rounded-full shadow-lg" 
               style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' }}>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">TimeScape</h2>
        <p className="text-gray-400 text-sm">Loading historical events...</p>
        
        <div className="mt-6 flex justify-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;

