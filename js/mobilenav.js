(function(){
  "use strict";

  function init(){
    var toggle = document.getElementById("menuToggle");
    var drawer = document.getElementById("mobileDrawer");
    var backdrop = document.getElementById("drawerBackdrop");
    var closeBtn = document.getElementById("drawerClose");
    if (!toggle || !drawer || !backdrop) return;

    var mobileMQ = window.matchMedia ? window.matchMedia("(max-width: 639px)") : null;
    var reduceMQ = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
    var isOpen = false;
    var lastFocus = null;
    var touchStartX = null;
    var touchStartY = null;

    // Highlight active route inside the drawer
    var rawHere = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    var here = rawHere.replace(/\.html$/, "") || "index";
    var links = drawer.querySelectorAll(".drawernav .drawerlink");
    Array.prototype.forEach.call(links, function(link){
      var href = (link.getAttribute("href") || "").split("/").pop().split("#")[0].toLowerCase().replace(/\.html$/, "");
      if (href && href === here){
        link.classList.add("isactive");
        link.setAttribute("aria-current", "page");
      } else {
        link.classList.remove("isactive");
        link.removeAttribute("aria-current");
      }
    });

    function getFocusable(){
      return Array.prototype.slice.call(
        drawer.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
      ).filter(function(el){
        return el.offsetParent !== null;
      });
    }

    function syncScrollState(){
      if (window.scrollY > 24){
        toggle.classList.add("isscrolled");
      } else {
        toggle.classList.remove("isscrolled");
      }
    }

    if ("inert" in drawer) drawer.inert = true;

    function openDrawer(){
      if (isOpen) return;
      isOpen = true;
      lastFocus = document.activeElement;

      if ("inert" in drawer) drawer.inert = false;
      drawer.setAttribute("aria-hidden", "false");
      backdrop.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");

      drawer.classList.add("isopen");
      backdrop.classList.add("isopen");
      document.documentElement.classList.add("navlock");
      document.body.classList.add("navlock");

      var targetFocus = closeBtn || getFocusable()[0];
      if (targetFocus){
        setTimeout(function(){
          if (isOpen) targetFocus.focus();
        }, reduceMQ.matches ? 10 : 60);
      }
    }

    function closeDrawer(restoreFocus){
      if (!isOpen) return;
      isOpen = false;

      drawer.classList.remove("isopen");
      backdrop.classList.remove("isopen");
      if ("inert" in drawer) drawer.inert = true;
      drawer.setAttribute("aria-hidden", "true");
      backdrop.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");

      document.documentElement.classList.remove("navlock");
      document.body.classList.remove("navlock");

      if (restoreFocus){
        var returnTo = (lastFocus && typeof lastFocus.focus === "function" && lastFocus !== document.body)
          ? lastFocus
          : toggle;
        returnTo.focus();
      }
      lastFocus = null;
    }

    toggle.addEventListener("click", function(){
      if (isOpen) closeDrawer(true);
      else openDrawer();
    });

    if (closeBtn){
      closeBtn.addEventListener("click", function(){
        closeDrawer(true);
      });
    }

    backdrop.addEventListener("click", function(){
      closeDrawer(true);
    });

    // Close drawer cleanly when tapping a link; smooth scroll if tapping #mailForm on index
    drawer.addEventListener("click", function(e){
      var anchor = e.target && e.target.closest ? e.target.closest("a") : null;
      if (!anchor) return;
      var href = anchor.getAttribute("href") || "";
      if (href === "index.html#mailForm" && here === "index"){
        e.preventDefault();
        closeDrawer(false);
        var formEl = document.getElementById("mailForm");
        if (formEl){
          formEl.scrollIntoView({ behavior: reduceMQ.matches ? "auto" : "smooth", block: "start" });
          var firstInput = document.getElementById("mailName");
          if (firstInput){
            setTimeout(function(){ firstInput.focus({ preventScroll: true }); }, reduceMQ.matches ? 20 : 320);
          }
        }
        return;
      }
      closeDrawer(false);
    });

    // Keyboard Escape and focus trapping
    document.addEventListener("keydown", function(e){
      if (!isOpen) return;
      if (e.key === "Escape"){
        e.preventDefault();
        closeDrawer(true);
        return;
      }
      if (e.key === "Tab"){
        var focusable = getFocusable();
        if (!focusable.length) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (e.shiftKey){
          if (document.activeElement === first || !drawer.contains(document.activeElement)){
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !drawer.contains(document.activeElement)){
            e.preventDefault();
            first.focus();
          }
        }
      }
    });

    // Swipe right to dismiss drawer
    drawer.addEventListener("touchstart", function(e){
      if (!isOpen || !e.touches || e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    drawer.addEventListener("touchend", function(e){
      if (!isOpen || touchStartX === null || !e.changedTouches || !e.changedTouches.length) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      var dy = e.changedTouches[0].clientY - touchStartY;
      touchStartX = null;
      touchStartY = null;
      if (dx > 60 && Math.abs(dx) > Math.abs(dy) * 1.3){
        closeDrawer(true);
      }
    }, { passive: true });

    // Automatically close if viewport expands past mobile breakpoint
    function handleBreakpoint(){
      if (mobileMQ && !mobileMQ.matches && isOpen){
        closeDrawer(false);
      }
    }

    if (mobileMQ){
      if (mobileMQ.addEventListener) mobileMQ.addEventListener("change", handleBreakpoint);
      else if (mobileMQ.addListener) mobileMQ.addListener(handleBreakpoint);
    }

    window.addEventListener("scroll", syncScrollState, { passive: true });
    window.addEventListener("pageshow", function(){ closeDrawer(false); syncScrollState(); });
    syncScrollState();
  }

  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
