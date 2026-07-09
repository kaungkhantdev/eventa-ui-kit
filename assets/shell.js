/* ============================================================
   Eventa shell — renders the sidebar and wires all shared UI.
   Each page: <body data-page="events"> ... <script src="assets/shell.js"></script>
   Exposes window.EventaOnThemeChange(dark) for pages that must repaint on theme flip.
   ============================================================ */
(function () {
  const M = window.Motion || null;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = () => window.matchMedia('(min-width: 1024px)').matches;

  /* ---------------- Navigation model ---------------- */
  const NAV = [
    { title: 'Manage', short: 'M', items: [
      { id: 'dashboard',     label: 'Dashboard',     icon: 'hgi-dashboard-square-01', href: 'dashboard.html' },
      { id: 'events',        label: 'Events',        icon: 'hgi-calendar-03',         href: 'events.html' },
      { id: 'registrations', label: 'Registrations', icon: 'hgi-user-add-01',         href: 'registrations.html' },
      { id: 'attendees',     label: 'Attendees',     icon: 'hgi-user-multiple',       href: 'attendees.html' },
      { id: 'tickets',       label: 'Tickets',       icon: 'hgi-ticket-01',           href: 'tickets.html' },
      { id: 'checkin',       label: 'Check-in',      icon: 'hgi-qr-code-01',          href: 'check-in.html' },
    ]},
    { title: 'Engage', short: 'E', items: [
      { id: 'speakers', label: 'Speakers', icon: 'hgi-mic-01',       href: 'speakers.html' },
      { id: 'agenda',   label: 'Agenda',   icon: 'hgi-time-schedule', href: 'agenda.html' },
      { id: 'feedback', label: 'Feedback', icon: 'hgi-comment-01',   href: 'feedback.html' },
    ]},
    { title: 'Finance', short: 'F', items: [
      { id: 'payments',  label: 'Payments',  icon: 'hgi-wallet-01',       href: 'payments.html' },
      { id: 'payouts',   label: 'Payouts',   icon: 'hgi-bank',            href: 'payouts.html' },
      { id: 'discounts', label: 'Discounts', icon: 'hgi-discount-tag-01', href: 'discounts.html' },
    ]},
    { title: 'Insights', short: 'I', items: [
      { id: 'reports', label: 'Reports', icon: 'hgi-analytics-up', href: 'reports.html' },
    ]},
    { title: 'System', short: 'S', items: [
      { id: 'notifications', label: 'Notifications', icon: 'hgi-notification-03', href: 'notifications.html' },
      { id: 'users',         label: 'Users & Roles', icon: 'hgi-user-group',     href: 'users.html' },
      { id: 'settings',      label: 'Settings',      icon: 'hgi-settings-01',    href: 'settings.html' },
    ]},
  ];

  const active = document.body.dataset.page || 'dashboard';
  const collapsed = localStorage.getItem('eventa-collapsed') === '1';

  function navItem(it) {
    const on = it.id === active;
    const cls = on
      ? 'nav-item flex items-center gap-1 rounded-lg bg-brand pr-2.5 text-[13px] font-medium text-white'
      : 'nav-item flex items-center gap-1 rounded-lg pr-2.5 text-[13px] font-medium text-muted hover:bg-line hover:text-ink';
    return `<li><a href="${it.href}" class="${cls}"><span class="grid h-9 w-9 shrink-0 place-items-center"><i class="hgi-stroke ${it.icon} text-[19px]"></i></span><span class="side-label">${it.label}</span></a></li>`;
  }

  const themeRow = `<li><button class="nav-item theme-toggle w-full flex items-center gap-1 rounded-lg pr-2.5 text-[13px] font-medium text-muted hover:bg-line hover:text-ink"><span class="grid h-9 w-9 shrink-0 place-items-center"><i class="hgi-stroke hgi-moon-02 text-[19px]"></i></span><span class="side-label">Dark mode</span><span class="theme-track side-label ml-auto flex h-5 w-9 items-center rounded-full bg-line p-0.5"><span class="theme-knob h-4 w-4 rounded-full bg-white shadow transition-transform"></span></span></button></li>`;

  const sections = NAV.map(sec => `
    <div>
      <p class="section-label px-2 text-[10px] font-semibold uppercase tracking-wider text-muted/80" data-short="${sec.short}">${sec.title}</p>
      <ul class="mt-1.5 space-y-0.5">${sec.items.map(navItem).join('')}${sec.title === 'System' ? themeRow : ''}</ul>
    </div>`).join('');

  // append the dark-mode row to the last (System) section's <ul>
  const sidebarHTML = `
    <aside id="sidebar" class="fixed inset-y-0 left-0 z-50 flex w-64 -translate-x-full flex-col overflow-hidden border-r border-hair bg-sidebar px-2.5 py-3 transition-transform duration-300 lg:static lg:z-auto lg:w-56 lg:translate-x-0 lg:shrink-0 lg:transition-none${collapsed ? ' collapsed' : ''}">
      <div class="flex items-center gap-2">
        <a href="dashboard.html" class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand text-white"><i class="hgi-stroke hgi-ticket-star text-[20px]"></i></a>
        <span class="side-label text-[17px] font-extrabold tracking-tight text-brand-dark">Eventa</span>
        <button id="btn-collapse" class="expanded-only ml-auto grid h-6 w-6 shrink-0 place-items-center rounded-md text-muted hover:bg-line" title="Collapse sidebar"><i class="hgi-stroke hgi-arrow-left-01 text-[16px]"></i></button>
      </div>
      <button id="btn-expand" class="collapsed-only mt-2 h-6 w-6 shrink-0 self-center place-items-center rounded-md text-muted hover:bg-line" title="Expand sidebar"><i class="hgi-stroke hgi-arrow-right-01 text-[16px]"></i></button>
      <nav class="mt-4 flex-1 space-y-4 overflow-y-auto overflow-x-hidden">${sections}</nav>
      <div class="mt-3 flex items-center gap-2.5 border-t border-hair pt-3">
        <div class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-emerald-400 text-[12px] font-semibold text-white">HN</div>
        <div class="side-label min-w-0 leading-tight">
          <p class="truncate text-[13px] font-semibold text-ink">Harper Nelson</p>
          <p class="truncate text-[11px] text-muted">Event Manager</p>
        </div>
      </div>
      <a href="login.html" class="nav-item mt-2 flex items-center gap-1 rounded-lg pr-2.5 text-[13px] font-medium text-muted hover:bg-line hover:text-ink"><span class="grid h-9 w-9 shrink-0 place-items-center"><i class="hgi-stroke hgi-logout-01 text-[18px]"></i></span><span class="side-label">Log out</span></a>
    </aside>`;

  const layout = document.querySelector('[data-layout]') || document.querySelector('.flex.min-h-screen') || document.body.firstElementChild;
  layout.insertAdjacentHTML('afterbegin', `<div id="backdrop" class="fixed inset-0 z-40 hidden bg-black/40 lg:hidden"></div>${sidebarHTML}`);

  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('backdrop');

  /* ---------------- Collapse / expand (desktop) ---------------- */
  function setCollapsed(c) {
    if (!isDesktop()) return;
    sidebar.classList.toggle('collapsed', c);
    localStorage.setItem('eventa-collapsed', c ? '1' : '0');
    if (M && !reduce) {
      const from = c ? 224 : 56, to = c ? 56 : 224;
      sidebar.style.width = from + 'px';
      M.animate(sidebar, { width: [from + 'px', to + 'px'] }, { duration: 0.32, ease: [0.4, 0, 0.2, 1] });
      setTimeout(() => { sidebar.style.width = ''; }, 360);
    }
  }
  /* ---------------- Drawer (mobile) ---------------- */
  function openDrawer() {
    sidebar.classList.remove('-translate-x-full'); sidebar.classList.add('translate-x-0');
    backdrop.classList.remove('hidden');
    if (M && !reduce) M.animate(backdrop, { opacity: [0, 1] }, { duration: 0.25 });
  }
  function closeDrawer() {
    sidebar.classList.add('-translate-x-full'); sidebar.classList.remove('translate-x-0');
    if (M && !reduce) { M.animate(backdrop, { opacity: [1, 0] }, { duration: 0.22 }); setTimeout(() => backdrop.classList.add('hidden'), 230); }
    else backdrop.classList.add('hidden');
  }
  window.matchMedia('(min-width: 1024px)').addEventListener('change', e => {
    sidebar.style.width = '';
    if (e.matches) sidebar.classList.remove('-translate-x-full', 'translate-x-0');
    else { sidebar.classList.remove('collapsed'); sidebar.classList.add('-translate-x-full'); }
    backdrop.classList.add('hidden');
  });
  document.getElementById('btn-collapse').addEventListener('click', () => (isDesktop() ? setCollapsed(true) : closeDrawer()));
  document.getElementById('btn-expand').addEventListener('click', () => setCollapsed(false));
  backdrop.addEventListener('click', closeDrawer);
  sidebar.addEventListener('click', e => { if (!isDesktop() && e.target.closest('a')) closeDrawer(); });
  const menuBtn = document.getElementById('btn-menu');
  if (menuBtn) menuBtn.addEventListener('click', openDrawer);

  /* ---------------- Dark mode (circular reveal, robust) ---------------- */
  const THEME_KEY = 'eventa-theme';
  function applyTheme(dark) {
    document.documentElement.classList.toggle('dark', dark);
    document.querySelectorAll('.theme-track').forEach(t => { t.classList.toggle('bg-brand', dark); t.classList.toggle('bg-line', !dark); });
    document.querySelectorAll('.theme-knob').forEach(k => k.classList.toggle('translate-x-4', dark));
    try { localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light'); } catch (e) {}
    if (typeof window.EventaOnThemeChange === 'function') window.EventaOnThemeChange(dark);
  }
  function toggleTheme(origin) {
    const isDark = document.documentElement.classList.contains('dark');
    const oldBg = isDark ? 'rgb(13 17 15)' : 'rgb(255 255 255)';
    applyTheme(!isDark);
    if (!M || reduce || !M.animate) return;
    document.querySelectorAll('.theme-reveal').forEach(e => e.remove());
    const r = origin.getBoundingClientRect();
    const ov = document.createElement('div');
    ov.className = 'theme-reveal';
    ov.style.cssText = `position:fixed;inset:0;z-index:70;pointer-events:none;background:${oldBg};transform-origin:${r.left + r.width / 2}px ${r.top + r.height / 2}px;will-change:transform,opacity;`;
    document.body.appendChild(ov);
    M.animate(ov, { scale: [1, 0], opacity: [1, 0.4] }, { duration: 0.5, ease: [0.4, 0, 0.2, 1] });
    M.animate('.hgi-moon-02', { rotate: [0, -25, 0], scale: [1, 1.15, 1] }, { duration: 0.5 });
    setTimeout(() => ov.remove(), 650);
  }
  document.querySelectorAll('.theme-toggle').forEach(btn => btn.addEventListener('click', () => toggleTheme(btn)));
  // sync toggle UI to whatever the <head> boot script already set (no flash)
  applyTheme(document.documentElement.classList.contains('dark'));

  /* ---------------- Declarative slide-overs / modals ---------------- */
  const overlay = document.createElement('div');
  overlay.className = 'panel-overlay';
  document.body.appendChild(overlay);
  function closeAll() {
    document.querySelectorAll('.panel.open, .modal.open').forEach(p => p.classList.remove('open'));
    overlay.classList.remove('open');
  }
  document.addEventListener('click', e => {
    const opener = e.target.closest('[data-open]');
    if (opener) { const p = document.getElementById(opener.getAttribute('data-open')); if (p) { closeAll(); p.classList.add('open'); overlay.classList.add('open'); } return; }
    if (e.target.closest('[data-close]') || e.target === overlay) closeAll();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });

  /* ---------------- Declarative tabs ([data-tabs] wrapper, [data-tab]/[data-tab-panel]) ---------------- */
  document.querySelectorAll('[data-tabs]').forEach(group => {
    const content = document.querySelector(group.getAttribute('data-tabs')) || group.parentElement;
    group.addEventListener('click', e => {
      const t = e.target.closest('[data-tab]'); if (!t) return;
      const name = t.getAttribute('data-tab');
      group.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('tab-active', b === t));
      content.querySelectorAll('[data-tab-panel]').forEach(p => p.classList.toggle('hidden', p.getAttribute('data-tab-panel') !== name));
    });
  });
})();
