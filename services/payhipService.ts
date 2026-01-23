
import { config } from '../config';

/**
 * Loads the Payhip SDK script if not already present.
 */
export const loadPayhipSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ((window as any).Payhip) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://payhip.com/payhip.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Payhip SDK'));
    document.body.appendChild(script);
  });
};

/**
 * Opens the Payhip checkout popup for a specific product.
 * @param productUrl The full Payhip product URL or product code (e.g., 'https://payhip.com/b/XXXX')
 */
export const openPayhipCheckout = async (productUrl: string): Promise<void> => {
  await loadPayhipSDK();
  
  if (!(window as any).Payhip) {
    throw new Error('Payhip SDK not initialized');
  }

  // Payhip SDK can be triggered by calling their internal method
  // Usually, the SDK detects links with class 'payhip-buy-button',
  // but we can also trigger it programmatically if needed.
  // For most reliable use in React, we find or create a hidden anchor and click it.
  
  const link = document.createElement('a');
  link.href = productUrl;
  link.className = 'payhip-buy-button';
  link.style.display = 'none';
  document.body.appendChild(link);
  
  // Payhip.js will intercept the click on any .payhip-buy-button
  link.click();
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
  }, 100);
};
