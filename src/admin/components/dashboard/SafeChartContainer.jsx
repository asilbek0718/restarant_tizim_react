import React, { useState, useEffect, useRef } from 'react';

/**
 * SafeChartContainer
 * A production-grade wrapper for Recharts that monitors its own size
 * using a ResizeObserver and prevents child components (like ResponsiveContainer)
 * from rendering until a valid positive width/height has been established by the browser.
 */
export const SafeChartContainer = ({ height = 300, children }) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      // Get content rectangle dimensions
      const { width, height: rectHeight } = entries[0].contentRect;
      setDimensions({ width, height: rectHeight || height });
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [height]);

  return (
    <div 
      ref={containerRef} 
      className="w-full min-w-0 min-h-0 relative" 
      style={{ height: `${height}px` }}
    >
      {dimensions.width > 0 && dimensions.height > 0 && (
        typeof children === 'function' 
          ? children(dimensions.width, dimensions.height) 
          : children
      )}
    </div>
  );
};

export default SafeChartContainer;
