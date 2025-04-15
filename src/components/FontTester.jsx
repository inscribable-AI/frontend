import React, { useEffect, useState } from 'react';

const FontTester = () => {
  const [fontLoaded, setFontLoaded] = useState(false);
  
  useEffect(() => {
    // Use the Font Loading API to check if TT Firs Neue is loaded
    document.fonts.ready.then(() => {
      if (document.fonts.check('1em "TT Firs Neue"')) {
        setFontLoaded(true);
      } else {
        setFontLoaded(false);
      }
    });
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
      <h3 className="text-sm font-bold mb-2">Font Test</h3>
      <div className="space-y-2">
        <p className="text-xs">
          Font status: 
          <span className={fontLoaded ? "text-green-500 ml-1" : "text-red-500 ml-1"}>
            {fontLoaded ? "TT Firs Neue loaded ✓" : "Font not loaded ✗"}
          </span>
        </p>
        <div className="border-t pt-2">
          <p className="text-sm mb-1">TT Firs Neue:</p>
          <p style={{ fontFamily: ' sans-serif' }} className="text-sm">
            The quick brown fox jumps over the lazy dog
          </p>
          <p className="text-sm mt-2 mb-1">System font:</p>
          <p style={{ fontFamily: 'Arial, sans-serif' }} className="text-sm">
            The quick brown fox jumps over the lazy dog
          </p>
        </div>
      </div>
    </div>
  );
};

export default FontTester; 