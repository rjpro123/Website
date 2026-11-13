(function(){
  "use strict";

  // Footer year
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mark the current tab
  var here = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  var tabs = document.querySelectorAll(".navtabs .tab");
  Array.prototype.forEach.call(tabs, function(a){
    var href = (a.getAttribute("href") || "").split("/").pop().split("#")[0].toLowerCase();
    if (href && href === here) a.classList.add("isactive");
  });
})();
