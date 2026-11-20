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

    requestAnimationFrame(function(){
      requestAnimationFrame(function(){ v.classList.add("on"); });
    });

    setTimeout(function(){
      window.location.assign(href);
    }, reduced ? 200 : 420);

    setTimeout(function(){
      navigating = false;
      document.body.classList.remove("leaving");
      if (veil) veil.classList.remove("on");
    }, 3500);
  }

  document.addEventListener("click", onClick);

  window.addEventListener("pageshow", function(e){
    if (e.persisted){
      navigating = false;
      document.body.classList.remove("leaving");
      if (veil) veil.classList.remove("on");
    }
  });
})();
