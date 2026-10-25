// Навигация по разделам работает через обычные ссылки-якоря браузера.
// Это убирает постоянные обработчики колеса мыши и собственный цикл requestAnimationFrame.

// Добавь сюда публичный URL конвертера после его публикации.
// Пока ссылка не указана, кнопка в модальном окне покажет подсказку и не ведёт на несуществующую страницу.
const PANACEA_APP_URL = 'https://panaceagif.netlify.app/';
const PANACEA_REPO_URL = 'https://github.com/panacea616/panacea616gif';

const projectData = {
  'panacea-gif': {
    type: 'showcase',
    title: 'panacea.gif',
    tech: ['HTML', 'CSS', 'JavaScript', 'FFmpeg.wasm'],
    description: 'Иногда нужен не весь ролик, а всего несколько секунд. panacea.gif превращает выбранный фрагмент видео в GIF и даёт контролировать качество и итоговый размер — вручную или автоматически под заданный лимит.',
    demo: './img/panacea-demo.gif',
    appUrl: PANACEA_APP_URL,
    repoUrl: PANACEA_REPO_URL
  }
};

// ===== МОДАЛЬНОЕ ОКНО =====
const modal = document.getElementById('projectModal');
const modalContent = document.getElementById('modalContent');
const modalClose = document.getElementById('modalClose');
let modalCloseTimer = null;

function openProjectModal(projectId) {
  const data = projectData[projectId];
  if (!data) return;
  if (modalCloseTimer) { window.clearTimeout(modalCloseTimer); modalCloseTimer = null; }
  modal.classList.remove('is-closing');

  modal.classList.add('project-modal--panacea', 'active');
  modalContent.innerHTML = renderPanaceaModal(data);
  document.body.style.overflow = 'hidden';
  initPanaceaModal(data);
}

function renderPanaceaModal(data) {
  return `
    <div class="panacea-modal">
      <div class="panacea-modal__visual">
        <div class="panacea-modal__visual-top">
          <span>PRODUCT PREVIEW</span>
          <span>01 / DEMO</span>
        </div>
        <div class="panacea-modal__gif-frame">
          <img src="${data.demo}" alt="Демонстрация работы приложения panacea.gif" class="panacea-modal__gif" loading="eager" />
        </div>
        <div class="panacea-modal__visual-footer">
          <span class="panacea-modal__status-dot"></span>
          <span>Поймай момент. Зацикли его.</span>
        </div>
      </div>

      <div class="panacea-modal__details">
        <p class="panacea-modal__eyebrow">PERSONAL PROJECT <span>·</span> 2026</p>
        <h2 class="modal-project__title panacea-modal__title">${data.title}</h2>
        <p class="panacea-modal__tagline">Поймай момент.<br />Зацикли его.</p>
        <p class="modal-project__description panacea-modal__description">${data.description}</p>

        <div class="panacea-modal__features">
          <div class="panacea-modal__feature">
            <span class="panacea-modal__feature-index">01</span>
            <div><h3>Точный фрагмент</h3><p>Оставь только нужные секунды видео.</p></div>
          </div>
          <div class="panacea-modal__feature">
            <span class="panacea-modal__feature-index">02</span>
            <div><h3>Качество под контролем</h3><p>Выбирай баланс между деталями и весом файла.</p></div>
          </div>
          <div class="panacea-modal__feature">
            <span class="panacea-modal__feature-index">03</span>
            <div><h3>Размер по задаче</h3><p>Задай лимит — приложение подберёт параметры GIF.</p></div>
          </div>
        </div>

        <div class="modal-project__tech panacea-modal__tech">
          ${data.tech.map(t => `<span class="modal-project__tech-tag">${t}</span>`).join('')}
        </div>

        <div class="panacea-modal__actions">
          <a href="#" class="panacea-modal__button" data-panacea-app-link aria-disabled="true">
            <span>Открыть приложение</span><span aria-hidden="true">↗</span>
          </a>
          <a href="#" class="panacea-modal__button panacea-modal__button--secondary" data-panacea-repo-link aria-disabled="true">
            <span>Исходный код</span><span aria-hidden="true">↗</span>
          </a>
        </div>
        <p class="panacea-modal__link-note" data-panacea-link-note hidden></p>
      </div>
    </div>
  `;
}

function initPanaceaModal(data) {
  const note = modalContent.querySelector('[data-panacea-link-note]');
  const links = [
    { selector: '[data-panacea-app-link]', url: data.appUrl, label: 'приложение' },
    { selector: '[data-panacea-repo-link]', url: data.repoUrl, label: 'исходный код' }
  ];

  let allLinksReady = true;
  links.forEach(({ selector, url, label }) => {
    const link = modalContent.querySelector(selector);
    if (!link) return;
    const safeUrl = (url || '').trim();
    if (safeUrl && /^https?:\/\//i.test(safeUrl)) {
      link.href = safeUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.removeAttribute('aria-disabled');
      link.classList.remove('is-disabled');
    } else {
      allLinksReady = false;
      link.href = '#';
      link.setAttribute('aria-disabled', 'true');
      link.classList.add('is-disabled');
      link.addEventListener('click', (event) => {
        event.preventDefault();
        if (note) {
          note.textContent = `Ссылка на ${label} пока не настроена.`;
          note.hidden = false;
          note.classList.add('is-visible');
        }
      });
    }
  });

  if (note) note.hidden = allLinksReady;
}

function closeProjectModal() {
  if (!modal.classList.contains('active') || modal.classList.contains('is-closing')) return;
  modal.classList.add('is-closing');
  // Оставляем окно в DOM на время короткой exit-анимации, затем освобождаем GIF из памяти.
  modalCloseTimer = window.setTimeout(() => {
    modal.classList.remove('active', 'project-modal--panacea', 'is-closing');
    document.body.style.overflow = '';
    modalContent.innerHTML = '';
    modalCloseTimer = null;
  }, 190);
}

// Открытие карточки проекта мышью или клавиатурой
document.querySelectorAll('.project-card:not(.project-card--coming)').forEach(card => {
  const openCard = () => {
    const projectId = card.dataset.project;
    if (projectId && projectData[projectId]) openProjectModal(projectId);
  };
  card.addEventListener('click', openCard);
  card.addEventListener('keydown', (event) => {
    if (event.target !== card) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openCard();
    }
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

// ===== ЛЁГКОЕ ПОЯВЛЕНИЕ СЕКЦИЙ ПРИ ПРОКРУТКЕ =====
// Анимируем только при первом входе в область видимости; элементы затем остаются видимыми.
(function initScrollReveals() {
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion || !('IntersectionObserver' in window)) return;

  const selectors = [
    '.about .section__title',
    '.about_text',
    '.skills .section__title',
    '.skills__card',
    '.projects .section__title',
    '.project-card',
    '.contacts__container',
    '.footer__container'
  ];
  const targets = [...document.querySelectorAll(selectors.join(','))];
  if (!targets.length) return;

  document.body.classList.add('motion-enabled');
  const siblingIndexes = new Map();
  targets.forEach((element) => {
    element.classList.add('js-reveal');
    const parent = element.parentElement;
    const index = siblingIndexes.get(parent) || 0;
    siblingIndexes.set(parent, index + 1);
    element.style.setProperty('--reveal-delay', `${Math.min(index, 4) * 55}ms`);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });

  targets.forEach((element) => observer.observe(element));
})();
