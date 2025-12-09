import React, { useEffect, useRef, useState } from "react";
import styles from "./Magnifier.module.css";

function Magnifier({
  src,
  alt = "",
  zoom = 2,
  size = 160,
  imageClassName,
  children,
  imageRef,
  style,
}) {
  const imgRef = useRef(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [lens, setLens] = useState({ x: 0, y: 0, show: false });

  const setRefs = (el) => {
    imgRef.current = el;
    if (typeof imageRef === "function") {
      imageRef(el);
    } else if (imageRef) {
      imageRef.current = el;
    }
  };

  useEffect(() => {
    setLens((prev) => ({ ...prev, show: false }));
  }, [src]);

  const handleLoad = () => {
    if (imgRef.current) {
      setNatural({
        w: imgRef.current.naturalWidth,
        h: imgRef.current.naturalHeight,
      });
    }
  };

  const handleMove = (e) => {
    const img = imgRef.current;
    if (!img || !natural.w || !natural.h) return;

    const rect = img.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;

    const half = size / 2;
    const x = Math.max(half, Math.min(rect.width - half, relX));
    const y = Math.max(half, Math.min(rect.height - half, relY));

    setLens({ x, y, show: true });
  };

  const handleLeave = () => setLens((prev) => ({ ...prev, show: false }));

  const bgSize = `${natural.w * zoom}px ${natural.h * zoom}px`;
  const bgPos = `-${lens.x * zoom - size / 2}px -${lens.y * zoom - size / 2}px`;

  return (
    <div
      className={styles.wrapper}
      onMouseMove={handleMove}
      onMouseEnter={handleMove}
      onMouseLeave={handleLeave}
      style={style}
    >
      <img
        ref={setRefs}
        src={src}
        alt={alt}
        className={`${styles.image} ${imageClassName || ""}`.trim()}
        onLoad={handleLoad}
      />
      {children}
      {lens.show && natural.w > 0 && (
        <div
          className={styles.lens}
          style={{
            width: size,
            height: size,
            left: lens.x - size / 2,
            top: lens.y - size / 2,
            backgroundImage: `url(${src})`,
            backgroundSize: bgSize,
            backgroundPosition: bgPos,
          }}
        />
      )}
    </div>
  );
}

export default Magnifier;
