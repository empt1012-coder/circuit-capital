(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document === "undefined") return;

  function val(id) {
    return (document.getElementById(id).value || "").trim();
  }

  document.getElementById("claim-form").addEventListener("submit", function (event) {
    event.preventDefault();
    document.getElementById("claim-out").value = api.check({
      vendor: val("claim-vendor"),
      product: val("claim-product"),
      claim: val("claim-text"),
      who: val("claim-who"),
      metric: val("claim-metric"),
      baseline: val("claim-baseline"),
      priceSource: val("claim-price-source"),
      volume: val("claim-volume"),
      unitPrice: val("claim-unit")
    }).text;
  });

  document.getElementById("claim-copy").addEventListener("click", function () {
    const out = document.getElementById("claim-out");
    out.focus();
    out.select();
    if (navigator.clipboard && out.value) navigator.clipboard.writeText(out.value).catch(function () {});
  });
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function num(value) {
    if (value === "" || value == null) return null;
    const n = Number(String(value).replace(/,/g, ""));
    return Number.isFinite(n) ? n : null;
  }

  function fmt(n) {
    return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
  }

  function check(input) {
    const whoLine = {
      vendor: "Vendor. This is the vendor's comparison. It is not the fact.",
      analyst: "Analyst. This is the analyst's number, not a measurement on our workload.",
      customer: "Customer. This is another customer's result, not ours.",
      unknown: "Unknown. Nobody is named as the measurer."
    }[input.who] || "Unknown. Nobody is named as the measurer.";

    const notMeasured = [];
    if (input.baseline !== "yes") notMeasured.push("No baseline is named. A percent faster, or a dollar saved, has nothing to stand on.");
    if (input.priceSource !== "yes") notMeasured.push("No price source is named. The claim does not say what the meter costs.");
    if (input.who === "vendor" || input.who === "unknown") notMeasured.push("The comparison was not run on our volume.");
    if (!notMeasured.length) notMeasured.push("A baseline and a price source are named. The claim is still not our bill.");

    const volume = num(input.volume);
    const unit = num(input.unitPrice);
    let bill;
    if (volume != null && unit != null) {
      bill = "At our volume, " + fmt(volume) + " × " + fmt(unit) + " = " + fmt(volume * unit) + ". That is our arithmetic, in the units we typed. It sits next to the claim. It does not confirm the claim.";
    } else {
      bill = "Our volume and unit price are blank. The claim does not price our bill.";
    }

    const questions = [];
    questions.push(input.baseline === "yes"
      ? "Walk the baseline you named. What was held constant?"
      : "Name the baseline. A speed or savings figure with no baseline is not a measurement.");
    questions.push(input.priceSource === "yes"
      ? "Show the price source on one page with the metric. Does it include the meter we will actually pay?"
      : "Where is the price, and which meter does it cover?");
    questions.push(volume != null
      ? "What does the claim do at our volume of " + fmt(volume) + "?"
      : "What does the claim do at our volume, not the demo volume?");

    const text = [
      "Vendor: " + (input.vendor || "Not named"),
      "Product: " + (input.product || "Not named"),
      "Metric: " + (input.metric || "Not named"),
      "",
      "Claim:",
      input.claim || "(no claim pasted)",
      "",
      "Whose number:",
      whoLine,
      "A vendor comparison is not the fact.",
      "",
      "What was not measured:",
      notMeasured.map(function (line) { return "- " + line; }).join("\n"),
      "",
      "What the bill still is:",
      bill,
      "",
      "Three questions for the call:",
      "1. " + questions[0],
      "2. " + questions[1],
      "3. " + questions[2]
    ].join("\n");

    return { text: text, bill: bill };
  }

  return { check: check };
});
