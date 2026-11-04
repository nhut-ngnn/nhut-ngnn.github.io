// The pixel black cat in a graduation cap that roams the invitation.
// Tap/click an empty spot: the cat runs there. Arrow keys or WASD: steer it.
// Tap the cat: it meows. Left alone, it strolls around and takes naps.
window.InviteCat = (function () {
  const SCALE = innerWidth < 600 ? 3 : 4; // 1 sprite pixel = SCALE screen px
  const FRAMES = Pixel.cat;
  const W = FRAMES.stand.w * SCALE;
  const H = FRAMES.stand.h * SCALE;
  const WALK = 150;
  const RUN = 330;
  const MARGIN = 40;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PHRASES = ["MEOW!", "Mrrp?", "Purrr...", "Hi there!", "Catch me!", "Got any fish?", "=^.^=", "I graduated too!"];

  let el, sprite, flip, bubble, pawLayer;
  let x, y; // the cat's feet, in viewport coordinates
  let target = null;
  let arriveCb = null;
  let running = false;
  let facing = 1;
  let lastT = 0;
  let animTime = 0;
  let blinkAt = 2;
  let idleTime = 0;
  let nextIdle = 3;
  let wander = true;
  let paused = false;
  let sleeping = false;
  let pawDist = 0;
  let pawSide = 0;
  let frame = "stand";
  let bubbleTimer;
  const keys = new Set();
  const moveListeners = [];
  let audio;
  let muted = localStorage.getItem("invite-cat-muted") === "1";

  const clampX = (v) => Math.min(innerWidth - MARGIN, Math.max(MARGIN, v));
  const clampY = (v) => Math.min(innerHeight - 8, Math.max(H + 10, v));
  const snap = (v) => Math.round(v / 2) * 2; // keep the 8-bit feel

  function setFrame(name) {
    if (name === frame) return;
    frame = name;
    sprite.src = FRAMES[name].url;
  }

  function create() {
    pawLayer = document.createElement("div");
    pawLayer.className = "cat-paws";
    pawLayer.setAttribute("aria-hidden", "true");
    document.body.appendChild(pawLayer);

    el = document.createElement("div");
    el.className = "cat";
    el.setAttribute("role", "img");
    el.setAttribute("aria-label", "A pixel black cat in a graduation cap");
    el.title = "Pet me!";
    el.style.width = W + "px";
    el.style.height = H + "px";
    el.innerHTML = '<div class="cat-bubble px-box" hidden></div><div class="cat-zzz" aria-hidden="true"><span>z</span><span>z</span><span>Z</span></div><div class="cat-flip"></div><div class="cat-shadow"></div>';
    flip = el.querySelector(".cat-flip");
    sprite = Pixel.img(FRAMES.stand, SCALE, "cat-sprite");
    flip.appendChild(sprite);
    bubble = el.querySelector(".cat-bubble");
    document.body.appendChild(el);

    x = innerWidth * 0.2;
    y = innerHeight - 20;
    render();

    el.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      wake();
      meow();
      jump();
      say(PHRASES[Math.floor(Math.random() * PHRASES.length)]);
    });

    document.addEventListener("pointerdown", (e) => {
      if (paused || e.button > 0) return;
      if (e.target.closest("a, button, input, textarea, select, label, summary, .no-cat, .cat")) return;
      goTo(e.clientX, e.clientY + 8, null, true);
    });

    const KEYMAP = { ArrowLeft: "l", ArrowRight: "r", ArrowUp: "u", ArrowDown: "d", a: "l", d: "r", w: "u", s: "d" };
    const keyOf = (e) => KEYMAP[e.key && e.key.length === 1 ? e.key.toLowerCase() : e.key];
    addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.target.closest && e.target.closest("input, textarea, [role=dialog]")) return;
      if (document.querySelector(".word-modal:not([hidden])")) return;
      const k = keyOf(e);
      if (!k || paused) return;
      keys.add(k);
      target = null;
      wake();
      e.preventDefault();
    });
    addEventListener("keyup", (e) => keys.delete(keyOf(e)));
    addEventListener("blur", () => keys.clear());
    addEventListener("resize", () => {
      x = clampX(x);
      y = clampY(y);
      render();
    });

    requestAnimationFrame(loop);
  }

  function render() {
    el.style.transform = `translate(${snap(x - W / 2)}px, ${snap(y - H)}px)`;
    el.style.zIndex = String(50 + Math.round(y / 10));
    flip.style.transform = `scaleX(${facing})`;
  }

  function loop(t) {
    const dt = Math.min((t - lastT) / 1000 || 0, 0.05);
    lastT = t;
    animTime += dt;
    let dx = 0;
    let dy = 0;
    let speed = 0;

    if (keys.size && !paused) {
      dx = (keys.has("r") ? 1 : 0) - (keys.has("l") ? 1 : 0);
      dy = (keys.has("d") ? 1 : 0) - (keys.has("u") ? 1 : 0);
      const len = Math.hypot(dx, dy) || 1;
      dx /= len;
      dy /= len;
      speed = dx || dy ? RUN * 0.8 : 0;
    } else if (target) {
      const ddx = target.x - x;
      const ddy = target.y - y;
      const dist = Math.hypot(ddx, ddy);
      if (dist < 4) {
        x = target.x;
        y = target.y;
        target = null;
        const cb = arriveCb;
        arriveCb = null;
        if (cb) cb();
      } else {
        speed = Math.min(running ? RUN : WALK, dist / dt);
        dx = ddx / dist;
        dy = ddy / dist;
      }
    }

    if (speed > 0) {
      const step = speed * dt;
      x = clampX(x + dx * step);
      y = clampY(y + dy * step);
      if (Math.abs(dx) > 0.15) facing = dx > 0 ? 1 : -1;
      pawDist += step;
      if (pawDist > 26) {
        pawDist = 0;
        dropPaw();
      }
      idleTime = 0;
      const period = speed >= RUN * 0.75 ? 0.08 : 0.14;
      const even = Math.floor(animTime / period) % 2 === 0;
      setFrame(even ? "walkA" : "walkB");
      el.classList.toggle("bob", !even);
      render();
      for (const fn of moveListeners) fn(x, y);
    } else {
      el.classList.remove("bob");
      if (sleeping) {
        setFrame("blink");
      } else if (animTime > blinkAt) {
        setFrame("blink");
        if (animTime > blinkAt + 0.14) {
          blinkAt = animTime + 2 + Math.random() * 3;
          setFrame("stand");
        }
      } else {
        setFrame("stand");
      }
      if (!paused) idleTime += dt;
      if (wander && !paused && !sleeping && idleTime > nextIdle) {
        idleTime = 0;
        nextIdle = 3 + Math.random() * 4;
        if (Math.random() < 0.3) nap();
        else goTo(MARGIN + Math.random() * (innerWidth - 2 * MARGIN), innerHeight * (0.6 + Math.random() * 0.38));
      }
    }
    requestAnimationFrame(loop);
  }

  function dropPaw() {
    if (reducedMotion) return;
    const p = document.createElement("span");
    p.className = "cat-paw";
    pawSide ^= 1;
    p.style.left = snap(x + (pawSide ? -10 : 6)) + "px";
    p.style.top = snap(y - 6 + (pawSide ? 0 : 4)) + "px";
    pawLayer.appendChild(p);
    setTimeout(() => p.remove(), 1800);
  }

  function nap() {
    sleeping = true;
    el.classList.add("sleeping");
    setTimeout(wake, 6000 + Math.random() * 5000);
  }

  function wake() {
    if (!sleeping) return;
    sleeping = false;
    el.classList.remove("sleeping");
  }

  function goTo(tx, ty, cb, run) {
    wake();
    target = { x: clampX(tx), y: clampY(ty) };
    running = Boolean(run) || Math.hypot(tx - x, ty - y) > 260;
    arriveCb = cb || null;
    idleTime = 0;
  }

  function say(text, ms) {
    bubble.textContent = text;
    bubble.hidden = false;
    // Keep the bubble on screen near the edges.
    const half = bubble.offsetWidth / 2;
    const shift = x - half < 8 ? 8 - (x - half) : x + half > innerWidth - 8 ? innerWidth - 8 - (x + half) : 0;
    bubble.style.marginLeft = snap(shift) + "px";
    bubble.style.setProperty("--shift", snap(shift) + "px");
    bubble.classList.remove("pop");
    void bubble.offsetWidth;
    bubble.classList.add("pop");
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => (bubble.hidden = true), ms || 2000);
  }

  function jump() {
    el.classList.remove("jump");
    void el.offsetWidth;
    el.classList.add("jump");
  }

  function ctx() {
    if (muted) return null;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === "suspended") audio.resume();
      return audio;
    } catch (_) {
      return null;
    }
  }

  // 8-bit "mi-aow": a square wave that rises then falls.
  function meow(pitch) {
    const a = ctx();
    if (!a) return;
    const p = pitch || 0.9 + Math.random() * 0.25;
    const t = a.currentTime;
    const osc = a.createOscillator();
    const gain = a.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(620 * p, t);
    osc.frequency.exponentialRampToValueAtTime(1050 * p, t + 0.12);
    osc.frequency.exponentialRampToValueAtTime(520 * p, t + 0.38);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.09, t + 0.03);
    gain.gain.setValueAtTime(0.09, t + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
    osc.connect(gain).connect(a.destination);
    osc.start(t);
    osc.stop(t + 0.45);
  }

  // Two quick blips, like a coin pickup.
  function chomp() {
    const a = ctx();
    if (!a) return;
    const t = a.currentTime;
    [[0, 988], [0.07, 1319]].forEach(([d, f]) => {
      const osc = a.createOscillator();
      const gain = a.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(f, t + d);
      gain.gain.setValueAtTime(0.08, t + d);
      gain.gain.setValueAtTime(0.0001, t + d + 0.07);
      osc.connect(gain).connect(a.destination);
      osc.start(t + d);
      osc.stop(t + d + 0.08);
    });
  }

  function setMuted(value) {
    muted = value;
    localStorage.setItem("invite-cat-muted", value ? "1" : "0");
  }

  return {
    create,
    goTo,
    say,
    jump,
    meow,
    chomp,
    wake,
    setMuted,
    isMuted: () => muted,
    onMove: (fn) => moveListeners.push(fn),
    setPaused: (v) => {
      paused = v;
      if (v) keys.clear();
    },
    setWander: (v) => (wander = v),
    position: () => ({ x, y }),
  };
})();
