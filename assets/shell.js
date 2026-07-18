/* ============================================================
   Eventa shell — double sidebar (icon rail = modules, labeled panel = sub-nav).
   Injected into [data-layout] on every admin page and driven by
   <body data-page="…">. Icons are Hugeicons (hgi-stroke).
     • Rail  = main nav (modules). The active module (the one containing the
       current page) is highlighted (bg-brand-soft text-brand); clicking a module
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
    { id: 'home', label: 'Home', icon: 'hgi-home-01', href: 'home.html' },
    { id: 'dashboard', label: 'Dashboard', icon: 'hgi-dashboard-speed-02', href: 'dashboard.html' },
    { id: 'events', label: 'Events', icon: 'hgi-calendar-03', href: 'events.html', groups: [
      { label: 'Manage', icon: 'hgi-calendar-03', items: [
        { label: 'All events',   page: 'events',     href: 'events.html' },
        { label: 'Create event', page: 'event-form', href: 'event-form.html' },
      ]},
      { label: 'Ticketing', icon: 'hgi-ticket-01', items: [
        { label: 'Tickets',   page: 'tickets',   href: 'tickets.html' },
        { label: 'Discounts', page: 'discounts', href: 'discounts.html' },
      ]},
      { label: 'Program', icon: 'hgi-mic-01', items: [
        { label: 'Agenda',    page: 'agenda',   href: 'agenda.html' },
        { label: 'Speakers',  page: 'speakers', href: 'speakers.html' },
      ]},
      { label: 'Content', icon: 'hgi-browser', items: [
        { label: 'Landing pages',  page: 'landing-pages',    href: 'landing-pages.html' },
        { label: 'Categories',     page: 'event-categories', href: 'event-categories.html' },
      ]},
      { label: 'Attendees', icon: 'hgi-user-multiple', items: [
        { label: 'Registrations', page: 'registrations', href: 'registrations.html' },
        { label: 'Attendees',     page: 'attendees',     href: 'attendees.html' },
        { label: 'Check-in',      page: 'checkin',       href: 'check-in.html' },
      ]},
    ]},
    { id: 'checkin-tool', label: 'Check-in tool', icon: 'hgi-qr-code-01', href: 'check-in-tool.html' },
    { id: 'finance', label: 'Finance', icon: 'hgi-wallet-01', href: 'payments.html', groups: [
      { label: 'Transactions', icon: 'hgi-wallet-01', items: [
        { label: 'Payments', page: 'payments', href: 'payments.html' },
        { label: 'Payouts',  page: 'payouts',  href: 'payouts.html' },
      ]},
      { label: 'Tax & invoicing', icon: 'hgi-invoice-01', items: [
        { label: 'Invoices', page: 'invoices', href: 'invoices.html' },
        { label: 'Taxes',    page: 'taxes',    href: 'taxes.html' },
      ]},
    ]},
    { id: 'reports', label: 'Insights', icon: 'hgi-analytics-up', href: 'reports.html', groups: [
      { label: 'Summary', icon: 'hgi-analytics-up', items: [
        { label: 'Overview', page: 'reports', href: 'reports.html' },
      ]},
      { label: 'Financial', icon: 'hgi-wallet-01', items: [
        { label: 'Income',       page: 'reports-income',       href: 'reports-income.html' },
        { label: 'Transactions', page: 'reports-transactions', href: 'reports-transactions.html' },
        { label: 'Payouts',      page: 'reports-payouts',      href: 'reports-payouts.html' },
      ]},
      { label: 'Attendees', icon: 'hgi-user-multiple', items: [
        { label: 'Registrations', page: 'reports-registrations', href: 'reports-registrations.html' },
        { label: 'Attendance',    page: 'reports-attendance',    href: 'reports-attendance.html' },
      ]},
      { label: 'Marketing', icon: 'hgi-discount-tag-01', items: [
        { label: 'Discounts', page: 'reports-discounts', href: 'reports-discounts.html' },
      ]},
      { label: 'Events', icon: 'hgi-calendar-03', items: [
        { label: 'Event performance', page: 'reports-events', href: 'reports-events.html' },
      ]},
    ]},
    { id: 'engagement', label: 'Engagement', icon: 'hgi-megaphone-01', href: 'notifications.html', groups: [
      { label: 'Activity', icon: 'hgi-notification-03', items: [
        { label: 'Notifications', page: 'notifications', href: 'notifications.html' },
      ]},
      { label: 'Messaging', icon: 'hgi-mail-01', items: [
        { label: 'Templates',     page: 'messaging-templates',     href: 'messaging-templates.html' },
        { label: 'Announcements', page: 'messaging-announcements', href: 'messaging-announcements.html' },
        { label: 'Delivery log',  page: 'messaging-log',           href: 'messaging-log.html' },
      ]},
      { label: 'Feedback', icon: 'hgi-comment-01', items: [
        { label: 'Overview', page: 'feedback', href: 'feedback.html' },
      ]},
    ]},
    { id: 'settings', label: 'Settings', icon: 'hgi-settings-01', href: 'settings-profile.html', bottom: true, groups: [
      { label: 'Account', icon: 'hgi-user-circle', items: [
        { label: 'Profile',      page: 'settings-profile',       href: 'settings-profile.html' },
        { label: 'Security',     page: 'settings-security',      href: 'settings-security.html' },
        { label: 'Notification preferences', page: 'settings-notifications', href: 'settings-notifications.html' },
      ]},
      { label: 'Workspace', icon: 'hgi-building-03', items: [
        { label: 'Organization', page: 'settings-organization', href: 'settings-organization.html' },
        { label: 'Payments',     page: 'settings-payments',     href: 'settings-payments.html' },
      ]},
      { label: 'Access', icon: 'hgi-shield-user', items: [
        { label: 'Users', page: 'users', href: 'users.html' },
        { label: 'Roles', page: 'roles', href: 'roles.html' },
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
      <aside id="rail" class="relative z-30 flex w-16 shrink-0 flex-col items-center bg-[#0e0f12] py-4 dark:bg-[#101613]">
        <div class="group relative flex justify-center">
          <a href="dashboard.html" class="grid h-9 w-9 place-items-center rounded-full border border-white/40 text-[13px] font-extrabold tracking-tight text-white">EC</a>
          <span class="rail-tip">Eventa Co., Ltd.</span>
        </div>
        <div id="rail-top" class="mt-5 flex flex-col items-center gap-1.5"></div>
        <div class="mt-auto flex flex-col items-center gap-2 pt-4">
          <div id="rail-bottom" class="flex flex-col items-center gap-1.5"></div>
          <div class="group relative flex justify-center">
            <button id="rail-theme" type="button" class="grid h-9 w-9 place-items-center rounded-lg text-white/55 transition hover:bg-white/10 hover:text-brand"><i class="hgi-stroke hgi-moon-02 text-[20px]"></i></button>
            <span class="rail-tip">Change mode</span>
          </div>
          <div class="group relative mt-1 flex justify-center">
            <span class="grid h-9 w-9 place-items-center text-brand"><span class="brand-logo h-[13px] w-[24px]"></span></span>
            <span class="rail-tip">Eventa for Business · v1.0.0.0</span>
          </div>
        </div>
      </aside>
      <aside id="panel" class="hidden w-64 shrink-0 flex flex-col border-r border-hair bg-surface">
        <div class="mt-4 flex h-9 items-center px-4">
          <h2 id="panel-head" class="text-[17px] font-bold tracking-tight text-ink"></h2>
        </div>
        <nav id="panel-nav" class="no-scrollbar mt-2 flex-1 space-y-1.5 overflow-y-auto px-2.5 pb-4"></nav>
        <div class="border-t border-hair px-4 py-3">
          <p class="text-[12px] font-semibold text-ink">Eventa for Business</p>
          <p class="text-[11px] text-muted tnum">Version 1.0.0.0</p>
        </div>
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
      ? 'grid h-9 w-9 place-items-center rounded-lg bg-brand text-white shadow-sm transition'
      : 'grid h-9 w-9 place-items-center rounded-lg text-white/55 transition hover:bg-white/10 hover:text-brand';
    const inner = `<i class="hgi-stroke ${m.icon} text-[18px]"></i>`;
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
          <i class="hgi-stroke ${g.icon} text-[17px]"></i>${g.label}
          <i data-acc-chevron class="hgi-stroke hgi-arrow-down-01 text-[15px] ml-auto rotate-180 text-muted transition-transform duration-200"></i>
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
    const ic = document.querySelector('#rail-theme i');
    if (ic) ic.className = 'hgi-stroke ' + (dark ? 'hgi-sun-03' : 'hgi-moon-02') + ' text-[20px]';
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

  /* ---------------- Header popovers: notifications + profile ---------------- */
  const popCls = 'pop hidden fixed z-[70] max-w-[calc(100vw-16px)] overflow-hidden rounded-2xl bg-surface shadow-xl ring-1 ring-black/5 dark:ring-white/10';
  const notifItem = (icon, tint, title, body, time, unread) => `
    <a href="notifications.html" class="flex gap-3 px-4 py-2.5 transition hover:bg-line">
      <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg ${tint}"><i class="hgi-stroke ${icon} text-[17px]"></i></span>
      <div class="min-w-0 flex-1"><p class="text-[13px] leading-snug text-ink"><span class="font-semibold">${title}</span> · ${body}</p><p class="mt-0.5 text-[11px] text-muted">${time}</p></div>
      ${unread ? '<span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand"></span>' : ''}
    </a>`;
  const menuLink = (href, icon, label, extra = '') => `
    <a href="${href}" class="flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium text-ink transition hover:bg-line"><i class="hgi-stroke ${icon} text-[17px] text-muted"></i>${label}${extra}</a>`;
  const popHTML = `
    <div id="eventa-notif-pop" class="${popCls} w-[340px]">
      <div class="flex items-center justify-between border-b border-hair px-4 py-3">
        <div class="flex items-center gap-2"><h3 class="text-[14px] font-bold text-ink">Notifications</h3><span class="grid h-5 min-w-[20px] place-items-center rounded-full bg-brand-soft px-1.5 text-[11px] font-semibold text-brand">3</span></div>
        <button class="text-[12px] font-semibold text-brand hover:underline">Mark all read</button>
      </div>
      <div class="max-h-[340px] overflow-y-auto py-1">
        ${notifItem('hgi-user-add-01', 'bg-brand-soft text-brand', 'New registration', 'Anong Pattana joined Tech Summit 2026', '2 min ago', true)}
        ${notifItem('hgi-wallet-01', 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300', 'Payment received', '฿1,250 from Ploy Srisai', '18 min ago', true)}
        ${notifItem('hgi-ticket-01', 'bg-amber-50 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300', 'Almost sold out', 'VIP Access is 92% sold', '1 hr ago', true)}
        ${notifItem('hgi-star', 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300', 'New feedback', 'Bangkok Jazz Night rated 4.8★', 'Yesterday', false)}
      </div>
      <a href="notifications.html" class="block border-t border-hair px-4 py-2.5 text-center text-[13px] font-semibold text-brand hover:bg-line">View all notifications</a>
    </div>
    <div id="eventa-profile-pop" class="${popCls} w-[300px]">
      <div class="flex items-center gap-3 p-4">
        <div class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-emerald-400 text-[14px] font-semibold text-white">HN</div>
        <div class="min-w-0"><p class="truncate text-[14px] font-bold text-ink">Harper Nelson</p><p class="truncate text-[12px] text-muted">Event Manager at Eventa</p></div>
      </div>
      <div class="px-2 pb-1">
        ${menuLink('settings-profile.html', 'hgi-user-circle', 'My Account')}
        ${menuLink('settings-organization.html', 'hgi-building-06', 'Company settings')}
        ${menuLink('#', 'hgi-crown', 'Upgrade to Pro', '<span class="ml-auto rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-600 dark:bg-violet-500/20 dark:text-violet-300">Optimized for business</span>')}
      </div>
      <div class="mx-3 my-1 border-t border-hair"></div>
      <div class="px-2 py-1">
        <div class="flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium text-ink"><i class="hgi-stroke hgi-test-tube-01 text-[17px] text-muted"></i>Beta Features<span class="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-semibold text-brand">New</span><button type="button" data-toggle class="relative ml-auto h-5 w-9 shrink-0 rounded-full bg-line transition-colors"><span class="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform"></span></button></div>
        ${menuLink('#', 'hgi-megaphone-01', "What's New")}
      </div>
      <div class="mx-3 my-1 border-t border-hair"></div>
      <div class="px-2 py-1">
        ${menuLink('../auth/login.html', 'hgi-logout-03', 'Log out')}
      </div>
      <div class="m-2 rounded-xl bg-violet-50 p-3 dark:bg-violet-500/10">
        <span class="grid h-9 w-9 place-items-center rounded-lg bg-violet-500 text-white"><i class="hgi-stroke hgi-sparkles text-[18px]"></i></span>
        <p class="mt-2.5 text-[13px] font-semibold leading-snug text-ink">Get everything you need to run your events like a pro</p>
        <a href="#" class="mt-1.5 inline-block text-[13px] font-bold text-violet-600 hover:underline dark:text-violet-300">Subscribe Now</a>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', popHTML);
  const notifPop = document.getElementById('eventa-notif-pop');
  const profilePop = document.getElementById('eventa-profile-pop');
  const pops = [notifPop, profilePop].filter(Boolean);
  const closePops = () => pops.forEach(p => p.classList.add('hidden'));
  function togglePop(pop, trigger) {
    const isOpen = !pop.classList.contains('hidden');
    closePops();
    if (!isOpen) {
      const r = trigger.getBoundingClientRect();
      pop.style.top = (r.bottom + 8) + 'px';
      pop.style.right = Math.max(8, window.innerWidth - r.right) + 'px';
      pop.classList.remove('hidden');
    }
  }
  document.querySelectorAll('button[title="Notifications"]').forEach(bell => {
    bell.addEventListener('click', e => { e.stopPropagation(); if (notifPop) togglePop(notifPop, bell); });
    const profile = bell.nextElementSibling;
    if (profile && profilePop) {
      profile.classList.add('cursor-pointer');
      profile.addEventListener('click', e => { e.stopPropagation(); togglePop(profilePop, profile); });
    }
  });
  if (profilePop) {
    const bt = profilePop.querySelector('[data-toggle]');
    if (bt) bt.addEventListener('click', e => {
      e.stopPropagation();
      const on = bt.classList.toggle('bg-brand'); bt.classList.toggle('bg-line', !on);
      bt.firstElementChild.classList.toggle('translate-x-4', on);
    });
  }
  pops.forEach(p => p.addEventListener('click', e => {
    if (e.target.closest('[data-toggle]')) return;
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href === '#') { e.preventDefault(); closePops(); }
  }));
  document.addEventListener('click', e => { if (!e.target.closest('.pop')) closePops(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePops(); });

  /* ---------------- Searchable event picker ----------------
     A plain <select> can't scale to thousands of events (no search, whole list in
     the DOM, awful on mobile). This enhances any <select data-event-picker> into a
     type-to-filter combobox. The native <select> stays in the DOM (hidden) as the
     value holder, so existing page code — select.value + 'change' events — is
     untouched. `data-event-picker="catalog"` first seeds the select from a shared
     catalog so search is actually useful; a leading "All events"/empty option is
     preserved for filter selects. At real scale, swap the local filter for a
     debounced server query — same UI. */
  const EVENT_CATALOG = [
    { name: 'Tech Summit 2026',          date: 'Jul 18, 2026', status: 'Live' },
    { name: 'Bangkok Jazz Night',        date: 'Jul 12, 2026', status: 'Live' },
    { name: 'Thai Street Food Festival', date: 'Aug 3, 2026',  status: 'Upcoming' },
    { name: 'UX Bangkok Meetup',         date: 'Aug 20, 2026', status: 'Upcoming' },
    { name: 'Sunrise Yoga Retreat',      date: 'Sep 11, 2026', status: 'Upcoming' },
    { name: 'DevOps World Bangkok',      date: 'Sep 3, 2026',  status: 'Upcoming' },
    { name: 'Founders Coffee Connect',   date: 'Sep 5, 2026',  status: 'Upcoming' },
    { name: 'AI Prototyping Bootcamp',   date: 'Sep 9, 2026',  status: 'Upcoming' },
    { name: 'Green Future Art Expo',     date: 'Sep 14, 2026', status: 'Upcoming' },
    { name: 'Marathon for Mangroves',    date: 'Sep 18, 2026', status: 'Upcoming' },
    { name: 'Indie Sound Night',         date: 'Sep 21, 2026', status: 'Live' },
    { name: 'Product Strategy Masterclass', date: 'Sep 24, 2026', status: 'Upcoming' },
    { name: 'Startup Pitch Arena',       date: 'Sep 27, 2026', status: 'Upcoming' },
    { name: 'Cloud Security Summit',     date: 'Oct 1, 2026',  status: 'Upcoming' },
    { name: 'Watercolor Weekend',        date: 'Oct 4, 2026',  status: 'Upcoming' },
    { name: 'Hearts United Benefit Ball',date: 'Oct 8, 2026',  status: 'Upcoming' },
    { name: 'Sunset Trail Run',          date: 'Oct 11, 2026', status: 'Upcoming' },
    { name: 'Bangkok Design Biennale',   date: 'Oct 15, 2026', status: 'Live' },
    { name: 'Jazz on the Rooftop',       date: 'Oct 18, 2026', status: 'Upcoming' },
    { name: 'Data Science Forum',        date: 'Oct 22, 2026', status: 'Upcoming' },
    { name: 'UX Research Roundtable',    date: 'Oct 25, 2026', status: 'Upcoming' },
    { name: 'Women in Tech Mixer',       date: 'Oct 29, 2026', status: 'Upcoming' },
    { name: 'Mindful Movement Retreat',  date: 'Nov 2, 2026',  status: 'Upcoming' },
    { name: 'Rapid Prototyping Lab',     date: 'Nov 6, 2026',  status: 'Upcoming' },
    { name: 'Charity Gala Under the Stars', date: 'Nov 9, 2026', status: 'Upcoming' },
    { name: 'Neon Nights Festival',      date: 'Nov 13, 2026', status: 'Live' },
    { name: 'Enterprise Cloud Expo',     date: 'Nov 17, 2026', status: 'Upcoming' },
    { name: 'Leadership in Practice',    date: 'Nov 20, 2026', status: 'Upcoming' },
    { name: 'Corporate Leadership Summit', date: 'Dec 20, 2025', status: 'Completed' },
    { name: 'Summer Music Festival',     date: 'Jun 15, 2025', status: 'Completed' },
    { name: 'Product Launch Mixer',      date: 'May 2, 2025',  status: 'Completed' },
    { name: 'Winter Code Conference',    date: 'Jan 18, 2025', status: 'Completed' },
    { name: 'Design Systems Workshop',   date: 'Feb 12, 2025', status: 'Completed' },
    { name: 'Love & Give Charity Dinner',date: 'Feb 14, 2025', status: 'Completed' },
    { name: 'Spring Wellness Retreat',   date: 'Mar 8, 2025',  status: 'Completed' },
    { name: 'Contemporary Art Showcase', date: 'Mar 22, 2025', status: 'Completed' },
    { name: 'Frontend Masters Seminar',  date: 'Apr 5, 2025',  status: 'Completed' },
    { name: 'Startup Growth Summit',     date: 'Apr 19, 2025', status: 'Completed' },
    { name: 'Investor Networking Night', date: 'May 16, 2025', status: 'Completed' },
    { name: 'Summer Beats Block Party',  date: 'Jul 19, 2025', status: 'Completed' },
  ];
  const CAT_META = {}; EVENT_CATALOG.forEach(e => { CAT_META[e.name] = e; });
  const STATUS_DOT = { Live: 'bg-brand', Upcoming: 'bg-blue-500', Completed: 'bg-gray-400', Draft: 'bg-amber-500' };
  function epEsc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  let epOpenPop = null;
  function epCloseOpen() { if (epOpenPop) { epOpenPop.remove(); epOpenPop = null; } }

  function enhanceEventPickers() {
    document.querySelectorAll('select[data-event-picker]').forEach(function (sel) {
      if (sel.dataset.epReady) return; sel.dataset.epReady = '1';

      const first = sel.options[0];
      const allOpt = first && (first.value === '' || /all events/i.test(first.textContent)) ? first.cloneNode(true) : null;

      if (sel.dataset.eventPicker === 'catalog') {
        const keep = sel.value || (sel.options[sel.selectedIndex] || {}).textContent;
        sel.innerHTML = (allOpt ? '<option value="' + epEsc(allOpt.value) + '">' + epEsc(allOpt.textContent) + '</option>' : '') +
          EVENT_CATALOG.map(e => '<option>' + epEsc(e.name) + '</option>').join('');
        const match = Array.prototype.find.call(sel.options, o => o.value === keep || o.textContent === keep);
        sel.value = match ? match.value : (allOpt ? allOpt.value : sel.options[0].textContent);
      }

      // trigger button reuses the select's own classes for visual parity
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.setAttribute('data-ep-trigger', '');
      trigger.className = sel.className + ' inline-flex items-center text-left';
      const epLabelSpan = document.createElement('span');
      epLabelSpan.className = 'truncate';
      trigger.appendChild(epLabelSpan);
      const setLabel = () => { epLabelSpan.textContent = (sel.options[sel.selectedIndex] || {}).textContent || 'Select event'; };
      setLabel();
      sel.classList.add('hidden');
      sel.parentNode.insertBefore(trigger, sel);

      function optionRows() {
        return Array.prototype.map.call(sel.options, function (o) {
          const meta = CAT_META[o.textContent];
          return { label: o.textContent, value: o.value, isAll: allOpt && o.value === allOpt.value && o.textContent === allOpt.textContent, meta: meta };
        });
      }

      function openPop() {
        epCloseOpen();
        const rows = optionRows();
        const pop = document.createElement('div');
        pop.className = 'fixed z-[70] w-[300px] max-w-[calc(100vw-24px)] overflow-hidden rounded-xl border border-hair bg-surface shadow-xl';
        pop.innerHTML =
          '<div class="border-b border-hair p-2">' +
            '<div class="relative"><i class="hgi-stroke hgi-search-01 text-[15px] pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"></i>' +
            '<input data-ep-search type="text" placeholder="Search events…" class="h-9 w-full rounded-lg bg-canvas pl-8 pr-2.5 text-[13px] text-ink placeholder:text-muted focus:outline-none focus:ring-4 focus:ring-brand/15"></div>' +
          '</div>' +
          '<div data-ep-list class="max-h-[280px] overflow-y-auto p-1.5"></div>';
        document.body.appendChild(pop);
        epOpenPop = pop;

        const r = trigger.getBoundingClientRect();
        let left = r.left; if (left + 300 > window.innerWidth - 12) left = window.innerWidth - 12 - 300;
        pop.style.left = Math.max(12, left) + 'px';
        let top = r.bottom + 6;
        if (top + 340 > window.innerHeight && r.top - 340 > 0) top = r.top - 6 - pop.offsetHeight;
        pop.style.top = top + 'px';

        const listEl = pop.querySelector('[data-ep-list]');
        const searchEl = pop.querySelector('[data-ep-search]');
        let active = -1, view = rows;

        function paint(q) {
          const s = (q || '').trim().toLowerCase();
          view = rows.filter(r => !s || r.label.toLowerCase().indexOf(s) !== -1);
          active = view.findIndex(r => r.value === sel.value && r.label === (sel.options[sel.selectedIndex] || {}).textContent);
          if (active < 0) active = view.length ? 0 : -1;
          listEl.innerHTML = view.length ? view.map(function (r, i) {
            const on = r.value === sel.value && r.label === (sel.options[sel.selectedIndex] || {}).textContent;
            const meta = r.meta ? '<span class="ml-auto flex shrink-0 items-center gap-1.5 whitespace-nowrap pl-2 text-[11px] text-muted"><span class="tnum">' + epEsc(r.meta.date) + '</span><span class="h-1.5 w-1.5 rounded-full ' + (STATUS_DOT[r.meta.status] || 'bg-gray-400') + '"></span></span>' : '';
            return '<button type="button" data-ep-i="' + i + '" class="ep-row flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] ' + (on ? 'bg-brand-soft font-semibold text-brand' : 'font-medium text-ink hover:bg-line') + '">' +
              '<i class="hgi-stroke hgi-tick-02 text-[14px] ' + (on ? 'text-brand' : 'invisible') + '"></i>' +
              '<span class="truncate">' + epEsc(r.label) + '</span>' + meta + '</button>';
          }).join('') : '<div class="px-2.5 py-6 text-center text-[13px] text-muted">No events match.</div>';
          highlight();
        }
        function highlight() {
          Array.prototype.forEach.call(listEl.querySelectorAll('.ep-row'), function (el, i) {
            el.classList.toggle('ring-2', i === active); el.classList.toggle('ring-inset', i === active); el.classList.toggle('ring-brand/40', i === active);
          });
        }
        function choose(i) {
          const row = view[i]; if (!row) return;
          const idx = Array.prototype.findIndex.call(sel.options, o => o.value === row.value && o.textContent === row.label);
          if (idx >= 0) sel.selectedIndex = idx;
          setLabel();
          sel.dispatchEvent(new Event('change', { bubbles: true }));
          epCloseOpen(); trigger.focus();
        }
        listEl.addEventListener('click', e => { const b = e.target.closest('[data-ep-i]'); if (b) choose(+b.dataset.epI); });
        listEl.addEventListener('mousemove', e => { const b = e.target.closest('[data-ep-i]'); if (b) { active = +b.dataset.epI; highlight(); } });
        searchEl.addEventListener('input', () => paint(searchEl.value));
        searchEl.addEventListener('keydown', e => {
          if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(view.length - 1, active + 1); highlight(); scrollActive(); }
          else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(0, active - 1); highlight(); scrollActive(); }
          else if (e.key === 'Enter') { e.preventDefault(); choose(active); }
          else if (e.key === 'Escape') { e.preventDefault(); epCloseOpen(); trigger.focus(); }
        });
        function scrollActive() { const el = listEl.querySelectorAll('.ep-row')[active]; if (el) el.scrollIntoView({ block: 'nearest' }); }
        paint('');
        searchEl.focus();
      }

      trigger.addEventListener('click', function (e) { e.stopPropagation(); if (epOpenPop) epCloseOpen(); else openPop(); });
    });
  }
  document.addEventListener('click', e => { if (epOpenPop && !e.target.closest('.fixed.z-\\[70\\]') && !e.target.closest('[data-ep-trigger]')) epCloseOpen(); });
  window.addEventListener('resize', epCloseOpen);
  enhanceEventPickers();
  window.EventaEnhanceEventPickers = enhanceEventPickers; // for panels/tabs that inject selects later
  // event metadata lookup for pages that headline the event (name → {date, status, dot})
  window.EventaEventMeta = function (name) {
    const m = CAT_META[name];
    return m ? { name: m.name, date: m.date, status: m.status, dot: STATUS_DOT[m.status] || 'bg-gray-400' } : null;
  };
})();
