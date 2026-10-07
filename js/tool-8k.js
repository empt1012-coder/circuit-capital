(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document === "undefined") return;

  const KEY = "cc-tool-8k";

  function example() {
    return {
      discovered: "2026-10-01T09:30",
      escalatedBy: "Example: J. Kim",
      escalatedAt: "2026-10-01T11:00",
      owner: "Example: CFO",
      financial: true,
      operational: false,
      customer: true,
      legal: false,
      reputational: false,
      thresholds: "Example: 5% of quarterly revenue, or a customer-data exposure.",
      evidence: "Example: the customer list was exposed for two hours. Counsel memo dated October 6.",
      determined: "2026-10-06T16:00"
    };
  }

  function read() {
    function v(id) { return document.getElementById(id).value.trim(); }
    function c(id) { return document.getElementById(id).checked; }
    return {
      discovered: v("k-discovered"),
      escalatedBy: v("k-who"),
      escalatedAt: v("k-when"),
      owner: v("k-owner"),
      financial: c("k-financial"),
      operational: c("k-operational"),
      customer: c("k-customer"),
      legal: c("k-legal"),
      reputational: c("k-reputational"),
      thresholds: v("k-thresholds"),
      evidence: v("k-evidence"),
      determined: v("k-determined")
    };
  }

  function fill(data) {
    document.getElementById("k-discovered").value = data.discovered || "";
    document.getElementById("k-who").value = data.escalatedBy || "";
    document.getElementById("k-when").value = data.escalatedAt || "";
    document.getElementById("k-owner").value = data.owner || "";
    document.getElementById("k-financial").checked = !!data.financial;
    document.getElementById("k-operational").checked = !!data.operational;
    document.getElementById("k-customer").checked = !!data.customer;
    document.getElementById("k-legal").checked = !!data.legal;
    document.getElementById("k-reputational").checked = !!data.reputational;
    document.getElementById("k-thresholds").value = data.thresholds || "";
    document.getElementById("k-evidence").value = data.evidence || "";
    document.getElementById("k-determined").value = data.determined || "";
  }

  function paint(sourceNote) {
    const data = read();
    if (sourceNote.indexOf("example") === -1) {
      try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
    }
    const result = api.worksheet(data);
    document.getElementById("k-source").textContent = sourceNote;
    document.getElementById("k-worked").textContent = result.worked;
    document.getElementById("k-out").value = result.text;
    document.getElementById("k-printout").textContent = result.text;
  }

  document.getElementById("k-form").addEventListener("input", function () { paint("Showing what you typed."); });
  document.getElementById("k-form").addEventListener("submit", function (event) {
    event.preventDefault();
    paint("Showing what you typed.");
  });
  document.getElementById("k-clear").addEventListener("click", function () {
    try { localStorage.removeItem(KEY); } catch (e) {}
    fill(example());
    paint("Showing the example. Replace it with your record.");
  });
  document.getElementById("k-copy").addEventListener("click", function () {
    const out = document.getElementById("k-out");
    out.focus();
    out.select();
    if (navigator.clipboard && out.value) navigator.clipboard.writeText(out.value).catch(function () {});
  });
  document.getElementById("k-print").addEventListener("click", function () { window.print(); });

  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { saved = null; }
  if (saved && typeof saved === "object") {
    fill(saved);
    paint("Showing your saved inputs.");
  } else {
    fill(example());
    paint("Showing the example. Replace it with your record.");
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function nthWeekday(year, month, weekday, n) {
    const d = new Date(Date.UTC(year, month - 1, 1));
    const add = (weekday - d.getUTCDay() + 7) % 7;
    d.setUTCDate(1 + add + (n - 1) * 7);
    return d;
  }

  function lastWeekday(year, month, weekday) {
    const d = new Date(Date.UTC(year, month, 0));
    const back = (d.getUTCDay() - weekday + 7) % 7;
    d.setUTCDate(d.getUTCDate() - back);
    return d;
  }

  function observe(year, month, day) {
    const d = new Date(Date.UTC(year, month - 1, day));
    const wd = d.getUTCDay();
    if (wd === 6) d.setUTCDate(d.getUTCDate() - 1);
    if (wd === 0) d.setUTCDate(d.getUTCDate() + 1);
    return d;
  }

  function key(d) {
    return d.getUTCFullYear() + "-" + String(d.getUTCMonth() + 1).padStart(2, "0") + "-" + String(d.getUTCDate()).padStart(2, "0");
  }

  function holidaysFor(year) {
    return [
      observe(year, 1, 1),
      nthWeekday(year, 1, 1, 3),
      nthWeekday(year, 2, 1, 3),
      lastWeekday(year, 5, 1),
      observe(year, 6, 19),
      observe(year, 7, 4),
      nthWeekday(year, 9, 1, 1),
      nthWeekday(year, 10, 1, 2),
      observe(year, 11, 11),
      nthWeekday(year, 11, 4, 4),
      observe(year, 12, 25)
    ];
  }

  function holidaySet(year) {
    const set = {};
    holidaysFor(year).concat(holidaysFor(year + 1)).forEach(function (d) { set[key(d)] = true; });
    return set;
  }

  function parseLocal(value) {
    const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/.exec(value || "");
    if (!m) return null;
    return {
      year: Number(m[1]),
      month: Number(m[2]),
      day: Number(m[3]),
      hour: m[4] == null ? null : Number(m[4]),
      minute: m[5] == null ? null : Number(m[5]),
      date: new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])))
    };
  }

  function longDate(d) {
    return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
  }

  function stamp(parsed) {
    if (!parsed) return "Not entered";
    const date = longDate(parsed.date);
    if (parsed.hour == null) return date;
    const h = parsed.hour % 12 || 12;
    const ap = parsed.hour < 12 ? "AM" : "PM";
    return date + ", " + h + ":" + String(parsed.minute).padStart(2, "0") + " " + ap;
  }

  function due(determined) {
    const start = parseLocal(determined);
    if (!start) return { error: "Enter the materiality determination date. The clock has not started." };
    const off = holidaySet(start.year);
    const skipped = [];
    const cursor = new Date(start.date.getTime());
    let counted = 0;
    while (counted < 4) {
      cursor.setUTCDate(cursor.getUTCDate() + 1);
      const wd = cursor.getUTCDay();
      const id = key(cursor);
      if (wd === 0 || wd === 6) continue;
      if (off[id]) {
        skipped.push(longDate(cursor));
        continue;
      }
      counted += 1;
    }
    return { date: cursor, skipped: skipped, text: longDate(cursor) };
  }

  function worksheet(input) {
    const boxes = [
      ["Financial", input.financial],
      ["Operational", input.operational],
      ["Customer", input.customer],
      ["Legal", input.legal],
      ["Reputational", input.reputational]
    ].filter(function (pair) { return pair[1]; }).map(function (pair) { return pair[0]; });
    const result = due(input.determined);
    const lines = [
      "Item 1.05 record",
      "Not legal advice. This page counts four business days. It does not decide materiality.",
      "The clock starts at the materiality determination, not at discovery.",
      "",
      "Discovered: " + stamp(parseLocal(input.discovered)),
      "Escalated by: " + ((input.escalatedBy || "").trim() || "Not entered"),
      "Escalated at: " + stamp(parseLocal(input.escalatedAt)),
      "Decision owner: " + ((input.owner || "").trim() || "Not entered"),
      "Thresholds checked: " + (boxes.length ? boxes.join(", ") : "None checked"),
      "Threshold note: " + ((input.thresholds || "").trim() || "Not entered"),
      "Evidence considered: " + ((input.evidence || "").trim() || "Not entered"),
      "Materiality determination: " + stamp(parseLocal(input.determined))
    ];
    if (result.error) {
      lines.push("Item 1.05 due date: " + result.error);
      return { worked: result.error, text: lines.join("\n"), due: null };
    }
    lines.push("Item 1.05 due date: " + result.text);
    lines.push("Count: the determination date is not day one. The next four days that are not a weekend, and not a US federal holiday in that year or the next, are the clock. A holiday that falls on Saturday is taken on Friday. A holiday that falls on Sunday is taken on Monday.");
    if (result.skipped.length) lines.push("Federal holidays skipped in this window: " + result.skipped.join("; ") + ".");
    return { worked: "Due " + result.text + ".", text: lines.join("\n"), due: key(result.date) };
  }

  return { worksheet: worksheet, due: due, holidaySet: holidaySet };
});
