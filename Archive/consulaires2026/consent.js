(function() {
    var GA_ID = 'G-DMMQMXXW6G';

    var translations = {
        fr: { text: 'Accepter les cookies \uD83C\uDF6A ?', accept: 'Accepter', decline: 'Refuser' },
        en: { text: 'Accept cookies \uD83C\uDF6A?', accept: 'Accept', decline: 'Decline' },
        de: { text: 'Cookies akzeptieren \uD83C\uDF6A?', accept: 'Akzeptieren', decline: 'Ablehnen' },
        it: { text: 'Accettare i cookie \uD83C\uDF6A?', accept: 'Accetta', decline: 'Rifiuta' }
    };

    function getLang() {
        var lang = document.documentElement.lang || '';
        lang = lang.toLowerCase().substring(0, 2);
        return translations[lang] ? lang : 'fr';
    }

    function setConsent(value) {
        var d = new Date();
        d.setFullYear(d.getFullYear() + 1);
        document.cookie = 'cookie_consent=' + value + ';path=/;expires=' + d.toUTCString() + ';SameSite=Lax';
        try { localStorage.setItem('cookie_consent', value); } catch(e) {}
    }

    function getConsent() {
        var match = document.cookie.match(/(^|;\s*)cookie_consent=([^;]*)/);
        if (match) return match[2];
        try { return localStorage.getItem('cookie_consent'); } catch(e) {}
        return null;
    }

    function loadGA() {
        var script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', GA_ID);
    }

    function dismissBanner(banner) {
        banner.style.animation = 'consentSlideDown 0.3s ease forwards';
        banner.addEventListener('animationend', function() { banner.remove(); });
    }

    function showBanner() {
        var t = translations[getLang()];

        var banner = document.createElement('div');
        banner.className = 'consent-banner';
        banner.innerHTML =
            '<p class="consent-text">' + t.text + '</p>' +
            '<div class="consent-buttons">' +
            '<button class="consent-btn consent-btn-accept" id="consent-accept">' + t.accept + '</button>' +
            '<button class="consent-btn consent-btn-decline" id="consent-decline">' + t.decline + '</button>' +
            '</div>';

        document.body.appendChild(banner);

        document.getElementById('consent-accept').addEventListener('click', function() {
            setConsent('accepted');
            dismissBanner(banner);
            loadGA();
        });

        document.getElementById('consent-decline').addEventListener('click', function() {
            setConsent('declined');
            dismissBanner(banner);
        });
    }

    var consent = getConsent();
    if (consent === 'accepted') {
        loadGA();
    } else if (!consent) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', showBanner);
        } else {
            showBanner();
        }
    }
})();
