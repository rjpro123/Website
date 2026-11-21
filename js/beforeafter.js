(function(){
  "use strict";

  function clamp(val){
    var num = Number(val);
    if (isNaN(num)) return 50;
    if (num < 0) return 0;
    if (num > 100) return 100;
    return num;
  }

  function initSlider(slider){
    var stage = slider.querySelector(".beforeafterstage");
    var range = slider.querySelector(".beforeafterrange");
    var buttons = Array.prototype.slice.call(slider.querySelectorAll(".beforeafterbtn"));
    var beforeBadge = slider.querySelector(".beforebadge");
    var afterBadge = slider.querySelector(".afterbadge");
    if (!stage || !range) return;

    var currentPercent = clamp(range.value || 50);
    var dragging = false;
    var animFrame = null;

    function applyPercent(pct, isSmooth){
      currentPercent = clamp(pct);
      slider.style.setProperty("--split", currentPercent.toFixed(1) + "%");
      range.value = currentPercent;
      range.setAttribute("aria-valuenow", Math.round(currentPercent));

      if (beforeBadge){
        beforeBadge.style.opacity = currentPercent <= 5 ? "0" : "1";
      }
      if (afterBadge){
        afterBadge.style.opacity = currentPercent >= 95 ? "0" : "1";
      }

      buttons.forEach(function(btn){
        var target = Number(btn.getAttribute("datapercent"));
        var match = Math.abs(target - currentPercent) < 2.5;
        btn.classList.toggle("isactive", match);
        btn.setAttribute("aria-pressed", match ? "true" : "false");
      });
    }

    function smoothTo(targetPercent){
      if (animFrame) cancelAnimationFrame(animFrame);
      var start = currentPercent;
      var target = clamp(targetPercent);
      var startTime = null;
      var duration = 280;

      function step(now){
        if (!startTime) startTime = now;
        var elapsed = now - startTime;
        var progress = Math.min(1, elapsed / duration);
        // Ease out cubic
        var ease = 1 - Math.pow(1 - progress, 3);
        var val = start + (target - start) * ease;
        applyPercent(val, false);
        if (progress < 1){
          animFrame = requestAnimationFrame(step);
        } else {
          animFrame = null;
          applyPercent(target, false);
        }
      }
      animFrame = requestAnimationFrame(step);
    }

    range.addEventListener("input", function(){
      applyPercent(range.value, false);
    });

    range.addEventListener("change", function(){
      applyPercent(range.value, false);
    });

    buttons.forEach(function(btn){
      btn.addEventListener("click", function(){
        var target = Number(btn.getAttribute("datapercent"));
        if (!isNaN(target)) smoothTo(target);
      });
    });

    function percentFromEvent(e){
      var rect = stage.getBoundingClientRect();
      if (!rect.width) return 50;
      var clientX = e.clientX;
      if (typeof clientX === "undefined" && e.touches && e.touches.length){
        clientX = e.touches[0].clientX;
      }
      return ((clientX - rect.left) / rect.width) * 100;
    }

    if (window.PointerEvent){
      stage.addEventListener("pointerdown", function(e){
        if (e.button !== 0 && e.pointerType === "mouse") return;
        if (e.target && e.target.closest && e.target.closest("button,a")) return;
        dragging = true;
        stage.classList.add("isdragging");
        try { stage.setPointerCapture(e.pointerId); } catch (err) {}
        applyPercent(percentFromEvent(e), false);
      });

      stage.addEventListener("pointermove", function(e){
        if (!dragging) return;
        applyPercent(percentFromEvent(e), false);
      });

      function onPointerEnd(e){
        if (!dragging) return;
        dragging = false;
        stage.classList.remove("isdragging");
        try { stage.releasePointerCapture(e.pointerId); } catch (err) {}
      }

      stage.addEventListener("pointerup", onPointerEnd);
      stage.addEventListener("pointercancel", onPointerEnd);
    }

    applyPercent(currentPercent, false);
    slider.classList.add("isready");
  }

  function init(){
    var sliders = document.querySelectorAll(".beforeafterslider");
    Array.prototype.forEach.call(sliders, initSlider);
  }

  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
