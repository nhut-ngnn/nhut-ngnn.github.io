// Word-guessing game inside the unlocked invitation. Each guest's secret word
// comes from their encrypted invitation; progress and solve time are kept in
// localStorage so a reload continues the same game (and the clock keeps running).
window.InviteWordGame = (function () {
  const LENGTH = 5;
  const TRIES = 6;
  const ROWS = ["QWERTYUIOP", "ASDFGHJKL", "+ZXCVBNM-"]; // + = Enter, - = Backspace
  const RANK = { absent: 1, present: 2, correct: 3 };
  const EMOJI = { correct: "🟩", present: "🟨", absent: "⬜" };

  const $ = (id) => document.getElementById(id);
  let state, word, name, storageKey, timer, celebrate, current, revealing;

  function score(guess) {
    const result = Array(LENGTH).fill("absent");
    const left = {};
    for (let i = 0; i < LENGTH; i++) {
      if (guess[i] === word[i]) result[i] = "correct";
      else left[word[i]] = (left[word[i]] || 0) + 1;
    }
    for (let i = 0; i < LENGTH; i++) {
      if (result[i] !== "correct" && left[guess[i]]) {
        result[i] = "present";
        left[guess[i]] -= 1;
      }
    }
    return result;
  }

  function formatTime(ms) {
    const tenths = Math.floor(ms / 100);
    const minutes = Math.floor(tenths / 600);
    const seconds = Math.floor(tenths / 10) % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}.${tenths % 10}`;
  }

  function elapsed() {
    if (state.elapsed != null) return state.elapsed;
    return state.startedAt ? Date.now() - state.startedAt : 0;
  }

  function save() {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function tick() {
    $("word-timer").textContent = formatTime(elapsed());
  }

  function updateOpenButton() {
    $("word-open-label").textContent = finished()
      ? `Your game: ${state.won ? state.guesses.length : "X"}/${TRIES} · ${formatTime(state.elapsed)}`
      : state.startedAt
        ? "Continue mini game"
        : "Play mini game";
  }

  function isOpen() {
    return !$("word-modal").hidden;
  }

  function openModal() {
    $("word-modal").hidden = false;
    document.body.style.overflow = "hidden";
    $("word-close").focus();
  }

  function closeModal() {
    if (!isOpen()) return;
    $("word-modal").hidden = true;
    document.body.style.overflow = "";
    updateOpenButton();
    $("word-open").focus();
  }

  function startClock() {
    if (!state.startedAt) {
      state.startedAt = Date.now();
      save();
      updateOpenButton();
    }
    if (!timer) timer = setInterval(tick, 100);
  }

  function stopClock() {
    clearInterval(timer);
    timer = null;
    tick();
  }

  function buildGrid() {
    const grid = $("word-grid");
    grid.replaceChildren();
    for (let r = 0; r < TRIES; r++) {
      const row = document.createElement("div");
      row.className = "word-row";
      for (let c = 0; c < LENGTH; c++) {
        const tile = document.createElement("span");
        tile.className = "word-tile";
        row.appendChild(tile);
      }
      grid.appendChild(row);
    }
  }

  function buildKeyboard() {
    const keyboard = $("word-keyboard");
    keyboard.replaceChildren();
    for (const letters of ROWS) {
      const row = document.createElement("div");
      row.className = "word-key-row";
      for (const ch of letters) {
        const key = document.createElement("button");
        key.type = "button";
        key.className = "word-key";
        if (ch === "+") {
          key.textContent = "Enter";
          key.classList.add("wide");
          key.addEventListener("click", submit);
        } else if (ch === "-") {
          key.innerHTML = '<i class="fa-solid fa-delete-left"></i>';
          key.setAttribute("aria-label", "Backspace");
          key.classList.add("wide");
          key.addEventListener("click", backspace);
        } else {
          key.textContent = ch;
          key.dataset.key = ch;
          key.addEventListener("click", () => type(ch));
        }
        row.appendChild(key);
      }
      keyboard.appendChild(row);
    }
  }

  function row(index) {
    return $("word-grid").children[index];
  }

  function paintRow(index, guess, result, animate) {
    [...row(index).children].forEach((tile, i) => {
      tile.textContent = guess[i];
      tile.classList.add("filled");
      const apply = () => tile.classList.add(result[i]);
      if (animate) {
        tile.style.animationDelay = `${i * 0.25}s`;
        tile.classList.add("flip");
        setTimeout(apply, i * 250 + 250);
      } else {
        apply();
      }
    });
  }

  function paintKeys() {
    const best = {};
    state.guesses.forEach((guess) => {
      score(guess).forEach((status, i) => {
        if (!best[guess[i]] || RANK[status] > RANK[best[guess[i]]]) best[guess[i]] = status;
      });
    });
    document.querySelectorAll(".word-key[data-key]").forEach((key) => {
      key.classList.remove("correct", "present", "absent");
      if (best[key.dataset.key]) key.classList.add(best[key.dataset.key]);
    });
  }

  function paintCurrent() {
    const tiles = row(state.guesses.length).children;
    for (let i = 0; i < LENGTH; i++) {
      tiles[i].textContent = current[i] || "";
      tiles[i].classList.toggle("filled", Boolean(current[i]));
    }
  }

  function message(text) {
    $("word-message").textContent = text;
  }

  function finished() {
    return state.won != null;
  }

  function type(ch) {
    if (finished() || revealing || current.length >= LENGTH) return;
    startClock();
    current += ch;
    paintCurrent();
    message("");
  }

  function backspace() {
    if (finished() || revealing) return;
    current = current.slice(0, -1);
    paintCurrent();
  }

  function submit() {
    if (finished() || revealing) return;
    if (current.length < LENGTH) {
      message("Not enough letters");
      const r = row(state.guesses.length);
      r.classList.remove("shake");
      void r.offsetWidth;
      r.classList.add("shake");
      return;
    }
    const guess = current;
    const index = state.guesses.length;
    state.guesses.push(guess);
    current = "";
    const won = guess === word;
    if (won || state.guesses.length === TRIES) {
      state.won = won;
      state.elapsed = elapsed();
      stopClock();
    }
    save();

    revealing = true;
    paintRow(index, guess, score(guess), true);
    setTimeout(() => {
      revealing = false;
      paintKeys();
      updateOpenButton();
      if (finished()) showResult(true);
    }, LENGTH * 250 + 300);
  }

  function shareText() {
    const grid = state.guesses.map((g) => score(g).map((s) => EMOJI[s]).join("")).join("\n");
    const outcome = state.won ? `${state.guesses.length}/${TRIES} in ${formatTime(state.elapsed)}` : `X/${TRIES} (${formatTime(state.elapsed)})`;
    return `🎓 Nhut's Graduation Word Game\n${name}: ${outcome}\n${grid}`;
  }

  function showResult(fresh) {
    const time = formatTime(state.elapsed);
    if (state.won) {
      const praise = ["Genius!", "Magnificent!", "Impressive!", "Splendid!", "Great!", "Phew!"][state.guesses.length - 1];
      message(praise);
      $("word-result-text").innerHTML = `You found <strong>${word}</strong> in <strong>${state.guesses.length}/${TRIES}</strong> tries and <strong>${time}</strong>.`;
      if (fresh && celebrate) celebrate();
    } else {
      message("So close!");
      $("word-result-text").innerHTML = `The word was <strong>${word}</strong>. Your time: <strong>${time}</strong>.`;
    }
    $("word-result").hidden = false;
  }

  async function share() {
    const text = shareText();
    const button = $("word-share");
    try {
      if (navigator.share && matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ text });
        return;
      }
      await navigator.clipboard.writeText(text);
      button.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
    } catch (err) {
      if (err.name === "AbortError") return;
      window.prompt("Copy your result:", text);
    }
    setTimeout(() => (button.innerHTML = '<i class="fa-solid fa-share-nodes"></i> Copy result'), 2000);
  }

  function onKey(event) {
    if (event.ctrlKey || event.metaKey || event.altKey || !isOpen()) return;
    if (event.key === "Escape") closeModal();
    else if (event.key === "Enter") submit();
    else if (event.key === "Backspace") backspace();
    else if (/^[a-z]$/i.test(event.key)) type(event.key.toUpperCase());
    else return;
    event.preventDefault();
  }

  function start(guestName, secretWord, onWin) {
    name = guestName;
    word = secretWord.toUpperCase();
    celebrate = onWin;
    current = "";
    revealing = false;
    storageKey = `invite-word:${word}`;
    try {
      state = JSON.parse(localStorage.getItem(storageKey)) || {};
    } catch (err) {
      state = {};
    }
    $("word-modal").hidden = true;
    render();
    document.addEventListener("keydown", onKey);
  }

  function render() {
    state = { guesses: [], startedAt: null, elapsed: null, won: null, ...state };
    buildGrid();
    buildKeyboard();
    state.guesses.forEach((guess, i) => paintRow(i, guess, score(guess), false));
    paintKeys();
    message("");
    $("word-result").hidden = true;
    updateOpenButton();
    tick();
    if (finished()) showResult(false);
    else if (state.startedAt) startClock();
  }

  function reset() {
    if (revealing) return;
    if (state.startedAt && !window.confirm("Start over? Your guesses and time will be cleared.")) return;
    clearInterval(timer);
    timer = null;
    current = "";
    state = {};
    localStorage.removeItem(storageKey);
    render();
  }

  function stop() {
    closeModal();
    clearInterval(timer);
    timer = null;
    document.removeEventListener("keydown", onKey);
  }

  $("word-share").addEventListener("click", share);
  // Live under <body> so no animated/transformed ancestor traps the fixed overlay.
  document.body.appendChild($("word-modal"));
  $("word-open").addEventListener("click", openModal);
  $("word-close").addEventListener("click", closeModal);
  $("word-reset").addEventListener("click", reset);
  $("word-again").addEventListener("click", reset);
  $("word-modal").addEventListener("click", (event) => event.target === event.currentTarget && closeModal());

  return { start, stop };
})();
