(function(){
  "use strict";

  function init(){
    var btn = document.getElementById("emailBtn");
    var win = document.getElementById("emailWindow");
    var closeBtn = document.getElementById("emailClose");

    // Ensure mini quick-message form redirects back to the current origin's thanks.html
    var nextInputs = document.querySelectorAll('input[name="_next"]');
    if (nextInputs.length){
      var prefix = window.location.pathname.indexOf("/Website/") === 0 ? "/Website/" : "/";
      var nextUrl = window.location.origin + prefix + "thanks.html";
      Array.prototype.forEach.call(nextInputs, function(el){
        el.value = nextUrl;
      });
    }

    if (!btn || !win) return;

    btn.setAttribute("aria-expanded", "false");

    var quickForm = win.querySelector("form");
    var quickSubmit = win.querySelector(".emailsend");
    if (quickForm && quickSubmit){
      quickForm.addEventListener("submit", function(){
        quickSubmit.disabled = true;
        quickSubmit.textContent = "Sending...";
      });
      window.addEventListener("pageshow", function(){
        quickSubmit.disabled = false;
        quickSubmit.textContent = "Send";
      });
    }

    function openWin(){
      win.classList.add("isopen");
      btn.setAttribute("aria-expanded", "true");
      var firstInput = win.querySelector("input:not([type='hidden']):not(.hp)");
      if (firstInput) firstInput.focus();
    }

    function closeWin(restoreFocus){
      win.classList.remove("isopen");
      btn.setAttribute("aria-expanded", "false");
      if (restoreFocus) btn.focus();
    }

    btn.addEventListener("click", function(e){
      e.stopPropagation();
      if (win.classList.contains("isopen")){
        closeWin(false);
      } else {
        openWin();
      }
    });

    if (closeBtn){
      closeBtn.addEventListener("click", function(e){
        e.stopPropagation();
        closeWin(true);
      });
    }

    // Close on Escape
    document.addEventListener("keydown", function(e){
      if (e.key === "Escape" && win.classList.contains("isopen")) closeWin(true);
    });

    // Close when clicking outside
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