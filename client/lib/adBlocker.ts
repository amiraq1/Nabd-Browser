/**
 * Ad Blocker Module for Nabd Browser
 * حجب الإعلانات ونوافذ الكوكيز المزعجة
 */

// قائمة المجالات المحظورة (تم توسيعها)
const AD_DOMAINS: string[] = [
  // Google Ads
  "googlesyndication.com",
  "googleadservices.com",
  "doubleclick.net",
  "adservice.google.com",
  "ads.google.com",
  "pagead2.googlesyndication.com",

  // Major Ad Networks
  "adnxs.com",
  "adsrvr.org",
  "facebook.com/tr",
  "connect.facebook.net",
  "amazon-adsystem.com",
  "media.net",
  "outbrain.com",
  "taboola.com",
  "criteo.com",
  "advertising.com",
  "moatads.com",
  "pubmatic.com",
  "rubiconproject.com",
  "openx.net",
  "casalemedia.com",
  "indexww.com",

  // Additional Networks
  "33across.com",
  "sharethrough.com",
  "spotxchange.com",
  "teads.tv",
  "smartadserver.com",
  "adform.net",
  "bidswitch.net",
  "contextweb.com",
  "yieldmo.com",

  // Tracking & Analytics
  "quantserve.com",
  "scorecardresearch.com",
  "bluekai.com",
  "krxd.net",
  "exelator.com",
  "liveramp.com",
  "rlcdn.com",
  "demdex.net",
  "agkn.com",
  "adsymptotic.com",

  // Retargeting
  "adroll.com",
  "revcontent.com",
  "mgid.com",
  "content-ad.net",
  "zergnet.com",

  // Popup Networks
  "popads.net",
  "popcash.net",
  "propellerads.com",
  "adsterra.com",
  "exo-click.com",
];

// عناصر HTML التي يجب إخفاؤها (إعلانات + نوافذ الكوكيز المزعجة)
const AD_SELECTORS = [
  // إعلانات عامة
  '[id*="google_ads"]',
  '[id*="ad-container"]',
  '[id*="ad_container"]',
  '[id*="advert"]',
  '[class*="google-ad"]',
  '[class*="ad-banner"]',
  '[class*="ad-slot"]',
  '[class*="advertisement"]',
  '[class*="sponsored"]',
  '[class*="promoted"]',
  "[data-ad]",
  "[data-advertisement]",
  "ins.adsbygoogle",
  'iframe[src*="doubleclick"]',
  'iframe[src*="googlesyndication"]',
  ".ad-wrapper",
  ".advert-container",
  "#sidebar-ad",
  "#header-ad",
  "#footer-ad",
  '[aria-label*="advertisement"]',
  '[aria-label*="sponsored"]',

  // نوافذ الكوكيز والموافقة (GDPR/Cookie Banners)
  "#onetrust-banner-sdk",
  ".fc-consent-root",
  "#CybotCookiebotDialog",
  ".cookie-banner",
  "#cookie-banner",
  ".gdpr-banner",
  "#gdpr-banner",
  '[class*="cookie-consent"]',
  '[id*="cookie-consent"]',
  '[class*="cookie-notice"]',
  '[id*="cookie-notice"]',
  ".cc-banner",
  "#cc-main",
  '[class*="consent-banner"]',
  '[class*="privacy-banner"]',
];

// إحصائيات الحظر
interface BlockStats {
  totalBlocked: number;
  sessionBlocked: number;
  lastBlockedUrl: string | null;
  lastBlockedTime: number | null;
}

let blockStats: BlockStats = {
  totalBlocked: 0,
  sessionBlocked: 0,
  lastBlockedUrl: null,
  lastBlockedTime: null,
};

// قائمة المواقع المستثناة (القائمة البيضاء)
let whitelist: string[] = [];

// المستمعون للأحداث
type BlockEventListener = (stats: BlockStats, blockedUrl: string) => void;
const blockListeners: BlockEventListener[] = [];

