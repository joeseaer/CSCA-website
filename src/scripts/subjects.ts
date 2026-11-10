const switcher = document.querySelector<HTMLElement>('[data-subject-switcher]');

if (switcher) {
  const options = switcher.querySelector<HTMLElement>('[data-subject-options]');
  const buttons = [...switcher.querySelectorAll<HTMLButtonElement>('[data-subject]')];
  const storageKey = 'hubcsca.site.subject';

  const select = (index: number, keyboard = false, persist = true) => {
    switcher.classList.toggle('is-keyboard-switch', keyboard);
    options?.style.setProperty('--subject-index', String(index));
    buttons.forEach((button, position) => {
      const selected = position === index;
      button.setAttribute('aria-pressed', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    const subject = buttons[index].dataset.subject || 'math';
    document.documentElement.dataset.subject = subject;
    if (persist) {
      try {
        localStorage.setItem(storageKey, subject);
      } catch {
        /* Selection still works without storage. */
      }
    }
    if (keyboard) buttons[index].focus();
  };

  let saved = 'math';
  try {
    saved = localStorage.getItem(storageKey) || saved;
  } catch {
    /* Use the default subject. */
  }
  select(
    Math.max(
      0,
      buttons.findIndex((button) => button.dataset.subject === saved),
    ),
    false,
    false,
  );

  buttons.forEach((button, index) => {
    button.addEventListener('click', (event) => select(index, event.detail === 0));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? buttons.length - 1
            : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
      select(next, true);
    });
  });
}
