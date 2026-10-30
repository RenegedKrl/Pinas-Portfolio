// Aplica o visual cartunesco no widget do Pinas Kit (ele desenha tudo em shadow DOM,
// então o CSS do site não alcança: o tema é injetado dentro de cada shadow root).
const css = `
.c { background: #F6F3EE; color: #0B0B0B; border: 3px solid #0B0B0B; border-radius: 18px; font-family: 'Inter', system-ui, sans-serif; }
h3, strong { font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-weight: 800; }
p, .ck { color: #2A2A2A; }
label { font-weight: 700; }
input, select, textarea { border: 3px solid #0B0B0B; border-radius: 12px; background: #fff; min-height: 48px; }
input:focus, select:focus, textarea:focus { border-color: #E10600; box-shadow: 3px 3px 0 #E10600; }
.ck input { min-height: 0; accent-color: #E10600; }
button.s, a.cta { background: #E10600; border: 3px solid #0B0B0B; box-shadow: 4px 4px 0 #0B0B0B; transition: transform .15s, box-shadow .15s; }
button.s:hover, a.cta:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 #0B0B0B; }
button.s:active, a.cta:active { transform: scale(.96, 1.04); box-shadow: 1px 1px 0 #0B0B0B; }
.fab { background: #25D366; border: 3px solid #0B0B0B; box-shadow: 4px 4px 0 #0B0B0B; transition: transform .2s cubic-bezier(.3,1.8,.5,1); }
.fab:hover { transform: rotate(-10deg) scale(1.08); }
.fab:active { transform: scale(.92, 1.08); }
.dot { background: #E10600; border-color: #0B0B0B; }
.bal { box-shadow: 8px 8px 0 #0B0B0B; animation: pk-pop .35s cubic-bezier(.2,1.4,.4,1); transform-origin: bottom right; }
.at span { background: #E10600; color: #fff; border: 2px solid #0B0B0B; }
.x { color: #0B0B0B; font-weight: 700; }
@keyframes pk-pop { from { transform: scale(.6) rotate(4deg); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
`;

const themed = new WeakSet<ShadowRoot>();
const apply = () => {
  document.querySelectorAll<HTMLElement>('[data-pinas], [data-pinas-form]').forEach((host) => {
    const root = host.shadowRoot;
    if (!root || themed.has(root)) return;
    const style = document.createElement('style');
    style.textContent = css;
    root.appendChild(style);
    themed.add(root);
  });
};

apply();
new MutationObserver(apply).observe(document.body, { childList: true, subtree: true });
