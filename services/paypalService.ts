
import { config } from '../config';

/**
 * Robust PayPal SDK Loader
 * Handles dynamic Client ID changes and prevents errors in sandboxed environments.
 */
export const loadPayPalScript = async (): Promise<any> => {
  const clientId = config.paypal.clientId;
  const isSandbox = config.paypal.isSandbox;
  
  if (!clientId || clientId.includes('AaBbCc')) {
    throw new Error("Invalid PayPal Client ID. Please update it in Admin Settings.");
  }

  const scriptId = 'paypal-sdk-script';
  const existingScript = document.getElementById(scriptId) as HTMLScriptElement;
  
  if (existingScript) {
    const scriptUrl = new URL(existingScript.src);
    const existingId = scriptUrl.searchParams.get('client-id');
    
    if (existingId === clientId) {
      if ((window as any).paypal) return (window as any).paypal;
      
      return new Promise((resolve, reject) => {
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if ((window as any).paypal) {
            clearInterval(interval);
            resolve((window as any).paypal);
          }
          if (attempts > 30) { 
            clearInterval(interval);
            reject(new Error("PayPal initialization timed out. Your browser may be blocking the script."));
          }
        }, 100);
      });
    } else {
      existingScript.remove();
      if ((window as any).paypal) delete (window as any).paypal;
    }
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = scriptId;
    // Adding attributes to help the SDK identify the integration source and bypass some host restrictions
    script.setAttribute('data-sdk-integration-source', 'button-factory');
    script.setAttribute('data-namespace', 'paypal_sdk');
    
    const baseUrl = "https://www.paypal.com/sdk/js";
    // Added disable-funding to reduce complex UI elements that might trigger frame errors
    const params = new URLSearchParams({
        'client-id': clientId,
        'currency': 'USD',
        'intent': 'capture',
        'disable-funding': 'credit,card,paylater'
    });
    
    if (isSandbox) params.append('debug', 'true');
    
    script.src = `${baseUrl}?${params.toString()}`;
    script.async = true;
    
    const timeout = setTimeout(() => {
      reject(new Error("PayPal script load timed out. Check your internet or browser tracking protection."));
    }, 8000);

    script.onload = () => {
      clearTimeout(timeout);
      // The namespace attribute changes the global object name
      const sdk = (window as any).paypal_sdk || (window as any).paypal;
      if (sdk) {
        resolve(sdk);
      } else {
        reject(new Error("PayPal SDK loaded but object is not available in window."));
      }
    };

    script.onerror = () => {
      clearTimeout(timeout);
      reject(new Error("Failed to load PayPal. Many preview environments block external payment scripts for security. Use 'Simulate Payment' below to test the app flow."));
    };

    document.body.appendChild(script);
  });
};
