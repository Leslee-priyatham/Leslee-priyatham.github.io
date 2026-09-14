const root = document.documentElement;
const header = document.querySelector(".site-header");
const hero = document.querySelector(".hero");
const experience = document.querySelector(".experience");
const timelineItems = [...document.querySelectorAll(".timeline-item")];
const readingTrace = document.querySelector(".reading-trace");
const revealItems = [...document.querySelectorAll(".reveal")];
const navLinks = [...document.querySelectorAll('nav a[href^="#"]')];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const captureMode = new URLSearchParams(window.location.search).has("capture");

root.classList.add("js-ready");
if (captureMode) root.classList.add("capture-mode");

requestAnimationFrame(() => {
  requestAnimationFrame(() => root.classList.add("is-ready"));
});

const showEverything = () => {
  for (const item of revealItems) item.classList.add("is-visible");
  experience?.classList.add("is-inview");
};

if (captureMode || reducedMotion.matches || !("IntersectionObserver" in window)) {
  showEverything();
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -7%", threshold: 0.06 },
  );

  revealItems.forEach((item, index) => {
    item.style.setProperty("--reveal-order", String(index));
    revealObserver.observe(item);
  });

  if (experience) {
    const timelineObserver = new IntersectionObserver(
      ([entry], observer) => {
        if (!entry?.isIntersecting) return;
        experience.classList.add("is-inview");
        observer.disconnect();
      },
      { rootMargin: "0px 0px -22%", threshold: 0.08 },
    );
    timelineObserver.observe(experience);
  }
}

const sectionLinks = new Map(navLinks.map((link) => [link.getAttribute("href").slice(1), link]));

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      if (hero && window.scrollY < hero.offsetHeight * 0.5) {
        for (const link of navLinks) link.removeAttribute("aria-current");
        return;
      }
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      for (const link of navLinks) link.removeAttribute("aria-current");
      sectionLinks.get(visible.target.id)?.setAttribute("aria-current", "location");
    },
    { rootMargin: "-25% 0px -62%", threshold: [0, 0.15, 0.4] },
  );

  for (const id of sectionLinks.keys()) {
    const section = document.getElementById(id);
    if (section) sectionObserver.observe(section);
  }
}

let scrollFrame = 0;
const clamp01 = (value) => Math.min(Math.max(value, 0), 1);

const updateScrollState = () => {
  scrollFrame = 0;
  header?.classList.toggle("is-scrolled", window.scrollY > 14);
  if (hero && window.scrollY < hero.offsetHeight * 0.5) {
    for (const link of navLinks) link.removeAttribute("aria-current");
  }
  if (!reducedMotion.matches && hero) {
    const lift = Math.min(window.scrollY * 0.035, 12);
    hero.style.setProperty("--scroll-lift", `${lift}px`);
    hero.style.setProperty("--note-scroll-y", `${Math.max(window.scrollY * -0.055, -22)}px`);
  }

  const pageRange = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const pageProgress = clamp01(window.scrollY / pageRange);
  root.style.setProperty("--page-progress", pageProgress.toFixed(4));
  readingTrace?.setAttribute("aria-valuenow", String(Math.round(pageProgress * 100)));

  if (experience && !reducedMotion.matches) {
    const experienceTop = experience.offsetTop;
    const traceStart = experienceTop - window.innerHeight * 0.55;
    const traceEnd = Math.min(
      experienceTop + experience.offsetHeight - window.innerHeight * 0.35,
      pageRange,
    );
    const timelineProgress = clamp01((window.scrollY - traceStart) / Math.max(traceEnd - traceStart, 1));
    experience.style.setProperty("--timeline-progress", timelineProgress.toFixed(4));
    document.body.classList.toggle("trace-handoff", window.scrollY >= traceStart);

    for (const [index, item] of timelineItems.entries()) {
      item.classList.toggle(
        "is-passed",
        timelineProgress > 0 &&
          timelineProgress >= Math.min(index / Math.max(timelineItems.length - 1, 1), 0.98),
      );
    }
  } else {
    document.body.classList.remove("trace-handoff");
  }
};

window.addEventListener(
  "scroll",
  () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(updateScrollState);
  },
  { passive: true },
);
updateScrollState();

if (!reducedMotion.matches && hero && window.matchMedia("(pointer: fine)").matches) {
  let pointerFrame = 0;
  let pointerX = 0;
  let pointerY = 0;

  const paintParallax = () => {
    pointerFrame = 0;
    hero.style.setProperty("--parallax-x", `${pointerX * 7}px`);
    hero.style.setProperty("--parallax-y", `${pointerY * 5}px`);
    hero.style.setProperty("--brain-x", `${pointerX * -3}px`);
    hero.style.setProperty("--brain-y", `${pointerY * -2}px`);
  };

  hero.addEventListener("pointermove", (event) => {
    const bounds = hero.getBoundingClientRect();
    pointerX = (event.clientX - bounds.left) / bounds.width - 0.5;
    pointerY = (event.clientY - bounds.top) / bounds.height - 0.5;
    if (!pointerFrame) pointerFrame = requestAnimationFrame(paintParallax);
  });

  hero.addEventListener("pointerleave", () => {
    pointerX = 0;
    pointerY = 0;
    if (!pointerFrame) pointerFrame = requestAnimationFrame(paintParallax);
  });
}

reducedMotion.addEventListener?.("change", (event) => {
  if (event.matches) showEverything();
  updateScrollState();
});
