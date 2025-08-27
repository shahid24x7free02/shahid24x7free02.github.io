/* visitor-logger.js
   Drop into any web page with: <script src="https://yourcdn.com/visitor-logger.js" async></script>
   Make sure to replace GAS_ENDPOINT with your deployed Apps Script web app URL.
*/
(function () {
  'use strict';

  const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzpWVheGQuuimelYD2swTej1EW10tV7E2MSbU9z0_ToniEKFre4Lbvx013oimxDmWYn/exec'; // <- REPLACE
  const SITE_KEY = 'MySiteKey'; // <- REPLACE (must match Apps Script)

  // timeout helper
  function timeoutFetch(url, opts = {}, ms = 6000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);
    opts.signal = controller.signal;
    return fetch(url, opts).finally(() => clearTimeout(id));
  }

  function detectDevice() {
    try {
      // Prefer userAgentData when available (Chromium)
      if (navigator.userAgentData && navigator.userAgentData.platform) {
        return navigator.userAgentData.platform;
      }
      const ua = navigator.userAgent || '';
      if (/Android/i.test(ua)) return 'Android';
      if (/\b(iPhone|iPad|iPod)\b/i.test(ua)) return 'iOS';
      if (/Windows NT/i.test(ua)) return 'Windows';
      if (/Macintosh/i.test(ua)) return 'macOS';
      if (/Linux/i.test(ua)) return 'Linux';
      return 'Unknown';
    } catch (e) {
      return 'Unknown';
    }
  }

  function detectBrowser() {
    try {
      const ua = (navigator.userAgent || '').toLowerCase();
      if (ua.includes('edg/')) return 'Edge';
      if (ua.includes('opr/') || ua.includes('opera')) return 'Opera';
      if (ua.includes('chrome/') && !ua.includes('edg/') && !ua.includes('opr/')) return 'Chrome';
      if (ua.includes('firefox/')) return 'Firefox';
      if (ua.includes('safari/') && !ua.includes('chrome/') && !ua.includes('opr/') && !ua.includes('edg/')) return 'Safari';
      if (ua.includes('brave/')) return 'Brave';
      return navigator.userAgent || 'Unknown';
    } catch (e) {
      return 'Unknown';
    }
  }

  async function getIPAndGeo() {
    const fallback = { ip: 'Unknown', city: 'Unknown', region: 'Unknown', country: 'Unknown' };
    try {
      // ipapi.co returns: ip, city, region, country_name (and more)
      const res = await timeoutFetch('https://ipapi.co/json/', { method: 'GET', cache: 'no-store' }, 5000);
      if (!res.ok) return fallback;
      const j = await res.json();
      return {
        ip: j.ip || 'Unknown',
        city: j.city || 'Unknown',
        region: j.region || j.region_code || 'Unknown',
        country: j.country_name || j.country || 'Unknown'
      };
    } catch (err) {
      return fallback;
    }
  }

  async function sendToGAS(payloadObj) {
    try {
      // Build URLSearchParams (application/x-www-form-urlencoded) -> avoids preflight in most browsers
      const params = new URLSearchParams();
      for (const k in payloadObj) {
        if (Object.prototype.hasOwnProperty.call(payloadObj, k)) {
          params.set(k, payloadObj[k] == null ? '' : String(payloadObj[k]));
        }
      }
      // also send siteKey
      params.set('siteKey', SITE_KEY);

      const res = await fetch(GAS_ENDPOINT, {
        method: 'POST',
        body: params,
        // don't explicitly set Content-Type to application/json (that causes preflight)
        credentials: 'omit',
        mode: 'cors'
      });

      // Try to parse JSON response
      let text = await res.text();
      try {
        const parsed = JSON.parse(text || '{}');
        return { ok: res.ok, body: parsed, raw: text };
      } catch (e) {
        return { ok: res.ok, body: null, raw: text };
      }
    } catch (err) {
      return { ok: false, error: err.message || String(err) };
    }
  }

  async function collectAndSend() {
    const ts = new Date().toISOString();
    const pageUrl = (typeof location !== 'undefined' && location.href) ? location.href : '';
    const device = detectDevice();
    const browser = detectBrowser();

    // get IP + geo
    const geo = await getIPAndGeo();

    // Match your header names exactly as requested:
    const payload = {
      'TimeStamp': ts,
      'WebPageURl': pageUrl,
      'Device': device,
      'Browser': browser,
      'IP Address': geo.ip,
      'City': geo.city,
      'State': geo.region,
      'Country': geo.country
    };

    const result = await sendToGAS(payload);
    if (result.ok && result.body && result.body.success) {
      console.log('[VisitorLogger] ✅ visitor data sent to Google Sheet (VisiterData).', payload, result.body);
    } else {
      // helpful debug logs
      console.warn('[VisitorLogger] Response not OK or no success flag. result=', result);
      // If you want to remove debug logs later, delete these lines
    }
    return result;
  }

  // run on full page load + 1 second
  if (typeof window !== 'undefined') {
    window.addEventListener('load', function () {
      try {
        setTimeout(() => {
          collectAndSend().catch(err => console.error('[VisitorLogger] error', err));
        }, 1000); // exactly 1 second after page load
      } catch (e) {
        console.error('[VisitorLogger] init error', e);
      }
    }, { passive: true });
  }
})();
