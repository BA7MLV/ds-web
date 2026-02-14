import React from 'react';

export const SafeAreaLayout = ({ children, className = '' }) => {
  return (
    <div className={`min-h-screen min-h-[100svh] flex flex-col ${className}`}>
      {children}
    </div>
  );
};

export const SafeAreaTopSpacer = ({ className = '' }) => {
  return <div className={`h-safe-top ${className}`} />;
};

export const SafeAreaBottomSpacer = ({ className = '' }) => {
  return <div className={`h-safe-bottom ${className}`} />;
};

export const SafeAreaFixedHeader = ({ children, className = '' }) => {
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 pt-safe ${className}`}
    >
      {children}
    </header>
  );
};

export const SafeAreaFixedBottom = ({ children, className = '' }) => {
  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 pb-safe ${className}`}
    >
      {children}
    </div>
  );
};
