(() => {
  const start = '2026-11-09';
  const end = '2026-12-31';
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  if (today < start || today > end || document.getElementById('christmas-effects-control')) return;

  const preferenceKey = 'bs-christmas-effects-2026';
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = new URL('christmas-effects.css?v=1', document.currentScript.src).href;
  document.head.appendChild(stylesheet);

  const scene = document.createElement('div');
  scene.className = 'christmas-effects-scene';
  scene.setAttribute('aria-hidden', 'true');
  const decorations = ['❄', '❅', '❆', '🎄', '🍬', '🔔', '✦'];
  const total = matchMedia('(max-width: 640px)').matches ? 18 : 32;
  for (let index = 0; index < total; index += 1) {
    const item = document.createElement('span');
    item.className = 'christmas-fall-item';
    item.textContent = decorations[index % decorations.length];
    item.style.setProperty('--left', `${Math.round(Math.random() * 100)}%`);
    item.style.setProperty('--size', `${16 + Math.round(Math.random() * 16)}px`);
    item.style.setProperty('--delay', `${-(Math.random() * 16).toFixed(1)}s`);
    item.style.setProperty('--duration', `${11 + Math.round(Math.random() * 10)}s`);
    item.style.setProperty('--drift', `${-28 + Math.round(Math.random() * 56)}px`);
    item.style.setProperty('--opacity', `${0.35 + Math.random() * 0.45}`);
    scene.appendChild(item);
  }
  document.body.appendChild(scene);

  const control = document.createElement('button');
  control.id = 'christmas-effects-control';
  control.className = 'christmas-effects-control';
  control.type = 'button';
  control.innerHTML = '<span class="christmas-effects-control-icon" aria-hidden="true">✦</span><span class="christmas-effects-control-label"></span>';
  control.setAttribute('aria-pressed', 'true');
  control.setAttribute('aria-label', 'Turn festive effects off');
  document.body.appendChild(control);

  const label = control.querySelector('.christmas-effects-control-label');
  const apply = enabled => {
    document.body.classList.toggle('christmas-effects-enabled', enabled);
    control.classList.toggle('is-off', !enabled);
    control.setAttribute('aria-pressed', String(enabled));
    control.setAttribute('aria-label', enabled ? 'Turn festive effects off' : 'Turn festive effects on');
    label.textContent = enabled ? 'Festive effects: On' : 'Festive effects: Off';
  };
  let enabled = true;
  try { enabled = localStorage.getItem(preferenceKey) !== 'off'; } catch {}
  apply(enabled);
  control.addEventListener('click', () => {
    enabled = !enabled;
    try { localStorage.setItem(preferenceKey, enabled ? 'on' : 'off'); } catch {}
    apply(enabled);
  });
})();
