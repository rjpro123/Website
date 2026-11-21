(function(){
  "use strict";

  var reduceMQ = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  var reduced = reduceMQ.matches;
  var navigating = false;
  var veil = null;

  if (reduceMQ.addEventListener){
    reduceMQ.addEventListener("change", function(e){ reduced = e.matches; });
  }

  /* ---------------- Souwest overlay veil between pages ---------------- */
  function ensureVeil(){
    if (veil) return veil;
    veil = document.createElement("div");
    veil.className = "pageveil";
    veil.setAttribute("aria-hidden", "true");
    var img = document.createElement("img");
    img.className = "veilmark";
    img.alt = "";
    img.src = "assets/logo.png";
    img.addEventListener("error", function(){ img.style.display = "none"; });
    var bar = document.createElement("span");
    bar.className = "veilbar";
    veil.appendChild(img);
    veil.appendChild(bar);
    document.body.appendChild(veil);
    return veil;
  }

  var resetTimer = null;

  function normPath(p){
    return p.replace(/\/index\.html$/i, "/").replace(/\.html$/i, "");
  }

  function isSamePage(url){
    return url.origin === window.location.origin &&
      normPath(url.pathname) === normPath(window.location.pathname) &&
      url.search === window.location.search &&
      !url.hash;
  }

  function resolveInternalUrl(link){
    var href = link.getAttribute("href");
    if (!href) return null;
    if (link.target === "_blank" || link.target === "_parent" || link.hasAttribute("download")) return null;
    if (/^(mailto:|tel:|sms:|javascript:|#)/i.test(href)) return null;
    var url;
    try { url = new URL(href, window.location.href); } catch (e) { return null; }
    if (url.origin !== window.location.origin) return null;
    return url;
  }

  function clearVeil(){
    navigating = false;
    if (resetTimer){ clearTimeout(resetTimer); resetTimer = null; }
    document.body.classList.remove("leaving");
    if (veil) veil.classList.remove("on");
  }

  function onClick(e){
    if (navigating) return;
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    var link = e.target && e.target.closest ? e.target.closest("a") : null;
    if (!link) return;

    var url = resolveInternalUrl(link);
    if (!url) return;

    if (isSamePage(url)){
      e.preventDefault();
      if (window.scrollY > 0){
        window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      }
      return;
    }

    var href = link.getAttribute("href");
    e.preventDefault();
    navigating = true;

    var v = ensureVeil();
    if (!reduced) document.body.classList.add("leaving");

    requestAnimationFrame(function(){
      requestAnimationFrame(function(){ v.classList.add("on"); });
    });

    setTimeout(function(){
      window.location.assign(href);
    }, reduced ? 200 : 420);

    resetTimer = setTimeout(clearVeil, 3500);
  }

  document.addEventListener("click", onClick);

  window.addEventListener("pagehide", function(){
    if (resetTimer){ clearTimeout(resetTimer); resetTimer = null; }
  });

  window.addEventListener("pageshow", function(e){
    if (e.persisted) clearVeil();
  });
})();
