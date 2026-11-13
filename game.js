(function(){
  "use strict";

  // ============================================================
  // 8 bit platformer - Souwest Garden Run
  // ============================================================
  var TILE = 16;
  var VW = 480, VH = 270;
  var ROWS = 15, COLS = 240;

  // tile ids
  var EMPTY = 0, GROUND = 1, BRICK = 2, QBLOCK = 3, PIPE = 4, PLAT = 5, USED = 6;

  var canvas = document.getElementById("game");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  // ---- palette (classic NES look) ----
  var C = {
    sky: "#5c94fc", ground: "#c84c0c", groundTop: "#00a800", brick: "#c84c0c",
    q: "#e39d17", qDark: "#9c4a00", used: "#a0522d", pipe: "#00a800",
    pipeLight: "#80d010", pipeDark: "#005000", coin: "#fcd000", coinDark: "#e39d17",
    red: "#d82800", skin: "#fca044", brown: "#6b3e00", blue: "#0058f8",
    goomba: "#a0522d", goombaDark: "#5c2e00", white: "#fcfcfc", flag: "#00a800"
  };

  // ============================================================
  // LEVEL
  // ============================================================
  var grid, coins, enemies, flag, score, coinCount, lives, time, state, cam;

  function buildLevel(){
    grid = [];
    for (var y = 0; y < ROWS; y++){
      grid[y] = [];
      for (var x = 0; x < COLS; x++) grid[y][x] = EMPTY;
    }
    coins = []; enemies = [];

    function set(x, y, t){ if (x >= 0 && x < COLS && y >= 0 && y < ROWS) grid[y][x] = t; }
    function rect(x, y, w, h, t){ for (var j = y; j < y + h; j++) for (var i = x; i < x + w; i++) set(i, j, t); }
    function row(x, y, pattern){
      for (var i = 0; i < pattern.length; i++){
        var c = pattern.charAt(i);
        set(x + i, y, c === "X" ? BRICK : (c === "?" ? QBLOCK : (c === "=" ? PLAT : EMPTY)));
      }
    }

    var G = ROWS - 2;              // ground row
    var gaps = [[69,72],[104,108],[151,155],[186,190]];
    for (var x = 0; x < COLS; x++){
      var gap = false;
      for (var g = 0; g < gaps.length; g++) if (x >= gaps[g][0] && x <= gaps[g][1]) gap = true;
      if (!gap){ set(x, G, GROUND); set(x, G + 1, GROUND); }
    }

    // pipes
    var pipes = [[28,2],[58,3],[88,4],[118,3],[138,2],[161,4],[196,3]];
    for (var p = 0; p < pipes.length; p++){
      rect(pipes[p][0], G - pipes[p][1], 2, pipes[p][1], PIPE);
    }

    // block rows
    row(16,  G - 4, "X?X?");
    row(21,  G - 4, "XXXX");
    row(36,  G - 4, "?XXX");
    row(41,  G - 8, "?X?X");
    row(46,  G - 4, "XX?X");
    row(66,  G - 4, "X?XX");
    row(94,  G - 4, "XXXX");
    row(99,  G - 8, "X?X?");
    row(124, G - 4, "?XXX");
    row(129, G - 8, "XXXX");
    row(143, G - 4, "XX?X");
    row(172, G - 4, "XXXX");
    row(177, G - 8, "?X?X");
    row(210, G - 4, "XX?XX");
    row(222, G - 8, "X?X");

    // floating platforms
    row(48,  G - 7, "=====");
    row(76,  G - 6, "===");
    row(112, G - 8, "=====");
    row(146, G - 6, "====");
    row(166, G - 9, "=====");

    // coins
    function coinRow(x, y, n, step){
      step = step || 1;
      for (var i = 0; i < n; i++) coins.push({ x: (x + i * step) * TILE + 4, y: y * TILE + 4, w: 8, h: 12, got: false, spin: 0 });
    }
    coinRow(18,  G - 6, 4);
    coinRow(40,  G - 9, 4);
    coinRow(50,  G - 8, 5);
    coinRow(67,  G - 7, 3);
    coinRow(97,  G - 9, 4);
    coinRow(114, G - 9, 4);
    coinRow(145, G - 8, 4);
    coinRow(167, G - 10, 5);
    coinRow(180, G - 9, 4);
    coinRow(212, G - 9, 4);

    // goombas
    var spots = [34, 53, 80, 97, 122, 143, 160, 178, 196, 205];
    for (var s = 0; s < spots.length; s++){
      enemies.push({ x: spots[s] * TILE + 2, y: G * TILE - 14, w: 14, h: 14, vx: -0.45, vy: 0, alive: true, squash: 0 });
    }

    // flag pole
    flag = { x: 231 * TILE, y: G * TILE - 96, poleH: 96, won: false };
  }

  // ============================================================
  // PLAYER
  // ============================================================
  var p, keys;

  function newPlayer(){
    p = { x: 3 * TILE, y: (ROWS - 3) * TILE, w: 12, h: 16, vx: 0, vy: 0, onGround: false, face: 1, anim: 0, dead: false };
  }

  function reset(){
    buildLevel();
    newPlayer();
    score = 0; coinCount = 0; lives = 3; time = 300; cam = 0; state = "ready";
    updateHud();
  }

  function respawn(){
    newPlayer();
    cam = 0;
    time = Math.max(time, 120);
    state = "play";
  }

  // ============================================================
  // INPUT
  // ============================================================
  keys = { left: false, right: false, jump: false };
  var jumpHeld = false;

  var KEYMAP = {
    ArrowLeft: "left", KeyA: "left",
    ArrowRight: "right", KeyD: "right",
    ArrowUp: "jump", KeyW: "jump", Space: "jump"
  };

  // stop the page scrolling when a thumb is on the game
  canvas.addEventListener("touchmove", function(e){ e.preventDefault(); }, { passive: false });

  document.addEventListener("keydown", function(e){
    var k = KEYMAP[e.code];
    if (!k) return;
    e.preventDefault();
    if (!keys[k]){
      if (k === "jump") jumpHeld = true;
    }
    keys[k] = true;
    if (k === "jump" && state === "ready") startGame();
  });
  document.addEventListener("keyup", function(e){
    var k = KEYMAP[e.code];
    if (!k) return;
    e.preventDefault();
    keys[k] = false;
    if (k === "jump") jumpHeld = false;
  });

  // on screen buttons
  var pointers = {};
  Array.prototype.forEach.call(document.querySelectorAll(".gpad"), function(btn){
    function press(e){
      e.preventDefault();
      try { btn.setPointerCapture(e.pointerId); } catch (err) {}
      var key = btn.getAttribute("data-key");
      pointers[e.pointerId] = key;
      keys[key] = true;
      if (key === "jump") jumpHeld = true;
      if (state === "ready") startGame();
    }
    function release(e){
      var key = pointers[e.pointerId];
      if (!key) return;
      delete pointers[e.pointerId];
      keys[key] = false;
      if (key === "jump") jumpHeld = false;
    }
    btn.addEventListener("pointerdown", press);
    btn.addEventListener("pointerup", release);
    btn.addEventListener("pointercancel", release);
    btn.addEventListener("pointerleave", release);
  });

  // ============================================================
  // SOUND (tiny web audio blips)
  // ============================================================
  var audio = null, muted = false;
  function beep(freq, dur, type){
    if (muted) return;
    try {
      if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
      var o = audio.createOscillator(), g = audio.createGain();
      o.type = type || "square";
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.08, audio.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + dur);
      o.connect(g); g.connect(audio.destination);
      o.start(); o.stop(audio.currentTime + dur);
    } catch (err) {}
  }
  var sJump = function(){ beep(420, 0.12); };
  var sCoin = function(){ beep(880, 0.08); setTimeout(function(){ beep(1320, 0.12); }, 70); };
  var sStomp = function(){ beep(180, 0.1); };
  var sBreak = function(){ beep(120, 0.14); };
  var sDie = function(){ beep(300, 0.1); setTimeout(function(){ beep(160, 0.3); }, 110); };

  // ============================================================
  // TILE HELPERS
  // ============================================================
  function tileAt(tx, ty){
    if (ty < 0) return EMPTY;
    if (tx < 0 || tx >= COLS) return GROUND;
    if (ty >= ROWS) return EMPTY;
    return grid[ty][tx];
  }
  function solid(tx, ty){
    var t = tileAt(tx, ty);
    return t === GROUND || t === BRICK || t === QBLOCK || t === PIPE || t === PLAT || t === USED;
  }
  function overlaps(a, b){
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  // ============================================================
  // UPDATE
  // ============================================================
  var parts = [];

  function update(){
    if (state !== "play") return;

    // timer
    if (time > 0){
      if (++frameCount % 24 === 0){ time--; updateHud(); }
      if (time === 0){ state = "over"; showOverlay("TIME UP", "The clock beat you. Press restart to go again."); }
    }

    // horizontal
    var maxSpeed = keys.jump ? 2.4 : 1.6;
    if (keys.left) { p.vx -= 0.16; p.face = -1; }
    else if (keys.right) { p.vx += 0.16; p.face = 1; }
    else {
      if (p.vx > 0) p.vx -= 0.12; else if (p.vx < 0) p.vx += 0.12;
    }
    p.vx = Math.max(-maxSpeed, Math.min(maxSpeed, p.vx));
    if (p.vx > 2.2) p.vx = 2.2; else if (p.vx < -2.2) p.vx = -2.2;

    // jump
    if (jumpHeld && p.onGround){
      p.vy = -5.2; p.onGround = false; sJump();
    }
    if (!jumpHeld && p.vy < -1.4) p.vy = -1.4;   // variable jump height

    p.vy += 0.28;
    if (p.vy > 7) p.vy = 7;

    // move x
    p.x += p.vx;
    resolveX();
    // move y
    p.y += p.vy;
    resolveY();

    p.anim += Math.abs(p.vx);

    // coins
    for (var i = 0; i < coins.length; i++){
      var c = coins[i];
      if (c.got) continue;
      c.spin += 0.12;
      if (overlaps(p, c)){
        c.got = true; coinCount++; score += 200; sCoin(); updateHud();
      }
    }

    // enemies
    for (var j = 0; j < enemies.length; j++){
      var e = enemies[j];
      if (!e.alive) { if (e.squash > 0) e.squash -= 0.08; continue; }
      e.vy += 0.28;
      e.x += e.vx;
      // turn around at walls and ledges
      var tx = Math.floor((e.x + (e.vx > 0 ? e.w : -1)) / TILE);
      var ty = Math.floor((e.y + e.h + 1) / TILE);
      if (solid(tx, Math.floor((e.y + e.h - 1) / TILE))){
        e.vx = -e.vx; e.x += e.vx;
      } else if (!solid(Math.floor(e.x / TILE), Math.floor((e.y + e.h + 1) / TILE))){
        e.vx = -e.vx; e.x += e.vx;
      }
      e.y += e.vy;
      if (e.y > (ROWS - 1) * TILE) { e.alive = false; }
      if (overlaps(p, e)){
        if (p.vy > 0.6 && p.y + p.h - e.y < 10){
          e.alive = false; e.squash = 1; p.vy = -3.2; score += 100; sStomp(); updateHud();
        } else {
          die();
        }
      }
    }

    // flag
    if (!flag.won && p.x + p.w > flag.x){
      flag.won = true; score += 1000; state = "won";
      showOverlay("COURSE CLEAR", "Score " + score + ". That is a tidy yard. Press restart to run it again.");
      updateHud();
    }

    // fall off the world
    if (p.y > ROWS * TILE) die();

    // camera
    var target = p.x - VW * 0.42;
    if (target > cam) cam = target;
    if (cam < 0) cam = 0;
    if (cam > COLS * TILE - VW) cam = COLS * TILE - VW;
  }

  function resolveX(){
    var left = Math.floor(p.x / TILE), right = Math.floor((p.x + p.w - 1) / TILE);
    var top = Math.floor(p.y / TILE), bottom = Math.floor((p.y + p.h - 1) / TILE);
    if (p.vx > 0){
      if (solid(right, top) || solid(right, bottom)){
        p.x = right * TILE - p.w; p.vx = 0;
      }
    } else if (p.vx < 0){
      if (solid(left, top) || solid(left, bottom)){
        p.x = (left + 1) * TILE; p.vx = 0;
      }
    }
  }

  function resolveY(){
    p.onGround = false;
    var left = Math.floor(p.x / TILE), right = Math.floor((p.x + p.w - 1) / TILE);
    var top = Math.floor(p.y / TILE), bottom = Math.floor((p.y + p.h - 1) / TILE);

    if (p.vy > 0){
      if (solid(left, bottom) || solid(right, bottom)){
        p.y = bottom * TILE - p.h; p.vy = 0; p.onGround = true;
      }
    } else if (p.vy < 0){
      if (solid(left, top) || solid(right, top)){
        var tx = Math.floor(p.x + p.w / 2) / TILE;
        var ty = Math.floor(p.y) / TILE;
        bump(tx, ty);
        p.y = (ty + 1) * TILE; p.vy = 0;
      }
    }
  }

  // hitting a block from below
  function bump(tx, ty){
    var t = tileAt(tx, ty);
    if (t === QBLOCK){
      grid[ty][tx] = USED;
      coinCount++; score += 200; sCoin(); updateHud();
    } else if (t === BRICK){
      grid[ty][tx] = EMPTY;
      sBreak();
      for (var i = 0; i < 4; i++){
        parts.push({ x: tx * TILE + 2, y: ty * TILE + 2, vx: (i % 2 ? 1 : -1) * 1.1, vy: -2.4, life: 26, size: 4 });
      }
    }
  }

  function die(){
    if (state !== "play") return;
    lives--; updateHud();
    sDie();
    if (lives <= 0){
      state = "over";
      showOverlay("GAME OVER", "Score " + score + ". Press restart to try again.");
    } else {
      respawn();
    }
  }

  // ============================================================
  // DRAW
  // ============================================================
  function draw(){
    ctx.fillStyle = C.sky;
    ctx.fillRect(0, 0, VW, VH);

    var x0 = Math.floor(cam / TILE), x1 = x0 + Math.ceil(VW / TILE) + 1;

    // tiles
    for (var tx = x0; tx <= x1 && tx < COLS; tx++){
      for (var ty = 0; ty < ROWS; ty++){
        var t = grid[ty][tx];
        if (t === EMPTY) continue;
        var px = tx * TILE - cam, py = ty * TILE;
        if (t === GROUND){
          ctx.fillStyle = C.ground; ctx.fillRect(px, py, TILE, TILE);
          ctx.fillStyle = C.groundTop; ctx.fillRect(px, py, TILE, 4);
          ctx.fillStyle = C.brown; ctx.fillRect(px, py + 12, TILE, 2);
        } else if (t === BRICK){
          ctx.fillStyle = C.brick; ctx.fillRect(px, py, TILE, TILE);
          ctx.fillStyle = "#000"; ctx.fillRect(px, py + 7, TILE, 1); ctx.fillRect(px + 7, py, 1, 8); ctx.fillRect(px + 3, py + 8, 1, 8); ctx.fillRect(px + 11, py + 8, 1, 8);
        } else if (t === QBLOCK){
          ctx.fillStyle = C.q; ctx.fillRect(px, py, TILE, TILE);
          ctx.fillStyle = C.qDark; ctx.fillRect(px, py, TILE, 2); ctx.fillRect(px, py + 14, TILE, 2); ctx.fillRect(px, py, 2, TILE); ctx.fillRect(px + 14, py, 2, TILE);
          ctx.fillStyle = "#000";
          ctx.fillRect(px + 5, py + 6, 2, 2); ctx.fillRect(px + 9, py + 6, 2, 2); ctx.fillRect(px + 7, py + 8, 2, 2);
        } else if (t === USED){
          ctx.fillStyle = C.used; ctx.fillRect(px, py, TILE, TILE);
          ctx.fillStyle = C.qDark; ctx.fillRect(px, py, TILE, 2); ctx.fillRect(px, py + 14, TILE, 2);
        } else if (t === PIPE){
          ctx.fillStyle = C.pipe; ctx.fillRect(px, py, TILE, TILE);
          ctx.fillStyle = C.pipeLight; ctx.fillRect(px + 2, py, 3, TILE);
          ctx.fillStyle = C.pipeDark; ctx.fillRect(px + TILE - 3, py, 3, TILE);
        } else if (t === PLAT){
          ctx.fillStyle = C.pipeLight; ctx.fillRect(px, py, TILE, 6);
          ctx.fillStyle = C.pipeDark; ctx.fillRect(px, py + 6, TILE, 2);
        }
      }
    }

    // flag pole
    if (flag && !flag.won){
      var fx = flag.x - cam;
      ctx.fillStyle = C.flag;
      ctx.fillRect(fx, flag.y, 4, flag.poleH);
      ctx.fillStyle = C.white;
      ctx.fillRect(fx - 12, flag.y, 12, 10);
      ctx.fillStyle = C.red;
      ctx.fillRect(fx - 12, flag.y, 12, 3);
      ctx.fillStyle = C.flag;
      ctx.fillRect(fx - 2, flag.y - 6, 8, 8);
    }

    // coins
    for (var i = 0; i < coins.length; i++){
      var c = coins[i];
      if (c.got) continue;
      var cxp = c.x - cam;
      var wob = Math.abs(Math.sin(c.spin));
      ctx.fillStyle = C.coin;
      ctx.fillRect(cxp + (wob > 0.6 ? 3 : 1), c.y, 6, 12);
      ctx.fillStyle = C.coinDark;
      ctx.fillRect(cxp + (wob > 0.6 ? 2 : 4), c.y + 2, 2, 8);
    }

    // enemies
    for (var j = 0; j < enemies.length; j++){
      var e = enemies[j];
      var ex = e.x - cam, ey = e.y;
      if (!e.alive){
        if (e.squash > 0){
          ctx.fillStyle = C.goombaDark;
          ctx.fillRect(ex, ey + 8, 14, 6);
        }
        continue;
      }
      var step = (Math.floor(e.x / 4) % 2) ? 0 : 2;
      ctx.fillStyle = C.goomba;
      ctx.fillRect(ex + 1, ey + 2, 12, 10);
      ctx.fillStyle = C.goombaDark;
      ctx.fillRect(ex, ey + 4, 14, 8);
      ctx.fillStyle = C.white;
      ctx.fillRect(ex + 3 + step, ey + 5, 3, 3);
      ctx.fillRect(ex + 8 - step, ey + 5, 3, 3);
      ctx.fillStyle = "#000";
      ctx.fillRect(ex + 4 + step, ey + 6, 1, 2);
      ctx.fillRect(ex + 9 - step, ey + 6, 1, 2);
      ctx.fillStyle = C.goombaDark;
      ctx.fillRect(ex - 1 + step, ey + 12, 6, 2);
      ctx.fillRect(ex + 9 - step, ey + 12, 6, 2);
    }

    // player
    if (p && state !== "over"){
      var px = Math.round(p.x - cam), py = Math.round(p.y);
      var run = p.onGround && Math.abs(p.vx) > 0.4;
      var legA = run ? (Math.floor(p.anim / 4) % 2 ? 3 : 0) : 0;
      // body
      ctx.fillStyle = C.red; ctx.fillRect(px + 1, py, 10, 5);      // cap
      ctx.fillStyle = C.red; ctx.fillRect(px + 8, py + 4, 3, 2);     // brim
      ctx.fillStyle = C.skin; ctx.fillRect(px + 2, py + 4, 8, 5);    // face
      ctx.fillStyle = C.brown; ctx.fillRect(px + 1, py + 3, 4, 3);  // hair
      ctx.fillStyle = "#000"; ctx.fillRect(px + 8, py + 6, 1, 2);     // eye
      ctx.fillStyle = C.red; ctx.fillRect(px + 1, py + 9, 10, 4);     // shirt
      ctx.fillStyle = C.blue; ctx.fillRect(px + 2, py + 12, 8, 3);    // overalls
      ctx.fillStyle = C.brown; ctx.fillRect(px + 1 - legA, py + 15, 5, 1);
      ctx.fillRect(px + 7 + legA, py + 15, 5, 1);
    }

    // particles
    for (var k = parts.length - 1; k >= 0; k--){
      var pt = parts[k];
      pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.2; pt.life -= 1;
      if (pt.life <= 0){ parts.splice(k, 1); continue; }
      ctx.fillStyle = C.brick;
      ctx.fillRect(Math.round(pt.x - cam), Math.round(pt.y), pt.size, pt.size);
    }
  }

  // ============================================================
  // HUD + OVERLAY
  // ============================================================
  function updateHud(){
    document.getElementById("gscore").textContent = score;
    document.getElementById("gcoins").textContent = coinCount;
    document.getElementById("gtime").textContent = time;
    document.getElementById("glives").textContent = lives;
  }

  var overlay = document.getElementById("goverlay");
  var titleEl = document.getElementById("gtitle");
  var subEl = document.getElementById("gsub");

  function showOverlay(title, sub){
    titleEl.textContent = title;
    subEl.textContent = sub;
    overlay.style.display = "flex";
    document.getElementById("gstart").textContent = (state === "won") ? "PLAY AGAIN" : "START";
  }
  function hideOverlay(){ overlay.style.display = "none"; }

  function startGame(){
    if (state === "won" || state === "over") reset();
    hideOverlay();
    state = "play";
  }

  document.getElementById("gstart").addEventListener("click", startGame);
  document.getElementById("grestart").addEventListener("click", function(){
    reset(); hideOverlay(); state = "play";
  });
  document.getElementById("gmute").addEventListener("click", function(){
    muted = !muted;
    this.textContent = muted ? "SOUND OFF" : "SOUND ON";
  });

  // ============================================================
  // LOOP
  // ============================================================
  var frameCount = 0;
  reset();
  showOverlay("SOUWEST GARDEN RUN", "Jump the bricks, stomp the goombas, grab the coins.");

  // small hook so the game can be checked from the console
  window.souwestgame = {
    get x(){ return p ? Math.round(p.x) : 0; },
    get y(){ return p ? Math.round(p.y) : 0; },
    get state(){ return state; },
    get coins(){ return coinCount; },
    get score(){ return score; },
    get keys(){ return { left: keys.left, right: keys.right, jump: keys.jump }; }
  };

  function loop(){
    update();
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // keep the game fair if the tab is hidden
  document.addEventListener("visibilitychange", function(){
    if (document.hidden){ keys.left = keys.right = keys.jump = false; jumpHeld = false; }
  });
})();
