(function() {
    var HASH = '39896748ed246bc1c65f7c18126617057741e167b1512eeffaf4f06ce63b824e';
    var TOKEN_KEY = '__site_auth';

    if (sessionStorage.getItem(TOKEN_KEY) === HASH) return;

    // Build the path to login.html relative to current page
    // Works on both GitHub Pages (/intropage/fr/page.html) and custom domains (/fr/page.html)
    var pathParts = location.pathname.split('/').filter(Boolean);
    var fileName = pathParts[pathParts.length - 1] || '';
    var knownSubdirs = ['fr', 'en', 'de', 'it'];

    // Check if the file is inside a language subdirectory
    var inSubdir = pathParts.some(function(part) {
        return knownSubdirs.indexOf(part) !== -1;
    });

    var prefix = inSubdir ? '../' : '';
    window.location.replace(prefix + 'login.html');
})();
