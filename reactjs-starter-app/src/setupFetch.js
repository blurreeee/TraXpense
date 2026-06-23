import { decryptPayload, encryptPayload } from './utils/encryption';

const originalFetch = window.fetch;

window.fetch = async function (...args) {
  let init = args[1];

  if (init && init.body && typeof init.body === 'string') {
    const method = (init.method || 'GET').toUpperCase();
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      let isJson = false;
      if (init.headers) {
        if (typeof init.headers.get === 'function') {
          const contentType = init.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            isJson = true;
          }
        } else if (Array.isArray(init.headers)) {
          const contentTypePair = init.headers.find(pair => pair[0] && pair[0].toLowerCase() === 'content-type');
          if (contentTypePair && contentTypePair[1] && contentTypePair[1].includes('application/json')) {
            isJson = true;
          }
        } else if (typeof init.headers === 'object') {
          const contentTypeKey = Object.keys(init.headers).find(k => k.toLowerCase() === 'content-type');
          if (contentTypeKey) {
            const contentTypeValue = init.headers[contentTypeKey];
            if (contentTypeValue && contentTypeValue.includes('application/json')) {
              isJson = true;
            }
          }
        }
      }

      if (isJson) {
        try {
          const parsed = JSON.parse(init.body);
          if (parsed && typeof parsed === 'object' && !parsed.payload) {
            const encrypted = encryptPayload(parsed);
            init = {
              ...init,
              body: JSON.stringify({ payload: encrypted })
            };
            args[1] = init;
          }
        } catch (e) {
          // Fallback if not valid JSON
        }
      }
    }
  }

  const response = await originalFetch.apply(this, args);

  // We only intercept successful JSON responses that contain 'response'
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
          if (json && typeof json === 'object' && json.response) {
            // It's our encrypted response!
            const decryptedData = decryptPayload(json.response);
            
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

  // If it's an error, or not our encrypted response, just return the original response
  return response;
};
