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

  // Defensively catch global errors that PayPal might throw during bootstrap in sandboxed frames
  const globalErrorHandler = (event: ErrorEvent) => {
    if (event.message?.includes('Can not read window host')) {
      console.warn("Caught PayPal Bootstrap Error: Sandbox restriction detected.");
      event.preventDefault(); // Stop it from bubbling up as an uncaught error
    }
  };
  window.addEventListener('error', globalErrorHandler);

  const scriptId = 'paypal-sdk-script';
  const existingScript = document.getElementById(scriptId) as HTMLScriptElement;
  
  if (existingScript) {
    const scriptUrl = new URL(existingScript.src);
    const existingId = scriptUrl.searchParams.get('client-id');
    
    if (existingId === clientId) {
      if ((window as any).paypal || (window as any).paypal_sdk) {
        return (window as any).paypal_sdk || (window as any).paypal;
      }
    } else {
      existingScript.remove();
      if ((window as any).paypal) delete (window as any).paypal;
      if ((window as any).paypal_sdk) delete (window as any).paypal_sdk;
    }
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = scriptId;
    script.crossOrigin = 'anonymous';
    
    // Attributes to help the SDK identify the integration source
    script.setAttribute('data-sdk-integration-source', 'button-factory');
    script.setAttribute('data-namespace', 'paypal_sdk');
    
    const baseUrl = "https://www.paypal.com/sdk/js";
    const params = new URLSearchParams({
        'client-id': clientId,
        'currency': 'USD',
        'intent': 'capture',
        'disable-funding': 'credit,card,paylater',
        // Try to force the SDK to be less aggressive with parent window checks
        'commit': 'true'
    });
    
    if (isSandbox) params.append('debug', 'true');
    
    script.src = `${baseUrl}?${params.toString()}`;
    script.async = true;
    
    const timeout = setTimeout(() => {
      window.removeEventListener('error', globalErrorHandler);
      reject(new Error("PayPal script load timed out. Sandbox environment may be blocking external scripts."));
    }, 10000);

    script.onload = () => {
      clearTimeout(timeout);
      window.removeEventListener('error', globalErrorHandler);
      
      // Give a small buffer for the SDK to finish internal bootstrapping
      setTimeout(() => {
        const sdk = (window as any).paypal_sdk || (window as any).paypal;
        if (sdk) {
          resolve(sdk);
        } else {
          reject(new Error("PayPal SDK loaded but initialization failed due to environment restrictions."));
        }
      }, 200);
    };

    script.onerror = () => {
      clearTimeout(timeout);
      window.removeEventListener('error', globalErrorHandler);
      reject(new Error("PayPal failed to load. This environment restricts payment SDKs. Please use 'Simulate Payment'."));
    };

    document.body.appendChild(script);
  });
};