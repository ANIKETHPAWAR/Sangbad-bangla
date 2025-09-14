import React, { useEffect, useRef } from 'react';

// Reusable AdSense ad slot component
// Props: adSlot (string), adFormat (string), fullWidthResponsive (bool), className (string), style (object)
const AdSlot = ({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  className = '',
  style = {}
}) => {
  const insRef = useRef(null);

  useEffect(() => {
    try {
      if (window.adsbygoogle && insRef.current) {
        // Push a new ad request for this ins element
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      // Ignore AdSense errors in dev
      // console.warn('adsbygoogle push failed', e);
    }
  }, [adSlot]);

  // Do not render without required attributes
  if (!adSlot) return null;

  return (
    <ins
      ref={insRef}
      className={`adsbygoogle ${className}`.trim()}
      style={{ display: 'block', ...style }}
      data-ad-client={import.meta.env.VITE_ADSENSE_CLIENT_ID || ''}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
    />
  );
};

export default AdSlot;



