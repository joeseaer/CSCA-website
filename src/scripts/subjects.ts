const switcher = document.querySelector<HTMLElement>('[data-subject-switcher]');

if (switcher) {
  const tablist = switcher.querySelector<HTMLElement>('[data-subject-tabs]');
  const tabs = [...switcher.querySelectorAll<HTMLButtonElement>('[data-subject-tab]')];
  const panels = [...switcher.querySelectorAll<HTMLElement>('[data-subject-panel]')];

  const select = (index: number, keyboard = false) => {
    switcher.classList.toggle('is-keyboard-switch', keyboard);
    tablist?.style.setProperty('--subject-index', String(index));
    tabs.forEach((tab, position) => {
      const selected = position === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[position].hidden = !selected;
    });
    if (keyboard) tabs[index].focus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', (event) => select(index, event.detail === 0));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? tabs.length - 1
            : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      select(next, true);
    });
  });
}
