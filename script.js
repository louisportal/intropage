// Toggle collapsible sections
function toggleSection(header) {
    const content = header.nextElementSibling;
    const icon = header.querySelector('.toggle-icon');

    content.classList.toggle('open');
    icon.classList.toggle('open');
}

// Toggle year sub-sections in timeline
function toggleYear(header) {
    const content = header.nextElementSibling;
    const icon = header.querySelector('.year-toggle');
    content.classList.toggle('open');
    icon.classList.toggle('open');
}

// Load shared HTML fragments (data-include="filename.html")
document.addEventListener('DOMContentLoaded', function() {
    // Load HTML includes
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

        // Close menu and handle nav links (anchor scroll or page navigation)
        document.querySelectorAll('.nav-link').forEach(function(link) {
            link.addEventListener('click', function(e) {
                navMenu.classList.remove('open');

                var href = this.getAttribute('href');

                // Only handle anchor links with smooth scroll
                if (href.startsWith('#')) {
                    e.preventDefault();
                    var targetId = href.substring(1);
                    var targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        // Open the section if it's collapsed
                        var sectionContent = targetElement.querySelector('.section-content');
                        var toggleIcon = targetElement.querySelector('.toggle-icon');
                        if (sectionContent && !sectionContent.classList.contains('open')) {
                            sectionContent.classList.add('open');
                            if (toggleIcon) toggleIcon.classList.add('open');
                        }

                        // Smooth scroll to the section
                        var header = document.querySelector('.header');
                        var headerHeight = header ? header.offsetHeight : 0;
                        var targetPosition = targetElement.offsetTop - headerHeight - 20;
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
                // For page links (e.g. liens-utiles.html), let browser navigate normally
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

    // Countdown to registration deadline (April 24, 2026)
    var deadline = new Date('2026-04-24T23:59:59+02:00');
    var now = new Date();
    var diff = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    var pastDeadline = diff <= 0;

    var countdownEl = document.getElementById('countdownDays');
    var bannerEl = document.getElementById('countdownBanner');
    if (countdownEl && bannerEl) {
        if (!pastDeadline) {
            countdownEl.textContent = diff;
        } else {
            bannerEl.style.display = 'none';
        }
    }

    // WhatsApp share button
    var whatsappLink = document.getElementById('whatsappShare');
    if (whatsappLink) {
        var shareUrl = window.location.href;
        whatsappLink.href = 'https://wa.me/?text=' + encodeURIComponent(shareUrl);
    }

    // Bio popup handler (delegated event listener)
    document.addEventListener('click', function(e) {
        const member = e.target.closest('.team-member');
        if (!member) return;

        const bioPopup = document.getElementById('bioPopup');
        if (!bioPopup) return;

        const bioPhoto = document.getElementById('bioPhoto');
        const bioName = document.getElementById('bioName');
        const bioBio = document.getElementById('bioBio');
        const bioLinkedin = document.getElementById('bioLinkedin');
        const bioElu = document.getElementById('bioElu');

        if (bioPhoto) bioPhoto.src = member.getAttribute('data-photo') || '';
        if (bioName) bioName.textContent = member.getAttribute('data-name') || '';
        if (bioBio) bioBio.textContent = member.getAttribute('data-bio') || '';

        const linkedin = member.getAttribute('data-linkedin');
        if (bioLinkedin) {
            bioLinkedin.style.display = linkedin ? 'inline-flex' : 'none';
            if (linkedin) bioLinkedin.href = linkedin;
        }

        const elu = member.getAttribute('data-elu');
        if (bioElu) {
            bioElu.style.display = elu ? 'inline-flex' : 'none';
            if (elu) bioElu.href = elu;
        }

        bioPopup.style.display = 'flex';
    });

    // Bio popup close functionality
    const bioPopup = document.getElementById('bioPopup');
    if (bioPopup) {
        // Close button
        const bioCloseBtn = bioPopup.querySelector('.bio-popup-close');
        if (bioCloseBtn) {
            bioCloseBtn.addEventListener('click', function() {
                bioPopup.style.display = 'none';
            });
        }

        // Close when clicking overlay
        bioPopup.addEventListener('click', function(e) {
            if (e.target === bioPopup) {
                bioPopup.style.display = 'none';
            }
        });
    }

    // Lightbox functionality
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    if (lightbox && lightboxImg) {
        // Close lightbox when clicking anywhere
        lightbox.addEventListener('click', function() {
            lightbox.style.display = 'none';
        });

        // Open lightbox when clicking grid photos (bento box)
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('grid-photo')) {
                lightboxImg.src = e.target.getAttribute('data-full') || e.target.src;
                lightbox.style.display = 'flex';
            }
        });
    }

    // Header scroll behavior for mobile
    const header = document.querySelector('.header');
    if (header) {
        let lastScrollTop = 0;
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            // Add scrolled class when scrolled down more than 50px
            if (scrollTop > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            lastScrollTop = scrollTop;
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
