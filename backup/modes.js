(function(){
  "use strict";
  var quoteBtn = document.getElementById("modeQuoteBtn");
  var emailBtn = document.getElementById("modeEmailBtn");
  var quotePanel = document.getElementById("modeQuote");
  var emailPanel = document.getElementById("modeEmail");
  if (!quoteBtn || !emailBtn || !quotePanel || !emailPanel) return;

  function show(mode){
    var isEmail = mode === "email";
    quotePanel.classList.toggle("is-active", !isEmail);
    quotePanel.hidden = isEmail;
    emailPanel.classList.toggle("is-active", isEmail);
    emailPanel.hidden = !isEmail;

    quoteBtn.classList.toggle("is-active", !isEmail);
    quoteBtn.setAttribute("aria-selected", String(!isEmail));
    emailBtn.classList.toggle("is-active", isEmail);
    emailBtn.setAttribute("aria-selected", String(isEmail));
  }

  function modeFromHash(){
    return (window.location.hash || "").toLowerCase().indexOf("email") !== -1 ? "email" : "quote";
  }

  quoteBtn.addEventListener("click", function(){
    show("quote");
    history.replaceState(null, "", window.location.pathname);
  });
  emailBtn.addEventListener("click", function(){
    show("email");
    history.replaceState(null, "", window.location.pathname + "#email");
  });

  window.addEventListener("hashchange", function(){ show(modeFromHash()); });

  show(modeFromHash());
})();
