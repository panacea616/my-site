// ===== ПРИНУДИТЕЛЬНАЯ ПРОКРУТКА В НАЧАЛО =====
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.addEventListener('DOMContentLoaded', () => {
  window.scrollTo(0, 0);
});

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function getHeaderHeight() {
  const header = document.querySelector('.header');
  return header ? header.offsetHeight : 80;
}

function easeInOutCubic(t, b, c, d) {
  t /= d / 2;
  if (t < 1) return c / 2 * t * t * t + b;
  t -= 2;
  return c / 2 * (t * t * t + 2) + b;
}

// ===== ПЛАВНАЯ ПРОКРУТКА =====
function smoothScrollToElement(elementId, callback) {
  const element = document.getElementById(elementId);
  if (!element) return;
  const headerHeight = getHeaderHeight();
  const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - headerHeight;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  const duration = 1000;
  if (Math.abs(distance) < 1) {
    if (callback) callback();
    return;
  }
  let startTime = null;
  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const elapsed = currentTime - startTime;
    const run = easeInOutCubic(elapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (elapsed < duration) {
      requestAnimationFrame(animation);
    } else {
      window.scrollTo(0, targetPosition);
      if (callback && typeof callback === 'function') callback();
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
  setTimeout(() => element.classList.remove('sweep-active'), 700);
}

function highlightSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) applySweepEffect(section);
}

function highlightAboutAndSkills() {
  const wrapper = document.getElementById('about-skills-wrapper');
  if (wrapper) applySweepEffect(wrapper);
}

// ===== ОБРАБОТЧИКИ НАВИГАЦИИ (делегирование) =====
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const href = link.getAttribute('href');
  if (href === '#') return;
  e.preventDefault();
  const targetId = href.substring(1);
  const callback = targetId === 'about' ? highlightAboutAndSkills : () => highlightSection(targetId);
  smoothScrollToElement(targetId, callback);
});

// Стрелка вниз
const scrollHint = document.getElementById('scrollHint');
if (scrollHint) {
  scrollHint.addEventListener('click', (e) => {
    e.preventDefault();
    smoothScrollToElement('about', highlightAboutAndSkills);
  });
}

// Автоскролл при первом движении колеса (с debounce)
let hasScrolled = false;
let scrollActive = false;
const wheelHandler = (e) => {
  if (hasScrolled || e.deltaY < 0) return;
  if (scrollActive) return;
  e.preventDefault();
  scrollActive = true;
  hasScrolled = true;
  smoothScrollToElement('about', () => { scrollActive = false; });
  setTimeout(() => { scrollActive = false; }, 1500);
};
window.addEventListener('wheel', wheelHandler, { passive: false });

// ===== АНИМАЦИЯ ПОЯВЛЕНИЯ =====
const fadeElements = document.querySelectorAll('.hero, .about, .skills, .projects, .contacts');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });
fadeElements.forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// ===== ДАННЫЕ ПРОЕКТОВ =====
const projectData = {
  'password-generator': {
    title: 'Генератор паролей',
    tech: ['HTML', 'CSS', 'JavaScript'],
    description: 'Интерактивный инструмент для создания надёжных паролей. Пользователь выбирает длину и набор символов — программа мгновенно генерирует случайный пароль. Проект демонстрирует работу с DOM, событиями и математическими функциями в JavaScript.',
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
  modalContent.innerHTML = `
    <h2 class="modal-project__title">${data.title}</h2>
    <div class="modal-project__tech">
      ${data.tech.map(t => `<span class="modal-project__tech-tag">${t}</span>`).join('')}
    </div>
    <p class="modal-project__description">${data.description}</p>
    <ul class="modal-project__features">
      ${data.features.map(f => `<li>${f}</li>`).join('')}
    </ul>
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
  initPasswordGenerator();
}

function closeProjectModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
  modalContent.innerHTML = ''; // очистка для освобождения памяти
}

// Инициализация генератора внутри модалки
function initPasswordGenerator() {
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
      password += chars[Math.floor(Math.random() * chars.length)];
    }
    passwordResult.textContent = password || 'Ошибка';
  }

  function copyPassword() {
    const text = passwordResult.textContent;
    if (!text || text === 'Нажмите кнопку') return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.classList.add('copied');
        copyBtn.textContent = '✅';
        setTimeout(() => {
          copyBtn.classList.remove('copied');
          copyBtn.textContent = '📋';
        }, 1500);
      }).catch(() => alert('Не удалось скопировать'));
    } else {
      // fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      copyBtn.classList.add('copied');
      copyBtn.textContent = '✅';
      setTimeout(() => {
        copyBtn.classList.remove('copied');
        copyBtn.textContent = '📋';
      }, 1500);
    }
  }

  generateBtn.addEventListener('click', generatePassword);
  copyBtn.addEventListener('click', copyPassword);
  generatePassword();
}

// Открытие по клику на карточку (кроме заглушек)
document.querySelectorAll('.project-card:not(.project-card--coming)').forEach(card => {
  card.addEventListener('click', () => {
    const projectId = card.dataset.project;
    if (projectId && projectData[projectId]) openProjectModal(projectId);
  });
});

// Закрытие модалки
modalClose.addEventListener('click', closeProjectModal);
document.querySelector('.project-modal__overlay').addEventListener('click', closeProjectModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('active')) closeProjectModal();
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
