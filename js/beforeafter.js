(function(){
  "use strict";

  var PAIR_MS = 5000;

  function clamp(val){
    var num = Number(val);
    if (isNaN(num)) return 50;
    if (num < 0) return 0;
    if (num > 100) return 100;
    return num;
  }

  function decodeImg(img){
    if (img && typeof img.decode === "function"){
      img.decode().catch(function(){});
    }
  }

  function initSlider(slider){
    var stage = slider.querySelector(".beforeafterstage");
    var range = slider.querySelector(".beforeafterrange");
    var buttons = Array.prototype.slice.call(slider.querySelectorAll(".beforeafterbtn"));
    var beforeBadge = slider.querySelector(".beforebadge");
    var afterBadge = slider.querySelector(".afterbadge");
    var pairs = Array.prototype.slice.call(slider.querySelectorAll(".beforeafterpair"));
    var dotsWrap = slider.querySelector(".beforeafterdots");
    var progressEl = slider.querySelector(".beforeafterprogressfill");
    if (!stage || !range) return;

    var currentPercent = clamp(range.value || 50);
    var dragging = false;
    var animFrame = null;
    var pairIndex = 0;
    var prevPairIndex = -1;
    var pairTimer = null;
    var dots = [];

    function applyPercent(pct){
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
        var ease = 1 - Math.pow(1 - progress, 3);
        var val = start + (target - start) * ease;
        applyPercent(val);
        if (progress < 1){
          animFrame = requestAnimationFrame(step);
        } else {
          animFrame = null;
          applyPercent(target);
        }
      }
      animFrame = requestAnimationFrame(step);
    }

    function resetProgress(animate){
      if (!progressEl) return;
      progressEl.style.transition = "none";
      progressEl.style.transform = "scaleX(0)";
      if (!animate || pairs.length < 2) return;
      void progressEl.offsetWidth;
      progressEl.style.transition = "transform " + PAIR_MS + "ms linear";
      progressEl.style.transform = "scaleX(1)";
    }

    function syncPairs(){
      pairs.forEach(function(pair, i){
        var active = i === pairIndex;
        var prev = i === prevPairIndex && i !== pairIndex;
        pair.classList.toggle("isprev", prev);
        pair.classList.toggle("isactive", active);
        pair.setAttribute("aria-hidden", active ? "false" : "true");
      });

      dots.forEach(function(dot, i){
        var active = i === pairIndex;
        dot.classList.toggle("isactive", active);
        dot.setAttribute("aria-selected", active ? "true" : "false");
      });
    }

    function stopPairCycle(){
      if (pairTimer){
        clearInterval(pairTimer);
        pairTimer = null;
      }
      resetProgress(false);
    }

    function startPairCycle(){
      stopPairCycle();
      if (pairs.length < 2 || document.hidden || dragging) return;
      resetProgress(true);
      pairTimer = setInterval(function(){
        if (!dragging){
          goToPair(pairIndex + 1, false);
        }
      }, PAIR_MS);
    }

    function goToPair(nextIdx, userAction){
      var count = pairs.length;
      if (!count) return;
      var target = ((nextIdx % count) + count) % count;
      if (target !== pairIndex){
        prevPairIndex = pairIndex;
        pairIndex = target;
      }
      syncPairs();
      if (userAction){
        startPairCycle();
      } else if (!document.hidden && !dragging){
        resetProgress(true);
      }
    }

    if (pairs.length){
      var pairImgs = Array.prototype.slice.call(stage.querySelectorAll(".beforeafterpair img"));
      pairImgs.forEach(decodeImg);
      if (window.galleryPreload){
        window.galleryPreload.preloadBatch(pairImgs.map(function(im){ return im.getAttribute("src"); }));
      }
    }

    if (dotsWrap && pairs.length > 1){
      dotsWrap.innerHTML = "";
      pairs.forEach(function(pair, i){
        var title = pair.getAttribute("datapairtitle") || ("Example " + (i + 1));
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "beforeafterdot" + (i === 0 ? " isactive" : "");
        dot.setAttribute("role", "tab");
        dot.setAttribute("datapairidx", String(i));
        dot.setAttribute("aria-label", "View " + title);
        dot.setAttribute("aria-selected", i === 0 ? "true" : "false");
        dot.addEventListener("click", function(e){
          if (e.detail > 0 && dot.blur) dot.blur();
          goToPair(i, true);
        });
        dotsWrap.appendChild(dot);
        dots.push(dot);
      });
    }

    range.addEventListener("input", function(){
      applyPercent(range.value);
    });

    range.addEventListener("change", function(){
      applyPercent(range.value);
    });

    buttons.forEach(function(btn){
      btn.addEventListener("click", function(e){
        if (e.detail > 0 && btn.blur) btn.blur();
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
        stopPairCycle();
        stage.classList.add("isdragging");
        try { stage.setPointerCapture(e.pointerId); } catch (err) {}
        applyPercent(percentFromEvent(e));
      });

      stage.addEventListener("pointermove", function(e){
        if (!dragging) return;
        applyPercent(percentFromEvent(e));
      });

      function onPointerEnd(e){
        if (!dragging) return;
        dragging = false;
        stage.classList.remove("isdragging");
        try { stage.releasePointerCapture(e.pointerId); } catch (err) {}
        startPairCycle();
      }

      stage.addEventListener("pointerup", onPointerEnd);
      stage.addEventListener("pointercancel", onPointerEnd);
    }

    document.addEventListener("visibilitychange", function(){
      if (document.hidden) stopPairCycle();
      else startPairCycle();
    });

    applyPercent(currentPercent);
    syncPairs();
    startPairCycle();
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
