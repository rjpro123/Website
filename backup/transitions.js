(function(){
  "use strict";

  var reduceMQ = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches:false };
  var reduced = reduceMQ.matches;
  var navigating = false;
  var veil = null;

  if (reduceMQ.addEventListener){
    reduceMQ.addEventListener("change", function(e){ reduced = e.matches; });
  }

  /* ---------------- Staggered reveal on load ---------------- */
  var REVEAL_SEL = [
    ".brand", ".tagline", ".nav-tabs", ".local-bar",
    ".page-head", ".hero-home", ".sec", ".module", ".dash-side",
    ".mail-card", ".mail-form", ".backrow", ".thanks-wrap",
    ".svc-grid", ".svc-strip", ".gitem", ".site-footer"
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
      n.style.setProperty("--d", (Math.min(i, 14) * 0.045) + "s");
    });

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
  function ensureVeil(){
    if (veil) return veil;
    veil = document.createElement("div");
    veil.className = "page-veil";
    veil.setAttribute("aria-hidden", "true");
    var img = document.createElement("img");
    img.className = "veil-mark";
    img.alt = "";
    img.src = "assets/logo.png";
    img.addEventListener("error", function(){ img.style.display = "none"; });
    var bar = document.createElement("span");
    bar.className = "veil-bar";
    veil.appendChild(img);
    veil.appendChild(bar);
    document.body.appendChild(veil);
    return veil;
  }

  function isInternalLink(link){
    var href = link.getAttribute("href");
    if (!href) return false;
    if (link.target === "_blank" || link.target === "_parent" || link.hasAttribute("download")) return false;
    if (/^(mailto:|tel:|sms:|javascript:|#)/i.test(href)) return false;
    var url;
    try { url = new URL(href, window.location.href); } catch (e) { return false; }
    if (url.origin !== window.location.origin) return false;
    if (url.pathname === window.location.pathname && url.search === window.location.search) return false;
    return true;
  }

  function onClick(e){
    if (navigating) return;
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    var link = e.target && e.target.closest ? e.target.closest("a") : null;
    if (!link || !isInternalLink(link)) return;

    var href = link.getAttribute("href");
    e.preventDefault();
    navigating = true;

    var v = ensureVeil();
    if (!reduced) document.body.classList.add("leaving");

    // two frames guarantees the veil is painted before we navigate away
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){ v.classList.add("on"); });
    });

    setTimeout(function(){
      window.location.assign(href);
    }, reduced ? 200 : 420);
  }

  /* ---------------- Boot ---------------- */
  document.addEventListener("click", onClick);
  reveal();

  window.addEventListener("pageshow", function(e){
    if (e.persisted){
      navigating = false;
      document.body.classList.remove("leaving");
      if (veil) veil.classList.remove("on");
      reveal();
    }
  });
})();
