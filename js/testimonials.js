(function(){
  "use strict";

  var section = document.querySelector(".testimonialsection");
  if (!section) return;

  var viewport = section.querySelector(".testimonialviewport");
  var track = section.querySelector(".testimonialtrack");
  var cards = track ? Array.prototype.slice.call(track.querySelectorAll(".testimonialcard")) : [];
  var prevBtn = section.querySelector(".testimonialprev");
  var nextBtn = section.querySelector(".testimonialnext");
  var dotsWrap = section.querySelector(".testimonialdots");
  var statusEl = section.querySelector(".testimonialstatus");

  if (!viewport || !track || cards.length < 2) return;

  var count = cards.length;
  var index = 0;
  var autoTimer = null;
  var AUTO_MS = 6000;
  var reduceMQ = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  var reduced = reduceMQ.matches;

  if (reduceMQ.addEventListener){
    reduceMQ.addEventListener("change", function(e){
      reduced = e.matches;
      if (reduced) stopAuto();
      else startAuto();
    });
  }

  /* ---------------- Build indicator dots ---------------- */
  var dots = [];
  if (dotsWrap){
    dotsWrap.innerHTML = "";
    cards.forEach(function(_, i){
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "testimonialdot";
      dot.setAttribute("aria-label", "Show review " + (i + 1) + " of " + count);
      dot.addEventListener("click", function(){
        goTo(i, true);
      });
      dotsWrap.appendChild(dot);
      dots.push(dot);
    });
  }

  function applyOffset(dragPx){
    var pct = -(index * 100);
    if (dragPx){
      track.style.transform = "translate3d(calc(" + pct + "% + " + dragPx.toFixed(1) + "px), 0, 0)";
    } else {
      track.style.transform = "translate3d(" + pct + "%, 0, 0)";
    }
  }

  function syncUI(announce){
    cards.forEach(function(card, i){
      var active = i === index;
      card.classList.toggle("isactive", active);
      card.setAttribute("aria-hidden", active ? "false" : "true");
    });

    dots.forEach(function(dot, i){
      var active = i === index;
      dot.classList.toggle("isactive", active);
      if (active) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });

    if (statusEl && announce){
      statusEl.textContent = "Review " + (index + 1) + " of " + count;
    }
  }

  function goTo(nextIndex, userAction){
    index = ((nextIndex % count) + count) % count;
    track.style.transition = "";
    applyOffset(0);
    syncUI(!!userAction);
    if (userAction) restartAuto();
  }

  function prev(userAction){ goTo(index - 1, userAction); }
  function next(userAction){ goTo(index + 1, userAction); }

  if (prevBtn){
    prevBtn.addEventListener("click", function(){ prev(true); });
  }
  if (nextBtn){
    nextBtn.addEventListener("click", function(){ next(true); });
  }

  /* ---------------- Keyboard navigation ---------------- */
  section.addEventListener("keydown", function(e){
    if (e.key === "ArrowLeft"){
      e.preventDefault();
      prev(true);
    } else if (e.key === "ArrowRight"){
      e.preventDefault();
      next(true);
    }
  });

  /* ---------------- Touch & mouse swipe / drag ---------------- */
  var dragging = false;
  var lockedAxis = "";
  var startX = 0;
  var startY = 0;
  var deltaX = 0;
  var activePointerId = null;

  function beginDrag(x, y, pointerId){
    dragging = true;
    lockedAxis = "";
    startX = x;
    startY = y;
    deltaX = 0;
    activePointerId = pointerId;
    stopAuto();
  }

  function moveDrag(x, y){
    if (!dragging) return;
    var dx = x - startX;
    var dy = y - startY;

    if (!lockedAxis){
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      lockedAxis = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
      if (lockedAxis === "y"){
        dragging = false;
        track.style.transition = "";
        applyOffset(0);
        startAuto();
        return;
      }
      viewport.classList.add("isdragging");
      track.style.transition = "none";
    }

    if (lockedAxis === "x"){
      deltaX = dx;
      applyOffset(deltaX);
    }
  }

  function endDrag(){
    if (!dragging){
      viewport.classList.remove("isdragging");
      return;
    }
    dragging = false;
    activePointerId = null;
    viewport.classList.remove("isdragging");
    track.style.transition = "";

    var width = viewport.clientWidth || 320;
    var threshold = Math.min(60, width * 0.18);
    if (lockedAxis === "x" && Math.abs(deltaX) > threshold){
      if (deltaX < 0) next(true);
      else prev(true);
    } else {
      applyOffset(0);
      startAuto();
    }
    deltaX = 0;
    lockedAxis = "";
  }

  if (window.PointerEvent){
    viewport.addEventListener("pointerdown", function(e){
      if (e.button !== 0 && e.pointerType === "mouse") return;
      if (e.target && e.target.closest && e.target.closest("button,a")) return;
      beginDrag(e.clientX, e.clientY, e.pointerId);
      if (e.pointerType === "mouse"){
        try { viewport.setPointerCapture(e.pointerId); } catch (err) {}
      }
    });

    window.addEventListener("pointermove", function(e){
      if (!dragging || (activePointerId !== null && e.pointerId !== activePointerId)) return;
      moveDrag(e.clientX, e.clientY);
    });

    window.addEventListener("pointerup", function(e){
      if (!dragging || (activePointerId !== null && e.pointerId !== activePointerId)) return;
      endDrag();
    });

    window.addEventListener("pointercancel", function(e){
      if (!dragging || (activePointerId !== null && e.pointerId !== activePointerId)) return;
      endDrag();
    });
  } else {
    viewport.addEventListener("touchstart", function(e){
      if (!e.touches || e.touches.length !== 1) return;
      beginDrag(e.touches[0].clientX, e.touches[0].clientY, null);
    }, { passive: true });

    viewport.addEventListener("touchmove", function(e){
      if (!dragging || !e.touches || e.touches.length !== 1) return;
      moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    viewport.addEventListener("touchend", endDrag, { passive: true });
    viewport.addEventListener("touchcancel", endDrag, { passive: true });
  }

  /* ---------------- Autoplay with pause on hover/focus/hidden ---------------- */
  function stopAuto(){
    if (autoTimer){
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  function startAuto(){
    stopAuto();
    if (reduced || document.hidden) return;
    autoTimer = setInterval(function(){
      if (!dragging) next(false);
    }, AUTO_MS);
  }

  function restartAuto(){
    startAuto();
  }

  section.addEventListener("mouseenter", stopAuto);
  section.addEventListener("mouseleave", startAuto);
  section.addEventListener("focusin", stopAuto);
  section.addEventListener("focusout", function(e){
    if (!section.contains(e.relatedTarget)) startAuto();
  });
  document.addEventListener("visibilitychange", function(){
    if (document.hidden) stopAuto();
    else startAuto();
  });

  section.classList.add("isready");
  goTo(0, false);
  startAuto();
})();
