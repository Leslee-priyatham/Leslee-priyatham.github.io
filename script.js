const projects = [
  {
    type: 'AI EVALUATION / PYTHON',
    title: 'EvalLab',
    description: 'A local workspace for blind comparison of AI responses, versioned rubrics, human review, optional Gemini judging, and evidence exports.',
    tags: ['Python', 'SQLite', 'Gemini'],
    href: 'https://github.com/Leslee-priyatham/EvalLab',
    artLabel: 'Illustrative workflow for EvalLab',
    cardA: 'RESPONSE A',
    cardB: 'RESPONSE B',
    center: 'BLIND<br>REVIEW'
  },
  {
    type: 'DOCUMENT AGENT / GEMINI',
    title: 'Gemini Invoice Agent',
    description: 'A local Streamlit app that routes invoice questions through image transcription, structured extraction, Decimal checks, or retrieval over a fictional expense policy.',
    tags: ['Python', 'Streamlit', 'Pydantic v2'],
    href: 'https://github.com/Leslee-priyatham/gemini-invoice-agent',
    artLabel: 'Illustrative workflow for Gemini Invoice Agent',
    cardA: 'INVOICE',
    cardB: 'POLICY EVIDENCE',
    center: 'VISIBLE<br>CHECKS'
  }
];

let currentProject = 0;
const stage = document.querySelector('.project-stage');
const art = document.getElementById('project-art');
const dots = [...document.querySelectorAll('[data-project]')];

function showProject(index) {
  currentProject = (index + projects.length) % projects.length;
  const project = projects[currentProject];
  document.getElementById('project-current').textContent = String(currentProject + 1).padStart(2, '0');
  document.getElementById('project-type').textContent = project.type;
  document.getElementById('project-title').textContent = project.title;
  document.getElementById('project-description').textContent = project.description;
  document.getElementById('project-tags').replaceChildren(...project.tags.map(tag => {
    const item = document.createElement('span');
    item.textContent = tag;
    return item;
  }));
  document.getElementById('project-link').href = project.href;
  art.setAttribute('aria-label', project.artLabel);
  art.classList.toggle('invoice', currentProject === 1);
  art.querySelector('.diagram-card-a span').textContent = project.cardA;
  art.querySelector('.diagram-card-b span').textContent = project.cardB;
  art.querySelector('.diagram-center span').innerHTML = project.center;
  dots.forEach((dot, i) => {
    dot.setAttribute('aria-selected', String(i === currentProject));
    dot.tabIndex = i === currentProject ? 0 : -1;
  });
  stage.classList.remove('swap');
  void stage.offsetWidth;
  stage.classList.add('swap');
}

document.getElementById('project-prev').addEventListener('click', () => showProject(currentProject - 1));
document.getElementById('project-next').addEventListener('click', () => showProject(currentProject + 1));
dots.forEach(dot => {
  dot.addEventListener('click', () => showProject(Number(dot.dataset.project)));
  dot.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    showProject(currentProject + (event.key === 'ArrowRight' ? 1 : -1));
    dots[currentProject].focus();
  });
});

const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.getElementById('mobile-nav');
function closeMenu() {
  mobileNav.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open menu');
}
menuButton.addEventListener('click', () => {
  const opening = mobileNav.hidden;
  mobileNav.hidden = !opening;
  menuButton.setAttribute('aria-expanded', String(opening));
  menuButton.setAttribute('aria-label', opening ? 'Close menu' : 'Open menu');
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

const header = document.getElementById('site-header');
const progress = document.querySelector('.scroll-progress');
const hero = document.querySelector('.hero');
const heroTitle = document.querySelector('.hero-title');
const heroVisual = document.querySelector('.hero-visual');
const blueSections = [...document.querySelectorAll('.statement,.contact')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let scrollScheduled = false;

function updateScroll() {
  const scrollY = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${maxScroll > 0 ? scrollY / maxScroll * 100 : 0}%`;
  header.classList.toggle('scrolled', scrollY > Math.min(180, window.innerHeight * .2));
  const probe = header.getBoundingClientRect().height / 2;
  header.classList.toggle('on-blue', blueSections.some(section => {
    const rect = section.getBoundingClientRect();
    return rect.top <= probe && rect.bottom >= probe;
  }));
  if (!reduceMotion.matches && window.innerWidth > 720) {
    const fraction = Math.min(1, scrollY / Math.max(1, hero.offsetHeight));
    heroTitle.style.transform = `translateY(${-fraction * 90}px) scale(${1 - fraction * .43})`;
    heroVisual.style.transform = `translateX(-50%) translateY(${fraction * 125}px) rotate(${fraction * 7}deg)`;
  } else {
    heroTitle.style.transform = '';
    heroVisual.style.transform = '';
  }
  scrollScheduled = false;
}
window.addEventListener('scroll', () => {
  if (!scrollScheduled) { requestAnimationFrame(updateScroll); scrollScheduled = true; }
}, { passive: true });
window.addEventListener('resize', updateScroll);
updateScroll();

if ('IntersectionObserver' in window && !reduceMotion.matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: .08, rootMargin: '0px 0px -35px 0px' });
  document.querySelectorAll('.reveal').forEach(item => observer.observe(item));
} else {
  document.querySelectorAll('.reveal').forEach(item => item.classList.add('visible'));
}

document.getElementById('year').textContent = String(new Date().getFullYear());
