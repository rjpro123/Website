(function(){
  "use strict";

  var reduceMQ = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches:false };
  var reduced = reduceMQ.matches;
  var nativeVT = typeof document.startViewTransition === "function";

  /* ---------------- Staggered reveal on load ---------------- */
  var REVEAL_SEL = [
    ".brand", ".tagline", ".nav-tabs", ".local-bar",
    ".page-head", ".hero-home", ".sec", ".module", ".dash-side",
    ".mail-card", ".mail-form", ".backrow", ".thanks-wrap",
    ".svc-grid", ".gitem", ".site-footer"
  ];

  function collect(){
    var out = [];
    REVEAL_SEL.forEach(function(sel){
      var found = document.querySelectorAll(sel);
      for (var i = 0; i < found.length; i++) out.push(found[i]);
    });
    return out;
  }

  function reveal(){
    if (reduced) return;
    var nodes = collect();
    if (!nodes.length) return;

    document.body.classList.add("reveal-ready");
    nodes.forEach(function(n, i){
      n.classList.add("reveal");
      n.style.setProperty("--d", (Math.min(i, 14) * 0.055) + "s");
    });

    // safety net: never leave content invisible
    setTimeout(function(){
      nodes.forEach(function(n){ n.classList.add("is-in"); });
    }, 2000);

    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        nodes.forEach(function(n){ n.classList.add("is-in"); });
      });
    });
  }

  /* ---------------- Overlay veil for page changes ---------------- */
  function buildVeil(){
    var veil = document.createElement("div");
    veil.className = "page-veil";
    veil.innerHTML = '<img src="assets/logo.png" class="veil-mark" alt=""><span class="veil-bar"></span>';
    document.body.appendChild(veil);
    return veil;
  }

  function isInternalLink(link){
    var href = link.getAttribute("href");
    if (!href) return false;
    if (link.target === "_blank" || link.hasAttribute("download")) return false;
    if (/^(mailto:|tel:|sms:|javascript:|#)/i.test(href)) return false;
    var url;
    try { url = new URL(href, location.href); } catch (e) { return false; }
    if (url.origin !== location.origin) return false;
    if (url.pathname === location.pathname && url.search === location.search) return false; // anchor / same page
    return true;
  }

  function onClick(e){
    if (reduced || nativeVT) return;               // native transitions handle it
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var link = e.target && e.target.closest ? e.target.closest("a") : null;
    if (!link || !isInternalLink(link)) return;

    var href = link.getAttribute("href");
    e.preventDefault();

    var veil = buildVeil();
    requestAnimationFrame(function(){ veil.classList.add("on"); });
    setTimeout(function(){ location.href = href; }, 460);
  }

  /* ---------------- Boot ---------------- */
  document.addEventListener("click", onClick);
  reveal();

  // restore animations when returning via back/forward cache
  window.addEventListener("pageshow", function(e){
    if (e.persisted) reveal();
  });
})();
