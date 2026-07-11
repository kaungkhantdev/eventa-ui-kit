/* ============================================================
   Eventa shell — double sidebar (icon rail = modules, labeled panel = sub-nav).
   Identical design to primary-ui/dashboard.html (reicon icons), injected into
   [data-layout] on every admin page and driven by <body data-page="…">.
     • Rail  = main nav (modules). The active module (the one containing the
       current page) is highlighted + its icon is filled; clicking a module
       navigates to its landing page (whose panel then opens). A module without
       an href instead swaps the panel client-side (fallback).
     • Panel = the selected module's grouped, collapsible sub-nav; the leaf
       matching data-page is highlighted. Modules with no groups hide the panel.
   Also wires: mobile drawer, dark mode (circular reveal), and the declarative
   slide-over panels / modals / tabs. Exposes window.EventaOnThemeChange(dark).
   ============================================================ */
(function () {
  const M = window.Motion || null;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = () => window.matchMedia('(min-width: 1024px)').matches;

  /* ---------------- Navigation model ---------------- */
  const MODULES = [
    { id: 'home', label: 'Home', icon: 'home', href: 'home.html' },
    { id: 'dashboard', label: 'Dashboard', icon: 'element-42', href: 'dashboard.html' },
    { id: 'events', label: 'Events', icon: 'calendar', href: 'events.html', groups: [
      { label: 'Schedule', icon: 'calendar', items: [
        { label: 'All Events',    page: 'events',       href: 'events.html' },
        { label: 'Create Event',  page: 'event-form',   href: 'event-form.html' },
        { label: 'Event Details', page: 'event-detail', href: 'event-detail.html' },
        { label: 'Agenda',        page: 'agenda',       href: 'agenda.html' },
      ]},
      { label: 'Attendees', icon: 'users', items: [
        { label: 'Registrations', page: 'registrations', href: 'registrations.html' },
        { label: 'Attendees',     page: 'attendees',     href: 'attendees.html' },
        { label: 'Check-in',      page: 'checkin',       href: 'check-in.html' },
        { label: 'Speakers',      page: 'speakers',      href: 'speakers.html' },
      ]},
    ]},
    { id: 'finance', label: 'Finance', icon: 'wallet', href: 'payments.html', groups: [
      { label: 'Transactions', icon: 'wallet', items: [
        { label: 'Payments', page: 'payments', href: 'payments.html' },
        { label: 'Payouts',  page: 'payouts',  href: 'payouts.html' },
      ]},
      { label: 'Pricing', icon: 'ticket', items: [
        { label: 'Tickets',   page: 'tickets',   href: 'tickets.html' },
        { label: 'Discounts', page: 'discounts', href: 'discounts.html' },
      ]},
    ]},
    { id: 'management', label: 'Management', icon: 'settings', bottom: true, href: 'reports.html', groups: [
      { label: 'Business', icon: 'briefcase', items: [
        { label: 'Reports',       page: 'reports',       href: 'reports.html' },
        { label: 'Notifications', page: 'notifications', href: 'notifications.html' },
        { label: 'Feedback',      page: 'feedback',      href: 'feedback.html' },
        { label: 'Settings',      page: 'settings',      href: 'settings.html' },
      ]},
      { label: 'Staff', icon: 'security-user2', items: [
        { label: 'Users', page: 'users', href: 'users.html' },
        { label: 'Roles', page: 'roles', href: '#' },
      ]},
    ]},
  ];

  const activePage = document.body.dataset.page || 'dashboard';
  function moduleOfPage(pg) {
    for (const m of MODULES) {
      if (m.id === pg) return m.id;
      if (m.groups) for (const g of m.groups) for (const it of g.items) if (it.page === pg) return m.id;
    }
    return 'dashboard';
  }
  let selectedModule = moduleOfPage(activePage);

  /* ---------------- Sidebar markup ---------------- */
  const sidenavHTML = `
    <div id="backdrop" class="fixed inset-0 z-40 hidden bg-black/40 lg:hidden"></div>
    <div id="sidenav" class="fixed inset-y-0 left-0 z-50 flex -translate-x-full transition-transform duration-300 lg:static lg:translate-x-0">
      <aside id="rail" class="relative z-30 flex w-16 shrink-0 flex-col items-center bg-[#0e0f12] py-4">
        <div class="group relative flex justify-center">
          <a href="dashboard.html" class="grid h-9 w-9 place-items-center rounded-full border border-brand/70 text-brand"><re-icon icon="ticket-star2" size="18" weight="filled"></re-icon></a>
          <span class="rail-tip">Eventa</span>
        </div>
        <div id="rail-top" class="mt-5 flex flex-col items-center gap-1.5"></div>
        <div class="mt-auto flex flex-col items-center gap-1.5 pt-4">
          <div id="rail-bottom" class="flex flex-col items-center gap-1.5"></div>
          <div class="group relative flex justify-center">
            <button id="rail-theme" type="button" class="grid h-9 w-9 place-items-center rounded-lg text-white/55 transition hover:bg-white/10 hover:text-brand"><re-icon icon="moon" size="20"></re-icon></button>
            <span class="rail-tip">Theme</span>
          </div>
          <div class="group relative flex justify-center">
            <a href="../auth/login.html" class="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand to-emerald-400 text-[11px] font-semibold text-white">HN</a>
            <span class="rail-tip">Harper Nelson</span>
          </div>
        </div>
      </aside>
      <aside id="panel" class="hidden w-64 shrink-0 flex-col border-r border-hair bg-surface">
        <div class="mt-4 flex h-9 items-center px-4">
          <h2 id="panel-head" class="text-[17px] font-bold tracking-tight text-ink"></h2>
        </div>
        <nav id="panel-nav" class="no-scrollbar mt-2 flex-1 space-y-1.5 overflow-y-auto px-2.5 pb-4"></nav>
      </aside>
    </div>`;

  const layout = document.querySelector('[data-layout]') || document.querySelector('.flex.min-h-screen') || document.body.firstElementChild;
  layout.insertAdjacentHTML('afterbegin', sidenavHTML);

  const backdrop = document.getElementById('backdrop');
  const sidenav = document.getElementById('sidenav');
  const rail = document.getElementById('rail');
  const panel = document.getElementById('panel');
  const railTop = document.getElementById('rail-top');
  const railBottom = document.getElementById('rail-bottom');
  const panelHead = document.getElementById('panel-head');
  const panelNav = document.getElementById('panel-nav');

  /* ---------------- Render: icon rail (modules) ---------------- */
  function railBtn(m) {
    const on = m.id === selectedModule;
    const cls = on
      ? 'grid h-9 w-9 place-items-center rounded-lg bg-brand-soft text-brand transition'
      : 'grid h-9 w-9 place-items-center rounded-lg text-white/55 transition hover:bg-white/10 hover:text-brand';
    const inner = `<re-icon icon="${m.icon}" size="18"${on ? ' weight="filled"' : ''}></re-icon>`;
    const control = m.href
      ? `<a href="${m.href}" class="${cls}">${inner}</a>`
      : `<button type="button" data-mod="${m.id}" class="${cls}">${inner}</button>`;
    return `<div class="group relative flex justify-center">${control}<span class="rail-tip">${m.label}</span></div>`;
  }
  function renderRail() {
    railTop.innerHTML = MODULES.filter(m => !m.bottom).map(railBtn).join('');
    railBottom.innerHTML = MODULES.filter(m => m.bottom).map(railBtn).join('');
  }

  /* ---------------- Render: labeled panel (sub-nav) ---------------- */
  function panelLeaf(it) {
    const on = it.page === activePage;
    const cls = on
      ? 'block rounded-lg py-1.5 pl-9 pr-2.5 text-[13px] font-semibold bg-brand-soft text-brand'
      : 'block rounded-lg py-1.5 pl-9 pr-2.5 text-[13px] font-medium text-muted transition hover:bg-brand-soft/60 hover:text-brand';
    return `<li><a href="${it.href}" class="${cls}">${it.label}</a></li>`;
  }
  function wireAccordion() {
    panelNav.querySelectorAll('[data-acc]').forEach(acc => {
      const btn = acc.querySelector('[data-acc-toggle]');
      const body = acc.querySelector('[data-acc-body]');
      const chev = acc.querySelector('[data-acc-chevron]');
      btn.onclick = () => {
        const open = !body.classList.contains('hidden');
        body.classList.toggle('hidden', open);
        chev.classList.toggle('rotate-180', !open);
      };
    });
  }
  function renderPanel() {
    const m = MODULES.find(x => x.id === selectedModule);
    if (!m || !m.groups || !m.groups.length) { panel.classList.add('hidden'); return; }
    panel.classList.remove('hidden');
    panelHead.textContent = m.label;
    panelNav.innerHTML = m.groups.map(g => `
      <div data-acc>
        <button type="button" data-acc-toggle class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold text-ink transition hover:bg-line">
          <re-icon icon="${g.icon}" size="17"></re-icon>${g.label}
          <re-icon data-acc-chevron icon="chevron-down" size="15" class="ml-auto rotate-180 text-muted transition-transform duration-200"></re-icon>
        </button>
        <ul data-acc-body class="mt-0.5 space-y-0.5">${g.items.map(panelLeaf).join('')}</ul>
      </div>`).join('');
    wireAccordion();
  }
  function selectModule(id) { selectedModule = id; renderRail(); renderPanel(); }

  renderRail();
  renderPanel();

  // rail: module buttons switch the panel; Home / Dashboard links navigate
  rail.addEventListener('click', e => {
    const b = e.target.closest('[data-mod]');
    if (b) { e.preventDefault(); selectModule(b.dataset.mod); }
  });

  /* ---------------- Mobile drawer ---------------- */
  function openDrawer() {
    sidenav.classList.remove('-translate-x-full');
    backdrop.classList.remove('hidden');
    if (M && !reduce) M.animate(backdrop, { opacity: [0, 1] }, { duration: 0.25 });
  }
  function closeDrawer() {
    sidenav.classList.add('-translate-x-full');
    if (M && !reduce) { M.animate(backdrop, { opacity: [1, 0] }, { duration: 0.22 }); setTimeout(() => backdrop.classList.add('hidden'), 230); }
    else backdrop.classList.add('hidden');
  }
  const menuBtn = document.getElementById('btn-menu');
  if (menuBtn) menuBtn.addEventListener('click', openDrawer);
  backdrop.addEventListener('click', closeDrawer);
  // close on a real navigation link (leaf / logo / avatar), not on a module-switch button
  sidenav.addEventListener('click', e => { if (!isDesktop() && e.target.closest('a[href]:not([href="#"])')) closeDrawer(); });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', e => {
    if (e.matches) sidenav.classList.remove('-translate-x-full');
    else sidenav.classList.add('-translate-x-full');
    backdrop.classList.add('hidden');
  });

  /* ---------------- Dark mode (circular reveal, robust) ---------------- */
  const THEME_KEY = 'eventa-theme';
  function applyTheme(dark) {
    document.documentElement.classList.toggle('dark', dark);
    const ic = document.querySelector('#rail-theme re-icon');
    if (ic) ic.setAttribute('icon', dark ? 'sun' : 'moon');
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
    setTimeout(() => ov.remove(), 650);
  }
  const themeBtn = document.getElementById('rail-theme');
  themeBtn.addEventListener('click', () => toggleTheme(themeBtn));
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
