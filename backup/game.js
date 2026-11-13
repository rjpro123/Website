(function(){
  "use strict";

  // ============================================================
  // Garden Tycoon - run a landscaping crew
  // ============================================================
  var SAVE_KEY = "souwesttycoon";

  // ---------- job types ----------
  var JOBS = [
    { id: "mow",    name: "Mow the lawn",        sub: "Marion, standard lot",    pay: 30,  tool: "mower",    icon: "&#127807;", secs: 2 },
    { id: "edge",   name: "Mow and edge",        sub: "Brighton, front yard",   pay: 45,  tool: "mower",    icon: "&#9986;",  secs: 3 },
    { id: "hedge",  name: "Trim the hedge",      sub: "Stirling, long hedge",    pay: 75,  tool: "trimmer",  icon: "&#127794;", secs: 4 },
    { id: "spray",  name: "Weed spraying",       sub: "Glenelg, lawn and beds",  pay: 70,  tool: "sprayer",  icon: "&#128167;", secs: 4 },
    { id: "clean",  name: "Garden cleanup",      sub: "Unley, end of lease",     pay: 95,  tool: "chipper",  icon: "&#129578;", secs: 5 },
    { id: "mulch",  name: "Mulch the beds",      sub: "Norwood, front beds",     pay: 110, tool: "mulcher",  icon: "&#127756;", secs: 5 },
    { id: "turf",   name: "New turf laid",       sub: "Tea Tree Gully, couch",   pay: 165, tool: "turfkit",  icon: "&#127793;", secs: 6 },
    { id: "tree",   name: "Take down a tree",    sub: "Hindmarsh, medium tree",  pay: 230, tool: "treegear", icon: "&#129699;", secs: 7 },
    { id: "sale",   name: "Ready for sale",      sub: "West Lakes, kerbside",   pay: 260, tool: "turfkit",  icon: "&#127968;", secs: 7 }
  ];

  // ---------- shop ----------
  var SHOP = [
    { id: "mower",   name: "Ride on mower",   cost: 0,    desc: "Cuts the grass properly.",  owned: true, icon: "&#128663;" },
    { id: "trimmer", name: "Hedge trimmer",  cost: 140,  desc: "Unlocks hedge trimming.", icon: "&#9986;" },
    { id: "sprayer", name: "Spray unit",     cost: 300,  desc: "Unlocks weed spraying.", icon: "&#128167;" },
    { id: "chipper", name: "Wood chipper",   cost: 480,  desc: "Unlocks cleanups and green waste.", icon: "&#129698;" },
    { id: "mulcher", name: "Mulch trailer",  cost: 720,  desc: "Unlocks mulching.", icon: "&#127756;" },
    { id: "turfkit", name: "Turf and soil kit", cost: 1300, desc: "Unlocks turf work and sales.", icon: "&#127793;" },
    { id: "treegear",name: "Tree gear",      cost: 2000, desc: "Unlocks tree removal.", icon: "&#129715;" },
    { id: "trailer", name: "Ute and trailer",cost: 600,  desc: "Every job pays 30% more.", icon: "&#128663;" },
    { id: "crew",    name: "Hire a crew member", cost: 450, desc: "Works on jobs while you are away.", repeatable: true, icon: "&#128101;" }
  ];

  var GOAL = 5000;

  var state = null;
  var board = [];        // jobs currently on the board
  var working = [];      // jobs in progress
  var lastTick = Date.now();

  // ---------- helpers ----------
  function byId(list, id){
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function jobDef(id){ return byId(JOBS, id); }
  function shopDef(id){ return byId(SHOP, id); }

  function defaultState(){
    return {
      cash: 80, earned: 0, jobsDone: 0, day: 1,
      owned: { mower: true },
      crew: 0,
      crewJobs: 0,
      best: 0,
      lastSeen: Date.now()
    };
  }

  function save(){
    state.lastSeen = Date.now();
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  function load(){
    var s = null;
    try { s = JSON.parse(localStorage.getItem(SAVE_KEY) || "null"); } catch (e) {}
    if (!s || typeof s !== "object") return defaultState();
    var d = defaultState();
    for (var k in d) if (typeof s[k] === "undefined") s[k] = d[k];
    if (!s.owned || !s.owned.mower) s.owned.mower = true;
    return s;
  }

  function pay(base, job){
    var amount = base;
    if (state.owned.trailer) amount = Math.round(amount * 1.3);
    amount = Math.round(amount * (1 + state.crew * 0.06));
    state.cash += amount;
    state.earned += amount;
    state.jobsDone += 1;
    return amount;
  }

  // ---------- job board ----------
  function availableJobs(){
    var list = [];
    for (var i = 0; i < JOBS.length; i++){
      if (!state.owned[JOBS[i].tool]) continue;
      list.push(JOBS[i]);
    }
    return list;
  }

  function refillBoard(){
    var avail = availableJobs();
    var wanted = 5;
    while (board.length < wanted){
      if (!avail.length) break;
      var pick = avail[Math.floor(Math.random() * avail.length)];
      board.push({ uid: "b" + Date.now() + Math.random().toString(16).slice(2, 7), def: pick, slot: board.length });
      avail.splice(avail.indexOf(pick), 1);
    }
    board = board.slice(0, wanted);
  }

  function doJob(uid){
    for (var i = 0; i < board.length; i++){
      if (board[i].uid !== uid) continue;
      var job = board[i];
      if (!state.owned[job.def.tool]) return;
      var slots = 1 + state.crew;
      if (working.length >= slots) return;
      board.splice(i, 1);
      working.push({ uid: job.uid, def: job.def, total: job.def.secs * 1000, left: job.def.secs * 1000 });
      save();
      render();
      return;
    }
  }

  function finishJob(w){
    var amount = pay(w.def.pay, w.def);
    floatCash(amount);
    popCoin(120 + Math.random() * 220, 180);
    save();
    render();
  }

  // ---------- shop ----------
  function buy(id){
    var item = shopDef(id);
    if (!item) return;
    if (!item.repeatable && state.owned[id]) return;
    if (state.cash < item.cost) return;
    state.cash -= item.cost;
    if (item.repeatable) state.crew += 1;
    else state.owned[id] = true;
    refillBoard();
    save();
    render();
  }

  // ---------- offline + crew earnings ----------
  function processOffline(){
    var now = Date.now();
    var away = Math.min((now - (state.lastSeen || now)) / 1000, 60 * 60 * 4); // cap at 4 hours
    if (state.crew > 0 && away > 20){
      var jobs = Math.floor(away / 9) * state.crew;
      var avg = 55 * (state.owned.trailer ? 1.3 : 1) * (1 + state.crew * 0.06);
      var gain = Math.round(jobs * avg);
      if (gain > 0){
        state.cash += gain;
        state.earned += gain;
        state.jobsDone += jobs;
        state.crewJobs += jobs;
        return { jobs: jobs, gain: gain, mins: Math.round(away / 60) };
      }
    }
    return null;
  }

  function crewTick(){
    if (state.crew <= 0) return;
    var slots = working.length;
    if (slots >= 1 + state.crew) return;
    var avail = availableJobs();
    if (!avail.length) return;
    var pick = avail[Math.floor(Math.random() * avail.length)];
    working.push({ uid: "c" + Date.now() + Math.random().toString(16).slice(2, 7), def: pick, total: pick.secs * 1000, left: pick.secs * 1000, crew: true });
  }

  // ---------- rendering ----------
  var el = {
    cash: document.getElementById("tcash"),
    earned: document.getElementById("tearned"),
    jobs: document.getElementById("tjobs"),
    day: document.getElementById("tday"),
    jobsList: document.getElementById("tyjobs"),
    shop: document.getElementById("tyshop"),
    crew: document.getElementById("tycrew"),
    crewSub: document.getElementById("tycrewsub"),
    win: document.getElementById("tywin"),
    reset: document.getElementById("treset")
  };

  function money(n){ return "$" + Math.round(n).toLocaleString("en-AU"); }

  function floatCash(amount){
    if (!el.cash) return;
    var f = document.createElement("span");
    f.className = "tyfloat";
    f.textContent = "+" + money(amount);
    el.cash.parentNode.appendChild(f);
    setTimeout(function(){ if (f.parentNode) f.parentNode.removeChild(f); }, 1200);
  }

  function render(){
    el.cash.textContent = money(state.cash);
    el.earned.textContent = money(state.earned);
    el.jobs.textContent = state.jobsDone;
    el.day.textContent = state.day;

    // job board
    var html = "";
    for (var i = 0; i < board.length; i++){
      var b = board[i];
      var locked = !state.owned[b.def.tool];
      var busy = working.length >= 1 + state.crew;
      html += '<div class="tyjob' + (locked ? " locked" : "") + '">' +
        '<span class="tyjobicon">' + b.def.icon + '</span>' +
        '<span class="tyjobtext"><b>' + b.def.name + '</b><em>' + b.def.sub + '</em></span>' +
        '<span class="tyjobpay">' + money(b.def.pay) + '</span>' +
        '<button type="button" class="tyjobbtn" data-uid="' + b.uid + '"' + (locked || busy ? " disabled" : "") + '>' + (locked ? "LOCKED" : (busy ? "BUSY" : "DO IT")) + '</button>' +
        '</div>';
    }
    // jobs in progress
    for (var w = 0; w < working.length; w++){
      var wk = working[w];
      var pct = Math.round((1 - wk.left / wk.total) * 100);
      html += '<div class="tyjob doing"><span class="tyjobicon">' + wk.def.icon + '</span>' +
        '<span class="tyjobtext"><b>' + wk.def.name + (wk.crew ? " <small>(crew)</small>" : "") + '</b>' +
        '<span class="tybar"><i style="width:' + pct + '%"></i></span></span></div>';
    }
    el.jobsList.innerHTML = html;

    // shop
    var sh = "";
    for (var s = 0; s < SHOP.length; s++){
      var it = SHOP[s];
      var owned = !it.repeatable && state.owned[it.id];
      var afford = state.cash >= it.cost;
      var count = it.repeatable && state.crew ? " (x" + state.crew + ")" : "";
      sh += '<div class="tyshopitem' + (owned ? " owned" : "") + '">' +
        '<span class="tyshopicon">' + (it.icon || "&#128188;") + '</span>' +
        '<span class="tyshopname"><b>' + it.name + count + '</b><em>' + it.desc + '</em></span>' +
        (owned ? '<span class="tyowned">OWNED</span>' :
          '<button type="button" class="tybuybtn" data-id="' + it.id + '"' + (afford ? "" : " disabled") + '>' + money(it.cost) + '</button>') +
        '</div>';
    }
    el.shop.innerHTML = sh;

    // crew
    var crewHtml = "";
    for (var c = 0; c < state.crew; c++){
      var nm = c === 0 ? "Hutch Man" : "Crew " + (c + 1);
      crewHtml += '<span class="tycrewcard"><span class="tycrewface">' + (c === 0 ? "H" : (c + 1)) + '</span>' +
        '<span><b>' + nm + '</b><em>On the tools</em></span></span>';
    }
    if (!crewHtml) crewHtml = '<span class="tycrewcard empty">No crew yet. Hire one from the shop.</span>';
    el.crew.innerHTML = crewHtml;
    el.crewSub.textContent = state.crew > 0
      ? state.crew + " crew member" + (state.crew > 1 ? "s" : "") + " earning while you are away. They also take jobs off your hands."
      : "Hire a crew member and they will pick up work on their own.";

    var goalFill = document.getElementById("tygoalfill");
    var goalNum = document.getElementById("tygoalnum");
    if (goalFill) goalFill.style.width = Math.min(100, Math.round(state.earned / GOAL * 100)) + "%";
    if (goalNum) goalNum.textContent = money(state.earned) + " of " + money(GOAL);

    el.win.hidden = state.earned < GOAL;
    if (state.earned >= GOAL){
      el.win.querySelector(".tybig").textContent = "Depot owned";
    }
  }

  // ---------- events ----------
  el.jobsList.addEventListener("click", function(e){
    var btn = e.target.closest("[data-uid]");
    if (btn && !btn.disabled) doJob(btn.getAttribute("data-uid"));
  });
  el.shop.addEventListener("click", function(e){
    var btn = e.target.closest("[data-id]");
    if (btn && !btn.disabled) buy(btn.getAttribute("data-id"));
  });
  el.reset.addEventListener("click", function(){
    state = defaultState();
    board = []; working = [];
    refillBoard();
    save(); render();
  });
  document.getElementById("tywinbtn").addEventListener("click", function(){ el.win.hidden = true; });

  // ---------- loop ----------
  function tick(){
    var now = Date.now();
    var dt = Math.min(500, now - lastTick);
    lastTick = now;

    for (var i = working.length - 1; i >= 0; i--){
      working[i].left -= dt;
      if (working[i].left <= 0){
        var w = working.splice(i, 1)[0];
        finishJob(w);
      }
    }

    // crew picks up new work
    crewTick();

    // refill the board slowly
    if (board.length < 5 && Math.random() < 0.02) refillBoard();

    // day counter
    if (state.jobsDone > state.day * 3) { state.day = Math.floor(state.jobsDone / 3) + 1; }

    updateBars();
    drawScene();
    if (Math.random() < 0.01) save();
  }

  function updateBars(){
    var bars = el.jobsList.querySelectorAll(".tybar i");
    var idx = 0;
    for (var w = 0; w < working.length; w++){
      if (bars[idx]) bars[idx].style.width = Math.round((1 - working[w].left / working[w].total) * 100) + "%";
      idx++;
    }
  }


  // ============================================================
  // PIXEL SCENE - the yard grows as the business grows
  // ============================================================
  var sceneCv = document.getElementById("tyscene");
  var sctx = sceneCv ? sceneCv.getContext("2d") : null;
  if (sctx) sctx.imageSmoothingEnabled = false;
  var SW = 480, SH = 260;
  var pops = [];

  function px(c, x, y, w, h, col){ c.fillStyle = col; c.fillRect(x, y, w, h); }

  function drawScene(){
    if (!sctx) return;
    var c = sctx;
    var t = Date.now() / 1000;

    // sky and sun
    px(c, 0, 0, SW, SH, "#6ba7f0");
    px(c, 0, 100, SW, 60, "#8cc4f7");
    px(c, 406, 22, 26, 26, "#ffd45e");
    px(c, 410, 18, 18, 34, "#ffd45e");
    px(c, 418, 26, 2, 18, "#ffd45e");
    var cl1 = Math.round(Math.sin(t * 0.2) * 18);
    var cl2 = Math.round(Math.sin(t * 0.15 + 2) * 24);
    px(c, 40 + cl1, 26, 34, 8, "#ffffff");
    px(c, 52 + cl1, 20, 18, 8, "#ffffff");
    px(c, 250 + cl2, 40, 30, 8, "#ffffff");
    px(c, 262 + cl2, 34, 16, 8, "#ffffff");

    // lawn
    px(c, 0, 190, SW, SH - 190, "#4a9b3c");
    px(c, 0, 190, SW, 4, "#6fc455");
    px(c, 0, 226, SW, 4, "#3a7d30");

    // house
    px(c, 26, 126, 96, 64, "#d9c39a");
    px(c, 18, 114, 112, 14, "#a3452f");
    px(c, 26, 100, 96, 16, "#c2543a");
    px(c, 62, 152, 22, 38, "#6b4423");
    px(c, 74, 170, 3, 3, "#ffd45e");
    px(c, 40, 138, 20, 18, "#8fd3f0");
    px(c, 88, 138, 20, 18, "#8fd3f0");
    px(c, 40, 138, 20, 2, "#2e6f8f");
    px(c, 88, 138, 20, 2, "#2e6f8f");

    // garden bed
    px(c, 140, 206, 70, 20, "#6b4423");
    px(c, 142, 202, 66, 6, "#7fc85c");
    for (var f = 0; f < 5; f++) px(c, 148 + f * 12, 196, 5, 8, "#e2626b");

    // tree
    px(c, 232, 150, 8, 42, "#6b4423");
    px(c, 214, 122, 44, 34, "#2f7a33");
    px(c, 222, 114, 28, 12, "#3f9440");
    px(c, 220, 128, 10, 10, "#57ad4c");

    // hedge
    for (var hg = 0; hg < 7; hg++) px(c, 330 + hg * 16, 168, 16, 24, "#2f7a33");

    // depot shed and ute appear with the trailer upgrade
    if (state.owned.trailer){
      px(c, 380, 146, 64, 46, "#8a8f86");
      px(c, 374, 136, 76, 12, "#5f655e");
      px(c, 396, 164, 22, 28, "#3d423d");
      px(c, 440, 170, 36, 18, "#c2543a");
      px(c, 444, 188, 8, 8, "#2b2b2b");
      px(c, 466, 188, 8, 8, "#2b2b2b");
    }

    // gear standing on the lawn
    var tools = [
      { id: "mower",    x: 168, kind: "mower" },
      { id: "trimmer",  x: 196, kind: "trimmer" },
      { id: "sprayer",  x: 224, kind: "sprayer" },
      { id: "chipper",  x: 252, kind: "chipper" },
      { id: "mulcher",  x: 280, kind: "mulcher" },
      { id: "turfkit",  x: 308, kind: "turf" },
      { id: "treegear", x: 336, kind: "tree" }
    ];
    for (var tl = 0; tl < tools.length; tl++){
      if (!state.owned[tools[tl].id]) continue;
      var X = tools[tl].x, Y = 216;
      if (tools[tl].kind === "mower"){
        px(c, X, Y, 18, 10, "#d82800");
        px(c, X + 4, Y - 8, 6, 8, "#d82800");
        px(c, X, Y + 10, 6, 4, "#2b2b2b");
        px(c, X + 12, Y + 10, 6, 4, "#2b2b2b");
      } else if (tools[tl].kind === "trimmer"){
        px(c, X + 6, Y - 14, 3, 16, "#c8952e");
        px(c, X, Y - 18, 16, 5, "#2f7a33");
      } else if (tools[tl].kind === "sprayer"){
        px(c, X + 4, Y - 12, 10, 14, "#4a9bd0");
        px(c, X + 7, Y - 18, 4, 8, "#2f6f9f");
      } else if (tools[tl].kind === "chipper"){
        px(c, X, Y - 12, 16, 14, "#c2543a");
        px(c, X + 4, Y - 18, 8, 7, "#8a8f86");
      } else if (tools[tl].kind === "mulcher"){
        px(c, X, Y - 10, 18, 12, "#6b4423");
        px(c, X + 2, Y - 14, 14, 5, "#7fc85c");
      } else if (tools[tl].kind === "turf"){
        px(c, X, Y - 8, 16, 10, "#4a9b3c");
        px(c, X + 2, Y - 12, 12, 5, "#6fc455");
      } else if (tools[tl].kind === "tree"){
        px(c, X + 6, Y - 8, 4, 10, "#6b4423");
        px(c, X, Y - 20, 16, 14, "#2f7a33");
      }
    }

    // crew on the tools
    for (var cr = 0; cr < state.crew; cr++){
      var bx = 300 + cr * 22 + Math.round(Math.sin(t * 1.6 + cr) * 14);
      var by = 198 + (cr % 2) * 8;
      px(c, bx, by - 12, 10, 8, "#d82800");
      px(c, bx + 1, by - 20, 8, 8, "#fca044");
      px(c, bx + 2, by - 4, 3, 6, "#0058f8");
      px(c, bx + 6, by - 4, 3, 6, "#0058f8");
    }

    // mower drives while a mowing job is running
    for (var w2 = 0; w2 < working.length; w2++){
      var job = working[w2].def;
      if (job.id !== "mow" && job.id !== "edge") continue;
      var mx = 150 + Math.round(((Date.now() / 14) % 120));
      px(c, mx - 26, 206, 24, 4, "#6fc455");
      px(c, mx, 208, 20, 11, "#d82800");
      px(c, mx + 5, 198, 7, 10, "#d82800");
      px(c, mx, 219, 7, 5, "#2b2b2b");
      px(c, mx + 14, 219, 7, 5, "#2b2b2b");
    }

    // coins popping
    for (var pp = pops.length - 1; pp >= 0; pp--){
      var po = pops[pp];
      po.life -= 1;
      po.y -= 0.7;
      if (po.life <= 0){ pops.splice(pp, 1); continue; }
      px(c, Math.round(po.x), Math.round(po.y), 8, 10, "#ffd45e");
      px(c, Math.round(po.x) + 2, Math.round(po.y) + 2, 4, 6, "#e39d17");
    }
  }

  function popCoin(x, y){
    pops.push({ x: x, y: y, life: 40 });
    if (pops.length > 20) pops.shift();
  }

  // ---------- boot ----------
  state = load();
  var offline = processOffline();
  refillBoard();
  render();
  if (offline && offline.gain > 0){
    el.crewSub.textContent = "While you were away your crew did " + offline.jobs + " jobs and earned " + money(offline.gain) + ".";
  }
  save();

  setInterval(tick, 100);

  // small hook for checking from the console
  window.souwestgame = {
    get cash(){ return state.cash; },
    get earned(){ return state.earned; },
    get jobs(){ return state.jobsDone; },
    get crew(){ return state.crew; },
    get board(){ return board.length; },
    get working(){ return working.length; },
    get owned(){ return state.owned; },
    buy: buy
  };
})();