/**
 * إنشاء السكريبت مع إرسال إحصائيات للتطبيق
 */
export function createAdBlockScript(): string {
  return `
(function() {
  'use strict';
  
  const adSelectors = ${JSON.stringify(AD_SELECTORS)};
  let blockedCount = 0;
  
  // 1. وظيفة إخفاء العناصر المزعجة
  function hideAds() {
    adSelectors.forEach(function(selector) {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(function(el) {
          if (!el.dataset.nabdBlocked) {
            el.dataset.nabdBlocked = 'true';
            blockedCount++;
            
            // إرسال إشعار للتطبيق
            window.ReactNativeWebView?.postMessage(JSON.stringify({
              type: 'adBlocked',
              selector: selector,
              count: blockedCount
            }));
            
            // نحذف العنصر تماماً
            if(el.parentNode) {
              el.parentNode.removeChild(el);
            } else {
              el.style.display = 'none !important';
              el.style.visibility = 'hidden !important';
              el.style.height = '0 !important';
              el.style.overflow = 'hidden !important';
            }
          }
        });
      } catch(e) {}
    });
  }
  
  // 2. منع النوافذ المنبثقة (Popup Blocker)
  const originalOpen = window.open;
  window.open = function(url, name, features) {
    // السماح للنوافذ التي يطلبها المستخدم فقط
    if (event && event.isTrusted) {
      return originalOpen.call(window, url, name, features);
    }
    blockedCount++;
    window.ReactNativeWebView?.postMessage(JSON.stringify({
      type: 'popupBlocked',
      url: url,
      count: blockedCount
    }));
    console.log('[Nabd] Blocked popup:', url);
    return null;
  };

  // 3. إزالة الـ overlay الذي يمنع التمرير
  function enableScrolling() {
    const body = document.body;
    const html = document.documentElement;
    
    if (body) {
      body.style.overflow = 'auto';
      body.style.position = 'static';
    }
    if (html) {
      html.style.overflow = 'auto';
      html.style.position = 'static';
    }
  }

  // تشغيل التنظيف عند التحميل
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      hideAds();
      enableScrolling();
    });
  } else {
    hideAds();
    enableScrolling();
  }
  
  // تشغيل التنظيف بشكل دوري لأن بعض المواقع تحمل الإعلانات لاحقاً
  const observer = new MutationObserver(function(mutations) {
    hideAds();
  });
  
  if (document.body || document.documentElement) {
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  }
  
  // تنظيف نهائي كل ثانية للتأكد
  setInterval(function() {
    hideAds();
    enableScrolling();
  }, 1000);
  
  console.log('[Nabd] Ad blocker activated');
})();
true;
`;
}

// للتوافق مع الكود القديم
export const AD_BLOCK_SCRIPT = createAdBlockScript();

/**
 * استخراج النطاق من URL
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * التحقق مما إذا كان الموقع في القائمة البيضاء
 */
export function isWhitelisted(url: string): boolean {
  const domain = extractDomain(url);
  return whitelist.some(
    (whitelistedDomain) =>
      domain === whitelistedDomain || domain.endsWith(`.${whitelistedDomain}`)
  );
}

/**
 * التحقق مما إذا كان يجب حظر الطلب
 */
export function shouldBlockRequest(
  url: string,
  pageUrl?: string
): { blocked: boolean; domain?: string } {
  try {
    // تجاوز الحظر للمواقع في القائمة البيضاء
    if (pageUrl && isWhitelisted(pageUrl)) {
      return { blocked: false };
    }

    const urlLower = url.toLowerCase();
    const blockedDomain = AD_DOMAINS.find((domain) =>
      urlLower.includes(domain)
    );

    if (blockedDomain) {
      // تحديث الإحصائيات
      blockStats.totalBlocked++;
      blockStats.sessionBlocked++;
      blockStats.lastBlockedUrl = url;
      blockStats.lastBlockedTime = Date.now();

      // إعلام المستمعين
      notifyListeners(url);

      return { blocked: true, domain: blockedDomain };
    }

    return { blocked: false };
  } catch {
    return { blocked: false };
  }
}

