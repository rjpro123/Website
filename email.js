(function(){
  "use strict";

  var EMAIL = "souwestgardening@gmail.com";
  var MAX_FILES = 5;
  var MAX_BYTES = 8 * 1024 * 1024;

  /* ---------------- Photo upload previews ---------------- */
  var input = document.getElementById("photos");
  var thumbs = document.getElementById("thumbs");
  var form = document.getElementById("mailForm");
  var errEl = document.querySelector('[data-err-for="photos"]');

  function showError(msgText){
    if (!errEl) return;
    errEl.textContent = msgText || "";
    errEl.classList.toggle("show", !!msgText);
  }

  function filesOk(){
    var files = Array.prototype.slice.call((input && input.files) || []);
    if (files.length > MAX_FILES) return "Please attach up to " + MAX_FILES + " photos.";
    var tooBig = files.filter(function(f){ return f.size > MAX_BYTES; });
    if (tooBig.length) return "One or more photos are over 8MB. Please email them instead.";
    return "";
  }

  if (input && thumbs){
    input.addEventListener("change", function(){
      thumbs.innerHTML = "";
      var files = Array.prototype.slice.call(input.files || []);

      files.slice(0, MAX_FILES).forEach(function(f){
        var box = document.createElement("div");
        box.className = "thumb";

        if (f.type && f.type.indexOf("image") === 0){
          var img = document.createElement("img");
          img.alt = f.name;
          img.src = URL.createObjectURL(f);
          box.appendChild(img);
        }
        var cap = document.createElement("span");
        cap.textContent = f.name;
        box.appendChild(cap);

        if (f.size > MAX_BYTES) box.classList.add("is-bad");
        thumbs.appendChild(box);
      });

      showError(filesOk());
    });
  }

  /* ---------------- Block submit if attachments are unusable ---------------- */
  if (form){
    form.addEventListener("submit", function(e){
      var problem = filesOk();
      if (problem){
        e.preventDefault();
        showError(problem);
        if (input) input.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }
})();
