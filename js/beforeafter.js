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
    var pairs = Array.prototype.slice.call(slider.querySelectorAll(".beforeafterpair"));
    var dotsWrap = slider.querySelector(".beforeafterdots");
    var progressEl = slider.querySelector(".beforeafterprogressfill");
    if (!stage || !range) return;

    var currentPercent = clamp(range.value || 50);
    var dragging = false;
    var pairIndex = 0;
    var prevPairIndex = -1;
    var pairTimer = null;
    var dots = [];

    function applyPercent(pct){
      currentPercent = clamp(pct);
      slider.style.setProperty("--split", currentPercent.toFixed(1) + "%");
      range.value = currentPercent;
      range.setAttribute("aria-valuenow", Math.round(currentPercent));
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

      if (window.galleryPreload && pairs.length > 1){
        var nextPair = pairs[(pairIndex + 1) % pairs.length];
        var nextImgs = Array.prototype.slice.call(nextPair.querySelectorAll("img"));
        window.galleryPreload.preloadBatch(nextImgs.map(function(im){ return im.getAttribute("src"); }));
      }
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
      Array.prototype.slice.call(pairs[0].querySelectorAll("img")).forEach(decodeImg);
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
      if (!dragging) startPairCycle();
    });

    range.addEventListener("change", function(){
      applyPercent(range.value);
      if (!dragging) startPairCycle();
    });

    function percentFromEvent(e){
      var rect = stage.getBoundingClientRect();
      if (!rect.width) return 50;
      return ((e.clientX - rect.left) / rect.width) * 100;
    }

    if (window.PointerEvent){
      stage.addEventListener("pointerdown", function(e){
        if (e.button !== 0 && e.pointerType === "mouse") return;
        if (e.target && e.target.closest && e.target.closest("button,a")) return;
        if (e.target === range) e.preventDefault();
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
