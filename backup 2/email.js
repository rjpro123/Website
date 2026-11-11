(function(){
  "use strict";
  var copyBtn = document.getElementById("copyBtn");
  var msg = document.getElementById("copiedMsg");
  if (!copyBtn || !msg) return;
  var EMAIL = "souwestlawnandgarden@gmail.com";

  copyBtn.addEventListener("click", function(){
    function done(){
      msg.textContent = "Email address copied to your clipboard.";
      setTimeout(function(){ msg.textContent = ""; }, 4000);
    }
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(EMAIL).then(done, function(){ window.prompt("Copy the email address:", EMAIL); });
    } else {
      window.prompt("Copy the email address:", EMAIL);
    }
  });
})();
