(function() {
    var HASH = '39896748ed246bc1c65f7c18126617057741e167b1512eeffaf4f06ce63b824e';
    var TOKEN_KEY = '__site_auth';

    if (sessionStorage.getItem(TOKEN_KEY) === HASH) return;

    // Determine path to login.html relative to current page
    var depth = (location.pathname.match(/\//g) || []).length - 1;
    var isSubdir = location.pathname.split('/').filter(Boolean).length > 1
        && !location.pathname.endsWith('/');
    var pathParts = location.pathname.replace(/\/[^/]*$/, '').split('/').filter(Boolean);

    // Check if we're in a subdirectory (fr/, en/, de/, it/)
    var prefix = '';
    var page = location.pathname.split('/').filter(Boolean);
    // If the HTML file is inside a folder like /fr/, /en/, etc.
    if (page.length >= 2) {
        prefix = '../';
    }

    window.location.replace(prefix + 'login.html');
})();
