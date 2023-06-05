import React, { useState, useEffect } from 'react';

const ImageWithFallback = ({ src, fallbackSrc, alt, style }) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{
    setImageSrc(src)
  }, [src])
  const handleError = () => {
    console.log('error');
    setImageSrc(fallbackSrc);
  };
  const handleImageLoad = () => {
    setLoading(false);
  };

  return (
    <>
        {loading && <img src={fallbackSrc} alt={alt} style={style} />}
        <img src={imageSrc} alt={alt} onLoad={handleImageLoad} onError={handleError} style={{...style, display: loading ? 'none': 'block'}} />
    
    </>
    )
};

export default ImageWithFallback;