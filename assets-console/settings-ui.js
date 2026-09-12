/* Eventa · shared settings-page behaviour -------------------------------------
   Extracted from the old tabbed settings.html when Settings was split into one
   page per section (Account / Workspace / Access). Every handler is delegated
   and guarded, so including this on a settings page that lacks the markup is a
   harmless no-op.

   Handles:
     [data-toggle]                 — the pill toggle switches (preferences, payments)
     [data-reveal]                 — show/hide a secret key input
     [data-mode-toggle] [data-mode]— Stripe test/live mode key swap + connection badge
----------------------------------------------------------------------------- */
(function () {
  document.addEventListener('click', function (e) {
    // toggle switches
    var t = e.target.closest('[data-toggle]');
    if (t) {
      var on = t.classList.contains('bg-brand');
      t.classList.toggle('bg-brand', !on);
      t.classList.toggle('bg-line', on);
      var dot = t.querySelector('span');
      if (dot) dot.classList.toggle('translate-x-4', !on);
      return;
    }
    // reveal secret key
    var r = e.target.closest('[data-reveal]');
    if (r) {
      var input = r.parentElement.querySelector('input');
      var icon = r.querySelector('i');
      if (input) {
        var hidden = input.type === 'password';
        input.type = hidden ? 'text' : 'password';
        if (icon)
          icon.className = 'hgi-stroke ' + (hidden ? 'hgi-view-off' : 'hgi-view') + ' text-[16px]';
      }
      return;
    }
  });

  // test / live mode — swaps which set of keys is shown
  var banner = document.getElementById('test-banner');
  document.querySelectorAll('[data-mode-toggle] [data-mode]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var mode = btn.getAttribute('data-mode');
      document.querySelectorAll('[data-mode-toggle] [data-mode]').forEach(function (b) {
        b.classList.toggle('active', b === btn);
      });
      if (banner) banner.classList.toggle('hidden', mode !== 'test');
      document.querySelectorAll('[data-mode-label]').forEach(function (l) {
        l.textContent = mode === 'test' ? 'Test mode' : 'Live mode';
      });
      document.querySelectorAll('[data-key-field]').forEach(function (f) {
        f.value = f.getAttribute('data-' + mode) || '';
        if (f.hasAttribute('data-secret')) f.type = 'password';
      });
      var pub = document.querySelector('[data-key-field]:not([data-secret])');
      var badge = document.getElementById('conn-badge');
      var connected = pub && pub.value.trim() !== '';
      if (badge) badge.className = 'badge ' + (connected ? 'badge-green' : 'badge-gray');
      if (badge)
        badge.innerHTML = connected
          ? '<i class="hgi-stroke hgi-checkmark-badge-01 text-[12px]"></i>Connected'
          : '<i class="hgi-stroke hgi-alert-circle text-[12px]"></i>Not connected';
    });
  });
})();
