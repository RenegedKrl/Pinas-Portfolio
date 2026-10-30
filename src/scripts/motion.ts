import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(pointer: fine)').matches;
const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];

// rolagem suave
if (!reduced) {
  const lenis = new Lenis();
  (window as any).lenis = lenis; // janelas modais pausam a rolagem suave
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

// preloader: só na primeira visita da sessão
const pl = $('[data-preloader]');
if (pl) {
  const seen = (() => { try { return sessionStorage.getItem('pl'); } catch { return '1'; } })();
  if (seen || reduced) pl.classList.add('done');
  else {
    const c = $('[data-pl-count]')!;
    const o = { v: 0 };
    gsap.to(o, { v: 100, duration: 1.2, ease: 'power2.inOut', onUpdate: () => (c.textContent = String(Math.round(o.v))), onComplete: () => { pl.classList.add('done'); try { sessionStorage.setItem('pl', '1'); } catch {} } });
  }
}

// navbar: larga na hero, encolhe em pílula depois dela
const nav = $('[data-nav]');
const onNav = () => {
  const hero = $('.hero') as HTMLElement | null;
  const limit = hero ? hero.offsetTop + hero.offsetHeight - 80 : -1; // sem hero: já começa em pílula
  nav?.classList.toggle('pill', scrollY > limit);
};
addEventListener('scroll', onNav, { passive: true });
onNav();

// botões magnéticos
if (fine && !reduced) $$('[data-magnetic]').forEach((el) => {
  el.addEventListener('mousemove', (e) => {
    const r = el.getBoundingClientRect();
    gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * .3, y: (e.clientY - r.top - r.height / 2) * .3, duration: .3 });
  });
  el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, y: 0, duration: .5, ease: 'elastic.out(1,.4)' }));
});

// entrada do título do hero
if (!reduced) gsap.from('[data-split] .line', { yPercent: 110, opacity: 0, rotate: 4, stagger: .1, duration: .9, ease: 'back.out(1.8)', delay: pl && !pl.classList.contains('done') ? 1.3 : .1 });

// cena 3D do hero (carrega sob demanda)
const stage = $('[data-hero3d]');
if (stage) import('./hero3d').then((m) => m.mountHero3D(stage, reduced));

// marquee com velocidade ligada à rolagem
const mq = $('[data-marquee]');
if (mq && !reduced) {
  const tw = gsap.to(mq, { xPercent: -50, ease: 'none', duration: 18, repeat: -1 });
  ScrollTrigger.create({ onUpdate: (s) => gsap.to(tw, { timeScale: 1 + Math.min(Math.abs(s.getVelocity()) / 400, 5), duration: .2, overwrite: true, onComplete: () => { gsap.to(tw, { timeScale: 1, duration: .8 }); } }) });
}

// manifesto: palavras acendem com a rolagem
const mw = $$('[data-reveal-words] .w');
if (mw.length) {
  if (reduced) mw.forEach((w) => w.classList.add('on'));
  else ScrollTrigger.create({ trigger: '[data-reveal-words]', start: 'top 85%', end: 'center 70%', onUpdate: (s) => mw.forEach((w, i) => w.classList.toggle('on', i / mw.length < s.progress)) });
}

// cards problema/solução
$$('[data-flip]').forEach((b) => b.addEventListener('click', () => b.classList.toggle('on')));

// passos do método
$$('[data-step]').forEach((li) => ScrollTrigger.create({ trigger: li, start: 'top 75%', onEnter: () => li.classList.add('on'), onLeaveBack: () => li.classList.remove('on') }));
if (reduced) $$('[data-step]').forEach((li) => li.classList.add('on'));

// contadores
$$('[data-count]').forEach((el) => {
  const end = parseFloat(el.dataset.count!), dec = el.dataset.count!.includes('.') ? 1 : 0;
  const fmt = (v: number) => (el.dataset.prefix ?? '') + v.toFixed(dec).replace('.', ',') + (el.dataset.suffix ?? '');
  if (reduced) return void (el.textContent = fmt(end));
  el.textContent = fmt(0);
  const o = { v: 0 };
  ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => gsap.to(o, { v: end, duration: 1.6, ease: 'power3.out', onUpdate: () => (el.textContent = fmt(o.v)) }) });
});

// foto do sobre gira levemente com a rolagem
const spin = $('[data-spin]');
if (spin && !reduced) gsap.fromTo(spin, { rotate: -8 }, { rotate: 4, scrollTrigger: { trigger: spin, scrub: true } });

// carrossel 3D: rolagem (desktop, pin), arraste e teclado
const ring = $('[data-ring]');
if (ring) {
  const slides = $$('[data-slide]', ring);
  const n = slides.length, step = 360 / n;
  const counter = $('[data-counter]'), bar = $('[data-bar]');
  const st = { rot: 0 };
  const render = () => {
    ring.style.setProperty('--rot', `${st.rot}deg`);
    const idx = ((Math.round(-st.rot / step) % n) + n) % n;
    slides.forEach((s, i) => s.classList.toggle('active', i === idx));
    if (counter) counter.textContent = String(idx + 1).padStart(2, '0');
    if (bar) bar.style.width = `${((idx + 1) / n) * 100}%`;
  };
  const snapTo = (r: number) => gsap.to(st, { rot: Math.round(r / step) * step, duration: .6, ease: 'power3.out', onUpdate: render });
  render();

  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
    gsap.to(st, { rot: -step * (n - 1), ease: 'none', onUpdate: render, scrollTrigger: { trigger: '[data-carousel-section]', pin: true, scrub: 1, start: 'top top', end: `+=${n * 60}%`, snap: 1 / (n - 1) } });
  });

  // arraste (sobrepõe a posição; no desktop a rolagem retoma depois)
  const car = $('[data-carousel]')!;
  let x0 = 0, r0 = 0, drag = false, moved = false;
  car.addEventListener('pointerdown', (e) => { drag = true; moved = false; x0 = e.clientX; r0 = st.rot; gsap.killTweensOf(st); });
  addEventListener('pointermove', (e) => { if (!drag) return; const dx = e.clientX - x0; if (Math.abs(dx) > 5) moved = true; st.rot = r0 + dx * .25; render(); });
  addEventListener('pointerup', () => { if (drag) { drag = false; snapTo(st.rot); } });
  car.addEventListener('click', (e) => { if (moved) e.preventDefault(); }, true);
  // celular: gira sozinho a cada 2s enquanto está na tela; para 5s depois de um arraste
  mm.add('(max-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
    let visible = false, pauseUntil = 0;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: .4 });
    io.observe(car);
    const pause = () => (pauseUntil = Date.now() + 5000);
    car.addEventListener('pointerdown', pause);
    const id = setInterval(() => { if (visible && !drag && Date.now() > pauseUntil) snapTo(st.rot - step); }, 2000);
    return () => { clearInterval(id); io.disconnect(); car.removeEventListener('pointerdown', pause); };
  });
  car.tabIndex = 0;
  car.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') snapTo(st.rot - step); if (e.key === 'ArrowLeft') snapTo(st.rot + step); });
}

// depoimentos no celular: bolinhas acompanham o card visível; dica some após o primeiro arraste
const chats = $('[data-chats]') as HTMLElement | null;
if (chats) {
  const dots = $$('.dots i');
  chats.addEventListener('scroll', () => {
    const w = (chats.firstElementChild as HTMLElement).offsetWidth + 20;
    const n = Math.round(chats.scrollLeft / w);
    dots.forEach((d, i) => d.classList.toggle('on', i === n));
    $('.swipe')?.classList.add('done');
  }, { passive: true });
}
