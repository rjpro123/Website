(function(){
  "use strict";

  var grid = document.querySelector(".gallerygrid");
  var lb = document.getElementById("lightbox");
  if (!grid || !lb) return;

  var stage = document.getElementById("lbstage");
  var lbImg = document.getElementById("lbimage");
  var lbCap = document.getElementById("lbcaption");
  var lbCount = document.getElementById("lbcount");
  var lbThumbs = document.getElementById("lbthumbs");
  var lbZoom = document.getElementById("lbzoom");
  var lbHint = document.getElementById("lbhint");
  var lbLoader = document.getElementById("lbloader");
  var btnIn = document.getElementById("lbzoomin");
  var btnOut = document.getElementById("lbzoomout");
  var btnReset = document.getElementById("lbzoomreset");
  var hintTimer = null;

  var items = Array.prototype.slice.call(grid.querySelectorAll(".gitem"));
  var photos = items.filter(function(it){ return it.querySelector(".gframe img"); });
  if (!photos.length) return;

  var index = 0;
  var MAXZOOM = 4;
  var factor = 1;      // current zoom factor
  var tx = 0, ty = 0;   // pan offset in pixels
  var base = null;      // unscaled image box
  var dragging = false, sx = 0, sy = 0, moved = false;
  var anchor = null;      // where the pointer last hovered over the photo
  var openAnchor = null;  // pointer position when the viewer was opened

  function read(it){
    var img = it.querySelector(".gframe img");
    var cap = it.querySelector("figcaption");
    var strong = cap ? cap.querySelector("strong") : null;
    var sub = cap ? cap.querySelector("span") : null;
    return {
      src: img.getAttribute("data-full") || img.getAttribute("src"),
      thumb: img.getAttribute("src"),
      alt: img.getAttribute("alt") || (strong ? strong.textContent : ""),
      title: strong ? strong.textContent : "",
      sub: sub ? sub.textContent : ""
    };
  }

  // Measure the UNTRANSFORMED image box.
  // offsetWidth/offsetHeight ignore transforms, and the image is centred in
  // the stage, so we can work out its position without touching the
  // transform (which would fire the transition and give a mid-animation
  // reading - that was what made the zoom jump around).
  function measure(){
    var w = lbImg.offsetWidth, h = lbImg.offsetHeight;
    var sr = stage.getBoundingClientRect();
    var cs = getComputedStyle(stage);
    var padL = parseFloat(cs.paddingLeft) || 0;
    var padR = parseFloat(cs.paddingRight) || 0;
    var padT = parseFloat(cs.paddingTop) || 0;
    var padB = parseFloat(cs.paddingBottom) || 0;
    var cw = sr.width - padL - padR;
    var ch = sr.height - padT - padB;
    base = {
      left: sr.left + padL + (cw - w) / 2,
      top: sr.top + padT + (ch - h) / 2,
      w: w, h: h
    };
  }

  function clamp(){
    if (!base) return;
    var minX = base.w * (1 - factor), minY = base.h * (1 - factor);
    tx = Math.max(minX, Math.min(0, tx));
    ty = Math.max(minY, Math.min(0, ty));
  }

  function paint(){
    lbImg.style.transform = "translate(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px) scale(" + factor.toFixed(3) + ")";
  }

  // keep the point under the cursor anchored while the zoom changes
  function setZoom(f, cx, cy){
    measure();
    var px = cx - base.left, py = cy - base.top;
    factor = Math.max(1, Math.min(MAXZOOM, f));
    tx = cx - base.left - px * factor;
    ty = cy - base.top - py * factor;
    clamp();
    paint();
    var zoomed = factor > 1.02;
    stage.classList.toggle("iszoomed", zoomed);
    lbImg.classList.toggle("iszoomed", zoomed);
    lb.classList.toggle("iszoomed", zoomed);
    if (lbZoom){
      lbZoom.hidden = !zoomed;
      lbZoom.textContent = factor.toFixed(1) + "x";
    }
    if (btnIn) btnIn.disabled = factor >= MAXZOOM;
    if (btnOut) btnOut.disabled = factor <= 1.02;
    if (lbHint){
      if (zoomed){
        lbHint.textContent = "Drag to move around &middot; click to zoom out";
        lbHint.classList.remove("isfade");
      } else {
        lbHint.textContent = "Click the photo to zoom \u00b7 drag to move around";
        lbHint.classList.add("isfade");
      }
    }
  }

  function zoomOut(){
    factor = 1; tx = 0; ty = 0;
    stage.classList.remove("iszoomed");
    lbImg.classList.remove("iszoomed");
    lb.classList.remove("iszoomed");
    lbImg.style.transform = "none";
    if (lbZoom){ lbZoom.hidden = true; lbZoom.textContent = "1x"; }
    if (btnIn) btnIn.disabled = false;
    if (btnOut) btnOut.disabled = true;
  }

  function render(){
    var d = read(photos[index]);
    if (lbLoader) lbLoader.hidden = false;
    lbImg.onload = function(){ if (lbLoader) lbLoader.hidden = true; };
    lbImg.onerror = function(){ if (lbLoader) lbLoader.hidden = true; };
    lbImg.src = d.src;
    lbImg.alt = d.alt;
    zoomOut();

    lbCap.innerHTML = "";
    var t = document.createElement("strong"); t.textContent = d.title;
    var s = document.createElement("span"); s.textContent = d.sub;
    lbCap.appendChild(t);
    lbCap.appendChild(s);

    lbCount.textContent = (index + 1) + " of " + photos.length;

    Array.prototype.forEach.call(lbThumbs.children, function(ch, i){
      ch.classList.toggle("isactive", i === index);
    });
    var active = lbThumbs.children[index];
    if (active && active.scrollIntoView){
      active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }

  function open(i){
    index = i;
    if (!anchor && openAnchor) anchor = { x: openAnchor.x, y: openAnchor.y };
    render();
    lb.hidden = false;
    document.body.classList.add("lblock");
    var close = lb.querySelector(".lbclose");
    if (close) close.focus();
    if (lbHint){
      lbHint.classList.remove("isfade");
      if (hintTimer) clearTimeout(hintTimer);
      hintTimer = setTimeout(function(){ lbHint.classList.add("isfade"); }, 4000);
    }
  }

  function close(){
    lb.hidden = true;
    document.body.classList.remove("lblock");
    zoomOut();
  }

  function next(){ index = (index + 1) % photos.length; render(); }
  function prev(){ index = (index - 1 + photos.length) % photos.length; render(); }

  window.addEventListener("resize", function(){
    if (lb.hidden) return;
    measure();
    clamp();
    paint();
  });

  // openable tiles
  photos.forEach(function(it, i){
    it.classList.add("gclick");
    it.setAttribute("tabindex", "0");
    it.setAttribute("role", "button");
    it.setAttribute("aria-label", "Open photo: " + read(it).title);
    it.addEventListener("click", function(e){
      openAnchor = { x: e.clientX, y: e.clientY };
      open(i);
    });
    it.addEventListener("keydown", function(e){
      if (e.key === "Enter" || e.key === " "){ e.preventDefault(); open(i); }
    });
  });

  // thumbnails
  photos.forEach(function(it, i){
    var d = read(it);
    var b = document.createElement("button");
    b.type = "button";
    b.className = "lbthumb";
    b.setAttribute("aria-label", d.title);
    var im = document.createElement("img");
    im.src = d.thumb;
    im.alt = "";
    im.loading = "lazy";
    b.appendChild(im);
    b.addEventListener("click", function(){ index = i; render(); });
    lbThumbs.appendChild(b);
  });

  // controls
  Array.prototype.forEach.call(lb.querySelectorAll("[data-lbclose]"), function(el){
    el.addEventListener("click", close);
  });
  lb.querySelector(".lbnext").addEventListener("click", next);
  lb.querySelector(".lbprev").addEventListener("click", prev);

  // zoom control buttons
  var zoomctl = document.querySelector(".lbzoomctl");
  if (zoomctl){
    zoomctl.addEventListener("click", function(e){ e.stopPropagation(); });
    zoomctl.addEventListener("pointerdown", function(e){ e.stopPropagation(); });
    zoomctl.addEventListener("pointerup", function(e){ e.stopPropagation(); });
    zoomctl.addEventListener("dblclick", function(e){ e.stopPropagation(); });
  }
  function stageCentre(){
    var r = stage.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  // the point the zoom should grow around: wherever the user last touched
  // the photo, otherwise the middle of the stage
  function zoomAnchor(){
    if (!anchor) return stageCentre();
    var r = stage.getBoundingClientRect();
    return {
      x: Math.max(r.left, Math.min(r.right, anchor.x)),
      y: Math.max(r.top, Math.min(r.bottom, anchor.y))
    };
  }
  if (btnIn){
    btnIn.addEventListener("click", function(){
      var c = zoomAnchor();
      setZoom(factor * 1.45, c.x, c.y);
    });
  }
  if (btnOut){
    btnOut.addEventListener("click", function(){
      var c = zoomAnchor();
      setZoom(factor / 1.45, c.x, c.y);
    });
  }
  if (btnReset){
    btnReset.addEventListener("click", function(){ zoomOut(); });
  }

  // double click toggles zoom in and out at that point
  stage.addEventListener("dblclick", function(e){
    e.preventDefault();
    if (factor > 1.02){ zoomOut(); }
    else { setZoom(2.2, e.clientX, e.clientY); }
  });

  // click to zoom into that spot, click again to zoom out
  stage.addEventListener("click", function(e){
    anchor = { x: e.clientX, y: e.clientY };
    if (factor > 1.02){
      if (moved) return;
      zoomOut();
    } else {
      setZoom(2.2, e.clientX, e.clientY);
    }
  });

  // drag to pan while zoomed
  stage.addEventListener("pointerdown", function(e){
    moved = false;
    if (factor <= 1.02) return;
    dragging = true;
    sx = e.clientX; sy = e.clientY;
    try { stage.setPointerCapture(e.pointerId); } catch (err) {}
    stage.classList.add("isdragging");
    lbImg.style.transition = "none";
  });
  function trackHover(e){
    anchor = { x: e.clientX, y: e.clientY };
  }
  lbImg.addEventListener("pointermove", trackHover);
  lbImg.addEventListener("pointerenter", trackHover);
  lbImg.addEventListener("mousemove", trackHover);

  stage.addEventListener("pointermove", function(e){
    if (!dragging) return;
    var dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
    sx = e.clientX; sy = e.clientY;
    tx += dx; ty += dy;
    clamp();
    paint();
  });
  function endDrag(){
    if (!dragging) return;
    dragging = false;
    stage.classList.remove("isdragging");
    lbImg.style.transition = "";
  }
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);

  // wheel to zoom toward the pointer
  stage.addEventListener("wheel", function(e){
    e.preventDefault();
    var step = e.deltaY > 0 ? 0.85 : 1.18;
    setZoom(factor * step, e.clientX, e.clientY);
  }, { passive: false });

  // keyboard
  document.addEventListener("keydown", function(e){
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") next();
    else if (e.key === "ArrowLeft") prev();
    else if (e.key === "+" || e.key === "="){ var a = zoomAnchor(); setZoom(factor * 1.2, a.x, a.y); }
    else if (e.key === "-"){ var b = zoomAnchor(); setZoom(factor / 1.2, b.x, b.y); }
  });

  // swipe between photos (only when not zoomed)
  var x0 = null;
  stage.addEventListener("touchstart", function(e){ x0 = e.changedTouches[0].clientX; }, { passive:true });
  stage.addEventListener("touchend", function(e){
    if (x0 === null || factor > 1.02) { x0 = null; return; }
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 60){ if (dx > 0) prev(); else next(); }
    x0 = null;
  }, { passive:true });
})();
