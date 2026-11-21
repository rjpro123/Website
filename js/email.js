(function(){
  "use strict";

  var MAX_FILES = 10;
  var MAX_BYTES = 10 * 1024 * 1024; // FormSubmit total attachment cap (10MB)
  var MAX_DIM = 1600;               // Max width or height when compressing photos
  var JPEG_QUALITY = 0.82;

  /* ---------------- Service prefill from URL or chips ---------------- */
  var subjectInput = document.getElementById("mailSubject");
  var servicesInput = document.getElementById("mailServices");
  var chipWrap = document.getElementById("serviceChips");
  var lastAutoSubject = "";

  function syncServicesField(){
    if (!chipWrap) return [];
    var active = Array.prototype.slice.call(chipWrap.querySelectorAll(".svcchip.isselected"))
      .map(function(b){ return b.getAttribute("dataservice"); });
    if (servicesInput) servicesInput.value = active.join(", ");
    return active;
  }

  function updateSubjectFromChips(){
    var active = syncServicesField();
    if (!subjectInput) return;
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

  var SERVICE_MAP = [
    { chip: "Lawn Mowing", keys: ["lawn mowing", "mowing", "edging"] },
    { chip: "Hedging", keys: ["hedg"] },
    { chip: "Tree Work", keys: ["tree", "stump", "branch"] },
    { chip: "Spraying", keys: ["spray", "weed"] },
    { chip: "Garden Cleanup", keys: ["cleanup", "clean up", "sale", "tidy"] },
    { chip: "Mulching", keys: ["mulch", "soil", "planting", "garden beds"] },
    { chip: "Turf", keys: ["turf", "aeration", "overseeding"] }
  ];

  try {
    var params = new URLSearchParams(window.location.search);
    var svc = params.get("service");
    if (svc){
      if (subjectInput){
        lastAutoSubject = "Quote for " + svc;
        subjectInput.value = lastAutoSubject;
      }
      if (chipWrap){
        var lower = svc.toLowerCase();
        var matchedChips = [];
        SERVICE_MAP.forEach(function(entry){
          if (entry.keys.some(function(k){ return lower.indexOf(k) !== -1; })){
            matchedChips.push(entry.chip.toLowerCase());
          }
        });
        Array.prototype.forEach.call(chipWrap.querySelectorAll(".svcchip"), function(btn){
          var label = (btn.getAttribute("dataservice") || "").toLowerCase();
          if (label && (lower.indexOf(label) !== -1 || matchedChips.indexOf(label) !== -1)){
            btn.classList.add("isselected");
            btn.setAttribute("aria-pressed", "true");
          }
        });
        var synced = syncServicesField();
        if (servicesInput && !synced.length) servicesInput.value = svc;
      }
    }
  } catch (e) {}

  /* ---------------- Yard size, frequency & green waste single-select chips ---------------- */
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
  bindSingleChipGroup("wasteChips", "mailGreenWaste");

  /* ---------------- Interactive suburb pills ---------------- */
  var areasList = document.getElementById("areasList");
  var suburbInput = document.getElementById("mailSuburb");
  var nameInput = document.getElementById("mailName");
  var msgInput = document.getElementById("mailMessage");
  var mailFormEl = document.getElementById("mailForm");

  if (areasList && suburbInput){
    function syncSuburbPills(){
      var val = suburbInput.value.trim().toLowerCase();
      Array.prototype.forEach.call(areasList.querySelectorAll(".areapill"), function(p){
        var ps = (p.getAttribute("datasuburb") || p.textContent.trim()).toLowerCase();
        p.classList.toggle("isselected", !!val && ps === val);
      });
    }

    suburbInput.addEventListener("input", syncSuburbPills);

    areasList.addEventListener("click", function(e){
      var pill = e.target && e.target.closest ? e.target.closest(".areapill") : null;
      if (!pill) return;
      var suburb = pill.getAttribute("datasuburb") || pill.textContent.trim();
      suburbInput.value = suburb;
      syncSuburbPills();

      if (mailFormEl && mailFormEl.scrollIntoView){
        mailFormEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      setTimeout(function(){
        if (nameInput && !nameInput.value.trim()) nameInput.focus({ preventScroll: true });
        else if (msgInput) msgInput.focus({ preventScroll: true });
      }, 350);
    });
  }

  /* ---------------- Copy direct email button ---------------- */
  var copyBtn = document.getElementById("copyEmailBtn");
  if (copyBtn){
    var copyHint = copyBtn.querySelector(".copyemailhint");
    var copyTimer = null;
    var fallbackCopy = function(text){
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.readOnly = true;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { ta.setSelectionRange(0, text.length); } catch (err) {}
      try { document.execCommand("copy"); } catch (err) {}
      document.body.removeChild(ta);
    };
    copyBtn.addEventListener("click", function(){
      var addr = copyBtn.getAttribute("dataemail");
      var done = function(){
        if (copyTimer) clearTimeout(copyTimer);
        copyBtn.classList.add("copied");
        if (copyHint) copyHint.textContent = "Copied to clipboard!";
        copyTimer = setTimeout(function(){
          copyBtn.classList.remove("copied");
          if (copyHint) copyHint.textContent = "Tap to copy";
          copyTimer = null;
        }, 2200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(addr).then(done).catch(function(){ fallbackCopy(addr); done(); });
      } else {
        fallbackCopy(addr);
        done();
      }
    });
  }

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
  var activeBatches = 0;
  var pendingFiles = 0;
  var inFlightKeys = {};
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
        img.src = url;
        img.alt = f.name;
        box.appendChild(img);
      } else {
        var badge = document.createElement("div");
        badge.className = "thumbfile";
        badge.textContent = (f.name.split(".").pop() || "FILE").toUpperCase();
        box.appendChild(badge);
      }

      var rm = document.createElement("button");
      rm.type = "button";
      rm.className = "thumbremove";
      rm.setAttribute("aria-label", "Remove " + f.name);
      rm.textContent = "\u00d7";
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
      if (processing){
        statusEl.textContent = "Preparing photos...";
        statusEl.hidden = false;
      } else if (queue.length){
        statusEl.textContent = queue.length + " of " + MAX_FILES + " photo" + (queue.length === 1 ? "" : "s") + " \u00b7 " + formatSize(total) + " of 10 MB";
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

  function fileKey(f){
    return (f.name || "") + "|" + (f.size || 0) + "|" + (f.lastModified || 0);
  }

  function isImageFile(f){
    if (f.type && f.type.indexOf("image/") === 0) return true;
    return /\.(jpe?g|png|webp|gif|heic|heif|bmp)$/i.test(f.name || "");
  }

  function addFiles(incoming){
    var files = Array.prototype.slice.call(incoming || []);
    if (!files.length) return;

    var skipped = 0;
    var rejectedType = 0;
    var candidates = [];

    files.forEach(function(f){
      if (!isImageFile(f)){
        rejectedType += 1;
        return;
      }
      var key = fileKey(f);
      var duplicate = !!inFlightKeys[key] || queue.some(function(existing){
        return existing._origKey === key || fileKey(existing) === key;
      }) || candidates.some(function(c){
        return fileKey(c) === key;
      });
      if (duplicate) return;

      if (queue.length + pendingFiles + candidates.length >= MAX_FILES){
        skipped += 1;
        return;
      }
      candidates.push(f);
    });

    if (!candidates.length){
      if (rejectedType > 0){
        renderQueue("Please attach image files only (JPG, PNG or WEBP).");
      } else if (skipped > 0){
        renderQueue("You can attach up to " + MAX_FILES + " photos. Remove one to add another.");
      }
      return;
    }

    activeBatches += 1;
    pendingFiles += candidates.length;
    processing = true;
    candidates.forEach(function(f){ inFlightKeys[fileKey(f)] = true; });

    if (statusEl){
      statusEl.textContent = "Preparing photos...";
      statusEl.hidden = false;
    }

    var batchKeys = candidates.map(fileKey);
    Promise.all(candidates.map(function(orig){
      var key = fileKey(orig);
      return compressImage(orig).then(function(out){
        out._origKey = key;
        return out;
      });
    })).then(function(processed){
      processed.forEach(function(f){
        if (queue.length < MAX_FILES) queue.push(f);
      });
      batchKeys.forEach(function(k){ delete inFlightKeys[k]; });
      pendingFiles = Math.max(0, pendingFiles - candidates.length);
      activeBatches = Math.max(0, activeBatches - 1);
      processing = activeBatches > 0;
      syncInput();
      var notice = "";
      if (rejectedType > 0) notice = "Only image files were added (non image files skipped).";
      else if (skipped > 0) notice = "You can attach up to " + MAX_FILES + " photos. Extra photos were skipped.";
      renderQueue(notice);
    }).catch(function(){
      batchKeys.forEach(function(k){ delete inFlightKeys[k]; });
      pendingFiles = Math.max(0, pendingFiles - candidates.length);
      activeBatches = Math.max(0, activeBatches - 1);
      processing = activeBatches > 0;
      renderQueue("Could not process one of the selected photos. Please try again.");
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
      if (nameInput) nameInput.value = nameInput.value.trim();
      if (msgInput) msgInput.value = msgInput.value.trim();
      var emailInput = document.getElementById("mailEmail");
      if (emailInput) emailInput.value = emailInput.value.trim();

      if (form.checkValidity && !form.checkValidity()){
        e.preventDefault();
        if (form.reportValidity) form.reportValidity();
        return;
      }
      if (processing){
        e.preventDefault();
        showError("Still preparing your photos. Please try again in a second.");
        return;
      }
      if (subjectInput && !subjectInput.value.trim()){
        var sub = suburbInput && suburbInput.value.trim();
        subjectInput.value = sub ? ("Quote enquiry for " + sub) : "Website quote enquiry";
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
