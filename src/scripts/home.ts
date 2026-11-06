import { initLearningStory, initStudentStories } from './learning-story';
import { initExamSchedule } from './exam-schedule';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const $ = <T extends HTMLElement>(selector: string, root: ParentNode = document) =>
  root.querySelector<T>(selector);
const $$ = <T extends HTMLElement>(selector: string, root: ParentNode = document) => [
  ...root.querySelectorAll<T>(selector),
];
const wrap = (index: number, length: number) => ((index % length) + length) % length;

interface AutoplayOptions {
  amount?: number;
  pausePointer?: boolean;
  pauseFocus?: boolean;
  paused?: () => boolean;
  state?: (playing: boolean, reset: boolean) => void;
}

function autoplay(
  section: HTMLElement,
  duration: number,
  next: () => void,
  options: AutoplayOptions = {},
) {
  let inView = false;
  let pointer = false;
  let focus = false;
  let timer = 0;
  let playing = false;
  const clear = () => {
    window.clearTimeout(timer);
    timer = 0;
  };
  const sync = (reset = false) => {
    const canPlay =
      inView &&
      !pointer &&
      !focus &&
      !reduceMotion.matches &&
      !document.hidden &&
      !options.paused?.();
    if (!canPlay) {
      clear();
      if (playing || reset) options.state?.(false, reset);
      playing = false;
      return;
    }
    if (timer && !reset) return;
    clear();
    playing = true;
    options.state?.(true, true);
    timer = window.setTimeout(() => {
      timer = 0;
      next();
      sync(true);
    }, duration);
  };
  const threshold = options.amount ?? 0.2;
  new IntersectionObserver(
    ([entry]) => {
      inView = entry.intersectionRatio >= threshold;
      sync();
    },
    { threshold: [0, threshold] },
  ).observe(section);
  if (options.pausePointer) {
    section.addEventListener('pointerenter', () => {
      pointer = true;
      sync();
    });
    section.addEventListener('pointerleave', () => {
      pointer = false;
      sync();
    });
  }
  if (options.pauseFocus) {
    section.addEventListener('focusin', (event) => {
      focus = !(event.target as Element).closest('[data-method-autoplay]');
      sync();
    });
    section.addEventListener('focusout', (event) => {
      if (!section.contains(event.relatedTarget as Node | null)) {
        focus = false;
        sync();
      }
    });
  }
  reduceMotion.addEventListener('change', () => sync(true));
  document.addEventListener('visibilitychange', () => sync(true));
  window.addEventListener('pagehide', clear);
  return { reset: () => sync(true) };
}

function initNavigation() {
  const header = $('[data-header]');
  const toggle = $<HTMLButtonElement>('[data-mobile-toggle]');
  const menu = $('#mobile-menu');
  if (!header || !toggle || !menu) return;
  const updateScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
  updateScroll();
  window.addEventListener('scroll', updateScroll, { passive: true });
  const setMenu = (open: boolean, focusTrigger = false) => {
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单');
    header.classList.toggle('is-menu-open', open);
    document.body.classList.toggle('menu-open', open);
    if (focusTrigger) toggle.focus();
  };
  toggle.addEventListener('click', () => setMenu(Boolean(menu.hidden)));
  menu.addEventListener('click', (event) => {
    if ((event.target as Element).closest('a, [data-open-contact]')) setMenu(false);
  });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (event) => {
    if (event.matches) setMenu(false);
  });
  const dropdowns = $$<HTMLDetailsElement>('[data-nav-dropdown]');
  dropdowns.forEach((detail) => {
    let mouseInside = false;
    detail.querySelector('summary')?.addEventListener('click', (event) => {
      // Hover has already opened the menu; a mouse click must not immediately close it.
      if (mouseInside && event.detail > 0) {
        event.preventDefault();
        detail.open = true;
      }
    });
    detail.addEventListener('toggle', () => {
      detail.querySelector('summary')?.setAttribute('aria-expanded', String(detail.open));
      if (detail.open)
        dropdowns
          .filter((other) => other !== detail)
          .forEach((other) => {
            other.open = false;
          });
    });
    detail.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'mouse') {
        mouseInside = true;
        detail.open = true;
      }
    });
    detail.addEventListener('pointerleave', (event) => {
      mouseInside = false;
      if (event.pointerType === 'mouse' && !detail.contains(document.activeElement))
        detail.open = false;
    });
    detail.addEventListener('focusout', (event) => {
      if (!detail.contains(event.relatedTarget as Node | null)) detail.open = false;
    });
  });
  document.addEventListener('pointerdown', (event) => {
    dropdowns.forEach((detail) => {
      if (!detail.contains(event.target as Node)) detail.open = false;
    });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const open = dropdowns.find((detail) => detail.open);
    if (open) {
      open.open = false;
      open.querySelector('summary')?.focus();
    }
    if (!menu.hidden) setMenu(false, true);
  });
  menu.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab' || menu.hidden) return;
    const focusable = $$<HTMLElement>('a, button, summary', menu).filter(
      (item) => item.getClientRects().length,
    );
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === toggle) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      toggle.focus();
    }
  });
  toggle.addEventListener('keydown', (event) => {
    if (event.key === 'Tab' && event.shiftKey && !menu.hidden) {
      event.preventDefault();
      $$<HTMLElement>('a,button,summary', menu)
        .filter((item) => item.getClientRects().length)
        .at(-1)
        ?.focus();
    }
  });
}

