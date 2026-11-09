const library = document.querySelector<HTMLElement>('[data-library]');
const en = document.documentElement.lang === 'en';

if (library) {
  const search = library.querySelector<HTMLInputElement>('#resource-query');
  const form = library.querySelector<HTMLFormElement>('[data-resource-search]');
  const categories = [...library.querySelectorAll<HTMLAnchorElement>('[data-category]')];
  const sections = [...library.querySelectorAll<HTMLElement>('[data-resource-section]')];
  const status = library.querySelector<HTMLElement>('[data-search-status]');
  const empty = library.querySelector<HTMLElement>('[data-resource-empty]');
  const glossary = [...library.querySelectorAll<HTMLDetailsElement>('[data-glossary-group]')];
  const initialOpen = new Map(glossary.map((group) => [group, group.open]));
  const normalize = (value: string) => value.normalize('NFKC').toLocaleLowerCase().trim();
  let category = 'all';
  let searching = false;
  const stage = library.querySelector<HTMLElement>('[data-app-stage]');
  const moduleButtons = [...library.querySelectorAll<HTMLButtonElement>('[data-module-select]')];
  const screens = [...library.querySelectorAll<HTMLElement>('[data-stage-screen]')];
  let selectedModule = moduleButtons[0];

  const selectModule = (button: HTMLButtonElement) => {
    selectedModule = button;
    moduleButtons.forEach((item) => {
      const selected = item === button;
      item.setAttribute('aria-pressed', String(selected));
      item.closest('[data-module-row]')?.classList.toggle('is-active', selected);
    });
    const title = stage?.querySelector<HTMLElement>('[data-stage-title]');
    const link = stage?.querySelector<HTMLAnchorElement>('[data-stage-open]');
    if (title) title.textContent = button.dataset.moduleTitle || '';
    if (link && button.dataset.moduleHref) {
      link.href = button.dataset.moduleHref;
      link.setAttribute(
        'aria-label',
        en ? `Open ${button.dataset.moduleTitle}` : `打开${button.dataset.moduleTitle}`,
      );
    }
    screens.forEach((screen) => {
      const selected = screen.dataset.stageScreen === button.dataset.moduleScreen;
      screen.classList.toggle('is-active', selected);
      screen.setAttribute('aria-hidden', String(!selected));
    });
  };
  const visibleModules = () =>
    moduleButtons.filter((button) => !button.closest<HTMLElement>('[data-module-row]')?.hidden);
  const syncStage = () => {
    const visible = visibleModules();
    if (stage) stage.hidden = !visible.length;
    if (visible.length && !visible.includes(selectedModule)) selectModule(visible[0]);
  };
  moduleButtons.forEach((button) => {
    button.disabled = false;
    button.addEventListener('click', () => selectModule(button));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const visible = visibleModules();
      const current = visible.indexOf(button);
      const index =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? visible.length - 1
            : (current + (event.key === 'ArrowDown' ? 1 : -1) + visible.length) % visible.length;
      const next = visible[index];
      if (next) {
        next.focus();
        selectModule(next);
      }
    });
  });

  const applyFilters = () => {
    const query = normalize(search?.value || '');
    const words = query.split(/\s+/).filter(Boolean);
    let count = 0;
    let visibleSections = 0;
    library.classList.toggle('is-filtering', Boolean(query) || category !== 'all');
    sections.forEach((section) => {
      const active = category === 'all' || category === section.dataset.resourceSection;
      let sectionCount = 0;
      section.querySelectorAll<HTMLElement>('[data-resource-item]').forEach((item) => {
        const content = normalize(item.dataset.search || item.textContent || '');
        const matches = words.every((word) => content.includes(word));
        item.hidden = !matches;
        if (matches) sectionCount += 1;
      });
      section.querySelectorAll<HTMLElement>('[data-resource-group]').forEach((group) => {
        group.hidden = ![...group.querySelectorAll<HTMLElement>('[data-resource-item]')].some(
          (item) => !item.hidden,
        );
      });
      section.hidden = !active || sectionCount === 0;
      if (!section.hidden) {
        count += sectionCount;
        visibleSections += 1;
        section.querySelectorAll<HTMLElement>('.reveal-pending').forEach((item) => {
          item.classList.remove('reveal-pending');
          item.classList.add('reveal-visible');
        });
      }
    });
    glossary.forEach((group) => {
      if (query) group.open = !group.hidden;
      else if (searching) group.open = initialOpen.get(group) || false;
    });
    searching = Boolean(query);
    categories.forEach((link) => {
      const selected = link.dataset.category === category;
      link.classList.toggle('is-selected', selected);
      if (selected) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    if (status) {
      status.hidden = !query;
      status.textContent = query ? (en ? `${count} matching results` : `${count} 条匹配结果`) : '';
    }
    if (empty) empty.hidden = visibleSections > 0;
    syncStage();
  };

  categories.forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      category = link.dataset.category || 'all';
      applyFilters();
      const fragment = category === 'all' ? '#collection' : `#${category}`;
      window.history.replaceState(null, '', fragment);
    });
  });
  search?.addEventListener('input', applyFilters);
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    applyFilters();
  });
  library.querySelector('[data-clear-search]')?.addEventListener('click', () => {
    if (search) search.value = '';
    category = 'all';
    applyFilters();
    window.history.replaceState(null, '', '#collection');
    search?.focus();
  });

  const hashCategory = () => {
    const hash = window.location.hash.slice(1);
    if (categories.some((link) => link.dataset.category === hash)) {
      category = hash;
      applyFilters();
    } else if (hash === 'collection') {
      category = 'all';
      applyFilters();
    }
  };
  hashCategory();
  window.addEventListener('hashchange', () => {
    hashCategory();
    // A header link may target a section hidden by the preceding category.
    document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ block: 'start' });
  });

  // Skeletons represent only the actual loading state of local screenshot files.
  library.querySelectorAll<HTMLElement>('[data-image-frame]').forEach((frame) => {
    const image = frame.querySelector<HTMLImageElement>('img');
    if (!image) return;
    const loaded = () => {
      frame.classList.remove('is-image-loading');
      frame.removeAttribute('aria-busy');
    };
    if (!image.complete) {
      frame.classList.add('is-image-loading');
      frame.setAttribute('aria-busy', 'true');
      image.addEventListener('load', loaded, { once: true });
      image.addEventListener('error', loaded, { once: true });
    }
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.remove('reveal-pending');
          entry.target.classList.add('reveal-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.06, rootMargin: '0px 0px 45px 0px' },
    );
    library.querySelectorAll<HTMLElement>('[data-resource-reveal]').forEach((item) => {
      if (item.getBoundingClientRect().top < window.innerHeight) return;
      item.classList.add('reveal-pending');
      observer.observe(item);
    });
    reducedMotion.addEventListener('change', (event) => {
      if (!event.matches) return;
      observer.disconnect();
      library
        .querySelectorAll('.reveal-pending')
        .forEach((item) => item.classList.remove('reveal-pending'));
    });
  }
}
