const AD_DOMAINS = [
  "googlesyndication.com",
  "googleadservices.com",
  "doubleclick.net",
  "adservice.google.com",
  "ads.google.com",
  "pagead2.googlesyndication.com",
  "adnxs.com",
  "adsrvr.org",
  "facebook.com/tr",
  "connect.facebook.net/en_US/fbevents",
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
  "33across.com",
  "sharethrough.com",
  "spotxchange.com",
  "teads.tv",
  "smartadserver.com",
  "adform.net",
  "bidswitch.net",
  "contextweb.com",
  "yieldmo.com",
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
  "adroll.com",
  "revcontent.com",
  "mgid.com",
  "content-ad.net",
  "zergnet.com",
];

const AD_SELECTORS = [
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
  '[data-ad]',
  '[data-advertisement]',
  'ins.adsbygoogle',
  'iframe[src*="doubleclick"]',
  'iframe[src*="googlesyndication"]',
  '.ad-wrapper',
  '.advert-container',
  '#sidebar-ad',
  '#header-ad',
  '#footer-ad',
  '[aria-label*="advertisement"]',
  '[aria-label*="sponsored"]',
];

export const AD_BLOCK_SCRIPT = `
(function() {
  'use strict';
  
  const adSelectors = ${JSON.stringify(AD_SELECTORS)};
  
  function hideAds() {
    adSelectors.forEach(function(selector) {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(function(el) {
          el.style.display = 'none';
          el.style.visibility = 'hidden';
          el.style.height = '0';
          el.style.overflow = 'hidden';
        });
      } catch(e) {}
    });
  }
  
  hideAds();
  
  const observer = new MutationObserver(function(mutations) {
    hideAds();
  });
  
  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true
  });
  
  setInterval(hideAds, 2000);
})();
true;
`;

export function shouldBlockRequest(url: string): boolean {
  try {
    const urlLower = url.toLowerCase();
    return AD_DOMAINS.some((domain) => urlLower.includes(domain));
  } catch {
    return false;
  }
}

export function getBlockedDomains(): string[] {
  return AD_DOMAINS;
}
