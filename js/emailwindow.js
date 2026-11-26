(function(){
  "use strict";

  function init(){
    var btn = document.getElementById("emailBtn");
    var win = document.getElementById("emailWindow");
    var closeBtn = document.getElementById("emailClose");
    if (!btn || !win) return;

    var widthMQ = window.matchMedia ? window.matchMedia("(max-width: 640px)") : null;
    var touchMQ = window.matchMedia ? window.matchMedia("(hover: none) and (pointer: coarse)") : null;
    var ua = navigator.userAgent || "";
    var isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    var inFrame = false;
    try { inFrame = window.self !== window.top; } catch (err) { inFrame = true; }

    function isMobile(){
      if (isMobileUA) return true;
      if (widthMQ && widthMQ.matches) return true;
      if (touchMQ && touchMQ.matches) return true;
      return window.innerWidth <= 640;
    }

    function openWin(){
      win.classList.add("isopen");
      win.setAttribute("aria-hidden", "false");
      btn.setAttribute("aria-expanded", "true");
      var firstInput = win.querySelector("input:not([type='hidden']):not(.hp)");
      if (firstInput){
        requestAnimationFrame(function(){
          try { firstInput.focus({ preventScroll: true }); } catch (err) { firstInput.focus(); }
        });
      }
    }

    function closeWin(restoreFocus){
      win.classList.remove("isopen");
      win.setAttribute("aria-hidden", "true");
      if (!isMobile()) btn.setAttribute("aria-expanded", "false");
      if (restoreFocus){
        try { btn.focus({ preventScroll: true }); } catch (err) { btn.focus(); }
      }
    }

    function syncMode(){
      if (isMobile()){
        win.classList.remove("isopen");
        win.setAttribute("aria-hidden", "true");
        btn.removeAttribute("aria-expanded");
        if (inFrame){
          btn.setAttribute("target", "_blank");
          btn.setAttribute("rel", "noopener noreferrer");
        } else {
          btn.removeAttribute("target");
          btn.removeAttribute("rel");
        }
      } else {
        var open = win.classList.contains("isopen");
        win.setAttribute("aria-hidden", open ? "false" : "true");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        btn.removeAttribute("target");
        btn.removeAttribute("rel");
      }
    }

    syncMode();
    [widthMQ, touchMQ].forEach(function(mq){
      if (!mq) return;
      if (mq.addEventListener) mq.addEventListener("change", syncMode);
      else if (mq.addListener) mq.addListener(syncMode);
    });

    var quickForm = win.querySelector("form");
    var quickSubmit = win.querySelector(".emailsend");
    if (quickForm && quickSubmit){
      quickForm.addEventListener("submit", function(e){
        Array.prototype.forEach.call(quickForm.querySelectorAll('input[type="text"]:not(.hp),input[type="email"],textarea'), function(el){
          el.value = el.value.trim();
        });
        if (quickForm.checkValidity && !quickForm.checkValidity()){
          e.preventDefault();
          if (quickForm.reportValidity) quickForm.reportValidity();
          return;
        }
        quickSubmit.disabled = true;
        quickSubmit.textContent = "Sending...";
      });
      window.addEventListener("pageshow", function(){
        quickSubmit.disabled = false;
        quickSubmit.textContent = "Send";
        closeWin(false);
        syncMode();
      });
    }

    btn.addEventListener("click", function(e){
      if (isMobile()) return;
      e.preventDefault();
      e.stopPropagation();
      if (win.classList.contains("isopen")) closeWin(false);
      else openWin();
    });

    if (closeBtn){
      closeBtn.addEventListener("click", function(e){
        e.stopPropagation();
        closeWin(true);
      });
    }

    document.addEventListener("keydown", function(e){
      if (e.key === "Escape" && win.classList.contains("isopen")) closeWin(true);
    });

    document.addEventListener("click", function(e){
      if (!win.classList.contains("isopen")) return;
      var t = e.target;
      var inBtn = btn.contains(t) || (t && t.closest && t.closest("#emailBtn"));
      if (!win.contains(t) && !inBtn) closeWin(false);
    });
  }

  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