function initMethods() {
  const section = $('[data-carousel="method"]');
  if (!section) return (_index: number) => {};
  const items = $$('[data-method-item]', section);
  const buttons = $$<HTMLButtonElement>('[data-method]', section);
  const slides = $$('[data-method-slide]', section);
  let current = 0;
  let manuallyPaused = false;
  let controller: ReturnType<typeof autoplay> | undefined;
  const position = $('[data-method-position]', section);
  const pause = $<HTMLButtonElement>('[data-method-autoplay]', section);
  const select = (index: number, reset = true) => {
    current = wrap(index, items.length);
    items.forEach((item, i) => {
      item.classList.toggle('is-active', i === current);
      buttons[i].setAttribute('aria-selected', String(i === current));
      buttons[i].tabIndex = i === current ? 0 : -1;
      const progress = $('.journey-step-progress', item);
      progress?.classList.remove('is-playing', 'is-paused');
      slides[i].hidden = i !== current;
    });
    if (position)
      position.textContent = `${String(current + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
    if (reset) controller?.reset();
  };
  buttons.forEach((button, i) => {
    button.addEventListener('click', () => select(i));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key))
        return;
      event.preventDefault();
      const target =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? items.length - 1
            : wrap(
                current + (['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : -1),
                items.length,
              );
      select(target);
      buttons[target].focus();
    });
  });
  $('[data-method-prev]', section)?.addEventListener('click', () => select(current - 1));
  $('[data-method-next]', section)?.addEventListener('click', () => select(current + 1));
  pause?.addEventListener('click', () => {
    manuallyPaused = !manuallyPaused;
    pause.setAttribute('aria-pressed', String(manuallyPaused));
    pause.textContent = manuallyPaused ? '继续自动切换 ▷' : '暂停自动切换 Ⅱ';
    controller?.reset();
  });
  if (pause && reduceMotion.matches) {
    pause.textContent = '手动切换';
    pause.disabled = true;
  }
  controller = autoplay(section, 8500, () => select(current + 1, false), {
    amount: 0.35,
    pauseFocus: true,
    pausePointer: true,
    paused: () => manuallyPaused,
    state(playing, reset) {
      const progress = $('.journey-step-progress', items[current]);
      if (!progress) return;
      if (reset) {
        progress.classList.remove('is-playing');
        void progress.offsetWidth;
      }
      if (playing) {
        progress.classList.add('is-playing');
        progress.classList.remove('is-paused');
      } else progress.classList.add('is-paused');
    },
  });
  $$<HTMLAnchorElement>('[data-method-link]').forEach((link) =>
    link.addEventListener('click', () => select(Number(link.dataset.methodLink))),
  );
  return (index: number) => {
    select(index);
    section.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
  };
}

function initFaq() {
  const tabs = $$<HTMLButtonElement>('[data-faq-tab]');
  const panels = $$('[data-faq-panel]');
  const select = (index: number, focus = false) => {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
    if (focus) tabs[index].focus();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      select(
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? tabs.length - 1
            : wrap(i + (event.key === 'ArrowRight' ? 1 : -1), tabs.length),
        true,
      );
    });
  });
}

function initContact() {
  const dialog = $<HTMLDialogElement>('#contact-dialog');
  if (!dialog) return;
  let trigger: HTMLElement | null = null;
  $$<HTMLButtonElement>('[data-open-contact]').forEach((button) =>
    button.addEventListener('click', () => {
      trigger = button;
      dialog.showModal();
      document.body.classList.add('dialog-open');
    }),
  );
  $('[data-close-contact]', dialog)?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      const box = dialog.getBoundingClientRect();
      if (
        event.clientX < box.left ||
        event.clientX > box.right ||
        event.clientY < box.top ||
        event.clientY > box.bottom
      )
        dialog.close();
    }
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    trigger?.focus();
  });
}

initNavigation();
initContact();
if ($('[data-carousel="method"]')) {
  initStudentStories();
  initMethods();
  initFaq();
  initLearningStory();
}
initExamSchedule();
