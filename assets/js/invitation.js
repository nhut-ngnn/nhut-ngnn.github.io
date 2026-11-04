// Decrypts a personalized invitation produced by bin/encrypt_invitations.py.
(function () {
  // Must match bin/encrypt_invitations.py
  const SALT = new TextEncoder().encode("nhut-ngnn-graduation-invitation");
  const ITERATIONS = 250000;
  const ICONS = [
    ["🎓", "cap"], ["📚", "books"], ["🎉", "party"], ["🌸", "flower"],
    ["📷", "camera"], ["☕", "coffee"], ["🎸", "guitar"], ["⭐", "star"],
    ["🍀", "clover"], ["🚀", "rocket"], ["🎨", "palette"], ["🌙", "moon"],
    ["🍕", "pizza"], ["🏆", "trophy"], ["💡", "bulb"], ["🎵", "music"],
  ];
  const LETTERS = "ABCDEFGHIJKLMNOP";
  const CODE_LENGTH = 5;
  const CEREMONY = new Date("2026-11-07T07:00:00+07:00");

  const $ = (id) => document.getElementById(id);
  const game = document.querySelector(".lock-game");
  const slots = $("lock-slots");
  const board = $("lock-board");
  const message = $("invite-message");
  const locked = $("invite-locked");
  const envelope = $("invite-envelope");
  const result = $("invite-result");
  const image = $("invite-image");
  const baseUrl = $("invite-locked").dataset.baseUrl;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let countdownTimer;
  let sequence = "";
  let busy = false;
  let failures = 0;

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, reducedMotion ? 0 : ms));

  function normalize(code) {
    return code.toUpperCase().replace(/[^A-Z0-9]/g, "");
  }

  function toHex(bytes) {
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function derive(code) {
    const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(normalize(code)), "PBKDF2", false, ["deriveBits"]);
    const bits = new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", salt: SALT, iterations: ITERATIONS, hash: "SHA-256" }, base, 512));
    const key = await crypto.subtle.importKey("raw", bits.slice(0, 32), "AES-GCM", false, ["decrypt"]);
    return { key, fileId: toHex(bits.slice(32, 48)) };
  }

  async function open(code) {
    const { key, fileId } = await derive(code);
    const response = await fetch(`${baseUrl}/${fileId}.bin`);
    if (!response.ok) throw new Error("not-found");
    const data = new Uint8Array(await response.arrayBuffer());
    const plain = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: data.slice(0, 12) }, key, data.slice(12)));
    const metaLength = (plain[0] << 8) | plain[1];
    const { name, word } = JSON.parse(new TextDecoder().decode(plain.slice(2, 2 + metaLength)));
    const blob = new Blob([plain.slice(2 + metaLength)], { type: "image/png" });
    return { name, word, blob };
  }

  function startCountdown() {
    const box = $("invite-countdown");
    const units = Object.fromEntries([...box.querySelectorAll("[data-unit]")].map((el) => [el.dataset.unit, el]));
    function tick() {
      const diff = CEREMONY - Date.now();
      if (diff <= 0) {
        box.classList.add("done");
        clearInterval(countdownTimer);
        return;
      }
      units.days.textContent = Math.floor(diff / 86400000);
      units.hours.textContent = String(Math.floor(diff / 3600000) % 24).padStart(2, "0");
      units.minutes.textContent = String(Math.floor(diff / 60000) % 60).padStart(2, "0");
      units.seconds.textContent = String(Math.floor(diff / 1000) % 60).padStart(2, "0");
    }
    tick();
    countdownTimer = setInterval(tick, 1000);
  }

  function confetti() {
    if (reducedMotion) return;
    const canvas = $("invite-confetti");
    const ctx = canvas.getContext("2d");
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    const colors = ["#c9a227", "#f1d27a", "#c0392b", "#2e86de", "#27ae60", "#8e44ad"];
    const pieces = Array.from({ length: 160 }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height * 0.35,
      vx: (Math.random() - 0.5) * 16,
      vy: -Math.random() * 14 - 4,
      size: Math.random() * 7 + 4,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    const end = performance.now() + 4000;
    (function frame(now) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pieces) {
        p.vy += 0.35;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.spin;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
      if (now < end) requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    })(performance.now());
  }

  async function show({ name, word, blob }, animate) {
    const url = URL.createObjectURL(blob);
    $("invite-greeting").textContent = name;
    image.src = url;
    image.alt = `Graduation invitation for ${name}`;
    $("invite-letter-link").href = url;
    const download = $("invite-download");
    download.href = url;
    download.download = `Graduation_Invitation_${name.replace(/\s+/g, "_")}.png`;

    if (animate) {
      envelope.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
      await wait(500);
      envelope.classList.add("opened");
      await wait(1300);
      locked.classList.add("leaving");
      await wait(450);
    }
    locked.hidden = true;
    result.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
    startCountdown();
    window.InviteWordGame.start(name, word, confetti);
    if (animate) confetti();
  }

  function renderSlots() {
    slots.replaceChildren(
      ...Array.from({ length: CODE_LENGTH }, (_, i) => {
        const slot = document.createElement("span");
        const letter = sequence[i];
        slot.className = letter ? "lock-slot filled" : "lock-slot";
        slot.textContent = letter ? ICONS[LETTERS.indexOf(letter)][0] : "";
        return slot;
      })
    );
  }

  function buildBoard() {
    ICONS.forEach(([emoji, label], i) => {
      const key = document.createElement("button");
      key.type = "button";
      key.className = "lock-key";
      key.textContent = emoji;
      key.setAttribute("aria-label", label);
      key.addEventListener("click", () => press(LETTERS[i]));
      board.appendChild(key);
    });
  }

  function press(letter) {
    if (busy || sequence.length >= CODE_LENGTH) return;
    const key = board.children[LETTERS.indexOf(letter)];
    key.classList.add("pressed");
    setTimeout(() => key.classList.remove("pressed"), 150);
    sequence += letter;
    message.textContent = "";
    renderSlots();
    if (sequence.length === CODE_LENGTH) submit(sequence, true);
  }

  function reset() {
    sequence = "";
    renderSlots();
  }

  async function submit(code, animate) {
    if (!normalize(code)) return;
    busy = true;
    game.classList.add("busy");
    message.className = "invite-message";
    message.textContent = "Checking the seal…";
    try {
      const invitation = await open(code);
      sessionStorage.setItem("invite-code", code);
      game.classList.add("success");
      message.textContent = "Unlocked! 🎉";
      await show(invitation, animate);
      message.textContent = "";
    } catch (err) {
      failures += 1;
      message.className = "invite-message error";
      message.textContent =
        failures >= 3
          ? "Still not right. Check the 5 icons I sent you and tap them in the same order."
          : "That's not your sequence, please try again.";
      for (const el of [game, envelope]) {
        el.classList.remove("shake");
        void el.offsetWidth;
        el.classList.add("shake");
      }
      await wait(450);
      reset();
    } finally {
      busy = false;
      game.classList.remove("busy");
    }
  }

  document.addEventListener("keydown", (event) => {
    if (busy || !result.hidden || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === "Backspace") {
      sequence = sequence.slice(0, -1);
      renderSlots();
    }
  });

  $("lock-undo").addEventListener("click", () => {
    if (busy) return;
    sequence = sequence.slice(0, -1);
    renderSlots();
  });
  $("lock-clear").addEventListener("click", () => !busy && reset());

  $("invite-logout").addEventListener("click", () => {
    sessionStorage.removeItem("invite-code");
    clearInterval(countdownTimer);
    window.InviteWordGame.stop();
    URL.revokeObjectURL(image.src);
    image.removeAttribute("src");
    failures = 0;
    reset();
    game.classList.remove("success");
    message.textContent = "";
    envelope.classList.remove("opened", "shake");
    locked.classList.remove("leaving");
    result.hidden = true;
    locked.hidden = false;
  });

  buildBoard();
  renderSlots();

  const params = new URLSearchParams(location.search);
  const fromLink = params.get("code");
  const saved = fromLink || sessionStorage.getItem("invite-code");
  if (saved) {
    sequence = normalize(saved).slice(0, CODE_LENGTH);
    renderSlots();
    // Play the opening animation for links shared by me; skip it on page reload.
    submit(saved, Boolean(fromLink));
  }
})();
