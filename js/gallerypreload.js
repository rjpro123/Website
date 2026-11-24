(function(){
  "use strict";

  var cache = Object.create(null);

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

  function loadSingle(url){
    if (!url) return Promise.resolve();
    if (cache[url]) return cache[url];

    var promise = new Promise(function(resolve){
      var img = new Image();
      img.decoding = "async";
      if ("fetchPriority" in img){
        img.fetchPriority = "high";
      }

      var settled = false;
      function finish(ok){
        if (settled) return;
        settled = true;
        if (ok) decodeImage(img).then(resolve, resolve);
        else resolve();
      }

      img.onload = function(){ finish(true); };
      img.onerror = function(){ finish(false); };
      img.src = url;

      if (img.complete && img.naturalWidth > 0){
        finish(true);
      }
    });

    cache[url] = promise;
    return promise;
  }

  function preloadBatch(urls){
    var list = uniqueUrls(Array.isArray(urls) ? urls : []);
    return Promise.all(list.map(loadSingle));
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

    if (img.complete){
      if (img.naturalWidth > 0){
        markReady();
      } else {
        img.classList.remove("gpending");
        img.classList.add("gloaded");
      }
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
    stageImgs.forEach(trackImageReadiness);
  }

  window.galleryPreload = { preloadBatch: preloadBatch };

  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
