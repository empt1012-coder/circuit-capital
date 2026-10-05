(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document === "undefined") return;

  function val(id) {
    return (document.getElementById(id).value || "").trim();
  }

  document.getElementById("margin-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const result = api.margin({
      price: val("margin-price"),
      inputTokens: val("margin-in"),
      outputTokens: val("margin-out-tokens"),
      inputPrice: val("margin-in-price"),
      outputPrice: val("margin-out-price"),
      minutes: val("margin-minutes"),
      hourly: val("margin-hourly"),
      tasks: val("margin-tasks")
    });
    document.getElementById("margin-worked").textContent = result.worked;
    document.getElementById("margin-out").value = result.text;
  });

  document.getElementById("margin-copy").addEventListener("click", function () {
    const out = document.getElementById("margin-out");
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
    if (!Number.isFinite(n)) return "—";
    const abs = Math.abs(n);
    const digits = abs !== 0 && abs < 0.01 ? 6 : 2;
    return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: digits });
  }

  function margin(input) {
    const price = num(input.price);
    const inputTokens = num(input.inputTokens);
    const outputTokens = num(input.outputTokens);
    const inputPrice = num(input.inputPrice);
    const outputPrice = num(input.outputPrice);
    const minutes = num(input.minutes);
    const hourly = num(input.hourly);
    const tasks = num(input.tasks);
    const missing = [price, inputTokens, outputTokens, inputPrice, outputPrice, minutes, hourly].some(function (n) { return n == null; });
    if (missing) {
      return {
        worked: "Enter every cost field. Tasks per month can stay blank.",
        text: "Incomplete. No cost was invented."
      };
    }

    const tokenCost = (inputTokens / 1e6) * inputPrice + (outputTokens / 1e6) * outputPrice;
    const reviewCost = (minutes / 60) * hourly;
    const contribution = price - tokenCost - reviewCost;
    const marginPct = price === 0 ? null : contribution / price;
    const note = reviewCost > tokenCost ? "Human review costs more than the tokens." : "";
    const worked = "Token cost = (" + fmt(inputTokens) + " / 1,000,000) × " + fmt(inputPrice) + " + (" + fmt(outputTokens) + " / 1,000,000) × " + fmt(outputPrice) + " = " + fmt(tokenCost) + ". Review cost = (" + fmt(minutes) + " / 60) × " + fmt(hourly) + " = " + fmt(reviewCost) + ".";

    const lines = [
      "Numbers are in the units you typed. This page does not call a model.",
      "",
      "Token cost: " + fmt(tokenCost),
      "Review cost: " + fmt(reviewCost),
      "Contribution: " + fmt(contribution),
      "Margin: " + (marginPct == null ? "Not defined. Price charged is 0." : (Math.round(marginPct * 1000) / 10) + "%"),
    ];
    if (tasks != null) lines.push("Contribution per month at " + fmt(tasks) + " tasks: " + fmt(contribution * tasks));
    if (note) lines.push("", note);

    return { worked: worked, text: lines.join("\n"), tokenCost: tokenCost, reviewCost: reviewCost, contribution: contribution, marginPct: marginPct, note: note };
  }

  return { margin: margin };
});
