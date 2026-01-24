
import { config } from '../config';

/**
 * Loads the Payhip SDK script if not already present.
 */
export const loadPayhipSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve();
    
    // Check if already loaded
    if ((window as any).Payhip) {
      return resolve();
    }

    // Check if script tag already exists
    if (document.getElementById('payhip-sdk')) {
      return resolve();
    }

    const script = document.createElement('script');
    script.id = 'payhip-sdk';
    script.src = 'https://payhip.com/payhip.js';
    script.async = true;
    script.onload = () => {
      console.log("Payhip SDK loaded successfully.");
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load Payhip SDK'));
    document.body.appendChild(script);
  });
};

/**
 * Programmatic checkout trigger (Fallback method)
 */
export const openPayhipCheckout = async (productUrl: string): Promise<void> => {
  await loadPayhipSDK();
  
  if (!(window as any).Payhip) {
    // If SDK didn't load, just open the link in a new tab
    window.open(productUrl, '_blank');
    return;
  }

  // The SDK works best with real DOM elements. 
  // We create a temporary one, click it, and remove it.
  const link = document.createElement('a');
  link.href = productUrl;
  link.className = 'payhip-buy-button';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
  }, 500);
};
