(function(){
  "use strict";
  var form = document.getElementById("quoteForm");
  var panes = Array.prototype.slice.call(document.querySelectorAll(".pane"));
  var steps = Array.prototype.slice.call(document.querySelectorAll(".step"));
  var success = document.getElementById("success");
  var summary = document.getElementById("successSummary");
  var mailto = document.getElementById("successMail");

  function q(sel, ctx){ return (ctx||form).querySelector(sel); }
  function qa(sel, ctx){ return Array.prototype.slice.call((ctx||form).querySelectorAll(sel)); }

  function setError(name, msg){
    var el = q("[data-err-for=\"" + name + "\"]");
    if (!el) return;
    el.textContent = msg || "";
    el.classList.toggle("show", !!msg);
    var input = form.elements[name];
    var wrap = input && input.closest ? input.closest(".field") : null;
    if (wrap) wrap.classList.toggle("has-error", !!msg);
  }

  function val(name){ var el = form.elements[name]; return el ? el.value.trim() : ""; }
  function radioValue(name){
    var checked = form.querySelector("input[name=\"" + name + "\"]:checked");
    return checked ? checked.value : "";
  }

  function validateField(name){
    var v = val(name);
    if (name === "fullName") { if (v.length < 2) { setError(name, "Please enter your full name."); return false; } }
    else if (name === "phone") {
      var digits = v.replace(/\D/g, "");
      if (!digits) { setError(name, "We need a number to reach you."); return false; }
      if (digits.length < 8) { setError(name, "Please enter a valid contact number."); return false; }
    }
    else if (name === "email") {
      if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { setError(name, "That email doesn't look right."); return false; }
    }
    else if (name === "suburb") { if (!v) { setError(name, "Suburb or postcode helps us dispatch crews."); return false; } }
    else if (name === "timing") { if (!v) { setError(name, "Choose your preferred timing."); return false; } }
    setError(name, "");
    return true;
  }

  function validateGroup(name, msg){
    var checked = qa("input[name=\"" + name + "\"]:checked");
    if (!checked.length) { setError(name, msg); return false; }
    setError(name, "");
    return true;
  }

  function validatePane(n){
    var ok = true;
    if (n === 1) {
      ok = validateField("fullName") && ok;
      ok = validateField("phone") && ok;
      ok = validateField("email") && ok;
      ok = validateField("suburb") && ok;
    } else if (n === 2) {
      ok = validateGroup("propType", "Select a property type.") && ok;
      ok = validateGroup("services", "Pick at least one service.") && ok;
    } else if (n === 3) {
      ok = validateGroup("yardSize", "Select an estimated yard size.") && ok;
      ok = validateField("timing") && ok;
    }
    return ok;
  }

  function show(n){
    panes.forEach(function(p){
      var on = p.getAttribute("data-pane") === String(n);
      p.classList.toggle("is-active", on);
    });
    steps.forEach(function(s, i){
      var num = i + 1;
      s.classList.toggle("is-active", num === n);
      s.classList.toggle("is-done", num < n);
    });
    var top = form.getBoundingClientRect().top + window.pageYOffset - 16;
    if (window.scrollY > top) window.scrollTo({ top: top, behavior: "smooth" });
  }

  // Continue / Back
  qa(".btn-next").forEach(function(btn){
    btn.addEventListener("click", function(){
      var next = Number(btn.getAttribute("data-next"));
      if (validatePane(next - 1)) show(next);
    });
  });
  qa(".btn-back").forEach(function(btn){
    btn.addEventListener("click", function(){
      show(Number(btn.getAttribute("data-back")));
    });
  });

  // Real-time validation on blur; errors clear as you type
  ["fullName","phone","email","suburb","timing"].forEach(function(name){
    var el = form.elements[name];
    if (!el) return;
    el.addEventListener("blur", function(){ validateField(name); });
    el.addEventListener("input", function(){
      var wrap = el.closest(".field");
      if (wrap && wrap.classList.contains("has-error")) validateField(name);
    });
    el.addEventListener("change", function(){ validateField(name); });
  });
  qa("input[type=checkbox],input[type=radio]").forEach(function(el){
    el.addEventListener("change", function(){
      setError(el.name, "");
    });
  });

  // Submit
  form.addEventListener("submit", function(e){
    e.preventDefault();
    var all = validatePane(1) && validatePane(2) && validatePane(3);
    if (!all) {
      var firstBad = form.querySelector(".has-error");
      if (firstBad) {
        var n = Number(firstBad.closest(".pane").getAttribute("data-pane"));
        show(n);
        firstBad.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    var services = qa("input[name=services]:checked").map(function(i){ return i.value; });
    var propLabels = { residential:"Residential Home", commercial:"Commercial / Strata", rental:"Rental / End of Lease" };
    var sizeLabels = { small:"Small Courtyard", standard:"Standard Suburban Lot", acreage:"Large Acreage / Commercial" };
    var timingLabels = { asap:"ASAP / Urgent", week:"Within 7 Days", regular:"Regular Scheduled Care" };

    summary.innerHTML = "";
    [["Name", val("fullName")], ["Phone", val("phone")], ["Suburb", val("suburb")],
     ["Property", propLabels[radioValue("propType")] || "-"], ["Services", services.length ? services.length + " selected" : "-"],
     ["Yard Size", sizeLabels[radioValue("yardSize")] || "-"], ["Timing", timingLabels[val("timing")] || "-"]
    ].forEach(function(row){
      var d = document.createElement("div");
      var dt = document.createElement("dt"); dt.textContent = row[0];
      var dd = document.createElement("dd"); dd.textContent = row[1];
      d.appendChild(dt); d.appendChild(dd);
      summary.appendChild(d);
    });

    mailto.href = "mailto:quotes@souwestlawnandgarden.com.au?subject=" +
      encodeURIComponent("Quote request - " + val("fullName") + " - " + val("suburb")) +
      "&body=" + encodeURIComponent(
        "Name: " + val("fullName") + "\nPhone: " + val("phone") + "\nSuburb: " + val("suburb") +
        "\nProperty: " + (propLabels[radioValue("propType")] || "") +
        "\nServices: " + services.join(", ") +
        "\nYard size: " + (sizeLabels[radioValue("yardSize")] || "") +
        "\nTiming: " + (timingLabels[val("timing")] || "") +
        "\nNotes: " + (val("notes") || "-")
      );

    panes.forEach(function(p){ p.classList.remove("is-active"); });
    success.hidden = false;
    success.scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();
