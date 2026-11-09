const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const en = document.documentElement.lang === 'en';
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const segment = (p: number, start: number, end: number) => clamp((p - start) / (end - start));

/** Manual carousel: two panels share a grid cell during a 12px crossfade. */
export function initStudentStories() {
  const section = document.querySelector<HTMLElement>('[data-carousel="stories"]');
  if (!section) return;
  const panels = [...section.querySelectorAll<HTMLElement>('[data-story-panel]')];
  const dots = [...section.querySelectorAll<HTMLButtonElement>('[data-story-dot]')];
  const status = section.querySelector<HTMLElement>('[data-story-status]');
  let current = 0;
  let animations: Animation[] = [];
  const settle = () => {
    animations.forEach((animation) => animation.cancel());
    animations = [];
    panels.forEach((panel, i) => {
      panel.hidden = i !== current;
      panel.inert = i !== current;
    });
  };
  const select = (index: number) => {
    const next = ((index % panels.length) + panels.length) % panels.length;
    if (next === current) return;
    settle();
    const previous = current;
    const direction = next > current ? 1 : -1;
    current = next;
    const incoming = panels[current];
    const outgoing = panels[previous];
    incoming.hidden = false;
    incoming.inert = false;
    outgoing.inert = true;
    outgoing.setAttribute('aria-hidden', 'true');
    incoming.removeAttribute('aria-hidden');
    panels.forEach((panel, i) => {
      if (i !== current) panel.setAttribute('aria-hidden', 'true');
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
      if (i === current) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    if (status)
      status.textContent = en
        ? `Student story ${current + 1} of ${panels.length}: ${dots[current].textContent?.trim()}`
        : `第 ${current + 1} 条，共 ${panels.length} 条学生反馈：${dots[current].textContent?.trim()}`;
    if (reducedMotion.matches) return settle();
    animations = [
      outgoing.animate(
        [
          { opacity: 1, transform: 'translateX(0)' },
          { opacity: 0, transform: `translateX(${-12 * direction}px)` },
        ],
        { duration: 260, easing: 'ease-out', fill: 'both' },
      ),
      incoming.animate(
        [
          { opacity: 0, transform: `translateX(${12 * direction}px)` },
          { opacity: 1, transform: 'translateX(0)' },
        ],
        { duration: 380, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' },
      ),
    ];
    const selected = current;
    animations[1].onfinish = () => {
      if (selected === current) settle();
    };
  };
  section.querySelector('[data-story-prev]')?.addEventListener('click', () => select(current - 1));
  section.querySelector('[data-story-next]')?.addEventListener('click', () => select(current + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => select(i)));
  section.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      select(current - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      select(current + 1);
    }
  });
  reducedMotion.addEventListener('change', settle);
  settle();
}

/** Local section progress → five storytelling beats. No pin, wheel handler, or loop. */
export function initLearningStory() {
  const section = document.querySelector<HTMLElement>('[data-learning-story]');
  if (!section) return;
  const route = section.querySelector<HTMLElement>('.learning-route')!;
  const svg = section.querySelector<SVGSVGElement>('.route-svg')!;
  const track = section.querySelector<SVGPathElement>('[data-route-track]')!;
  const paths = [...section.querySelectorAll<SVGPathElement>('[data-route-draw]')];
  const tip = section.querySelector<HTMLElement>('.route-tip')!;
  const nodes = [...section.querySelectorAll<HTMLElement>('[data-route-node]')];
  const metrics = [...section.querySelectorAll<HTMLElement>('[data-journey-metric]')];
  const counted = new Set<HTMLElement>();
  const pulsed = new Set<HTMLElement>();
  const countFrames = new Map<HTMLElement, number>();
  const mobile = window.matchMedia('(max-width: 760px)');
  let nodePositions: number[] = [];
  let length = 1;
  let scheduled = 0;
  let active = false;
  let furthest = 0;

  const finishCount = (metric: HTMLElement) => {
    cancelAnimationFrame(countFrames.get(metric) || 0);
    countFrames.delete(metric);
    metric.style.transitionDelay = '0ms';
    const strong = metric.querySelector<HTMLElement>('[data-final-value]');
    const span = strong?.querySelector('span');
    if (strong && span) span.textContent = strong.dataset.finalValue || '—';
    metric.classList.add('is-revealed');
  };
  const count = (metric: HTMLElement, delay: number) => {
    if (counted.has(metric)) return;
    counted.add(metric);
    metric.style.transitionDelay = `${delay}ms`;
    metric.classList.add('is-revealed');
    const strong = metric.querySelector<HTMLElement>('[data-story-count]');
    const span = strong?.querySelector('span');
    if (!strong || !span || reducedMotion.matches) return finishCount(metric);
    const target = Number(strong.dataset.storyCount);
    const suffix = strong.dataset.countSuffix || '';
    const start = performance.now() + delay;
    span.textContent = `0${suffix}`;
    const tick = (now: number) => {
      if (reducedMotion.matches || document.hidden) return finishCount(metric);
      const p = clamp((now - start) / 1000);
      span.textContent = `${Math.round(target * (1 - (1 - p) ** 3))}${suffix}`;
      if (p < 1) countFrames.set(metric, requestAnimationFrame(tick));
      else finishCount(metric);
    };
    countFrames.set(metric, requestAnimationFrame(tick));
  };
  const geometry = () => {
    const d = mobile.matches
      ? 'M60 0C60 25 65 50 100.8 64.8S250 85 237.6 140.4S90 170 108 223.2S250 250 230.4 302.4'
      : 'M100 250C145 220 198 190 264 170S407 136 492 140S678 130 744 107.5S920 89 984 42.5';
    const width = mobile.matches ? 360 : 1200;
    const height = mobile.matches ? 360 : 250;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    [track, ...paths].forEach((path) => path.setAttribute('d', d));
    length = track.getTotalLength();
    const arrowPoint = track.getPointAtLength(length * 0.935);
    const arrowNext = track.getPointAtLength(length * 0.945);
    const angle =
      (Math.atan2(arrowNext.y - arrowPoint.y, arrowNext.x - arrowPoint.x) * 180) / Math.PI;
    section
      .querySelector('[data-route-arrow]')
      ?.setAttribute('transform', `translate(${arrowPoint.x} ${arrowPoint.y}) rotate(${angle})`);
    nodePositions = nodes.map((node) => {
      const style = getComputedStyle(node);
      const x =
        (parseFloat(style.getPropertyValue(mobile.matches ? '--mobile-x' : '--node-x')) / 100) *
        width;
      const y =
        (parseFloat(style.getPropertyValue(mobile.matches ? '--mobile-y' : '--node-y')) / 100) *
        height;
      let closest = 0,
        distance = Infinity;
      for (let i = 0; i <= 600; i++) {
        const point = track.getPointAtLength((length * i) / 600);
        const candidate = (point.x - x) ** 2 + (point.y - y) ** 2;
        if (candidate < distance) {
          distance = candidate;
          closest = i / 600;
        }
      }
      return closest;
    });
    schedule();
  };
  const reveal = (name: string, p: number, distance: number) => {
    section.style.setProperty(`--${name}-opacity`, String(p));
    section.style.setProperty(`--${name}-y`, `${(1 - p) * distance}px`);
  };
  const render = () => {
    scheduled = 0;
    const bounds = section.getBoundingClientRect();
    // 0: section top reaches 88% viewport; 1: its bottom reaches the same line.
    const p = reducedMotion.matches ? 1 : clamp((innerHeight * 0.88 - bounds.top) / bounds.height);
    furthest = Math.max(furthest, p);
    section.dataset.storyProgress = p.toFixed(3);
    reveal('quote', segment(furthest, 0, 0.12), 20);
    reveal('meta', segment(furthest, 0.065, 0.18), 12);
    reveal('controls', segment(furthest, 0.1, 0.2), 8);
    reveal('heading', segment(furthest, 0.2, 0.32), 12);
    section.style.setProperty('--underline-progress', String(segment(furthest, 0.25, 0.35)));
    const draw = segment(p, 0.35, 0.82);
    section.style.setProperty('--route-progress', String(draw));
    section.style.setProperty('--arrow-opacity', String(segment(draw, 0.93, 0.96)));
    section.style.setProperty('--tip-opacity', String(draw > 0 && draw < 1 ? 1 : 0));
    const point = track.getPointAtLength(length * draw);
    const viewBox = svg.viewBox.baseVal;
    tip.style.left = `${(point.x / viewBox.width) * 100}%`;
    tip.style.top = `${(point.y / viewBox.height) * 100}%`;
    nodes.forEach((node, i) => {
      const reached = draw >= nodePositions[i] - 0.001;
      node.classList.toggle('is-active', reached);
      if (reached && !pulsed.has(node)) {
        pulsed.add(node);
        if (!reducedMotion.matches) node.classList.add('is-pulsing');
      }
    });
    section.style.setProperty('--wave-back-y', `${reducedMotion.matches ? 0 : (p - 0.5) * 12}px`);
    section.style.setProperty('--wave-blue-y', `${reducedMotion.matches ? 0 : (p - 0.5) * -16}px`);
    section.style.setProperty('--wave-teal-y', `${reducedMotion.matches ? 0 : (p - 0.5) * 20}px`);
    const metricsProgress = segment(furthest, 0.88, 0.96);
    reveal('metrics', metricsProgress, 22);
    if (furthest >= 0.9) metrics.forEach((metric, i) => count(metric, i * 120));
    section.classList.toggle('is-enhanced', !reducedMotion.matches);
  };
  function schedule() {
    if (!scheduled) scheduled = requestAnimationFrame(render);
  }
  window.addEventListener(
    'scroll',
    () => {
      if (active) schedule();
    },
    { passive: true },
  );
  window.addEventListener('resize', schedule, { passive: true });
  mobile.addEventListener('change', geometry);
  new ResizeObserver(geometry).observe(route);
  new IntersectionObserver(
    ([entry]) => {
      active = entry.isIntersecting;
      if (active) schedule();
    },
    { rootMargin: '120px 0px' },
  ).observe(section);
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) metrics.forEach(finishCount);
    schedule();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) countFrames.forEach((_, metric) => finishCount(metric));
    else schedule();
  });
  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(scheduled);
    countFrames.forEach(cancelAnimationFrame);
  });
  geometry();
  render();
}
