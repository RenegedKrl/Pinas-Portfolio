// Hero 3D: cursor de brinquedo clicando num botão "COMPRAR" que solta moedas e corações.
// Visual cartoon: material toon (3 tons) + contorno preto (casca invertida).
import * as THREE from 'three';

const C = { red: 0xe10600, black: 0x0b0b0b, paper: 0xf6f3ee, yellow: 0xffd23f, graphite: 0x2a2a2a, white: 0xffffff };

export function mountHero3D(el: HTMLElement, reduced: boolean) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  el.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0.4, 33); // 11 x 3 (canvas 300%)
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(C.white, 1.2));
  const key = new THREE.DirectionalLight(C.white, 2.4);
  key.position.set(-4, 6, 8);
  scene.add(key);

  // degradê de 3 tons para o toon
  const grad = new THREE.DataTexture(new Uint8Array([90, 90, 90, 255, 175, 175, 175, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat);
  grad.minFilter = grad.magFilter = THREE.NearestFilter;
  grad.needsUpdate = true;
  const toon = (color: number, map?: THREE.Texture) => new THREE.MeshToonMaterial({ color, gradientMap: grad, map });

  // contorno: casca empurrada pela normal, desenhada por trás
  const outlineMat = new THREE.ShaderMaterial({
    uniforms: { t: { value: 0.06 } },
    vertexShader: 'uniform float t; void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position + normal * t, 1.0); }',
    fragmentShader: 'void main(){ gl_FragColor = vec4(0.043,0.043,0.043,1.0); }',
    side: THREE.BackSide,
  });
  const withOutline = (geo: THREE.BufferGeometry, mat: THREE.Material | THREE.Material[], t = 0.06) => {
    const g = new THREE.Group();
    const m = new THREE.Mesh(geo, mat);
    const o = new THREE.Mesh(geo, t === 0.06 ? outlineMat : outlineMat.clone());
    if (t !== 0.06) (o.material as THREE.ShaderMaterial).uniforms.t.value = t;
    g.add(o, m);
    return g;
  };

  const world = new THREE.Group();
  scene.add(world);

  // ---- botão COMPRAR (de frente para a câmera)
  const btn = new THREE.Group();
  btn.position.set(-0.5, 0.5, 0);
  world.add(btn);
  const base = withOutline(new THREE.CylinderGeometry(1.9, 2.0, 0.5, 64), toon(C.graphite));
  base.rotation.x = Math.PI / 2;
  btn.add(base);

  const label = document.createElement('canvas');
  label.width = label.height = 512;
  const ctx = label.getContext('2d')!;
  ctx.fillStyle = '#E10600'; ctx.fillRect(0, 0, 512, 512);
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '800 92px "Bricolage Grotesque", system-ui, sans-serif';
  ctx.save(); ctx.translate(256, 256); ctx.rotate(-Math.PI / 2); ctx.fillText('COMPRAR', 0, 6); ctx.restore();
  const labelTex = new THREE.CanvasTexture(label);
  labelTex.colorSpace = THREE.SRGBColorSpace;
  document.fonts?.ready.then(() => { ctx.fillStyle = '#E10600'; ctx.fillRect(0, 0, 512, 512); ctx.fillStyle = '#fff'; ctx.save(); ctx.translate(256, 256); ctx.rotate(-Math.PI / 2); ctx.fillText('COMPRAR', 0, 6); ctx.restore(); labelTex.needsUpdate = true; });

  const cap = withOutline(new THREE.CylinderGeometry(1.45, 1.5, 0.6, 64), [toon(C.red), toon(C.white, labelTex), toon(C.red)]);
  cap.rotation.x = Math.PI / 2;
  cap.position.z = 0.45;
  btn.add(cap);

  // ---- cursor (seta clássica extrudada, ponta na origem)
  const s = new THREE.Shape();
  [[0, 0], [0, -17], [4.2, -13.2], [7, -19.6], [10, -18.4], [7.3, -12], [12.4, -12]].forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  s.closePath();
  const arrowGeo = new THREE.ExtrudeGeometry(s, { depth: 3, bevelEnabled: true, bevelThickness: 1, bevelSize: 0.9, bevelSegments: 4, curveSegments: 4 });
  arrowGeo.scale(0.085, 0.085, 0.085);
  arrowGeo.computeVertexNormals();
  const cursor = new THREE.Group();
  const arrow = withOutline(arrowGeo, toon(C.paper), 0.07);
  arrow.rotation.z = 0.35; // inclinação clássica
  cursor.add(arrow);
  world.add(cursor);
  const rest = new THREE.Vector3(0.1, 0.2, 2.6); // ponta flutuando à frente do botão
  const hit = new THREE.Vector3(-0.35, 0.5, 0.85); // ponta encostando na tampa
  cursor.position.copy(rest);

  // ---- moedas e corações
  const heart = new THREE.Shape();
  heart.moveTo(0, -0.9);
  heart.bezierCurveTo(-1.6, 0.1, -0.9, 1.3, 0, 0.55);
  heart.bezierCurveTo(0.9, 1.3, 1.6, 0.1, 0, -0.9);
  const heartGeo = new THREE.ExtrudeGeometry(heart, { depth: 0.35, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.1, bevelSegments: 3 });
  heartGeo.center(); heartGeo.scale(0.32, 0.32, 0.32); heartGeo.computeVertexNormals();
  const coinGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.09, 32);
  const coinMat = toon(C.yellow), heartMat = toon(C.paper);
  const thin = 0.035;

  type P = { obj: THREE.Group; v: THREE.Vector3; spin: THREE.Vector3; life: number };
  const pool: P[] = [];
  for (let i = 0; i < 28; i++) {
    const isCoin = i % 3 !== 0;
    const obj = withOutline(isCoin ? coinGeo : heartGeo, isCoin ? coinMat : heartMat, thin);
    if (isCoin) obj.children.forEach((c) => (c.rotation.x = Math.PI / 2));
    obj.visible = false;
    world.add(obj);
    pool.push({ obj, v: new THREE.Vector3(), spin: new THREE.Vector3(), life: 0 });
  }
  const burst = () => {
    let n = 10;
    for (const p of pool) {
      if (p.life > 0 || !n--) continue;
      p.life = 2.6 + Math.random() * 0.8;
      p.obj.visible = true;
      p.obj.position.set(btn.position.x + (Math.random() - 0.5), btn.position.y + (Math.random() - 0.5), 1);
      const a = Math.random() * Math.PI * 2;
      p.v.set(Math.cos(a) * (2 + Math.random() * 2.5), 4 + Math.random() * 3, 2 + Math.random() * 2);
      p.spin.set(Math.random() * 6, Math.random() * 8, Math.random() * 4);
      p.obj.scale.setScalar(0.01);
    }
  };

  // ---- animação do clique
  let clickT = -1; // -1 parado; 0..1 em andamento
  const click = () => { if (clickT < 0) clickT = 0; };
  el.addEventListener('pointerdown', click);
  // PC: clica de novo quando o mouse passa por cima
  if (matchMedia('(hover: hover)').matches) el.addEventListener('pointerenter', click);
  let auto = 1.2; // clica uma vez ao abrir

  // mouse
  const target = { x: 0, y: 0 };
  addEventListener('pointermove', (e) => { target.x = e.clientX / innerWidth - 0.5; target.y = e.clientY / innerHeight - 0.5; }, { passive: true });

  const resize = () => {
    const w = el.clientWidth * 3, h = (el.clientHeight || el.clientWidth) * 3;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(el);
  resize();

  const clock = new THREE.Clock();
  const ease = (t: number) => 1 - Math.pow(1 - t, 3);
  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(el);

  const tick = () => {
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    // cena inclina com o mouse
    world.rotation.y += (-0.45 + target.x * 0.6 - world.rotation.y) * 0.06; // base de 3/4 mostra a profundidade
    world.rotation.x += (0.18 + target.y * 0.35 - world.rotation.x) * 0.06;

    // clique automático só ao abrir
    auto -= dt;
    if (auto <= 0) { click(); auto = Infinity; }

    const idle = new THREE.Vector3(rest.x + Math.sin(t * 1.3) * 0.15 + target.x * 0.6, rest.y + Math.sin(t * 2) * 0.12 - target.y * 0.4, rest.z);
    if (clickT >= 0) {
      clickT += dt / 1.2;
      // desce (0..0.35), segura, volta (0.55..1)
      const k = clickT < 0.35 ? ease(clickT / 0.35) : clickT < 0.55 ? 1 : 1 - ease((clickT - 0.55) / 0.45);
      cursor.position.lerpVectors(idle, hit, k);
      cap.position.z = 0.45 - k * 0.25;
      cursor.scale.set(1 + k * 0.08, 1 - k * 0.08, 1); // squash cartoon
      if (clickT >= 0.35 && clickT - dt / 1.2 < 0.35) burst();
      if (clickT >= 1) clickT = -1;
    } else {
      cursor.position.lerp(idle, 0.12);
      cap.position.z = 0.45;
      cursor.scale.set(1, 1, 1);
    }
    cursor.rotation.z = Math.sin(t * 1.6) * 0.05;
    btn.rotation.z = Math.sin(t * 0.8) * 0.04;

    for (const p of pool) {
      if (p.life <= 0) continue;
      p.life -= dt;
      p.v.y -= 6 * dt;
      p.obj.position.addScaledVector(p.v, dt);
      p.obj.rotation.x += p.spin.x * dt; p.obj.rotation.y += p.spin.y * dt; p.obj.rotation.z += p.spin.z * dt;
      const sc = Math.min(1, p.obj.scale.x + dt * 6) * (p.life < 0.3 ? p.life / 0.3 : 1);
      p.obj.scale.setScalar(Math.max(sc, 0.001));
      if (p.life <= 0) p.obj.visible = false;
    }
    renderer.render(scene, camera);
  };

  if (reduced) { tick(); return; } // quadro estático
  renderer.setAnimationLoop(() => { if (visible) tick(); });
}
