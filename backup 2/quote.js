(function(){
  "use strict";
  var form = document.getElementById("quoteForm");
  if (!form) return;

  var dashEmail = document.getElementById("dashEmail");
  var priceEl = document.getElementById("qprice");
  var EMAIL = "souwestlawnandgarden@gmail.com";

  var PROP = { residential:"Residential Home", commercial:"Commercial / Strata", rental:"Rental / End of Lease" };
  var SIZE = { small:"Small Courtyard", standard:"Standard Suburban Lot", acreage:"Large Acreage / Commercial" };
  var TIMING = { asap:"ASAP / Urgent", week:"Within 7 Days", regular:"Regular Scheduled Care" };
  var SERVICE_LABELS = {
    mowing:"Lawn Mowing & Edging",
    hedging:"Hedging & Pruning",
    weeds:"Weed Control & Spraying",
    cleanup:"Garden Clean-up / Green Waste",
    planting:"Planting & Garden Bed Renewal",
    presale:"Getting Ready for Sale",
    turf:"Turf Replacement"
  };
  var SPECIAL_LABELS = {
    summer:"Summer Heat / Drought",
    winter:"Winter Weed & Patch Care",
    fire:"Fire Season Clearance"
  };

  // indicative per-visit pricing (AUD)
  var BASE = {
    small:    { lo: 45,  hi: 70  },
    standard: { lo: 80,  hi: 130 },
    acreage:  { lo: 160, hi: 320 }
  };
  var SERVICES = {
    mowing:     { lo: 0,  hi: 0  },
    hedging:    { lo: 40, hi: 85 },
    weeds:      { lo: 35, hi: 60 },
    cleanup:    { lo: 45, hi: 95 },
    planting:   { lo: 80, hi: 180 },
    presale:    { lo: 140, hi: 280 },
    turf:       { lo: 450, hi: 1200 }
  };
  var SPECIALS = {
    summer: { lo: 25, hi: 40 },
    winter: { lo: 25, hi: 40 },
    fire:   { lo: 45, hi: 80 }
  };
  var PROP_MULT = { residential:1, commercial:1.3, rental:1.15 };
  var TIMING_ADD = { asap:20, week:0, regular:0 };

  function radioVal(name){
    var c = form.querySelector("input[name=\"" + name + "\"]:checked");
    return c ? c.value : "";
  }
  function checkedVals(name){
    return Array.prototype.slice.call(form.querySelectorAll("input[name=\"" + name + "\"]:checked")).map(function(i){ return i.value; });
  }
  function setQ(key, text){ var el = form.ownerDocument.querySelector("[data-q=\"" + key + "\"]"); if (el) el.textContent = text; }

  function labelise(list, map){
    if (!list.length) return "None selected";
    return list.map(function(v){ return map[v] || v; }).join(", ");
  }

  function estimate(){
    var size = radioVal("yardSize");
    var services = checkedVals("services");
    var specials = checkedVals("special");
    var prop = radioVal("propType");
    var timing = form.elements.timing ? form.elements.timing.value : "";

    var lo = 0, hi = 0, hasSize = false;
    if (size && BASE[size]) { lo += BASE[size].lo; hi += BASE[size].hi; hasSize = true; }
    services.forEach(function(s){ if (SERVICES[s]) { lo += SERVICES[s].lo; hi += SERVICES[s].hi; } });
    specials.forEach(function(s){ if (SPECIALS[s]) { lo += SPECIALS[s].lo; hi += SPECIALS[s].hi; } });

    var mult = PROP_MULT[prop] || 1;
    lo = Math.round(lo * mult); hi = Math.round(hi * mult);
    var add = TIMING_ADD[timing] || 0;
    lo += add; hi += add;

    if (!hasSize) { priceEl.textContent = "Select a yard size"; return; }
    priceEl.textContent = "$" + lo + " - $" + hi;
  }

  function buildMail(){
    var services = checkedVals("services");
    var specials = checkedVals("special");
    var body = [
      "Name: " + (form.elements.fullName.value || ""),
      "Phone: " + (form.elements.phone.value || ""),
      "Email: " + (form.elements.email.value || ""),
      "Suburb: " + (form.elements.suburb.value || ""),
      "Property type: " + (PROP[radioVal("propType")] || ""),
      "Yard size: " + (SIZE[radioVal("yardSize")] || ""),
      "Services: " + (services.length ? labelise(services, SERVICE_LABELS) : ""),
      "Seasonal care: " + (specials.length ? labelise(specials, SPECIAL_LABELS) : ""),
      "Timing: " + (TIMING[form.elements.timing.value] || ""),
      "Notes: " + (form.elements.notes.value || "-")
    ].join("\n");
    return "mailto:" + EMAIL + "?subject=" + encodeURIComponent("Quote request - " + (form.elements.fullName.value || "Adelaide property") + " - " + (form.elements.suburb.value || "")) + "&body=" + encodeURIComponent(body);
  }

  function refresh(){
    setQ("propType", PROP[radioVal("propType")] || "Not set");
    setQ("yardSize", SIZE[radioVal("yardSize")] || "Not set");
    setQ("services", labelise(checkedVals("services"), SERVICE_LABELS));
    setQ("special", labelise(checkedVals("special"), SPECIAL_LABELS));
    setQ("timing", TIMING[form.elements.timing.value] || "Not set");
    setQ("suburb", form.elements.suburb.value.trim() || "Not set");
    estimate();
    if (dashEmail) dashEmail.href = buildMail();
  }

  form.addEventListener("change", refresh);
  form.addEventListener("input", refresh);
  form.addEventListener("submit", function(){
    refresh();
    if (dashEmail) dashEmail.href = buildMail();
  });

  refresh();
})();
