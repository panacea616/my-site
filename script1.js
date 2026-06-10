// ===== ПРИНУДИТЕЛЬНАЯ ПРОКРУТКА В НАЧАЛО (hero) ПРИ ЗАГРУЗКЕ =====
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

window.addEventListener('DOMContentLoaded', () => {
    window.scrollTo(0, 0);
});

// ===== ПЛАВНАЯ ПРОКРУТКА =====
function getHeaderHeight() {
    const header = document.querySelector('.header');
    return header ? header.offsetHeight : 80;
}

function smoothScrollToElement(elementId, callback) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const headerHeight = getHeaderHeight();
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const targetPosition = elementPosition - headerHeight;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 1000;

    if (Math.abs(distance) < 1) {
        if (callback) callback();
        return;
    }

    let startTime = null;

    function easeInOutCubic(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t * t + b;
        t -= 2;
        return c / 2 * (t * t * t + 2) + b;
    }

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = easeInOutCubic(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        } else {
            window.scrollTo(0, targetPosition);
            if (callback && typeof callback === 'function') {
                callback();
            }
        }
    }

    requestAnimationFrame(animation);
}

// ===== ЭФФЕКТ ЛУЧА =====
function applySweepEffect(element) {
    if (!element) return;
    element.classList.remove('sweep-active');
    void element.offsetWidth;
    element.classList.add('sweep-active');
    setTimeout(() => {
        element.classList.remove('sweep-active');
    }, 700);
}

function highlightSectionWithSweep(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) applySweepEffect(section);
}

function highlightAboutAndSkills() {
    const wrapper = document.getElementById('about-skills-wrapper');
    if (wrapper) applySweepEffect(wrapper);
}

// ===== ОБРАБОТЧИКИ =====

// Стрелка вниз
const scrollHint = document.getElementById('scrollHint');
if (scrollHint) {
    scrollHint.addEventListener('click', (e) => {
        e.preventDefault();
        smoothScrollToElement('about', () => highlightAboutAndSkills());
    });
}

// Автоскролл при первом движении колеса (без подсветки)
let hasScrolled = false;
let scrollActive = false;

window.addEventListener('wheel', (e) => {
    if (hasScrolled || e.deltaY < 0) return;
    if (scrollActive) return;

    e.preventDefault();
    scrollActive = true;
    hasScrolled = true;
    // Прокрутка без подсветки
    smoothScrollToElement('about');

    setTimeout(() => {
        scrollActive = false;
    }, 1500);
}, { passive: false });

// Навигация в шапке
document.querySelectorAll('.nav_link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href === '#hero') {
            smoothScrollToElement('hero', () => highlightSectionWithSweep('hero'));
        } else if (href === '#about') {
            smoothScrollToElement('about', () => highlightAboutAndSkills());
        } else if (href === '#projects') {
            smoothScrollToElement('projects', () => highlightSectionWithSweep('projects'));
        } else if (href === '#contacts') {
            smoothScrollToElement('contacts', () => highlightSectionWithSweep('contacts'));
        }
    });
});

// Кнопка "Посмотреть работы"
const worksBtn = document.querySelector('.hero__buttons .btn--primary');
if (worksBtn) {
    worksBtn.addEventListener('click', (e) => {
        e.preventDefault();
        smoothScrollToElement('projects', () => highlightSectionWithSweep('projects'));
    });
}

// Кнопки "Связаться" и "Написать мне"
const contactBtns = document.querySelectorAll('.hero__buttons .btn--secondary, .contacts .btn--primary');
contactBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        smoothScrollToElement('contacts', () => highlightSectionWithSweep('contacts'));
    });
});

// Ссылки в футере
document.querySelectorAll('.footer__link').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.substring(1);
            if (targetId === 'about') {
                smoothScrollToElement(targetId, () => highlightAboutAndSkills());
            } else {
                smoothScrollToElement(targetId, () => highlightSectionWithSweep(targetId));
            }
        }
    });
});

// Анимация появления
const fadeElements = document.querySelectorAll('.hero, .about, .skills, .projects, .contacts');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.2 });

fadeElements.forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});

// Кнопка отправки письма
const emailBtn = document.querySelector('.contacts .btn--primary');
if (emailBtn) {
    emailBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const email = 'dieforthiss@gmail.com';
        const subject = 'Вопрос от посетителя сайта';
        const body = 'Здравствуйте, Тимур! Хочу задать вам вопрос...';
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
}