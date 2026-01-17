/**
 * Ad Blocker Module for Nabd Browser
 * حجب الإعلانات ونوافذ الكوكيز المزعجة
 */

// قائمة المجالات المحظورة (تم توسيعها)
const AD_DOMAINS = [
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

// السكريبت الذي سيتم حقنه داخل الصفحة
export const AD_BLOCK_SCRIPT = `
(function() {
  'use strict';
  
  const adSelectors = ${JSON.stringify(AD_SELECTORS)};
  
  // 1. وظيفة إخفاء العناصر المزعجة
  function hideAds() {
    adSelectors.forEach(function(selector) {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(function(el) {
          // نحذف العنصر تماماً بدلاً من إخفائه فقط لضمان عدم تأثيره على التنسيق
          if(el.parentNode) {
            el.parentNode.removeChild(el);
          } else {
            el.style.display = 'none !important';
            el.style.visibility = 'hidden !important';
            el.style.height = '0 !important';
            el.style.overflow = 'hidden !important';
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

/**
 * التحقق مما إذا كان يجب حظر الطلب
 */
export function shouldBlockRequest(url: string): boolean {
  try {
    const urlLower = url.toLowerCase();
    // التحقق من الدومين
    return AD_DOMAINS.some((domain) => urlLower.includes(domain));
  } catch {
    return false;
  }
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

/**
 * إضافة نطاق جديد للحظر
 */
export function addBlockedDomain(domain: string): void {
  if (!AD_DOMAINS.includes(domain.toLowerCase())) {
    AD_DOMAINS.push(domain.toLowerCase());
  }
}

/**
 * إزالة نطاق من الحظر
 */
export function removeBlockedDomain(domain: string): boolean {
  const index = AD_DOMAINS.indexOf(domain.toLowerCase());
  if (index > -1) {
    AD_DOMAINS.splice(index, 1);
    return true;
  }
  return false;
}
