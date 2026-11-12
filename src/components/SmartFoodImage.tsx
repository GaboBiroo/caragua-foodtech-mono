'use client';

import React, { useEffect, useRef, useState } from 'react';

interface SmartFoodImageProps {
  src: string;
  alt: string;
  knownWidth?: number;
  knownHeight?: number;
  /**
   * 'card' | 'hero' | 'banner': prevents stretching small (<360px) rasters such as
   * 200x133 thumbnails across large containers by rendering them at crisp ~1:1 native
   * resolution over a blurred atmospheric backdrop of the same photo.
   * 'thumb': small square slots (<=80px) stay full-bleed object-cover.
   */
  mode?: 'card' | 'hero' | 'banner' | 'thumb';
  className?: string;
  imgClassName?: string;
  loading?: 'lazy' | 'eager';
  hoverZoom?: boolean;
}

export const SmartFoodImage: React.FC<SmartFoodImageProps> = ({
  src,
  alt,
  knownWidth = 0,
  knownHeight = 0,
  mode = 'card',
  className = '',
  imgClassName = '',
  loading = 'lazy',
  hoverZoom = false,
}) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number }>({
    w: knownWidth > 0 ? knownWidth : 0,
    h: knownHeight > 0 ? knownHeight : 0,
  });

  useEffect(() => {
    setDims({
      w: knownWidth > 0 ? knownWidth : 0,
      h: knownHeight > 0 ? knownHeight : 0,
    });
  }, [src, knownWidth, knownHeight]);

  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth > 0) {
      setDims((prev) =>
        prev.w === el.naturalWidth && prev.h === el.naturalHeight
          ? prev
          : { w: el.naturalWidth, h: el.naturalHeight }
      );
    }
  }, [src]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const el = e.currentTarget;
    if (el.naturalWidth > 0) {
      setDims({ w: el.naturalWidth, h: el.naturalHeight });
    }
  };

  // Compact rasters (<360px wide, e.g. 200x133 Anota AI menu blobs or 200x200 logos)
  // look pixelated/blurry when stretched across 380px-700px containers.
  const isCompactRaster = mode !== 'thumb' && dims.w > 0 && dims.w < 360;

  if (isCompactRaster) {
    // Render near native 1:1 pixel dimensions so sharp small photos stay tack-sharp
    const nativeMaxWidth =
      mode === 'hero'
        ? Math.min(Math.max(dims.w * 1.15, 220), 280)
        : Math.min(Math.max(dims.w * 1.08, 190), 240);

    return (
      <div
        className={`relative w-full h-full overflow-hidden flex items-center justify-center bg-stone-950 ${className}`}
      >
        {/* Atmospheric soft backdrop sampled from the same dish photo */}
        <img
          src={src}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover scale-125 blur-2xl opacity-55 brightness-75 pointer-events-none select-none"
          loading={loading}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/35 pointer-events-none"
        />

        {/* Crisp native-scale foreground photo (zero blurry upscaling) */}
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          onLoad={handleLoad}
          loading={loading}
          style={{
            maxWidth: `${Math.round(nativeMaxWidth)}px`,
            maxHeight: mode === 'banner' ? '82%' : '86%',
          }}
          className={`relative z-[1] w-auto h-auto object-contain rounded-2xl shadow-[0_14px_34px_rgba(0,0,0,0.48)] ring-1 ring-white/25 ${imgClassName}`}
        />
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      onLoad={handleLoad}
      loading={loading}
      className={`w-full h-full object-cover object-center ${
        hoverZoom ? 'group-hover:scale-105 transition-transform duration-500' : ''
      } ${className} ${imgClassName}`}
    />
  );
};
