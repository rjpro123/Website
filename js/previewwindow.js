(function(){
  "use strict";

  var show = document.getElementById("galleryShow");
  var viewport = document.getElementById("showViewport");
  var track = document.getElementById("showTrack");
  var captionEl = document.getElementById("showCaption");
  var thumbsWrap = document.getElementById("showThumbs");
  var countEl = document.getElementById("showCount");
  var playBtn = document.getElementById("showPlayBtn");
  var playLabel = document.getElementById("showPlayLabel");
  var prevBtn = document.getElementById("showPrevBtn");
  var nextBtn = document.getElementById("showNextBtn");
  var progressEl = document.getElementById("showProgress");
  if (!show || !viewport || !track) return;

  var AUTO_MS = 4500;
  var photos = [];
  var slides = [];
  var thumbs = [];
  var index = 0;
  var prevIndex = -1;
  var autoTimer = null;
  var manualPaused = false;
  var controlsOpen = false;
  var dragging = false;
  var lockedAxis = "";
  var startX = 0;
  var startY = 0;
  var deltaX = 0;
  var movedDrag = false;
  var activePointerId = null;

  var GALLERY_PHOTOS = [
    {
      src: "gallery/brightonbed.jpg",
      thumb: "gallery/brightonbed.jpg",
      alt: "Garden bed refresh in Brighton, SA",
      title: "Garden bed refresh",
      sub: "Brighton, SA"
    },
    {
      src: "gallery/stirlinghedge.jpg",
      thumb: "gallery/stirlinghedge.jpg",
      alt: "Hedge and prune in Stirling, SA",
      title: "Hedge & prune",
      sub: "Stirling, SA"
    },
    {
      src: "gallery/hutchman.jpg",
      thumb: "gallery/hutchman.jpg",
      alt: "Hutch Man the cat resting on the office rug",
      title: "Hutch Man",
      sub: "Keeping an eye on the jobs"
    },
    {
      src: "gallery/adelaidelawn.jpg",
      thumb: "gallery/adelaidelawn.jpg",
      alt: "Lawn mowing and garden care job in Adelaide",
      title: "Latest job",
      sub: "Adelaide, SA"
    },
    {
      src: "gallery/gardencleanup.jpg",
      thumb: "gallery/gardencleanup.jpg",
      alt: "Garden bed and potted citrus care in Adelaide",
      title: "Garden bed care",
      sub: "Adelaide, SA"
    }
  ];

  function collectPhotos(){
    var list = [];

    var gridItems = document.querySelectorAll(".gallerygrid .gitem");
    if (gridItems.length){
      Array.prototype.forEach.call(gridItems, function(item){
        var img = item.querySelector(".gframe img");
        if (!img) return;
        var cap = item.querySelector("figcaption");
        var strong = cap ? cap.querySelector("strong") : null;
        var sub = cap ? cap.querySelector("span") : null;
        list.push({
          src: img.getAttribute("data-full") || img.getAttribute("src"),
          thumb: img.getAttribute("src"),
          alt: img.getAttribute("alt") || (strong ? strong.textContent : ""),
          title: strong ? strong.textContent : "Gallery photo",
          sub: sub ? sub.textContent : ""
        });
      });
    } else {
      GALLERY_PHOTOS.forEach(function(item){
        list.push(item);
      });
    }

    var pairs = document.querySelectorAll(".beforeafterstage .beforeafterpair");
    if (pairs.length){
      Array.prototype.forEach.call(pairs, function(pair){
        var pairTitle = pair.getAttribute("datapairtitle") || "Yard Reset";
        var beforeImg = pair.querySelector(".beforeafterbefore");
        var afterImg = pair.querySelector(".beforeafterafter");
        if (beforeImg){
          list.push({
            src: beforeImg.getAttribute("src"),
            thumb: beforeImg.getAttribute("src"),
            alt: beforeImg.getAttribute("alt") || (pairTitle + " Before"),
            title: pairTitle + " (Before)",
            sub: "Before & After"
          });
        }
        if (afterImg){
          list.push({
            src: afterImg.getAttribute("src"),
            thumb: afterImg.getAttribute("src"),
            alt: afterImg.getAttribute("alt") || (pairTitle + " After"),
            title: pairTitle + " (After)",
            sub: "Before & After"
          });
        }
      });
    } else {
      var beforeImg = document.querySelector(".beforeafterstage .beforeafterbefore");
      var afterImg = document.querySelector(".beforeafterstage .beforeafterafter");
      if (beforeImg){
        list.push({
          src: beforeImg.getAttribute("src"),
          thumb: beforeImg.getAttribute("src"),
          alt: beforeImg.getAttribute("alt") || "Yard Reset Before",
          title: "Yard Reset (Before)",
          sub: "Before & After"
        });
      }
      if (afterImg){
        list.push({
          src: afterImg.getAttribute("src"),
          thumb: afterImg.getAttribute("src"),
          alt: afterImg.getAttribute("alt") || "Yard Reset After",
          title: "Yard Reset (After)",
          sub: "Before & After"
        });
      }
    }

    return list;
  }

  function buildSlides(){
    track.innerHTML = "";
    if (thumbsWrap) thumbsWrap.innerHTML = "";
    slides = [];
    thumbs = [];

    photos.forEach(function(item, i){
      var slide = document.createElement("div");
      slide.className = "showslide";
      slide.setAttribute("aria-hidden", i === 0 ? "false" : "true");

      var img = document.createElement("img");
      img.className = "showimg";
      img.loading = "eager";
      img.decoding = "async";
      img.draggable = false;
      img.src = item.src;
      img.alt = item.alt;
      if (typeof img.decode === "function"){
        img.decode().catch(function(){});
      }
      slide.appendChild(img);

      track.appendChild(slide);
      slides.push(slide);

      if (thumbsWrap){
        var thumbBtn = document.createElement("button");
        thumbBtn.type = "button";
        thumbBtn.className = "showthumb";
        thumbBtn.setAttribute("role", "tab");
        thumbBtn.setAttribute("datashowidx", String(i));
        thumbBtn.setAttribute("aria-label", "View " + item.title);
        thumbBtn.setAttribute("aria-selected", i === 0 ? "true" : "false");

        var tImg = document.createElement("img");
        tImg.src = item.thumb;
        tImg.alt = "";
        tImg.decoding = "async";
        tImg.draggable = false;
        thumbBtn.appendChild(tImg);

        thumbBtn.addEventListener("click", function(e){
          e.stopPropagation();
          if (e.detail > 0 && thumbBtn.blur) thumbBtn.blur();
          goTo(i, true);
        });
        thumbsWrap.appendChild(thumbBtn);
        thumbs.push(thumbBtn);
      }
    });
  }

  function resetProgress(animate){
    if (!progressEl) return;
    progressEl.style.transition = "none";
    progressEl.style.transform = "scaleX(0)";
    if (!animate) return;
    void progressEl.offsetWidth;
    progressEl.style.transition = "transform " + AUTO_MS + "ms linear";
    progressEl.style.transform = "scaleX(1)";
  }

  function syncUI(){
    var count = photos.length;
    var activeItem = photos[index];
    if (countEl) countEl.textContent = (index + 1) + " of " + count;

    if (captionEl && activeItem){
      captionEl.innerHTML = "";
      var strong = document.createElement("strong");
      strong.textContent = activeItem.title;
      var span = document.createElement("span");
      span.textContent = activeItem.sub;
      captionEl.appendChild(strong);
      captionEl.appendChild(span);
    }

    slides.forEach(function(slide, i){
      var active = i === index;
      var prev = i === prevIndex && i !== index;
      slide.classList.toggle("isprev", prev);
      slide.classList.toggle("isactive", active);
      slide.setAttribute("aria-hidden", active ? "false" : "true");
    });

    thumbs.forEach(function(btn, i){
      var active = i === index;
      btn.classList.toggle("isactive", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });

    var activeThumb = thumbs[index];
    if (activeThumb && thumbsWrap && thumbsWrap.scrollWidth > thumbsWrap.clientWidth){
      var targetLeft = activeThumb.offsetLeft - (thumbsWrap.clientWidth / 2) + (activeThumb.offsetWidth / 2);
      if (thumbsWrap.scrollTo) thumbsWrap.scrollTo({ left: Math.max(0, targetLeft), behavior: "smooth" });
      else thumbsWrap.scrollLeft = Math.max(0, targetLeft);
    }

    if (window.galleryPreload && count > 1){
      var nextItem = photos[(index + 1) % count];
      var prevItem = photos[(index - 1 + count) % count];
      window.galleryPreload.preloadBatch([nextItem.src, prevItem.src]);
    }
  }

  function stopAuto(){
    if (autoTimer){
      clearInterval(autoTimer);
      autoTimer = null;
    }
    resetProgress(false);
  }

  function startAuto(){
    stopAuto();
    if (manualPaused || document.hidden || photos.length < 2) return;
    resetProgress(true);
    autoTimer = setInterval(function(){
      if (!dragging){
        goTo(index + 1, false);
      }
    }, AUTO_MS);
  }

  function goTo(nextIndex, userAction){
    var count = photos.length;
    if (!count) return;
    var target = ((nextIndex % count) + count) % count;
    if (target !== index){
      prevIndex = index;
      index = target;
    }
    syncUI();
    if (userAction){
      startAuto();
    } else if (!manualPaused && !document.hidden){
      resetProgress(true);
    }
  }

  function syncPlayButton(){
    show.classList.toggle("ispaused", manualPaused);
    if (!playBtn) return;
    playBtn.classList.toggle("ispaused", manualPaused);
    playBtn.setAttribute("aria-pressed", manualPaused ? "true" : "false");
    playBtn.setAttribute("aria-label", manualPaused ? "Play slideshow" : "Stop playing slideshow");
    if (playLabel) playLabel.textContent = manualPaused ? "Play" : "Stop";
  }

  photos = collectPhotos();
  if (!photos.length) return;

  buildSlides();
  if (window.galleryPreload){
    window.galleryPreload.preloadBatch(photos.map(function(p){ return p.src; }));
  }

  if (prevBtn){
    prevBtn.addEventListener("click", function(e){
      e.stopPropagation();
      if (e.detail > 0 && prevBtn.blur) prevBtn.blur();
      goTo(index - 1, true);
    });
  }
  if (nextBtn){
    nextBtn.addEventListener("click", function(e){
      e.stopPropagation();
      if (e.detail > 0 && nextBtn.blur) nextBtn.blur();
      goTo(index + 1, true);
    });
  }

  if (playBtn){
    playBtn.addEventListener("click", function(e){
      e.stopPropagation();
      if (e.detail > 0 && playBtn.blur) playBtn.blur();
      manualPaused = !manualPaused;
      if (!manualPaused){
        controlsOpen = false;
        show.classList.remove("iscontrols");
      }
      syncPlayButton();
      if (manualPaused) stopAuto();
      else startAuto();
    });
  }

  viewport.addEventListener("click", function(e){
    if (movedDrag){
      movedDrag = false;
      return;
    }
    if (e.target && e.target.closest && e.target.closest("button,a,.showthumbs")) return;
    controlsOpen = !controlsOpen;
    show.classList.toggle("iscontrols", controlsOpen);
  });

  document.addEventListener("click", function(e){
    if (!controlsOpen) return;
    if (!show.contains(e.target)){
      controlsOpen = false;
      show.classList.remove("iscontrols");
    }
  });

  show.addEventListener("keydown", function(e){
    if (e.key === "ArrowLeft"){
      e.preventDefault();
      goTo(index - 1, true);
    } else if (e.key === "ArrowRight"){
      e.preventDefault();
      goTo(index + 1, true);
    }
  });

  function beginDrag(x, y, pointerId){
    dragging = true;
    movedDrag = false;
    lockedAxis = "";
    startX = x;
    startY = y;
    deltaX = 0;
    activePointerId = pointerId;
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
        return;
      }
      movedDrag = true;
      viewport.classList.add("isdragging");
    }

    if (lockedAxis === "x"){
      deltaX = dx;
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

    if (lockedAxis === "x" && Math.abs(deltaX) > 40){
      if (deltaX < 0) goTo(index + 1, true);
      else goTo(index - 1, true);
    }
    deltaX = 0;
    lockedAxis = "";
  }

  if (window.PointerEvent){
    viewport.addEventListener("pointerdown", function(e){
      if (e.button !== 0 && e.pointerType === "mouse") return;
      if (e.target && e.target.closest && e.target.closest("button,a,.showthumbs")) return;
      beginDrag(e.clientX, e.clientY, e.pointerId);
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
      if (e.target && e.target.closest && e.target.closest("button,a,.showthumbs")) return;
      beginDrag(e.touches[0].clientX, e.touches[0].clientY, null);
    }, { passive: true });

    viewport.addEventListener("touchmove", function(e){
      if (!dragging || !e.touches || e.touches.length !== 1) return;
      moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    viewport.addEventListener("touchend", endDrag, { passive: true });
    viewport.addEventListener("touchcancel", endDrag, { passive: true });
  }

  document.addEventListener("visibilitychange", function(){
    if (document.hidden) stopAuto();
    else startAuto();
  });

  syncPlayButton();
  goTo(0, false);
  startAuto();
})();
