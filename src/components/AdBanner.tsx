import { useEffect } from 'react';
import { Box } from '@mui/material';
import { useAppContext } from '@/context/AppContext';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface AdBannerProps {
  position?: 'inline' | 'sidebar' | 'sticky';
}

export default function AdBanner({ position = 'inline' }: AdBannerProps) {
  const { state } = useAppContext();

  useEffect(() => {
    // Load AdSense script
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    script.async = true;
    document.body.appendChild(script);

    // Push ad
    // (window.adsbygoogle = window.adsbygoogle || []).push({});

    // Track view/click - For demo, on mount simulate interaction
    const trackInteraction = async (type: 'view' | 'click') => {
      if (state.user) {
        try {
          await addDoc(collection(db, 'adInteractions'), {
            userId: state.user.uid,
            type,
            timestamp: new Date(),
          });
        } catch (error) {
          console.error('Error tracking ad interaction:', error);
        }
      }
    };
    trackInteraction('view');

    // Cleanup: Remove script without returning the element
    return () => {
      document.body.removeChild(script);
    };
  }, [state.user]);

  return (
    <Box sx={{ my: 2, textAlign: 'center' }} className="bg-surface-light dark:bg-surface-dark">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="YOUR_AD_CLIENT"
        data-ad-slot="YOUR_AD_SLOT"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </Box>
  );
}