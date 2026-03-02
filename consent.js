(function() {
    var GA_ID = 'G-PXLJJHGL5J';

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
        var banner = document.createElement('div');
        banner.className = 'consent-banner';
        banner.innerHTML =
            '<p>Accepter les cookies \uD83C\uDF6A ?</p>' +
            '<div class="consent-buttons">' +
            '<button class="consent-btn consent-btn-accept" id="consent-accept">Accepter</button>' +
            '<button class="consent-btn consent-btn-decline" id="consent-decline">Refuser</button>' +
            '</div>';
        document.body.appendChild(banner);

        document.getElementById('consent-accept').addEventListener('click', function() {
            localStorage.setItem('cookie_consent', 'accepted');
            banner.remove();
            loadGA();
        });

        document.getElementById('consent-decline').addEventListener('click', function() {
            localStorage.setItem('cookie_consent', 'declined');
            banner.remove();
        });
    }

    var consent = localStorage.getItem('cookie_consent');
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
