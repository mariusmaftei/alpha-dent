import React, { useMemo } from "react";

function ImageEnhancement({ image, brightness = 0, contrast = 0, sharpness = 0, filter = "none" }) {
  const enhancedStyle = useMemo(() => {
    const filters = [];
    
    if (brightness !== 0) {
      filters.push(`brightness(${1 + brightness / 100})`);
    }
    
    if (contrast !== 0) {
      filters.push(`contrast(${1 + contrast / 100})`);
    }
    
    if (sharpness !== 0) {
      const amount = sharpness / 100;
      filters.push(`contrast(${1 + amount * 0.5})`);
    }
    
    if (filter === "grayscale") {
      filters.push("grayscale(100%)");
    } else if (filter === "sepia") {
      filters.push("sepia(100%)");
    } else if (filter === "invert") {
      filters.push("invert(100%)");
    }
    
    return {
      filter: filters.length > 0 ? filters.join(" ") : "none",
    };
  }, [brightness, contrast, sharpness, filter]);

  return { enhancedStyle };
}

export default ImageEnhancement;

