(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document === "undefined") return;

  const form = document.getElementById("renewal-form");
  const out = document.getElementById("renewal-out");
  const decision = document.getElementById("renewal-decision");
  const table = document.getElementById("renewal-points");
  const total = document.getElementById("renewal-total");

  function val(id) {
    return (document.getElementById(id).value || "").trim();
  }

  function render(result) {
    decision.textContent = result.decision;
    decision.classList.toggle("tool-error", !!result.incomplete);
    total.textContent = result.total + " points. " + result.band;
    table.innerHTML = "<tr><th>Check</th><th>Result</th><th>Points</th></tr>" +
      result.rows.map(function (row) {
        return "<tr><td></td><td></td><td></td></tr>";
      }).join("");
    Array.prototype.forEach.call(table.querySelectorAll("tr"), function (tr, i) {
      if (i === 0) return;
      const row = result.rows[i - 1];
      tr.children[0].textContent = row.check;
      tr.children[1].textContent = row.result;
      tr.children[2].textContent = row.points;
    });
    out.value = result.text;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    render(api.score({
      product: val("product"),
      cost: val("cost"),
      paid: val("paid"),
      active: val("active"),
      cap: val("cap"),
      capStatus: val("cap-status"),
      notice: val("notice"),
      dataReturn: val("data-return"),
      exportAll: val("export"),
      sbom: val("sbom"),
      training: val("training"),
      subprocessors: val("subprocessors"),
      exitClause: val("exit")
    }));
  });

  document.getElementById("renewal-copy").addEventListener("click", function () {
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

  function label(id) {
    return {
      paid: "seats paid",
      active: "seats active",
      cap: "the price-up cap percentage",
      notice: "notice period days",
      dataReturn: "data-return window days"
    }[id];
  }

  function listJoin(items) {
    if (items.length <= 1) return items.join("");
    return items.slice(0, -1).join(", ") + " and " + items[items.length - 1];
  }

  function validate(input) {
    const missing = [];
    const invalid = [];
    const capStatus = input.capStatus || (input.cap === "" || input.cap == null ? "" : "set");
    ["paid", "active", "notice", "dataReturn"].forEach(function (id) {
      const raw = input[id];
      if (raw === "" || raw == null) { missing.push(label(id)); return; }
      const n = num(raw);
      if (n == null) invalid.push(label(id) + " must be a number");
      else if (n < 0) invalid.push(label(id) + " cannot be negative");
      else if (id !== "notice" && id !== "dataReturn" && !Number.isInteger(n)) invalid.push(label(id) + " must be a whole number");
    });
    const paid = num(input.paid);
    const active = num(input.active);
    if (paid === 0) invalid.push("seats paid must be at least 1");
    if (paid != null && active != null && paid > 0 && active > paid) invalid.push("seats active cannot be more than seats paid");
    if (!capStatus) missing.push("whether there is a price-up cap");
    if (capStatus === "set") {
      if (input.cap === "" || input.cap == null) missing.push(label("cap"));
      else {
        const cap = num(input.cap);
        if (cap == null) invalid.push("the price-up cap must be a number");
        else if (cap < 0) invalid.push("the price-up cap cannot be negative");
        else if (cap > 100) invalid.push("the price-up cap cannot be more than 100%");
      }
    }
    if (input.cost !== "" && input.cost != null) {
      const cost = num(input.cost);
      if (cost == null) invalid.push("annual cost must be a number");
      else if (cost < 0) invalid.push("annual cost cannot be negative");
    }
    return { missing: missing, invalid: invalid, capStatus: capStatus };
  }

  function score(input) {
    const product = input.product || "This product";
    const check = validate(input);
    if (check.missing.length || check.invalid.length) {
      const parts = [];
      if (check.missing.length) parts.push("Incomplete: add " + listJoin(check.missing) + ".");
      if (check.invalid.length) parts.push("Check the inputs: " + listJoin(check.invalid) + ".");
      const message = parts.join(" ");
      return {
        decision: check.missing.length ? "Incomplete: add " + listJoin(check.missing) : "Check the inputs",
        incomplete: true,
        total: 0,
        band: message + " No decision until the required fields are filled in with valid values.",
        rows: [],
        reasons: [],
        text: product + "\n" + message + "\nNo decision until the required fields are filled in with valid values."
      };
    }
    const paid = num(input.paid);
    const active = num(input.active);
    const cap = num(input.cap);
    const notice = num(input.notice);
    const dataReturn = num(input.dataReturn);
    const rows = [];

    const pct = Math.round((active / paid) * 1000) / 10;
    if (active / paid < 0.6) {
      rows.push({
        check: "Seat use",
        result: pct + "% of paid seats were active. Under 60% scores 2.",
        points: 2,
        agenda: "Cut the renewal to seats active in the last 30 days, or price the idle seats out."
      });
    } else {
      rows.push({
        check: "Seat use",
        result: pct + "% of paid seats were active. At or above 60% scores 0.",
        points: 0,
        agenda: ""
      });
    }

    if (check.capStatus === "none") {
      rows.push({
        check: "Price-up cap",
        result: "No cap. The price can rise by any amount. Scores 2.",
        points: 2,
        agenda: "Add a contractual price-up cap. We will not sign a blank increase."
      });
    } else if (check.capStatus === "unknown") {
      rows.push({
        check: "Price-up cap",
        result: "Unknown. Treated as no cap until the contract shows one. Scores 2.",
        points: 2,
        agenda: "Show us the price-up cap in the contract, or add one."
      });
    } else {
      rows.push({
        check: "Price-up cap",
        result: "Cap is " + cap + "%." + (cap === 0 ? " A 0% cap means no increase, the best case." : "") + " A named cap scores 0.",
        points: 0,
        agenda: ""
      });
    }

    if (notice < 30) {
      rows.push({
        check: "Notice period",
        result: notice + " days. Under 30 scores 2.",
        points: 2,
        agenda: "Extend the non-renewal notice to at least 30 days."
      });
    } else {
      rows.push({
        check: "Notice period",
        result: notice + " days. 30 or more scores 0.",
        points: 0,
        agenda: ""
      });
    }

    if (dataReturn < 30) {
      rows.push({
        check: "Data-return window",
        result: dataReturn + " days. Under 30 scores 1.",
        points: 1,
        agenda: "Extend the data-return window to at least 30 days after the contract ends."
      });
    } else {
      rows.push({
        check: "Data-return window",
        result: dataReturn + " days. 30 or more scores 0.",
        points: 0,
        agenda: ""
      });
    }

    if (input.exportAll === "no") {
      rows.push({
        check: "Export",
        result: "Cannot export all data. Scores 2.",
        points: 2,
        agenda: "Confirm we can export all customer data in a usable format before we renew."
      });
    } else if (input.exportAll === "unknown") {
      rows.push({
        check: "Export",
        result: "Unknown. Scores 1. A no would score 2.",
        points: 1,
        agenda: "Confirm in writing whether we can export all customer data in a usable format."
      });
    } else {
      rows.push({ check: "Export", result: "Full export is available. Scores 0.", points: 0, agenda: "" });
    }

    if (input.sbom === "no") {
      rows.push({
        check: "SBOM",
        result: "No SBOM on request. Scores 2.",
        points: 2,
        agenda: "Send the SBOM on request, including SaaS components. A slide with a logo is not an ingredients list."
      });
    } else if (input.sbom === "unknown") {
      rows.push({
        check: "SBOM",
        result: "SBOM unknown. Scores 1. A no would score 2.",
        points: 1,
        agenda: "Tell us whether an SBOM is available on request, and send it if it is."
      });
    } else {
      rows.push({ check: "SBOM", result: "SBOM is available on request. Scores 0.", points: 0, agenda: "" });
    }

    if (input.training === "unknown") {
      rows.push({
        check: "AI training",
        result: "Training use is unknown. Scores 2.",
        points: 2,
        agenda: "State whether customer data is used to train models, and whether that use is opt-in."
      });
    } else if (input.training === "opt-out") {
      rows.push({
        check: "AI training",
        result: "Training is opt-out. Scores 1. Unknown would score 2.",
        points: 1,
        agenda: "Move model training on our data to opt-in, or confirm it is off."
      });
    } else if (input.training === "opt-in") {
      rows.push({ check: "AI training", result: "Training is opt-in. Scores 0.", points: 0, agenda: "" });
    } else {
      rows.push({ check: "AI training", result: "Not applicable. Scores 0.", points: 0, agenda: "" });
    }

    if (input.subprocessors === "no") {
      rows.push({
        check: "Subprocessors",
        result: "Subprocessors are not listed. Scores 2.",
        points: 2,
        agenda: "List subprocessors before signature."
      });
    } else if (input.subprocessors === "unknown") {
      rows.push({
        check: "Subprocessors",
        result: "Unknown. Scores 1. A no would score 2.",
        points: 1,
        agenda: "Send the current subprocessor list."
      });
    } else {
      rows.push({ check: "Subprocessors", result: "Subprocessors are listed. Scores 0.", points: 0, agenda: "" });
    }

    if (input.exitClause === "no") {
      rows.push({
        check: "Exit clause",
        result: "No exit clause. Scores 2.",
        points: 2,
        agenda: "Add an exit clause we can exercise without a new negotiation."
      });
    } else if (input.exitClause === "unknown") {
      rows.push({
        check: "Exit clause",
        result: "Unknown. Scores 1. A no would score 2.",
        points: 1,
        agenda: "Confirm whether the contract has an exit clause, and quote it."
      });
    } else {
      rows.push({ check: "Exit clause", result: "Exit clause is present. Scores 0.", points: 0, agenda: "" });
    }

    const total = rows.reduce(function (sum, row) { return sum + row.points; }, 0);
    const hardReplace = input.exportAll === "no" && input.exitClause === "no";
    let decision = "Keep";
    let band = "0 points is Keep. 1 to 7 is Renegotiate. 8 or more is Replace.";
    if (hardReplace) {
      decision = "Replace";
      band = "No full export and no exit clause. That pair is Replace, even when the point total is lower. " + band;
    } else if (total >= 8) {
      decision = "Replace";
    } else if (total >= 1) {
      decision = "Renegotiate";
    }

    const ranked = rows.filter(function (row) { return row.points > 0; })
      .sort(function (a, b) { return b.points - a.points; });
    const reasons = (ranked.length ? ranked : rows.filter(function (row) { return row.points === 0 && row.result.indexOf("Not scored") !== 0; }))
      .slice(0, 3)
      .map(function (row) { return row.check + ": " + row.result; });
    while (reasons.length < 3) reasons.push("No further scored gap.");

    const agenda = ranked.map(function (row) { return row.agenda; }).filter(Boolean);
    const fillers = [
      "Name the owner on our side who accepts the renewal.",
      "Quote the renewal as an annual number, with the seats and the cap on the same page.",
      "Send the current order form and the notice clause, not a slide.",
      "Confirm the renewal date and the last day we can walk away.",
      "State whether the price includes only the seats we listed.",
      "Put the export, the SBOM, and the exit clause in the order, not in a follow-up email."
    ];
    fillers.forEach(function (line) {
      if (agenda.length < 6) agenda.push(line);
    });

    const cost = num(input.cost);
    const lines = [
      product + (cost == null ? "" : " — annual cost " + cost),
      "Decision: " + decision,
      "Points: " + total,
      "",
      "Reasons:",
      "1. " + reasons[0],
      "2. " + reasons[1],
      "3. " + reasons[2],
      "",
      "Points:",
    ];
    rows.forEach(function (row) {
      lines.push(row.check + " — " + row.points + " — " + row.result);
    });
    lines.push("", "Agenda for the vendor email:");
    agenda.slice(0, 6).forEach(function (line, i) {
      lines.push((i + 1) + ". " + line);
    });

    return { decision: decision, total: total, band: band, rows: rows, reasons: reasons, text: lines.join("\n") };
  }

  return { score: score, validate: validate };
});
