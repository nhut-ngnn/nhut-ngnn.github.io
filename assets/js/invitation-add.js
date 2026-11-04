// /invitation/add/: create personal invitation links and keep a guest list in this browser.
(function () {
  const C = window.INVITE_CONFIG;
  const P = window.INVITE_PATHS;
  const Link = window.InviteLink;
  const Cat = window.InviteCat;
  const $ = (id) => document.getElementById(id);
  const STORE = "invite-guests";

  // Links always point at the live site, even when this page runs on localhost.
  const base = P.page.replace(/\/?$/, "/");
  const localBase = new URL("../", location.href).href;
  const isLocal = localBase !== base;
  $("site").textContent = base;

  let guests = [];
  try {
    guests = JSON.parse(localStorage.getItem(STORE)) || [];
  } catch (_) {
    guests = [];
  }
  const save = () => localStorage.setItem(STORE, JSON.stringify(guests));
  const live = {}; // fileId -> true/false (uploaded yet?)

  function query(url) {
    return url.slice(url.indexOf("?"));
  }

  function addGuest(g) {
    guests = guests.filter((x) => x.url !== g.url);
    guests.unshift(g);
    save();
    render();
  }

  function unusedWord() {
    const used = new Set(guests.map((g) => g.word));
    const free = C.words.filter((w) => !used.has(w));
    const list = free.length ? free : C.words;
    return list[Math.floor(Math.random() * list.length)];
  }

  function download(blob, filename) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  // ---------- Form ----------
  const form = $("add-form");
  const note = $("add-note");
  const imageInput = $("image");
  const drop = $("drop");
  let image = null;

  function mode() {
    return form.querySelector("input[name=mode]:checked").value;
  }

  function syncMode() {
    drop.hidden = mode() !== "secret";
  }
  form.querySelectorAll("input[name=mode]").forEach((r) => r.addEventListener("change", syncMode));
  syncMode();

  function setImage(file) {
    image = file && file.type.startsWith("image/") ? file : null;
    const old = drop.querySelector("img.preview");
    if (old) old.remove();
    if (image) {
      const img = document.createElement("img");
      img.className = "preview";
      img.src = URL.createObjectURL(image);
      img.alt = "";
      drop.insertBefore(img, $("drop-text"));
      $("drop-text").innerHTML = `<b>${escapeHtml(image.name)}</b> · ${(image.size / 1024).toFixed(0)} KB (bấm để đổi)`;
      const guessed = image.name.replace(/\.[^.]+$/, "").replace(/^Graduation_Invitation_/, "").replace(/[_-]+/g, " ").trim();
      if (!$("name").value && guessed) $("name").value = guessed;
    } else {
      $("drop-text").innerHTML = "<b>Ảnh thư riêng</b> (không bắt buộc): bấm để chọn hoặc kéo thả PNG/JPG vào đây";
    }
  }
  imageInput.addEventListener("change", () => setImage(imageInput.files[0]));
  drop.addEventListener("dragover", (e) => {
    e.preventDefault();
    drop.classList.add("over");
  });
  drop.addEventListener("dragleave", () => drop.classList.remove("over"));
  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    drop.classList.remove("over");
    setImage(e.dataTransfer.files[0]);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = $("name").value.trim().replace(/\s+/g, " ");
    if (!name) return;
    note.className = "note";

    if (mode() === "quick") {
      addGuest({ name, type: "quick", url: `${base}?to=${Link.encodeName(name)}`, added: Date.now() });
      note.textContent = `Đã thêm ${name}. Link dùng được ngay.`;
    } else {
      const word = unusedWord();
      const { token, fileId, file } = await Link.seal({ name, word, image });
      const filename = `${fileId}.bin`;
      download(file, filename);
      addGuest({ name, type: "secret", url: `${base}?k=${token}`, fileId, word, letter: Boolean(image), added: Date.now() });
      note.className = "note warn";
      note.innerHTML = `Đã thêm ${escapeHtml(name)} và tải về <b>${filename}</b>. Chép file này vào <code>assets/invitations/</code> rồi commit và push; link chạy sau khi GitHub Pages deploy xong.`;
      live[fileId] = false;
    }
    Cat.say(`Welcome, ${name.split(" ").pop()}!`, 2200);
    Cat.meow();
    form.reset();
    setImage(null);
    syncMode();
    $("name").focus();
  });

  $("bulk-add").addEventListener("click", () => {
    const names = $("bulk").value.split("\n").map((s) => s.trim().replace(/\s+/g, " ")).filter(Boolean);
    names.reverse().forEach((name) => {
      guests = guests.filter((g) => g.name !== name || g.type !== "quick");
      guests.unshift({ name, type: "quick", url: `${base}?to=${Link.encodeName(name)}`, added: Date.now() });
    });
    save();
    render();
    $("bulk").value = "";
    if (names.length) Cat.say(`+${names.length} guests!`, 2000);
  });

  // ---------- Guest list ----------
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }

  function icon(id, scale) {
    return `<i class="pxi"><img class="px" src="${Pixel.sprites[id].url}" width="${Pixel.sprites[id].w * (scale || 2)}" height="${Pixel.sprites[id].h * (scale || 2)}" alt=""></i>`;
  }

  function render() {
    $("count").textContent = guests.length;
    const list = $("guests");
    if (!guests.length) {
      list.innerHTML = '<li class="empty">Chưa có khách nào. Thêm khách ở trên nhé!</li>';
      return;
    }
    list.replaceChildren(
      ...guests.map((g) => {
        const li = document.createElement("li");
        let tags = g.type === "secret" ? `<span class="tag secret">${icon("lock")} bí mật</span>` : `<span class="tag">${icon("bolt")} nhanh</span>`;
        if (g.letter) tags += ' <span class="tag">có thư</span>';
        if (g.type === "secret" && g.fileId in live) {
          tags += live[g.fileId] ? ' <span class="tag live">đã lên mạng</span>' : ' <span class="tag pending">chưa upload file</span>';
        }
        li.innerHTML = `
          <div class="who"><b>${escapeHtml(g.name)} ${tags}</b><a class="url" href="${escapeHtml(g.url)}" target="_blank" rel="noopener">${escapeHtml(g.url)}</a></div>
          <div class="tools">
            <button class="btn small copy" type="button" title="Copy link">${icon("copy")}</button>
            <a class="btn small" target="_blank" rel="noopener" title="${isLocal ? "Xem thử trên máy" : "Xem"}" href="${escapeHtml(isLocal ? localBase + query(g.url) : g.url)}">${icon("eye")}</a>
            <button class="btn small remove" type="button" title="Xoá khỏi danh sách">${icon("trash")}</button>
          </div>`;
        li.querySelector(".copy").addEventListener("click", async (e) => {
          await navigator.clipboard.writeText(g.url);
          e.currentTarget.textContent = "OK";
        });
        li.querySelector(".remove").addEventListener("click", () => {
          const extra = g.type === "secret" ? `\nNhớ xoá luôn file assets/invitations/${g.fileId}.bin nếu muốn huỷ link.` : "";
          if (!confirm(`Xoá ${g.name} khỏi danh sách?${extra}`)) return;
          guests = guests.filter((x) => x !== g);
          save();
          render();
        });
        return li;
      })
    );
  }

  // Is each secret guest's file reachable yet? (checks the site this page runs on)
  async function recheck() {
    await Promise.all(
      guests
        .filter((g) => g.type === "secret")
        .map(async (g) => {
          if (!g.fileId) {
            try {
              g.fileId = (await Link.derive(new URL(g.url).searchParams.get("k"))).fileId;
            } catch (_) {
              return;
            }
          }
          try {
            const r = await fetch(`${P.files}/${g.fileId}.bin`, { method: "HEAD", cache: "no-cache" });
            live[g.fileId] = r.ok;
          } catch (_) {
            live[g.fileId] = false;
          }
        })
    );
    save();
    render();
  }
  $("recheck").addEventListener("click", recheck);

  $("copy-all").addEventListener("click", async (e) => {
    await navigator.clipboard.writeText(guests.map((g) => `${g.name}: ${g.url}`).join("\n"));
    e.currentTarget.lastChild.textContent = " Đã copy ✓";
  });

  const csvCell = (v) => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`;
  $("export").addEventListener("click", () => {
    const rows = [["name", "type", "link", "word"]].concat(guests.map((g) => [g.name, g.type, g.url, g.word || ""]));
    const csv = "﻿" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
    download(new Blob([csv], { type: "text/csv" }), "invitation_links.csv");
  });

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let cell = "";
    let quoted = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (quoted) {
        if (ch === '"' && text[i + 1] === '"') {
          cell += '"';
          i++;
        } else if (ch === '"') quoted = false;
        else cell += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === ",") {
        row.push(cell);
        cell = "";
      } else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
      } else cell += ch;
    }
    if (cell || row.length) rows.push(row.concat(cell));
    return rows.filter((r) => r.some(Boolean));
  }

  $("import").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const rows = parseCsv((await file.text()).replace(/^﻿/, ""));
    const head = rows.shift().map((h) => h.trim().toLowerCase());
    const col = (n) => head.indexOf(n);
    let added = 0;
    rows.forEach((r) => {
      const name = r[col("name")];
      const url = r[col("link")];
      if (!name || !url) return;
      const secret = /[?&]k=/.test(url);
      guests = guests.filter((g) => g.url !== url);
      guests.push({ name, type: secret ? "secret" : "quick", url, word: col("word") >= 0 ? r[col("word")] : "", letter: secret, added: Date.now() });
      added++;
    });
    save();
    render();
    e.target.value = "";
    Cat.say(`Imported ${added} guests!`, 2200);
    recheck();
  });

  // ---------- Start ----------
  Cat.create();
  render();
  recheck();
  setTimeout(() => Cat.say("Who are we inviting?", 2600), 600);
})();
