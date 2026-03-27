(function() {
    var GA_ID = 'G-PXLJJHGL5J';

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

    function showBanner() {
        var t = translations[getLang()];

        var overlay = document.createElement('div');
        overlay.className = 'consent-overlay';

        var box = document.createElement('div');
        box.className = 'consent-box';
        box.innerHTML =
            '<p>' + t.text + '</p>' +
            '<div class="consent-buttons">' +
            '<button class="consent-btn consent-btn-accept" id="consent-accept">' + t.accept + '</button>' +
            '<button class="consent-btn consent-btn-decline" id="consent-decline">' + t.decline + '</button>' +
            '</div>';

        overlay.appendChild(box);
        document.body.appendChild(overlay);

        document.getElementById('consent-accept').addEventListener('click', function() {
            setConsent('accepted');
            overlay.remove();
            loadGA();
        });

        document.getElementById('consent-decline').addEventListener('click', function() {
            setConsent('declined');
            overlay.remove();
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
