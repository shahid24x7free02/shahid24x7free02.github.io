/* visitor-logger.js
   Drop into any web page with: <script src="https://yourcdn.com/visitor-logger.js" async></script>
   Make sure to replace GAS_ENDPOINT with your deployed Apps Script web app URL.
*/

(async function () {
  'use strict';

  const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzpWVheGQuuimelYD2swTej1EW10tV7E2MSbU9z0_ToniEKFre4Lbvx013oimxDmWYn/exec'; // <- replace
  const SITE_KEY = 'MySiteKey'; // <- REPLACE (must match Apps Script)

  function detectDevice() {
    if (navigator.userAgentData?.platform) return navigator.userAgentData.platform;
    const ua = navigator.userAgent || '';
    if (/Android/i.test(ua)) return 'Android';
    if (/\b(iPhone|iPad|iPod)\b/i.test(ua)) return 'iOS';
    if (/Windows NT/i.test(ua)) return 'Windows';
    if (/Macintosh/i.test(ua)) return 'macOS';
    if (/Linux/i.test(ua)) return 'Linux';
    return 'Unknown';
  }

  function detectBrowser() {
    const ua = (navigator.userAgent || '').toLowerCase();
    if (ua.includes('edg/')) return 'Edge';
    if (ua.includes('opr/') || ua.includes('opera')) return 'Opera';
    if (ua.includes('chrome/') && !ua.includes('edg/') && !ua.includes('opr/')) return 'Chrome';
    if (ua.includes('firefox/')) return 'Firefox';
    if (ua.includes('safari/') && !ua.includes('chrome/') && !ua.includes('opr/') && !ua.includes('edg/')) return 'Safari';
    return navigator.userAgent || 'Unknown';
  }

  async function getIPv4AndGeo() {
    try {
      // Step 1: get IPv4 only
      const ipRes = await fetch('https://api4.ipify.org?format=json&ts=' + Date.now(), {
        cache: 'no-store'
      });
      const ipJson = await ipRes.json();
      const ipv4 = ipJson.ip || 'Unknown';

      // Step 2: get geo data from ipwho.is (using ipv4)
      const geoRes = await fetch(`https://ipwho.is/${ipv4}?ts=${Date.now()}`, {
        cache: 'no-store'
      });
      const geoJson = await geoRes.json();
      return {
        ip: ipv4,
        city: geoJson.city || 'Unknown',
        region: geoJson.region || 'Unknown',
        country: geoJson.country || 'Unknown'
      };
    } catch (e) {
      return { ip: 'Unknown', city: 'Unknown', region: 'Unknown', country: 'Unknown' };
    }
  }

  async function sendToGAS(payloadObj) {
    const params = new URLSearchParams();
    Object.entries(payloadObj).forEach(([k, v]) => params.set(k, v || ''));
    params.set('siteKey', SITE_KEY);

    const res = await fetch(GAS_ENDPOINT + '?ts=' + Date.now(), { // cache-buster
      method: 'POST',
      body: params,
      cache: 'no-store',
      credentials: 'omit',
      mode: 'cors'
    });

    const text = await res.text();
    try {
      return { ok: res.ok, body: JSON.parse(text), raw: text };
    } catch {
      return { ok: res.ok, body: null, raw: text };
    }
  }

  async function collectAndSend() {
    const ts = new Date().toISOString();
    const geo = await getIPv4AndGeo();

    const payload = {
      'TimeStamp': ts,
      'WebPageURl': location.href,
      'Device': detectDevice(),
      'Browser': detectBrowser(),
      'IP Address': geo.ip,
      'City': geo.city,
      'State': geo.region,
      'Country': geo.country
    };

    const result = await sendToGAS(payload);
    if (result.ok && result.body?.success) {
      console.log('[VisitorLogger] ✅ Sent', payload);
    } else {
      console.warn('[VisitorLogger] ❌ Failed', result);
    }
  }

  window.addEventListener('load', () => setTimeout(collectAndSend, 1000));
})();
