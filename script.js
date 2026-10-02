// Toggle year photo sections
function toggleYearPhotos(badge) {
    var photos = badge.nextElementSibling;
    if (photos && photos.classList.contains('year-photos')) {
        photos.classList.toggle('open');
        badge.classList.toggle('open');
    }
}

// Floating "back to year" button on photo timelines (Activité pages)
(function() {
    function init() {
        var sections = document.querySelectorAll('.year-section');
        if (!sections.length) return;

        var btn = document.createElement('button');
        btn.className = 'year-back-btn';
        btn.type = 'button';
        document.body.appendChild(btn);
        var target = null;

        function headerOffset() {
            var h = document.querySelector('.header');
            return h ? h.offsetHeight : 0;
        }

        function update() {
            var top = headerOffset();
            var mid = window.innerHeight / 2;
            target = null;
            sections.forEach(function(sec) {
                var badge = sec.querySelector('.year-badge');
                if (!badge || !badge.classList.contains('open')) return;
                var r = sec.getBoundingClientRect();
                // Viewport middle is inside this open year, and its heading is out of view
                if (r.top < mid && r.bottom > mid && badge.getBoundingClientRect().bottom < top) {
                    target = badge;
                }
            });
            if (target) {
                btn.innerHTML = '&uarr; ' + target.querySelector('span').textContent;
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        }

        btn.addEventListener('click', function() {
            if (!target) return;
            var y = target.getBoundingClientRect().top + window.pageYOffset - headerOffset() - 12;
            window.scrollTo({ top: y, behavior: 'smooth' });
        });

        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        document.addEventListener('click', function(e) {
            if (e.target.closest('.year-badge')) setTimeout(update, 50);
        });
        update();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();

// Toggle links directory categories (Liens Utiles)
function toggleLinksCategory(header) {
    const wasOpen = header.classList.contains('open');
    // Close every category, then reopen the clicked one if it was closed
    document.querySelectorAll('.links-category-header.open').forEach(function(h) {
        h.classList.remove('open');
        h.nextElementSibling.classList.remove('open');
        h.querySelector('.links-category-toggle').classList.remove('open');
    });
    if (!wasOpen) {
        header.classList.add('open');
        header.nextElementSibling.classList.add('open');
        header.querySelector('.links-category-toggle').classList.add('open');
    }
}

// Toggle collapsible sections
function toggleSection(header) {
    const content = header.nextElementSibling;
    const icon = header.querySelector('.toggle-icon');

    content.classList.toggle('open');
    icon.classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', function() {
    // Show the number of links on each Useful Links category
    document.querySelectorAll('.links-category').forEach(function(cat) {
        var count = cat.querySelector('.links-category-count');
        if (count) count.textContent = cat.querySelectorAll('.link-block').length;
    });

    // Load shared HTML fragments (data-include="filename.html")
    document.querySelectorAll('[data-include]').forEach(function(el) {
        var file = el.getAttribute('data-include');
        fetch(file)
            .then(function(response) { return response.text(); })
            .then(function(html) {
                el.innerHTML = html;
            })
            .catch(function(err) {
                console.warn('Could not load ' + file, err);
            });
    });

    // Hamburger menu functionality
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');

    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            // Close language menu if open
            var langMenu = document.querySelector('.lang-switcher-menu');
            if (langMenu) langMenu.classList.remove('open');
            navMenu.classList.toggle('open');
        });

        // Close menu via close button
        var closeBtn = document.querySelector('.nav-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                navMenu.classList.remove('open');
            });
        }

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.nav-menu') && !e.target.closest('#hamburgerBtn')) {
                navMenu.classList.remove('open');
            }
        });

        // Close menu when a link is clicked
        document.querySelectorAll('.nav-link').forEach(function(link) {
            link.addEventListener('click', function() {
                navMenu.classList.remove('open');
            });
        });
    }

    // Language switcher functionality
    const langToggle = document.querySelector('.lang-switcher-toggle');
    const langMenu = document.querySelector('.lang-switcher-menu');

    if (langToggle && langMenu) {
        langToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            // Close hamburger menu if open
            var navMenuEl = document.getElementById('navMenu');
            if (navMenuEl) navMenuEl.classList.remove('open');
            langMenu.classList.toggle('open');
        });

        // Close language dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.lang-switcher')) {
                langMenu.classList.remove('open');
            }
        });
    }

    // WhatsApp share button
    var whatsappLink = document.getElementById('whatsappShare');
    if (whatsappLink) {
        var shareUrl = window.location.href;
        whatsappLink.href = 'https://wa.me/?text=' + encodeURIComponent(shareUrl);
    }

    // Header scroll behavior for mobile
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (scrollTop > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
});

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.priority-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
});
