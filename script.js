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
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Close language dropdown when clicking outside
document.addEventListener('click', function(e) {
    var menu = document.querySelector('.lang-switcher-menu');
    if (menu && !e.target.closest('.lang-switcher')) {
        menu.classList.remove('open');
    }
});

// Candidate carousel
function initCarousel() {
    var track = document.querySelector('.carousel-track');
    if (!track) return;
    var slides = track.querySelectorAll('.carousel-slide');
    var dots = document.querySelectorAll('.carousel-dot');
    var currentIndex = 0;

    function goToSlide(index) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        currentIndex = index;
        track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
        dots.forEach(function(dot, i) {
            dot.classList.toggle('active', i === currentIndex);
        });
    }

    document.querySelector('.carousel-btn-prev').addEventListener('click', function() {
        goToSlide(currentIndex - 1);
    });
    document.querySelector('.carousel-btn-next').addEventListener('click', function() {
        goToSlide(currentIndex + 1);
    });
    dots.forEach(function(dot, i) {
        dot.addEventListener('click', function() { goToSlide(i); });
    });
}

document.addEventListener('DOMContentLoaded', initCarousel);

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

document.querySelectorAll('.info-card, .stat-box, .priority-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
});
