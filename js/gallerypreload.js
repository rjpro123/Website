(function(){
  "use strict";

  var cache = Object.create(null);
  var queue = [];
  var activeCount = 0;
  var MAXCONCURRENT = 2;

  function uniqueUrls(list){
    var seen = Object.create(null);
    var out = [];
    for (var i = 0; i < list.length; i += 1){
      var raw = typeof list[i] === "string" ? list[i].trim() : "";
      if (!raw || seen[raw]) continue;
      seen[raw] = true;
      out.push(raw);
    }
    return out;
  }

  function decodeImage(img){
    if (typeof img.decode === "function"){
      return img.decode().catch(function(){});
    }
    return Promise.resolve();
  }

  function loadSingle(url, highPriority){
    if (!url) return Promise.resolve();
    if (cache[url]) return cache[url].promise;

    var entry = { status: "loading", img: null, promise: null };
    entry.promise = new Promise(function(resolve){
      var img = new Image();
      img.decoding = "async";
      if (highPriority && "fetchPriority" in img){
        img.fetchPriority = "high";
      }
      entry.img = img;

      var settled = false;
      function finish(ok){
        if (settled) return;
        settled = true;
        entry.status = ok ? "ready" : "error";
        if (ok){
          decodeImage(img).then(resolve, resolve);
        } else {
          resolve();
        }
      }

      img.onload = function(){ finish(true); };
      img.onerror = function(){ finish(false); };
      img.src = url;

      if (img.complete && img.naturalWidth > 0){
        finish(true);
      }
    });

    cache[url] = entry;
    return entry.promise;
  }

  function pumpQueue(){
    while (activeCount < MAXCONCURRENT && queue.length){
      var nextUrl = queue.shift();
      if (cache[nextUrl] && cache[nextUrl].status === "ready") continue;
      activeCount += 1;
      loadSingle(nextUrl, false).then(function(){
        activeCount = Math.max(0, activeCount - 1);
        pumpQueue();
      });
    }
  }

  function scheduleIdle(fn){
    if (typeof window.requestIdleCallback === "function"){
      window.requestIdleCallback(fn, { timeout: 600 });
    } else {
      setTimeout(fn, 60);
    }
  }

  function preload(url){
    return loadSingle(url, true);
  }

  function preloadBatch(urls){
    var list = uniqueUrls(Array.isArray(urls) ? urls : []);
    return Promise.all(list.map(function(u){ return loadSingle(u, true); }));
  }

  function isCached(url){
    return !!(cache[url] && cache[url].status === "ready");
  }

  function getStats(){
    var keys = Object.keys(cache);
    var ready = 0;
    for (var i = 0; i < keys.length; i += 1){
      if (cache[keys[i]].status === "ready") ready += 1;
    }
    return { tracked: keys.length, ready: ready, queued: queue.length };
  }

  function trackImageReadiness(img){
    if (!img) return;
    if (!img.decoding) img.decoding = "async";

    function markReady(){
      decodeImage(img).then(function(){
        img.classList.remove("gpending");
        img.classList.add("gloaded");
      });
    }

    if (img.complete && img.naturalWidth > 0){
      img.classList.remove("gpending");
      img.classList.add("gloaded");
      return;
    }

    img.classList.add("gpending");
    img.addEventListener("load", markReady, { once: true });
    img.addEventListener("error", function(){
      img.classList.remove("gpending");
      img.classList.add("gloaded");
    }, { once: true });
  }

  function init(){
    var stageImgs = Array.prototype.slice.call(document.querySelectorAll(".beforeafterstage img"));
    var gridImgs = Array.prototype.slice.call(document.querySelectorAll(".gallerygrid .gitem img"));
    var allImgs = stageImgs.concat(gridImgs);
    if (!allImgs.length) return;

    allImgs.forEach(trackImageReadiness);

    var priorityUrls = stageImgs.map(function(im){ return im.getAttribute("src"); });
    var gridUrls = [];
    gridImgs.forEach(function(im){
      var src = im.getAttribute("src");
      var full = im.getAttribute("data-full");
      if (src) gridUrls.push(src);
      if (full) gridUrls.push(full);
    });

    // High priority preload for the above-the-fold comparison slider pair
    uniqueUrls(priorityUrls).forEach(function(url){
      loadSingle(url, true);
    });

    // Background idle preloading for all gallery grid & lightbox images
    var planned = uniqueUrls(gridUrls);
    for (var i = 0; i < planned.length; i += 1){
      if (!cache[planned[i]]) queue.push(planned[i]);
    }

    if (queue.length){
      scheduleIdle(pumpQueue);
    }

    // Immediate intent prefetch on card hover, keyboard focus, or touch
    var items = Array.prototype.slice.call(document.querySelectorAll(".gallerygrid .gitem"));
    items.forEach(function(item){
      function warmCard(){
        var im = item.querySelector("img");
        if (!im) return;
        var full = im.getAttribute("data-full") || im.getAttribute("src");
        if (full) loadSingle(full, true);
      }
      item.addEventListener("pointerenter", warmCard, { passive: true });
      item.addEventListener("focusin", warmCard);
      item.addEventListener("touchstart", warmCard, { passive: true });
    });
  }

  window.galleryPreload = {
    preload: preload,
    preloadBatch: preloadBatch,
    isCached: isCached,
    getStats: getStats
  };

  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
