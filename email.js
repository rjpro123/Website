(function(){
  "use strict";

  var MAX_FILES = 5;
  var MAX_BYTES = 10 * 1024 * 1024; // FormSubmit total attachment cap (10MB)
  var MAX_DIM = 1600;               // Max width or height when compressing photos
  var JPEG_QUALITY = 0.82;

  /* ---------------- Dynamic _next redirect ---------------- */
  function setDynamicNext(){
    var nextInputs = document.querySelectorAll('input[name="_next"]');
    if (!nextInputs.length) return;
    var base = window.location.origin;
    var path = window.location.pathname;
    var prefix = path.indexOf("/Website/") === 0 ? "/Website/" : "/";
    var nextUrl = base + prefix + "thanks.html";
    Array.prototype.forEach.call(nextInputs, function(el){
      el.value = nextUrl;
    });
  }
  setDynamicNext();

  /* ---------------- Service prefill from URL or chips ---------------- */
  var subjectInput = document.getElementById("mailSubject");
  var chipWrap = document.getElementById("serviceChips");
  var lastAutoSubject = "";

  function updateSubjectFromChips(){
    if (!chipWrap || !subjectInput) return;
    var active = Array.prototype.slice.call(chipWrap.querySelectorAll(".svcchip.isselected"))
      .map(function(b){ return b.getAttribute("dataservice"); });
    var current = subjectInput.value.trim();
    var canOverwrite = !current || current === lastAutoSubject || current.indexOf("Quote for ") === 0;
    if (!canOverwrite) return;
    if (active.length){
      lastAutoSubject = "Quote for " + active.join(", ");
      subjectInput.value = lastAutoSubject;
    } else if (current === lastAutoSubject){
      lastAutoSubject = "";
      subjectInput.value = "";
    }
  }

  if (chipWrap){
    chipWrap.addEventListener("click", function(e){
      var btn = e.target && e.target.closest ? e.target.closest(".svcchip") : null;
      if (!btn) return;
      var selected = btn.classList.toggle("isselected");
      btn.setAttribute("aria-pressed", selected ? "true" : "false");
      updateSubjectFromChips();
    });
  }

  try {
    var params = new URLSearchParams(window.location.search);
    var svc = params.get("service");
    if (svc && subjectInput){
      lastAutoSubject = "Quote for " + svc;
      subjectInput.value = lastAutoSubject;
      if (chipWrap){
        var lower = svc.toLowerCase();
        Array.prototype.forEach.call(chipWrap.querySelectorAll(".svcchip"), function(btn){
          var label = (btn.getAttribute("dataservice") || "").toLowerCase();
          if (label && lower.indexOf(label) !== -1){
            btn.classList.add("isselected");
            btn.setAttribute("aria-pressed", "true");
          }
        });
      }
    }
  } catch (e) {}

  /* ---------------- Yard size & frequency single-select chips ---------------- */
  function bindSingleChipGroup(wrapId, hiddenId){
    var wrap = document.getElementById(wrapId);
    var hidden = document.getElementById(hiddenId);
    if (!wrap || !hidden) return;
    wrap.addEventListener("click", function(e){
      var btn = e.target && e.target.closest ? e.target.closest(".svcchip") : null;
      if (!btn) return;
      var wasSelected = btn.classList.contains("isselected");
      Array.prototype.forEach.call(wrap.querySelectorAll(".svcchip"), function(b){
        b.classList.remove("isselected");
        b.setAttribute("aria-pressed", "false");
      });
      if (wasSelected){
        hidden.value = "";
      } else {
        btn.classList.add("isselected");
        btn.setAttribute("aria-pressed", "true");
        hidden.value = btn.getAttribute("datavalue") || btn.textContent.trim();
      }
    });
  }
  bindSingleChipGroup("sizeChips", "mailYardSize");
  bindSingleChipGroup("freqChips", "mailFrequency");

  /* ---------------- Photo upload queue + compression ---------------- */
  var input = document.getElementById("photos");
  var dropZone = document.getElementById("uploadZone");
  var thumbs = document.getElementById("thumbs");
  var photoFields = document.getElementById("photoFields");
  var statusEl = document.getElementById("uploadStatus");
  var form = document.getElementById("mailForm");
  var submitBtn = form ? form.querySelector(".btnsubmit") : null;
  var errEl = document.querySelector('[dataerrfor="photos"]');

  var queue = [];
  var objectUrls = [];
  var processing = false;

  function showError(msgText){
    if (!errEl) return;
    errEl.textContent = msgText || "";
    errEl.classList.toggle("show", !!msgText);
  }

  function formatSize(bytes){
    if (bytes < 1024 * 1024){
      return Math.max(1, Math.round(bytes / 1024)) + " KB";
    }
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function totalBytes(list){
    return list.reduce(function(sum, f){ return sum + f.size; }, 0);
  }

  function filesOk(list){
    if (list.length > MAX_FILES) return "Please attach up to " + MAX_FILES + " photos.";
    var total = totalBytes(list);
    if (total > MAX_BYTES){
      return "Those photos add up to " + (total / 1048576).toFixed(1) +
             " MB. Please remove one or keep the total under 10 MB.";
    }
    return "";
  }

  function syncInput(){
    if (!input || typeof DataTransfer === "undefined") return;
    if (photoFields){
      // FormSubmit overwrites files that share the same field name, so each
      // queued photo is placed in its own uniquely named file input.
      input.removeAttribute("name");
      photoFields.innerHTML = "";
      queue.slice(0, MAX_FILES).forEach(function(f, idx){
        var field = document.createElement("input");
        field.type = "file";
        field.name = "photo" + (idx + 1);
        var dt = new DataTransfer();
        dt.items.add(f);
        field.files = dt.files;
        photoFields.appendChild(field);
      });
    } else {
      var dtAll = new DataTransfer();
      queue.forEach(function(f){ dtAll.items.add(f); });
      input.files = dtAll.files;
    }
  }

  function revokeUrls(){
    objectUrls.forEach(function(u){
      try { URL.revokeObjectURL(u); } catch (e) {}
    });
    objectUrls = [];
  }

  function renderQueue(extraNotice){
    if (!thumbs) return;
    revokeUrls();
    thumbs.innerHTML = "";

    var total = totalBytes(queue);
    var overTotal = total > MAX_BYTES;

    queue.forEach(function(f, idx){
      var box = document.createElement("div");
      box.className = "thumb";
      if (f.size > MAX_BYTES || overTotal || idx >= MAX_FILES){
        box.classList.add("isbad");
      }

      if (f.type && f.type.indexOf("image") === 0){
        var url = URL.createObjectURL(f);
        objectUrls.push(url);
        var img = document.createElement("img");
        img.alt = f.name;
        img.src = url;
        box.appendChild(img);
      } else {
        var placeholder = document.createElement("div");
        placeholder.className = "thumbfile";
        placeholder.textContent = "IMG";
        box.appendChild(placeholder);
      }

      var rm = document.createElement("button");
      rm.type = "button";
      rm.className = "thumbremove";
      rm.setAttribute("aria-label", "Remove " + f.name);
      rm.innerHTML = "&times;";
      rm.addEventListener("click", function(){
        queue.splice(idx, 1);
        syncInput();
        renderQueue();
      });
      box.appendChild(rm);

      var cap = document.createElement("span");
      cap.textContent = formatSize(f.size);
      box.appendChild(cap);

      thumbs.appendChild(box);
    });

    if (statusEl){
      if (queue.length){
        statusEl.textContent = queue.length + " of " + MAX_FILES + " photos \u00b7 " + formatSize(total) + " of 10 MB";
        statusEl.hidden = false;
      } else {
        statusEl.textContent = "";
        statusEl.hidden = true;
      }
    }

    showError(extraNotice || filesOk(queue));
  }

  function compressImage(file){
    return new Promise(function(resolve){
      if (!file.type || file.type.indexOf("image/") !== 0 || file.type === "image/gif" || file.size < 350 * 1024){
        resolve(file);
        return;
      }

      var img = new Image();
      var url = URL.createObjectURL(file);
      img.onload = function(){
        URL.revokeObjectURL(url);
        var w = img.naturalWidth || img.width;
        var h = img.naturalHeight || img.height;
        if (!w || !h){
          resolve(file);
          return;
        }
        var scale = Math.min(1, MAX_DIM / Math.max(w, h));
        var tw = Math.round(w * scale);
        var th = Math.round(h * scale);

        var canvas = document.createElement("canvas");
        canvas.width = tw;
        canvas.height = th;
        var ctx = canvas.getContext("2d");
        if (!ctx){
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, tw, th);

        canvas.toBlob(function(blob){
          if (!blob || blob.size >= file.size){
            resolve(file);
            return;
          }
          var baseName = file.name.replace(/\.[^.]+$/, "");
          var newFile = new File([blob], baseName + ".jpg", {
            type: "image/jpeg",
            lastModified: file.lastModified || Date.now()
          });
          resolve(newFile);
        }, "image/jpeg", JPEG_QUALITY);
      };
      img.onerror = function(){
        URL.revokeObjectURL(url);
        resolve(file);
      };
      img.src = url;
    });
  }

  function addFiles(incoming){
    var files = Array.prototype.slice.call(incoming || []);
    if (!files.length) return;

    var skipped = 0;
    var candidates = [];

    files.forEach(function(f){
      var duplicate = queue.some(function(existing){
        return existing.name === f.name && existing.size === f.size && existing.lastModified === f.lastModified;
      });
      if (duplicate) return;

      if (queue.length + candidates.length >= MAX_FILES){
        skipped += 1;
        return;
      }
      candidates.push(f);
    });

    if (!candidates.length){
      if (skipped > 0){
        renderQueue("You can attach up to " + MAX_FILES + " photos. Remove one to add another.");
      }
      return;
    }

    processing = true;
    if (statusEl){
      statusEl.textContent = "Preparing photos...";
      statusEl.hidden = false;
    }

    Promise.all(candidates.map(compressImage)).then(function(processed){
      processed.forEach(function(f){
        if (queue.length < MAX_FILES) queue.push(f);
      });
      processing = false;
      syncInput();
      var notice = skipped > 0 ? ("Only the first " + MAX_FILES + " photos were added.") : "";
      renderQueue(notice);
    });
  }

  if (input && thumbs){
    input.addEventListener("change", function(){
      var picked = Array.prototype.slice.call(input.files || []);
      if (typeof DataTransfer !== "undefined"){
        input.value = "";
        addFiles(picked);
      } else {
        queue = picked;
        renderQueue();
      }
    });
  }

  if (dropZone){
    ["dragenter", "dragover"].forEach(function(evt){
      dropZone.addEventListener(evt, function(e){
        e.preventDefault();
        dropZone.classList.add("isdrag");
      });
    });
    ["dragleave", "drop"].forEach(function(evt){
      dropZone.addEventListener(evt, function(e){
        e.preventDefault();
        dropZone.classList.remove("isdrag");
      });
    });
    dropZone.addEventListener("drop", function(e){
      var dtFiles = e.dataTransfer && e.dataTransfer.files ? e.dataTransfer.files : [];
      addFiles(dtFiles);
    });
  }

  /* ---------------- Validate & lock submit button ---------------- */
  if (form){
    form.addEventListener("submit", function(e){
      setDynamicNext();
      if (processing){
        e.preventDefault();
        showError("Still preparing your photos. Please try again in a second.");
        return;
      }
      syncInput();
      var problem = filesOk(queue);
      if (problem){
        e.preventDefault();
        showError(problem);
        if (dropZone || input) (dropZone || input).scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      if (submitBtn){
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";
      }
    });

    window.addEventListener("pageshow", function(){
      if (submitBtn){
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message";
      }
    });
  }
})();
