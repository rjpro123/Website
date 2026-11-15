(function(){
  "use strict";

  var PDF_URL = "assets/Souwest_Professional_Manual_v19.pdf";

  var card = document.getElementById("pdfcard");
  var viewer = document.getElementById("pdfviewer");
  var frame = document.getElementById("pdfframe");
  var closeBtn = document.getElementById("pdfclose");
  if (!card || !viewer || !frame) return;

  // iOS Safari does not render PDFs inside iframes - open in a new tab instead
  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
              (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  function open(){
    if (isIOS){
      window.open(PDF_URL, "_blank");
      return;
    }
    if (frame.getAttribute("src") !== PDF_URL){
      frame.setAttribute("src", PDF_URL);
    }
    viewer.hidden = false;
    document.body.classList.add("pdflock");
    var c = viewer.querySelector(".pdfclose");
    if (c) c.focus();
  }

  function close(){
    viewer.hidden = true;
    document.body.classList.remove("pdflock");
    // unload the PDF so it stops rendering in the background
    frame.setAttribute("src", "about:blank");
  }

  card.addEventListener("click", open);
  card.addEventListener("keydown", function(e){
    if (e.key === "Enter" || e.key === " "){
      e.preventDefault();
      open();
    }
  });

  if (closeBtn) closeBtn.addEventListener("click", close);

  // click on the dimmed area outside the top bar closes
  viewer.addEventListener("click", function(e){
    if (e.target === viewer) close();
  });

  document.addEventListener("keydown", function(e){
    if (viewer.hidden) return;
    if (e.key === "Escape") close();
  });
})();