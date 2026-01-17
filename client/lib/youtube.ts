export const YOUTUBE_SCRIPT = `
(function() {
    function enhanceYouTube() {
        // 1. محاولة إخفاء الإعلانات
        const styles = document.createElement('style');
        styles.innerHTML = \`
            .ad-container, .ad-div, .video-ads, .ytp-ad-module,
            ytm-promoted-sparkles-web-renderer,
            ytm-promoted-video-renderer,
            .ytp-ad-overlay-container,
            #player-ads,
            ytd-display-ad-renderer,
            ytd-statement-banner-renderer,
            ytd-in-feed-ad-layout-renderer,
            ytd-banner-promo-renderer-background,
            .ytp-ad-image-overlay
            { display: none !important; }
            
            /* إخفاء لافتة "افتح في التطبيق" */
            .open-in-app-message,
            .mobile-topbar-header-content.non-search-mode {
                display: none !important;
            }
        \`;
        document.head.appendChild(styles);

        // 2. النقر التلقائي على "تخطي الإعلان"
        setInterval(() => {
            const skipBtn = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .videoAdUiSkipButton');
            if (skipBtn) {
                skipBtn.click();
                console.log('Auto skipped ad');
            }
            
            // إغلاق الإعلانات المنبثقة فوق الفيديو
            const overlayCloseBtn = document.querySelector('.ytp-ad-overlay-close-button');
            if (overlayCloseBtn) {
                overlayCloseBtn.click();
            }
        }, 1000);
    }

    if (location.hostname.includes('youtube.com') || location.hostname.includes('youtu.be')) {
        // تنفيذ فور التحميل
        enhanceYouTube();
        // إعادة التنفيذ عند التنقل (لأن Youtube تطبيق صفحة واحدة SPA)
        window.addEventListener('yt-navigate-finish', enhanceYouTube);
    }
})();
`;
