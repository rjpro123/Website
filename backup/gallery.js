(function(){
  "use strict";

  var grid = document.querySelector(".gallerygrid");
  var lb = document.getElementById("lightbox");
  if (!grid || !lb) return;

  var items = Array.prototype.slice.call(grid.querySelectorAll(".gitem"));
  var photos = items.filter(function(it){ return it.querySelector(".gframe img"); });
  if (!photos.length) return;

  var lbImg = document.getElementById("lbimage");
  var lbCap = document.getElementById("lbcaption");
  var lbCount = document.getElementById("lbcount");
  var lbThumbs = document.getElementById("lbthumbs");
  var index = 0;

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

  function render(){
    var d = read(photos[index]);
    lbImg.src = d.src;
    lbImg.alt = d.alt;
    lbImg.classList.remove("iszoomed");

    lbCap.innerHTML = "";
    var t = document.createElement("strong"); t.textContent = d.title;
    var s = document.createElement("span"); s.textContent = d.sub;
    lbCap.appendChild(t);
    lbCap.appendChild(s);

    lbCount.textContent = (index + 1) + " of " + photos.length;
    lb.classList.toggle("lbsingle", photos.length < 2);

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
    render();
    lb.hidden = false;
    document.body.classList.add("lblock");
    var close = lb.querySelector(".lbclose");
    if (close) close.focus();
  }

  function close(){
    lb.hidden = true;
    document.body.classList.remove("lblock");
  }

  function next(){
    index = (index + 1) % photos.length;
    render();
  }

  function prev(){
    index = (index - 1 + photos.length) % photos.length;
    render();
  }

  // make each photo openable
  photos.forEach(function(it, i){
    it.classList.add("gclick");
    it.setAttribute("tabindex", "0");
    it.setAttribute("role", "button");
    it.setAttribute("aria-label", "Open photo: " + read(it).title);
    it.addEventListener("click", function(){ open(i); });
    it.addEventListener("keydown", function(e){
      if (e.key === "Enter" || e.key === " "){ e.preventDefault(); open(i); }
    });
  });

  // thumbnail strip
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

  // click the image to zoom
  lbImg.addEventListener("click", function(){
    lbImg.classList.toggle("iszoomed");
  });

  // keyboard
  document.addEventListener("keydown", function(e){
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") next();
    else if (e.key === "ArrowLeft") prev();
  });

  // swipe on touch
  var x0 = null;
  lb.addEventListener("touchstart", function(e){ x0 = e.changedTouches[0].clientX; }, { passive:true });
  lb.addEventListener("touchend", function(e){
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50){ if (dx > 0) prev(); else next(); }
    x0 = null;
  }, { passive:true });
})();
