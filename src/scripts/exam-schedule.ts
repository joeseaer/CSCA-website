import { examSchedule, scheduleState } from '../data/exam-schedule';

export function initExamSchedule() {
  const section = document.querySelector<HTMLElement>('[data-exam-schedule]');
  if (!section) return;
  const en = document.documentElement.lang === 'en';
  const updateToday = () => {
    const state = scheduleState(new Date(), en ? 'en' : 'zh');
    section.querySelectorAll<HTMLElement>('[data-milestone]').forEach((item, index) => {
      const active = index === state.current;
      item.classList.toggle('is-current', active);
      if (active) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
      const badge = item.querySelector<HTMLElement>('[data-schedule-today]');
      if (badge) {
        badge.textContent = state.label;
        badge.hidden = !active;
      }
    });
    const prefix = section.querySelector('[data-exam-prefix]');
    if (prefix)
      prefix.textContent = en
        ? state.ended
          ? 'Current exam'
          : 'Next exam'
        : state.ended
          ? '本场'
          : '下一场';
  };
  updateToday();
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) updateToday();
  });
  const select = section.querySelector<HTMLSelectElement>('[data-timezone-select]');
  const output = section.querySelector<HTMLOutputElement>('[data-timezone-range]');
  if (!select || !output) return;
  const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (![...select.options].some((option) => option.value === localZone)) {
    const option = document.createElement('option');
    option.value = localZone;
    option.textContent = en ? `Local time zone · ${localZone}` : `当前时区 · ${localZone}`;
    select.add(option, 0);
  }
  select.value = localZone;
  const updateZone = () => {
    const formatter = new Intl.DateTimeFormat(en ? 'en-GB' : 'zh-CN', {
      timeZone: select.value,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
    const start = formatter.format(new Date(examSchedule.startsAt));
    const end = formatter.format(new Date(new Date(examSchedule.endsAt).getTime() - 60_000));
    output.textContent = `${start} — ${end}`;
  };
  select.addEventListener('change', updateZone);
  updateZone();
}
