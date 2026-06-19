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

// ===== ОБРАБОТЧИКИ НАВИГАЦИИ =====

// Стрелка вниз
const scrollHint = document.getElementById('scrollHint');
if (scrollHint) {
  scrollHint.addEventListener('click', (e) => {
    e.preventDefault();
    smoothScrollToElement('about', () => highlightAboutAndSkills());
  });
}

// Автоскролл при первом движении колеса
let hasScrolled = false;
let scrollActive = false;

window.addEventListener('wheel', (e) => {
  if (hasScrolled || e.deltaY < 0) return;
  if (scrollActive) return;

  e.preventDefault();
  scrollActive = true;
  hasScrolled = true;
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

// ===== ДАННЫЕ ПРОЕКТОВ =====
const projectData = {
  'password-generator': {
    emoji: '🔐', // оставлен для карточки, но в модалке не выводится
    title: 'Генератор паролей',
    tech: ['HTML', 'CSS', 'JavaScript'],
    description: 'Интерактивный инструмент для создания надёжных паролей. Пользователь выбирает длину пароля и набор символов — программа мгновенно генерирует случайный пароль. Проект демонстрирует работу с DOM, событиями и математическими функциями в JavaScript.',
    features: [
      'Регулируемая длина пароля (от 4 до 32 символов)',
      'Опция использования спецсимволов (!@#$%^&*)',
      'Мгновенная генерация по нажатию кнопки',
      'Копирование пароля в буфер обмена одним кликом',
      'Адаптивный и минималистичный интерфейс'
    ]
  }
};

// ===== МОДАЛЬНОЕ ОКНО =====
const modal = document.getElementById('projectModal');
const modalContent = document.getElementById('modalContent');
const modalClose = document.getElementById('modalClose');

function openProjectModal(projectId) {
  const data = projectData[projectId];
  if (!data) return;

  // Формируем HTML без эмодзи (убрали <span class="modal-project__emoji">)
  modalContent.innerHTML = `
    <h2 class="modal-project__title">${data.title}</h2>
    <div class="modal-project__tech">
      ${data.tech.map(t => `<span class="modal-project__tech-tag">${t}</span>`).join('')}
    </div>
    <p class="modal-project__description">${data.description}</p>
    <ul class="modal-project__features">
      ${data.features.map(f => `<li>${f}</li>`).join('')}
    </ul>

    <!-- ГЕНЕРАТОР ПАРОЛЕЙ -->
    <div class="password-generator">
      <div class="password-generator__controls">
        <label class="password-generator__label">
          Длина:
          <input type="number" id="passLength" class="password-generator__input" value="12" min="4" max="32">
        </label>
        <label class="password-generator__label">
          <input type="checkbox" id="useSymbols" class="password-generator__checkbox" checked>
          Спецсимволы (!@#$%^&*)
        </label>
        <button id="generateBtn" class="password-generator__btn">Сгенерировать</button>
      </div>
      <div class="password-generator__result-wrapper">
        <div id="passwordResult" class="password-generator__result">Нажмите кнопку</div>
        <button id="copyBtn" class="password-generator__copy" title="Копировать в буфер">📋</button>
      </div>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // === НАСТРАИВАЕМ ГЕНЕРАТОР ПОСЛЕ ВСТАВКИ HTML ===
  const passLength = document.getElementById('passLength');
  const useSymbols = document.getElementById('useSymbols');
  const generateBtn = document.getElementById('generateBtn');
  const passwordResult = document.getElementById('passwordResult');
  const copyBtn = document.getElementById('copyBtn');

  function generatePassword() {
    const len = parseInt(passLength.value) || 12;
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let chars = letters;
    if (useSymbols.checked) chars += symbols;

    let password = '';
    for (let i = 0; i < len; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      password += chars[randomIndex];
    }
    passwordResult.textContent = password || 'Ошибка';
  }

  function copyPassword() {
    const text = passwordResult.textContent;
    if (!text || text === 'Нажмите кнопку') return;
    navigator.clipboard.writeText(text).then(() => {
      copyBtn.classList.add('copied');
      copyBtn.textContent = '✅';
      setTimeout(() => {
        copyBtn.classList.remove('copied');
        copyBtn.textContent = '📋';
      }, 1500);
    }).catch(() => {
      alert('Не удалось скопировать');
    });
  }

  generateBtn.addEventListener('click', generatePassword);
  copyBtn.addEventListener('click', copyPassword);

  // Генерируем сразу при открытии
  generatePassword();
}

function closeProjectModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// Клик по карточкам (только не по "скоро появится")
document.querySelectorAll('.project-card:not(.project-card--coming)').forEach(card => {
  card.addEventListener('click', () => {
    const projectId = card.dataset.project;
    openProjectModal(projectId);
  });
});

// Закрытие модалки
modalClose.addEventListener('click', closeProjectModal);
document.querySelector('.project-modal__overlay').addEventListener('click', closeProjectModal);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('active')) {
    closeProjectModal();
  }
});

// ===== КНОПКА ОТПРАВКИ ПИСЬМА =====
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
