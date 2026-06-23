import { decryptPayload } from './utils/encryption';

const originalFetch = window.fetch;

window.fetch = async function (...args) {
  const response = await originalFetch.apply(this, args);

  // We only intercept successful JSON responses that contain 'payload'
  if (response.ok) {
    // Clone the response so we can read it, but leave original intact if we don't intercept
    const clone = response.clone();
    
    // Check Content-Type
    const contentType = clone.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        const text = await clone.text();
        if (text) {
          const json = JSON.parse(text);
          if (json && typeof json === 'object' && json.payload) {
            // It's our encrypted response!
            const decryptedData = decryptPayload(json.payload);
            
            // Return a new response object that overrides the json() method
            return new Response(JSON.stringify(decryptedData), {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers
            });
          }
        }
      } catch (err) {
        // If anything fails parsing, just fall through to returning the original response
        console.error("Intercept fetch parsing error", err);
      }
    }
  }

  // If it's an error, or not our encrypted payload, just return the original response
  return response;
};
