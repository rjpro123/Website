(function(){
  "use strict";

  var btn = document.getElementById("emailBtn");
  var win = document.getElementById("emailWindow");
  var closeBtn = document.getElementById("emailClose");
  if (!btn || !win) return;

  function openWin(){
    win.classList.add("isopen");
    var firstInput = win.querySelector("input");
    if (firstInput) firstInput.focus();
  }

  function closeWin(){
    win.classList.remove("isopen");
    btn.focus();
  }

  btn.addEventListener("click", openWin);
  if (closeBtn) closeBtn.addEventListener("click", closeWin);

  // Close on Escape
  document.addEventListener("keydown", function(e){
    if (e.key === "Escape" && win.classList.contains("isopen")) closeWin();
  });

  // Close when clicking outside
  document.addEventListener("click", function(e){
    if (!win.classList.contains("isopen")) return;
    if (!win.contains(e.target) && e.target !== btn) closeWin();
  });
})();