/**
 * إعلام المستمعين بحظر جديد
 */
function notifyListeners(blockedUrl: string) {
  blockListeners.forEach((listener) => {
    try {
      listener(blockStats, blockedUrl);
    } catch (e) {
      console.error("[AdBlocker] Listener error:", e);
    }
  });
}

/**
 * الاشتراك في أحداث الحظر
 */
export function onAdBlocked(listener: BlockEventListener): () => void {
  blockListeners.push(listener);
  // إرجاع دالة لإلغاء الاشتراك
  return () => {
    const index = blockListeners.indexOf(listener);
    if (index > -1) {
      blockListeners.splice(index, 1);
    }
  };
}

/**
 * الحصول على إحصائيات الحظر
 */
export function getBlockStats(): BlockStats {
  return { ...blockStats };
}

/**
 * إعادة تعيين إحصائيات الجلسة
 */
export function resetSessionStats(): void {
  blockStats.sessionBlocked = 0;
}

/**
 * تحميل الإحصائيات الإجمالية (من التخزين)
 */
export function loadStats(savedStats: Partial<BlockStats>): void {
  blockStats = { ...blockStats, ...savedStats };
}

/**
 * الحصول على قائمة النطاقات المحظورة
 */
export function getBlockedDomains(): string[] {
  return [...AD_DOMAINS];
}

/**
 * الحصول على محددات CSS للإعلانات
 */
export function getAdSelectors(): string[] {
  return [...AD_SELECTORS];
}

// ============ إدارة القائمة البيضاء ============

/**
 * الحصول على القائمة البيضاء
 */
export function getWhitelist(): string[] {
  return [...whitelist];
}

/**
 * تعيين القائمة البيضاء (عند التحميل من التخزين)
 */
export function setWhitelist(domains: string[]): void {
  whitelist = domains.map((d) => d.toLowerCase().replace(/^www\./, ""));
}

/**
 * إضافة موقع للقائمة البيضاء
 */
export function addToWhitelist(domain: string): boolean {
  const cleanDomain = domain.toLowerCase().replace(/^www\./, "");
  if (!whitelist.includes(cleanDomain)) {
    whitelist.push(cleanDomain);
    return true;
  }
  return false;
}

/**
 * إزالة موقع من القائمة البيضاء
 */
export function removeFromWhitelist(domain: string): boolean {
  const cleanDomain = domain.toLowerCase().replace(/^www\./, "");
  const index = whitelist.indexOf(cleanDomain);
  if (index > -1) {
    whitelist.splice(index, 1);
    return true;
  }
  return false;
}

/**
 * التحقق من وجود موقع في القائمة البيضاء
 */
export function isInWhitelist(domain: string): boolean {
  const cleanDomain = domain.toLowerCase().replace(/^www\./, "");
  return whitelist.includes(cleanDomain);
}

/**
 * مسح القائمة البيضاء
 */
export function clearWhitelist(): void {
  whitelist = [];
}

// ============ إدارة النطاقات المحظورة ============

/**
 * إضافة نطاق جديد للحظر
 */
export function addBlockedDomain(domain: string): boolean {
  const cleanDomain = domain.toLowerCase();
  if (!AD_DOMAINS.includes(cleanDomain)) {
    AD_DOMAINS.push(cleanDomain);
    return true;
  }
  return false;
}

/**
 * إزالة نطاق من الحظر
 */
export function removeBlockedDomain(domain: string): boolean {
  const cleanDomain = domain.toLowerCase();
  const index = AD_DOMAINS.indexOf(cleanDomain);
  if (index > -1) {
    AD_DOMAINS.splice(index, 1);
    return true;
  }
  return false;
}
