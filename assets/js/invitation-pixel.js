// Pixel art kit: every sprite is a grid of characters, one character per colour.
// Sprites are drawn 1 cell = 1 px on a canvas, then scaled up with CSS (image-rendering: pixelated).
window.Pixel = (function () {
  const PALETTE = {
    K: "#05040a", // ink
    O: "#7d6bd6", // cat rim light
    B: "#2a2438", // cat fur
    L: "#352a55", // fur highlight
    G: "#b8f04a", // green
    e: "#f3eea0", // cat eye ring
    j: "#4a3a9a", // cat graduation cap
    W: "#ffffff",
    w: "#c9c2e8", // whiskers, letter lines
    P: "#ff8fab", // pink nose
    C: "#3a2d78", // graduation cap
    c: "#261d52", // cap band
    Y: "#ffd23f", // gold
    R: "#ff3d5a", // red collar
    A: "#9ad7ff", // fish
    S: "#5ec8ff", // fish belly
    N: "#1d4f86", // fish outline
    M: "#fff3c4", // moon
    m: "#e8d48a", // moon craters
    V: "#8f78ee", // envelope flap
    U: "#5b45b0", // envelope body
    I: "#2a1f5c", // envelope inside
    Q: "#4a3796", // envelope pocket
    E: "#7bd389", // green
    F: "#3d2f80", // night cloud
    f: "#2b2163", // night cloud shade
  };

  function fromGrid(rows) {
    const h = rows.length;
    const w = Math.max(...rows.map((r) => r.length));
    return draw(w, h, (px) => {
      rows.forEach((row, y) => [...row].forEach((ch, x) => ch !== "." && px(x, y, ch)));
    });
  }

  function draw(w, h, paint) {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    paint((x, y, ch) => {
      ctx.fillStyle = PALETTE[ch] || ch;
      ctx.fillRect(x, y, 1, 1);
    });
    return { url: canvas.toDataURL(), w, h };
  }

  // ---------- Black cat (24 x 25, chibi: big head, big eyes, short body, tail curled at its feet) ----------
  const CAT_HEAD = [
    ".........KKKKKK.........",
    "......KKKjjjjjjKKK......",
    "..O.KKjjjjjjYjjjjjKK.O..",
    ".OBO..KKKjjjjjjKKKY.OBO.",
    ".OBBO...KccccccK..YOBeO.",
    "OBBBBOOOOKKKKKKOOOOBBeO.",
    "OBBBBeeeeBBBBBBeeeeBBBBO",
    "OBBBeeKKeeBBBBeeKKeeBBBO",
    "OBBeeKKKKeeBBeeKKKKeeBBO",
    "OBBeKKWWKKeBBeKKWWKKeBBO",
    "OBBeKKWKKKeBBeKKWKKKeBBO",
    "OBBeeKKKKeeBBeeKKKKeeBBO",
    "OBBBeeKKeeBBBBeeKKeeBBBO",
    "OBBBBeeeeBBBBBBeeeeBBBBO",
    ".OBBBBBBBBBBBPPBBBBBBBO.",
    "..OBBBBBBBBBBBBBBBBBBO..",
    "...OOOBBBBBBBBBBBBOOO...",
  ];
  const CAT_HEAD_BLINK = [
    ".........KKKKKK.........",
    "......KKKjjjjjjKKK......",
    "..O.KKjjjjjjYjjjjjKK.O..",
    ".OBO..KKKjjjjjjKKKY.OBO.",
    ".OBBO...KccccccK..YOBeO.",
    "OBBBBOOOOKKKKKKOOOOBBeO.",
    "OBBBBBBBBBBBBBBBBBBBBBBO",
    "OBBBBBBBBBBBBBBBBBBBBBBO",
    "OBBBBBBBBBBBBBBBBBBBBBBO",
    "OBBeBBBBBBeBBeBBBBBBeBBO",
    "OBBBeeeeeeBBBBeeeeeeBBBO",
    "OBBBBBBBBBBBBBBBBBBBBBBO",
    "OBBBBBBBBBBBBBBBBBBBBBBO",
    "OBBBBBBBBBBBBBBBBBBBBBBO",
    ".OBBBBBBBBBBBPPBBBBBBBO.",
    "..OBBBBBBBBBBBBBBBBBBO..",
    "...OOOBBBBBBBBBBBBOOO...",
  ];
  const CAT_BODY = [
    ".....OBBBBBBBBBBBBO.....",
    "....OBBBBBBBBBBBBBBO....",
    "....OBBKBBBBBBBKBBBO.OO.",
    "....OBBKBBBBBBBKBBBOOBBO",
    "....OBBKBBBBBBBKBBBO.OBO",
    "....OBBBBBBBBBBBBBBOOBBO",
  ];
  const FEET = {
    stand: [
      "....OBBBOBBBBBBOBBBBBBO.",
      "....OOOOOOOOOOOOOOOOOO..",
    ],
    stepA: [
      "...OBBBO.OBBBBOBBBBBBO..",
      "...OOOOO..OOOOOOOOOOO...",
    ],
    stepB: [
      "....OBBBBOBBBBO.OBBBBBO.",
      ".....OOOOOOOOOO..OOOOO..",
    ],
  };
  const cat = {
    stand: fromGrid([...CAT_HEAD, ...CAT_BODY, ...FEET.stand]),
    blink: fromGrid([...CAT_HEAD_BLINK, ...CAT_BODY, ...FEET.stand]),
    walkA: fromGrid([...CAT_HEAD, ...CAT_BODY, ...FEET.stepA]),
    walkB: fromGrid([...CAT_HEAD, ...CAT_BODY, ...FEET.stepB]),
  };

  // ---------- Things ----------
  const fish = fromGrid([
    "...NNNNNN.....",
    ".NNAAAAAANN.NN",
    "NAWKAAAAAAANAN",
    "NAAAAAAAAAAANN",
    "NSSSSSSSSSANAN",
    ".NNSSSSSSNN.NN",
    "...NNNNNN.....",
  ]);

  const heart = fromGrid([".KK.KK.", "KRRKRRK", "KRWRRRK", ".KRRRK.", "..KRK..", "...K..."]);
  const paw = fromGrid(["..OO.OO..", "..OO.OO..", "OO.....OO", "OO.OOO.OO", "..OOOOO..", ".OOOOOOO.", ".OOOOOOO.", "..OO.OO.."]);
  const star = fromGrid(["....K....", "...KYK...", "KKKKYKKKK", "KYYYYYYYK", ".KYYYYYK.", "..KYYYK..", ".KYYKYYK.", ".KYK.KYK.", ".KK...KK."]);
  const twinkle = fromGrid(["..W..", "..W..", "WWYWW", "..W..", "..W.."]);

  const cloud = fromGrid([
    ".....FFFF.......",
    "....FFFFFF.FFF..",
    "..FFFFFFFFFFFFF.",
    ".FFFFFFFFFFFFFFF",
    "FFFFFFFFFFFFFFFF",
    "FFFFFFFFFFFFFFff",
    ".ffFFFFFFFFffff.",
    "..ffffffffffff..",
  ]);

  const moon = draw(22, 22, (px) => {
    const c = 10.5;
    const craters = [[7, 7, 2.2], [14, 12, 2.8], [8, 15, 1.6], [15, 5, 1.2]];
    for (let y = 0; y < 22; y++)
      for (let x = 0; x < 22; x++) {
        if (Math.hypot(x - c, y - c) > 10.4) continue;
        const crater = craters.some(([cx, cy, r]) => Math.hypot(x - cx, y - cy) < r);
        px(x, y, crater ? "m" : "M");
      }
  });

  // Rooftops, tiled along the bottom of the screen. Deterministic, so the tile repeats seamlessly.
  const roofs = draw(80, 34, (px) => {
    const far = "#1a1240";
    const near = "#0a0716";
    const lit = "#ffd23f";
    const blocks = [[0, 9, 18], [9, 11, 26], [20, 7, 14], [27, 12, 22], [39, 8, 30], [47, 10, 17], [57, 9, 24], [66, 14, 19]];
    blocks.forEach(([x0, w, h], i) => {
      for (let y = 34 - h; y < 34; y++) for (let x = x0; x < x0 + w; x++) px(x, y, far);
      if (i % 3 === 1) for (let k = 1; k <= Math.floor(w / 2); k++) for (let x = x0 + k - 1; x < x0 + w - k + 1; x++) px(x, 34 - h - k, far); // peaked roof
      if (i % 3 === 2) for (let y = 34 - h - 4; y < 34 - h; y++) px(x0 + 2, y, far), px(x0 + 3, y, far); // chimney
      for (let y = 34 - h + 3; y < 30; y += 4)
        for (let x = x0 + 2; x < x0 + w - 2; x += 3) if ((x * 7 + y * 13 + i) % 5 === 0) px(x, y, lit), px(x, y + 1, lit);
    });
    for (let x = 0; x < 80; x++) {
      const top = 28 + Math.round(Math.sin((x / 80) * Math.PI * 2) * 2);
      for (let y = top; y < 34; y++) px(x, y, near);
    }
  });

  // ---------- Envelope (24 x 24) ----------
  function envelope(open) {
    return draw(24, 24, (px) => {
      const top = 8;
      const border = (x, y) => x === 0 || x === 23 || y === top || y === 23;
      if (open) {
        for (let y = 0; y < top; y++)
          for (let x = 0; x < 24; x++) {
            const half = (y + 1) * 1.5;
            const dx = Math.abs(x - 11.5);
            if (dx <= half) px(x, y, dx > half - 1.5 || y === 0 ? "K" : "V");
          }
      }
      for (let y = top; y < 24; y++) for (let x = 0; x < 24; x++) px(x, y, border(x, y) ? "K" : open ? "I" : "U");
      if (open) {
        for (let y = 2; y <= 18; y++) for (let x = 4; x <= 19; x++) px(x, y, x === 4 || x === 19 || y === 2 ? "K" : "W");
        [5, 8, 11].forEach((y) => {
          for (let x = 7; x <= 16; x++) px(x, y, "w");
        });
        for (let x = 7; x <= 12; x++) px(x, 14, "w");
      }
      for (let y = top + 1; y < 23; y++)
        for (let x = 1; x < 23; x++) {
          const edgeY = 15 + Math.floor(Math.abs(x - 11.5) * -0.6);
          if (y > edgeY) px(x, y, y === edgeY + 1 ? "K" : "Q");
        }
      if (!open) {
        for (let y = top; y < 23; y++)
          for (let x = 0; x < 24; x++) {
            const limit = 17 - Math.floor(Math.abs(x - 11.5) * 0.75);
            if (y <= limit) px(x, y, y === limit || border(x, y) ? "K" : "V");
          }
        // gold seal with a paw print
        const seal = [".KKKKKKK.", "KYYYYYYYK", "KYKYKYKYK", "KYYYYYYYK", "KYYKKKYYK", "KYKKKKKYK", "KYYKKKYYK", "KYYYYYYYK", ".KKKKKKK."];
        seal.forEach((row, sy) => [...row].forEach((ch, sx) => ch !== "." && px(7 + sx, 11 + sy, ch)));
      }
    });
  }

  const icons = {
    fish,
    heart,
    paw,
    star,
    calendar: fromGrid([".K.....K.", "KRRRRRRRK", "KRRRRRRRK", "KWWWWWWWK", "KWKWKWKWK", "KWWWWWWWK", "KWKWKWRWK", "KWWWWWWWK", "KKKKKKKKK"]),
    cap: fromGrid(["....KKK....", "..KKCCCKK..", "KKCCCCCCCKK", "..KKCCCKKY.", "...KCCCK.Y.", "...KCCCK.Y.", "....KKK..Y."]),
    camera: fromGrid(["...KKKK....", "KKKKWWKKKKK", "KCCCKKKCCRK", "KCCKWWWKCCK", "KCCKWAWKCCK", "KCCKWWWKCCK", "KCCCKKKCCCK", "KKKKKKKKKKK"]),
    pin: fromGrid([".KKKKK.", "KRRRRRK", "KRWWRRK", "KRWWRRK", "KRRRRRK", ".KRRRK.", "..KRK..", "..KRK..", "...K...", "...K..."]),
    map: fromGrid(["KKKKKKKKKK", "KEEKAAKEEK", "KEEKAAKERK", "KEKAAKERRK", "KEKAAKEERK", "KKAAKEEEEK", "KAAKEEEEEK", "KKKKKKKKKK"]),
    moon: fromGrid(["..MMMM.", ".MMM...", "MMM....", "MMM....", "MMM....", ".MMM...", "..MMMM."]),
    lock: fromGrid(["..YYY..", ".Y...Y.", ".Y...Y.", "YYYYYYY", "YYYKYYY", "YYYKYYY", "YYYYYYY"]),
    bolt: fromGrid(["...YYY", "..YYY.", ".YYY..", "YYYYYY", "..YYY.", ".YYY..", "YYY..."]),
    game: fromGrid(["EE.YY", "EE.YY", ".....", "ww.EE", "ww.EE"]),
    download: fromGrid(["..AAA..", "..AAA..", "..AAA..", "AAAAAAA", ".AAAAA.", "..AAA..", "...A...", "WWWWWWW"]),
    sound: fromGrid(["...W.....", "..WW..W..", "WWWW...W.", "WWWW.W.W.", "WWWW...W.", "..WW..W..", "...W....."]),
    mute: fromGrid(["...W.....", "..WW.....", "WWWW.R.R.", "WWWW..R..", "WWWW.R.R.", "..WW.....", "...W....."]),
    copy: fromGrid(["WWWWW...", "W...W...", "W..WWWWW", "W..W...W", "WWWW...W", "...W...W", "...WWWWW"]),
    eye: fromGrid(["..WWWWW..", ".W..K..W.", "W..KKK..W", ".W..K..W.", "..WWWWW.."]),
    trash: fromGrid([".WWWWW.", "WWWWWWW", ".W.W.W.", ".W.W.W.", ".W.W.W.", ".W.W.W.", ".WWWWW."]),
    plus: fromGrid(["..Y..", "..Y..", "YYYYY", "..Y..", "..Y.."]),
    back: fromGrid(["...WW", "..WW.", ".WW..", "WW...", ".WW..", "..WW.", "...WW"]),
    close: fromGrid(["WW...WW", ".WW.WW.", "..WWW..", ".WW.WW.", "WW...WW"]),
    clock: fromGrid(["..YYY..", ".Y...Y.", "Y..W..Y", "Y..WW.Y", "Y.....Y", ".Y...Y.", "..YYY.."]),
  };
  const sprites = { ...icons, cloud, moon, twinkle, roofs, envelopeClosed: envelope(false), envelopeOpen: envelope(true) };

  function img(sprite, scale, className) {
    const el = new Image(sprite.w * scale, sprite.h * scale);
    el.src = sprite.url;
    el.alt = "";
    el.draggable = false;
    el.className = "px" + (className ? " " + className : "");
    return el;
  }

  // Night scene for every .scene element
  function buildScene(scene) {
    const small = innerWidth < 600;
    const rand = (a, b) => a + Math.random() * (b - a);
    const add = (sprite, scale, cls) => scene.appendChild(img(sprite, scale, cls));
    for (let i = 0; i < (small ? 40 : 80); i++) {
      const s = document.createElement("i");
      s.className = "dot" + (Math.random() < 0.2 ? " big" : "");
      s.style.left = `${rand(0, 100)}%`;
      s.style.top = `${Math.pow(Math.random(), 1.3) * 72}%`;
      s.style.animationDelay = `${rand(-4, 0).toFixed(2)}s`;
      scene.appendChild(s);
    }
    [[12, 10], [78, 30], [30, 22], [60, 8], [90, 48]].forEach(([l, t], i) => {
      const s = img(twinkle, small ? 3 : 4, "twinkle");
      s.style.left = `${l}%`;
      s.style.top = `${t}%`;
      s.style.animationDelay = `${-i * 0.7}s`;
      scene.appendChild(s);
    });
    add(moon, small ? 4 : 6, "moon");
    add(cloud, 6, "cloud c1");
    add(cloud, 4, "cloud c2");
    add(cloud, 3, "cloud c3");
    const roofLayer = document.createElement("div");
    roofLayer.className = "roofs";
    roofLayer.style.backgroundImage = `url(${roofs.url})`;
    scene.appendChild(roofLayer);
    for (let i = 0; i < (small ? 8 : 14); i++) {
      const f = document.createElement("i");
      f.className = "firefly";
      f.style.left = `${rand(2, 98)}%`;
      f.style.top = `${rand(60, 95)}%`;
      f.style.animationDelay = `${rand(-8, 0).toFixed(2)}s`;
      f.style.animationDuration = `${rand(5, 9).toFixed(2)}s`;
      scene.appendChild(f);
    }
  }

  // Replace every <i class="pxi" data-icon="..."> with its pixel image
  function fillIcons(root) {
    (root || document).querySelectorAll("i.pxi:empty").forEach((i) => {
      const sprite = icons[i.dataset.icon];
      if (sprite) i.appendChild(img(sprite, Number(i.dataset.scale) || 3));
    });
  }

  document.querySelectorAll(".scene").forEach(buildScene);
  fillIcons();

  return { cat, sprites, img, fillIcons };
})();
