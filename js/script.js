(function(){
  "use strict";

  // Footer year
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mark the current tab and bring it into view
  var rawHere = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  var here = rawHere.replace(/\.html$/, "") || "index";
  var tabs = document.querySelectorAll(".navtabs .tab");
  var active = null;
  Array.prototype.forEach.call(tabs, function(a){
    var href = (a.getAttribute("href") || "").split("/").pop().split("#")[0].toLowerCase().replace(/\.html$/, "");
    if (href && href === here){ a.classList.add("isactive"); active = a; }
  });
  var nav = document.querySelector(".navtabs");
  if (active && nav && nav.scrollWidth > nav.clientWidth){
    var navRect = nav.getBoundingClientRect();
    var tabRect = active.getBoundingClientRect();
    var offset = (tabRect.left - navRect.left) + nav.scrollLeft - (nav.clientWidth / 2) + (tabRect.width / 2);
    nav.scrollLeft = Math.max(0, offset);
  }

  // Ensure FormSubmit _next redirects back to the current origin's thanks.html
  var nextInputs = document.querySelectorAll('input[name="_next"]');
  if (nextInputs.length){
    var prefix = window.location.pathname.indexOf("/Website/") === 0 ? "/Website/" : "/";
    var nextUrl = window.location.origin + prefix + "thanks.html";
    Array.prototype.forEach.call(nextInputs, function(el){
      el.value = nextUrl;
    });
  }

  // Thanks page countdown redirect
  var countdownEl = document.getElementById("countdown");
  if (countdownEl){
    var seconds = parseInt(countdownEl.textContent, 10) || 12;
    var timer = null;
    var startCountdown = function(){
      if (timer) clearInterval(timer);
      timer = setInterval(function(){
        seconds = Math.max(0, seconds - 1);
        countdownEl.textContent = seconds;
        if (seconds <= 0){
          clearInterval(timer);
          timer = null;
          window.location.replace("gallery.html");
        }
      }, 1000);
    };
    startCountdown();
    window.addEventListener("pagehide", function(){
      if (timer){ clearInterval(timer); timer = null; }
    });
    window.addEventListener("pageshow", function(e){
      if (e.persisted){
        if (seconds <= 0) window.location.replace("gallery.html");
        else startCountdown();
      }
    });
  }
})();
