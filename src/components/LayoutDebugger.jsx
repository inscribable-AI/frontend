import React, { useEffect } from 'react';

function LayoutDebugger({ children }) {
  useEffect(() => {
    // Add diagnostic styles
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      /* Diagnostic styles - add visible borders to everything */
      .debug-layout * {
        outline: 1px solid rgba(255, 0, 0, 0.2);
      }
      
      /* Reset ALL top margins and paddings */
      body, #root, #app, 
      div, main, section, header, footer, 
      h1, h2, h3, h4, h5, h6, p {
        margin-top: 0 !important;
        padding-top: 0 !important;
      }
      
      /* Force main content to top */
      body > div#root {
        display: flex;
        flex-direction: column;
      }
      
      /* Ensure all wrappers are flush with parent */
      .min-h-screen {
        margin-top: 0 !important;
        padding-top: 0 !important;
      }
      
      /* Remove margins from standard layout elements */
      main, .flex-1, .py-6, .max-w-7xl {
        margin-top: 0 !important;
        padding-top: 0 !important;
      }
    `;
    document.head.appendChild(styleEl);
    
    // Log layout metrics to console
    console.log('========= LAYOUT DEBUGGER =========');
    console.log('Body margin-top:', getComputedStyle(document.body).marginTop);
    console.log('Root div margin-top:', document.getElementById('root') ? 
      getComputedStyle(document.getElementById('root')).marginTop : 'No #root');
    
    // Find the first main tag
    const mainEl = document.querySelector('main');
    if (mainEl) {
      console.log('Main element margin-top:', getComputedStyle(mainEl).marginTop);
      console.log('Main element padding-top:', getComputedStyle(mainEl).paddingTop);
      console.log('Main element first child:', mainEl.firstChild);
    }
    
    // Add debug class to body
    document.body.classList.add('debug-layout');
    
    return () => {
      // Clean up
      document.head.removeChild(styleEl);
      document.body.classList.remove('debug-layout');
    };
  }, []);

  return (
    <React.Fragment>
      {children}
    </React.Fragment>
  );
}

export default LayoutDebugger; 