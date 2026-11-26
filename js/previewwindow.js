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
      src: "gallery/rosebed.webp",
      thumb: "gallery/rosebed.webp",
      alt: "Mulched rose garden bed, trimmed front lawn and swept paved driveway in Adelaide",
      title: "Rose bed & driveway tidy",
      sub: "Adelaide, SA"
    },
    {
      src: "gallery/brightonbed.webp",
      thumb: "gallery/brightonbed.webp",
      alt: "Garden bed refresh in Brighton, SA",
      title: "Garden bed refresh",
      sub: "Brighton, SA"
    },
    {
      src: "gallery/stirlinghedge.webp",
      thumb: "gallery/stirlinghedge.webp",
      alt: "Hedge and prune in Stirling, SA",
      title: "Hedge & prune",
      sub: "Stirling, SA"
    },
    {
      src: "gallery/hutchman.webp",
      thumb: "gallery/hutchman.webp",
      alt: "Hutch Man the cat resting on the office rug",
      title: "Hutch Man",
      sub: "Keeping an eye on the jobs"
    },
    {
      src: "gallery/adelaidelawn.webp",
      thumb: "gallery/adelaidelawn.webp",
      alt: "Lawn mowing and garden care job in Adelaide",
      title: "Latest job",
      sub: "Adelaide, SA"
    },
    {
      src: "gallery/gardencleanup.webp",
      thumb: "gallery/gardencleanup.webp",
      alt: "Garden bed and potted citrus care in Adelaide",
      title: "Garden bed care",
      sub: "Adelaide, SA"
    },
    {
      src: "gallery/villahedge.webp",
      thumb: "gallery/villahedge.webp",
      alt: "Boxed front hedge and edged lawn at a sandstone villa in Adelaide",
      title: "Hedge & lawn edge",
      sub: "Adelaide, SA"
    },
    {
      src: "gallery/courtyardhedge.webp",
      thumb: "gallery/courtyardhedge.webp",
      alt: "Mowed courtyard lawn, trimmed boundary hedges and potted citrus in Adelaide",
      title: "Hedge trim & mow",
      sub: "Adelaide, SA"
    },
    {
      src: "gallery/IMG_20261124_122459705.webp",
      thumb: "gallery/IMG_20261124_122459705.webp",
      alt: "Recent lawn mowing and garden care work in Adelaide",
      title: "Recent job",
      sub: "Adelaide, SA"
    }
  ];

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
      img.loading = i <= 1 ? "eager" : "lazy";
      img.decoding = "async";
      img.draggable = false;
      img.src = item.src;
      img.alt = item.alt;
      if (i === 0){
        if ("fetchPriority" in img) img.fetchPriority = "high";
        if (typeof img.decode === "function") img.decode().catch(function(){});
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
        tImg.loading = i <= 1 ? "eager" : "lazy";
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
    } else {
      prevIndex = -1;
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

  photos = GALLERY_PHOTOS.slice();
  if (!photos.length) return;

  buildSlides();

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
      stopAuto();
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

    var swiped = lockedAxis === "x" && Math.abs(deltaX) > 40;
    if (swiped){
      if (deltaX < 0) goTo(index + 1, true);
      else goTo(index - 1, true);
    } else if (movedDrag){
      startAuto();
    }
    deltaX = 0;
    lockedAxis = "";
    if (movedDrag){
      setTimeout(function(){ movedDrag = false; }, 0);
    }
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

    window.addEventListener("blur", function(){
      if (dragging) endDrag();
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
  syncUI();
  startAuto();
})();
