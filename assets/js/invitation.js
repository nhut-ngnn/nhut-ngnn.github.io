// Invitation flow: read the personal link → cat eats the fish → envelope opens → invitation.
(function () {
  const C = window.INVITE_CONFIG;
  const P = window.INVITE_PATHS;
  const Link = window.InviteLink;
  const Cat = window.InviteCat;
  const $ = (id) => document.getElementById(id);
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, reducedMotion ? 0 : ms));
  const pick = (list) => list[Math.floor(Math.random() * list.length)];

  // ---------- Static content from the config ----------
  document.querySelectorAll("[data-config]").forEach((node) => {
    node.textContent = C[node.dataset.config];
  });

  const toCal = (iso) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  $("btn-calendar").href =
    "https://calendar.google.com/calendar/render?" +
    new URLSearchParams({
      action: "TEMPLATE",
      text: `${C.hostShort}'s ${C.title}`,
      dates: `${toCal(C.start)}/${toCal(C.end)}`,
      location: `${C.venue}, ${C.address}`,
      details: `Ceremony ${C.ceremony}, reception ${C.reception}. ${P.page}`,
    });
  $("btn-map").href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(C.mapQuery)}`;

  // ---------- Sound toggle ----------
  const soundBtn = $("btn-sound");
  function paintSound() {
    soundBtn.classList.toggle("muted", Cat.isMuted());
    soundBtn.setAttribute("aria-label", Cat.isMuted() ? "Sound off" : "Sound on");
  }
  soundBtn.addEventListener("click", () => {
    Cat.setMuted(!Cat.isMuted());
    paintSound();
    if (!Cat.isMuted()) Cat.meow();
  });
  paintSound();

  // ---------- Who is this letter for? ----------
  const params = new URLSearchParams(location.search);
  const token = params.get("k");
  const quickName = params.get("to") || params.get("name");
  const openedKey = `invite-opened:${token || quickName || "-"}`;

  async function resolveGuest() {
    if (token) {
      try {
        return await Link.open(token, P.files);
      } catch (_) {
        return null; // broken or unknown link
      }
    }
    if (quickName) {
      const name = Link.decodeName(quickName).slice(0, 60);
      return { name, word: Link.wordFor(name, C.words), image: null };
    }
    return { name: "", word: Link.wordFor("guest", C.words), image: null };
  }

  // ---------- The cat and its fish ----------
  Cat.create();
  const envImg = Pixel.img(Pixel.sprites.envelopeClosed, innerWidth < 600 ? 8 : 10);
  $("envelope").appendChild(envImg);
  const fishLayer = $("fish-layer");
  const meter = $("fish-meter");
  const status = $("lock-status");
  let fish = []; // { el, fx, fy, onEat }
  let eaten = 0;
  let unlocking = false;
  let feedCount = 0;
  let guest = null;

  const fishPos = (f) => ({ x: f.fx * innerWidth, y: f.fy * innerHeight });

  function placeFish(f) {
    const { x, y } = fishPos(f);
    f.el.style.left = x + "px";
    f.el.style.top = y + "px";
  }

  function makeFish(fx, fy, onEat) {
    const el = Pixel.img(Pixel.sprites.fish, 4, "fish");
    el.style.animationDelay = `${(Math.random() * -1).toFixed(2)}s`;
    fishLayer.appendChild(el);
    const f = { el, fx, fy, onEat };
    placeFish(f);
    fish.push(f);
    return f;
  }

  // Scatter fish at random, away from the card, the envelope and each other.
  function scatterFish(n) {
    const boxes = [".lock-card", "#envelope", ".topbar", "#lock-status", "#skip"].map((s) => document.querySelector(s).getBoundingClientRect());
    const blocked = boxes.map((r) => ({ l: r.left - 26, r: r.right + 26, t: r.top - 26, b: r.bottom + 26 }));
    const placed = [];
    for (let i = 0; i < n; i++) {
      let fx, fy;
      for (let tries = 0; tries < 120; tries++) {
        fx = 0.07 + Math.random() * 0.86;
        fy = 0.14 + Math.random() * 0.78;
        const px = fx * innerWidth;
        const py = fy * innerHeight;
        const hitsBox = blocked.some((b) => px > b.l && px < b.r && py > b.t && py < b.b);
        const tooClose = placed.some((p) => Math.hypot((p.fx - fx) * innerWidth, (p.fy - fy) * innerHeight) < 80);
        if (!hitsBox && !tooClose) break;
      }
      placed.push({ fx, fy });
      makeFish(fx, fy, onLockFishEaten);
    }
  }

  function renderMeter() {
    meter.replaceChildren(
      ...Array.from({ length: C.fish }, (_, i) => {
        const s = document.createElement("span");
        s.className = i < eaten ? "pip full" : "pip";
        s.appendChild(Pixel.img(Pixel.sprites.fish, 2));
        return s;
      })
    );
  }

  const YUM = ["Nom nom!", "Yummy!", "More fish!", "Purrrfect!", "+1 fish", "Mrrrow!"];

  function eatFish(f) {
    fish = fish.filter((k) => k !== f);
    f.el.classList.add("eaten");
    setTimeout(() => f.el.remove(), 450);
    Cat.chomp();
    Cat.jump();
    f.onEat();
  }

  Cat.onMove((x, y) => {
    for (const f of fish.slice()) {
      const p = fishPos(f);
      if (Math.hypot(p.x - x, p.y - (y - 14)) < 46) eatFish(f);
    }
  });
  addEventListener("resize", () => fish.forEach(placeFish));

  let nudgeTimer;
  function nudge() {
    clearTimeout(nudgeTimer);
    nudgeTimer = setTimeout(() => {
      if (unlocking || !fish.length) return;
      Cat.say("Tap a fish for me!", 2600);
      fish.forEach((f) => {
        f.el.classList.remove("wiggle");
        void f.el.offsetWidth;
        f.el.classList.add("wiggle");
      });
      nudge();
    }, 9000);
  }

  function onLockFishEaten() {
    eaten += 1;
    renderMeter();
    if (eaten >= C.fish) {
      unlock();
    } else {
      Cat.say(pick(YUM), 1200);
      status.textContent = `${C.fish - eaten} more fish to go!`;
      nudge();
    }
  }

  // ---------- Opening the letter ----------
  async function unlock() {
    if (unlocking) return;
    unlocking = true;
    clearTimeout(nudgeTimer);
    Cat.setPaused(true);
    fish.forEach((f) => f.el.remove());
    fish = [];
    status.textContent = "All full! Opening your letter...";
    Cat.say("So full! Let's open it!", 2500);

    const env = $("envelope").getBoundingClientRect();
    await new Promise((resolve) => Cat.goTo(env.left - 34, env.bottom - 4, resolve, true));
    Cat.jump();
    Cat.meow(1.15);
    await wait(300);
    envImg.src = Pixel.sprites.envelopeOpen.url;
    $("envelope").classList.add("opened");
    await wait(1400);
    $("stage-lock").classList.add("leaving");
    await wait(500);
    showInvite(true);
  }

  // ---------- The invitation ----------
  let countdownTimer;
  function startCountdown() {
    const box = $("countdown");
    const units = Object.fromEntries([...box.querySelectorAll("[data-unit]")].map((el) => [el.dataset.unit, el]));
    const start = new Date(C.start);
    function tick() {
      const diff = start - Date.now();
      if (diff <= 0) {
        box.hidden = true;
        $("countdown-done").hidden = false;
        clearInterval(countdownTimer);
        return;
      }
      units.days.textContent = Math.floor(diff / 86400000);
      units.hours.textContent = String(Math.floor(diff / 3600000) % 24).padStart(2, "0");
      units.minutes.textContent = String(Math.floor(diff / 60000) % 60).padStart(2, "0");
      units.seconds.textContent = String(Math.floor(diff / 1000) % 60).padStart(2, "0");
    }
    tick();
    clearInterval(countdownTimer);
    countdownTimer = setInterval(tick, 1000);
  }

  function showLetter(name, image) {
    if (!image) return;
    const url = URL.createObjectURL(image);
    const ext = (image.type.split("/")[1] || "png").replace("jpeg", "jpg");
    $("letter-image").src = url;
    $("letter-image").alt = `Graduation invitation letter for ${name}`;
    $("letter-link").href = url;
    $("letter-download").href = url;
    $("letter-download").download = `Graduation_Invitation_${name.replace(/\s+/g, "_")}.${ext}`;
    $("letter").hidden = false;
  }

  function showInvite(celebrate) {
    sessionStorage.setItem(openedKey, "1");
    const name = guest.name || C.defaultGuest;
    $("stage-lock").hidden = true;
    $("stage-invite").hidden = false;
    document.body.classList.add("is-open");
    window.scrollTo({ top: 0 });
    startCountdown();
    window.InviteWordGame.start(name, guest.word, confetti);
    Cat.setPaused(false);
    Cat.setWander(true);
    if (celebrate) {
      confetti();
      setTimeout(() => Cat.say(guest.name ? `Hi ${guest.name}! See you there!` : "See you there!", 3200), 500);
    }
  }

  $("btn-feed").addEventListener("click", () => {
    const f = makeFish(0.1 + Math.random() * 0.8, 0.35 + Math.random() * 0.55, () => {
      feedCount += 1;
      $("feed-count").textContent = `The cat has eaten ${feedCount} fish`;
      Cat.say(pick(YUM), 1200);
    });
    const p = fishPos(f);
    Cat.goTo(p.x, p.y + 14, null, true);
  });

  $("btn-replay").addEventListener("click", () => {
    sessionStorage.removeItem(openedKey);
    location.reload();
  });

  $("skip").addEventListener("click", () => {
    eaten = C.fish;
    renderMeter();
    unlock();
  });

  // ---------- Confetti ----------
  function confetti() {
    if (reducedMotion) return;
    const canvas = $("confetti");
    const ctx = canvas.getContext("2d");
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    const colors = ["#ffd23f", "#b8f04a", "#7d6bd6", "#ff8fab", "#9ad7ff", "#ffffff"];
    const pieces = Array.from({ length: 170 }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 240,
      y: canvas.height * 0.35,
      vx: (Math.random() - 0.5) * 16,
      vy: -Math.random() * 14 - 4,
      size: Math.random() * 7 + 4,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.3,
      color: pick(colors),
      round: Math.random() < 0.3,
    }));
    const end = performance.now() + 4200;
    (function frame(now) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pieces) {
        p.vy += 0.33;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.spin;
        ctx.save();
        ctx.translate(Math.round(p.x / 4) * 4, Math.round(p.y / 4) * 4);
        ctx.fillStyle = p.color;
        const q = Math.max(4, Math.round(p.size / 4) * 4);
        ctx.fillRect(-q / 2, -q / 2, q, q);
        ctx.restore();
      }
      if (now < end) requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    })(performance.now());
  }

  // ---------- Start ----------
  (async function init() {
    renderMeter();
    if (token) status.textContent = "Fetching your letter...";
    guest = await resolveGuest();

    if (!guest) {
      $("lock-play").hidden = true;
      $("lock-error").hidden = false;
      $("skip").hidden = true;
      $("envelope").classList.add("broken");
      status.textContent = "";
      setTimeout(() => Cat.say("Mrrp? Not your letter...", 3500), 600);
      return;
    }

    if (guest.name) {
      $("lock-title").textContent = `A letter for ${guest.name}`;
      document.title = `For ${guest.name} · ${C.hostShort}'s Graduation`;
    }
    $("guest").textContent = guest.name || C.defaultGuest;
    showLetter(guest.name || "Guest", guest.image);

    if (sessionStorage.getItem(openedKey)) {
      showInvite(false);
      return;
    }
    status.textContent = `${C.fish} fish to go!`;
    requestAnimationFrame(() => scatterFish(C.fish));
    setTimeout(() => Cat.say("So hungry... fish, please?", 3000), 700);
    nudge();
  })();
})();
