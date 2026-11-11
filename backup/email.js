(function(){
  "use strict";

  var EMAIL = "souwestgardening@gmail.com";
  var MAX_FILES = 5;
  var MAX_BYTES = 10 * 1024 * 1024;   // FormSubmit limit is 10MB in TOTAL

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
    var total = files.reduce(function(sum, f){ return sum + f.size; }, 0);
    if (total > MAX_BYTES) {
      return "Those photos add up to " + (Math.round(total / 1048576)) +
             "MB. Please keep the total under 10MB or email them separately.";
    }
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
