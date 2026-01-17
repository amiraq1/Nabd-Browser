
// قوائم الحجب الأساسية (محاكاة لقوائم AdGuard و EasyList)
const AD_PATTERNS = [
  // DoubleClick & Google Ads
  "doubleclick.net", "googleadservices.com", "googlesyndication.com", "g.doubleclick",
  "tpc.googlesyndication", "pagead2.googlesyndication", "google-analytics.com",

  // Facebook / Meta
  "connect.facebook.net", "pixel.facebook.com", "an.facebook.com",

  // Common Ad Networks
  "adnxs.com", "ads.yahoo.com", "moatads.com", "criteo.com", "outbrain.com",
  "taboola.com", "adroll.com", "rubiconproject.com", "pubmatic.com", "openx.net",
  "ads.twitter.com", "ads-twitter.com", "amazon-adsystem.com", "serving-sys.com",
  "media.net", "adform.net", "adsrvr.org", "smartadserver.com",

  // Mobile Specific
  "appsflyer.com", "adjust.com", "kochava.com", "branch.io",

  // Trackers & Analytics
  "hotjar.com", "crazyegg.com", "mixpanel.com", "segment.io", "fullstory.com",
  "scorecardresearch.com", "chartbeat.com", "quantserve.com", "newrelic.com"
];

const WHITELIST = [
  "google.com", "youtube.com" // نسمح بالنطاق الرئيسي، لكن نحظر الإعلانات داخله بالاسكريبت
];

// سكريبت الحجب التجميلي (CSS Injection) - يخفي العناصر المزعجة بدلاً من مجرد منع تحميلها
const COSMETIC_FILTERS = `
   /* Global Ad Blocking CSS */
   .adsbygoogle, .fb-ad, .ad-container, .ad-banner, .banner-ad, 
   div[id^="google_ads"], div[id^="div-gpt-ad"], 
   iframe[src*="googleads"], iframe[src*="doubleclick"],
   [class*="sponsored"], [id*="sponsored"],
   [class*="advertisement"], [id*="advertisement"],
   [class*="promo-"], [id*="promo-"],
   div.OUTBRAIN, div.Taboola,
   .trc_rbox_div, .trc_related_container,
   
   /* Mobile Specific Clutter */
   .app-banner, .mobile-banner, .smart-banner,
   .cookie-banner, .gdpr-banner,
   .newsletter-popup, .subscribe-popup,
   
   /* Floating Ads and Sticky Footers */
   .sticky-footer-ad, .floating-ad, .bottom-ad-bar
   { display: none !important; visibility: hidden !important; height: 0 !important; width: 0 !important; overflow: hidden !important; }
`;

export function shouldBlockRequest(url: string, currentUrl?: string): { blocked: boolean; reason?: string } {
  if (!url) return { blocked: false };

  // السماح بالنطاق الرئيسي (First Party)
  if (currentUrl) {
    try {
      const currentHost = new URL(currentUrl).hostname;
      const requestHost = new URL(url).hostname;
      if (URL && currentHost === requestHost) return { blocked: false };
    } catch (e) { }
  }

  const lowerUrl = url.toLowerCase();

  // التحقق من القائمة البيضاء
  if (WHITELIST.some(domain => lowerUrl.includes(domain))) {
    // استثناء: إذا كان الرابط نفسه يحتوي على كلمات إعلانية واضحة حتى لو كان في وايت ليست
    if (!lowerUrl.includes("/ads/") && !lowerUrl.includes("doubleclick")) {
      return { blocked: false };
    }
  }

  // التحقق من أنماط الإعلانات
  const match = AD_PATTERNS.find(pattern => lowerUrl.includes(pattern));
  if (match) {
    return { blocked: true, reason: match };
  }

  return { blocked: false };
}

export function isWhitelisted(url: string): boolean {
  if (!url) return false;
  return WHITELIST.some(domain => url.toLowerCase().includes(domain));
}

// إنشاء سكريبت الحقن للـ WebView
export function createAdBlockScript(): string {
  return `
    (function() {
      // 1. Inject CSS Rules (Cosmetic Filtering)
      const style = document.createElement('style');
      style.innerHTML = \`${COSMETIC_FILTERS}\`;
      document.head.appendChild(style);

      // 2. DOM Watcher to remove dynamic ads
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) { // ELEMENT_NODE
               // Check for ad classes/ids
               const className = node.className && typeof node.className === 'string' ? node.className.toLowerCase() : '';
               const id = node.id ? node.id.toLowerCase() : '';
               
               if (className.includes('ads') || className.includes('banner') || 
                   id.includes('google_ads') || id.includes('banner')) {
                   if(node.style) {
                       node.style.display = 'none';
                       node.style.visibility = 'hidden';
                   }
                   // window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'adBlocked' }));
               }
            }
          });
        });
      });
      
      observer.observe(document.body, { childList: true, subtree: true });
      
      console.log("Nabd AdBlock Active 🛡️");
    })();
  `;
}
