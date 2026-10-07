(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document === "undefined") return;

  const KEY = "cc-tool-risk-exception";
  const FIELDS = ["control", "system", "owner", "reason", "compensating", "funded", "amount", "expiry", "accepted"];

  function iso(offsetDays) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + offsetDays);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function example() {
    return [
      { control: "Other", system: "Example: remote access", owner: "N. Ortiz", reason: "Vendor cutover", compensating: "MFA on the jump host", funded: "yes", amount: "12000", expiry: iso(70), accepted: "CISO" },
      { control: "CISA KEV", system: "Example: edge gateway", owner: "Platform", reason: "Change window", compensating: "Source ACL", funded: "no", amount: "", expiry: iso(10), accepted: "CIO" },
      { control: "MFA", system: "Example: mail admin", owner: "", reason: "Break-glass account", compensating: "None", funded: "no", amount: "", expiry: "", accepted: "" },
      { control: "EDR", system: "Example: laptop fleet", owner: "IT", reason: "Agent conflict", compensating: "Weekly scan", funded: "yes", amount: "8000", expiry: iso(90), accepted: "CISO" }
    ];
  }

  function rowNode(row) {
    const tr = document.createElement("tr");
    FIELDS.forEach(function (field) {
      const td = document.createElement("td");
      let el;
      if (field === "control") {
        el = document.createElement("select");
        ["Other", "CISA KEV", "MFA", "Backups", "EDR"].forEach(function (name) {
          const opt = document.createElement("option");
          opt.value = name;
          opt.textContent = name;
          el.appendChild(opt);
        });
        el.value = row.control || "Other";
      } else if (field === "funded") {
        el = document.createElement("select");
        [["no", "No"], ["yes", "Yes"]].forEach(function (pair) {
          const opt = document.createElement("option");
          opt.value = pair[0];
          opt.textContent = pair[1];
          el.appendChild(opt);
        });
        el.value = row.funded === "yes" ? "yes" : "no";
      } else {
        el = document.createElement("input");
        el.type = field === "expiry" ? "date" : field === "amount" ? "text" : "text";
        if (field === "amount") el.inputMode = "decimal";
        el.value = row[field] || "";
        el.autocomplete = "off";
      }
      el.setAttribute("data-field", field);
      el.setAttribute("aria-label", {
        control: "Control or finding", system: "System", owner: "Owner", reason: "Reason",
        compensating: "Compensating control", funded: "Funded fix", amount: "Funded amount",
        expiry: "Expiry date", accepted: "Who accepted the risk"
      }[field]);
      td.appendChild(el);
      tr.appendChild(td);
    });
    const status = document.createElement("td");
    status.className = "row-flags";
    tr.appendChild(status);
    const td = document.createElement("td");
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "btn row-remove";
    remove.textContent = "Remove";
    remove.addEventListener("click", function () {
      if (document.querySelectorAll("#risk-rows tr").length <= 1) return;
      tr.remove();
      paint("Showing what you typed.");
    });
    td.appendChild(remove);
    tr.appendChild(td);
    return tr;
  }

  function readRows() {
    return Array.prototype.map.call(document.querySelectorAll("#risk-rows tr"), function (tr) {
      const row = {};
      FIELDS.forEach(function (field) { row[field] = tr.querySelector("[data-field='" + field + "']").value.trim(); });
      return row;
    });
  }

  function draw(rows, sourceNote) {
    const body = document.getElementById("risk-rows");
    body.innerHTML = "";
    rows.forEach(function (row) { body.appendChild(rowNode(row)); });
    paint(sourceNote);
  }

  function paint(sourceNote) {
    const rows = readRows();
    if (sourceNote.indexOf("example") === -1) {
      try { localStorage.setItem(KEY, JSON.stringify(rows)); } catch (e) {}
    }
    const result = api.register(rows, new Date());
    document.getElementById("risk-source").textContent = sourceNote;
    document.getElementById("risk-worked").textContent = result.worked;
    document.getElementById("risk-out").value = result.text;
    document.getElementById("risk-printout").textContent = result.text;
    Array.prototype.forEach.call(document.querySelectorAll("#risk-rows tr"), function (tr, i) {
      const cell = tr.querySelector(".row-flags");
      const item = result.rows[i];
      const bits = [];
      if (item.notWaivable) bits.push("Not waivable.");
      bits.push.apply(bits, item.flags);
      cell.textContent = bits.length ? bits.join(" ") : "No flag";
      cell.className = "row-flags" + (item.notWaivable || item.flags.length ? " is-missing" : "");
    });
  }

  document.getElementById("risk-form").addEventListener("input", function () { paint("Showing what you typed."); });
  document.getElementById("risk-form").addEventListener("submit", function (event) {
    event.preventDefault();
    paint("Showing what you typed.");
  });
  document.getElementById("risk-add").addEventListener("click", function () {
    document.getElementById("risk-rows").appendChild(rowNode({ control: "Other", funded: "no" }));
    paint("Showing what you typed.");
  });
  document.getElementById("risk-clear").addEventListener("click", function () {
    try { localStorage.removeItem(KEY); } catch (e) {}
    draw(example(), "Showing the example. Replace it with your register.");
  });
  document.getElementById("risk-copy").addEventListener("click", function () {
    const out = document.getElementById("risk-out");
    out.focus();
    out.select();
    if (navigator.clipboard && out.value) navigator.clipboard.writeText(out.value).catch(function () {});
  });
  document.getElementById("risk-print").addEventListener("click", function () { window.print(); });
  document.getElementById("risk-export").addEventListener("click", function () {
    const csv = api.toCsv(readRows());
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "risk-exceptions.csv";
    a.click();
    URL.revokeObjectURL(url);
  });
  document.getElementById("risk-import-btn").addEventListener("click", function () {
    document.getElementById("risk-import").click();
  });
  document.getElementById("risk-import").addEventListener("change", function (event) {
    const file = event.target.files && event.target.files[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () {
      const rows = api.fromCsv(String(reader.result || ""));
      if (!rows.length) {
        document.getElementById("risk-worked").textContent = "That file had no rows.";
        return;
      }
      draw(rows, "Showing the imported file. It was read in this browser and not uploaded.");
    };
    reader.readAsText(file);
  });

  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { saved = null; }
  if (Array.isArray(saved) && saved.length) draw(saved, "Showing your saved inputs.");
  else draw(example(), "Showing the example. Replace it with your register.");
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const FIELDS = ["control", "system", "owner", "reason", "compensating", "funded", "amount", "expiry", "accepted"];
  const LOCKED = { "CISA KEV": true, "MFA": true, "Backups": true, "EDR": true };

  function flagsFor(row, today) {
    const flags = [];
    const notWaivable = !!LOCKED[row.control];
    if (!(row.owner || "").trim()) flags.push("No owner.");
    if (!(row.expiry || "").trim()) flags.push("No expiry date.");
    const amount = Number(String(row.amount || "").replace(/,/g, ""));
    const funded = row.funded === "yes" && Number.isFinite(amount) && amount > 0;
    if (!funded) flags.push("No funded fix.");
    if ((row.expiry || "").trim()) {
      const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(row.expiry);
      if (!parts) flags.push("Expiry is not a date.");
      else {
        const expiry = new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]));
        const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const days = Math.round((expiry - now) / 86400000);
        if (days < 0) flags.push("Expired " + Math.abs(days) + " days ago.");
        else if (days <= 30) flags.push("Expires in " + days + " days.");
      }
    }
    return { notWaivable: notWaivable, flags: flags };
  }

  function register(rows, today) {
    const now = today || new Date();
    const detailed = (rows || []).map(function (row) {
      const mark = flagsFor(row, now);
      return { row: row, notWaivable: mark.notWaivable, flags: mark.flags };
    });
    const lines = ["Risk exception register", "Inputs stayed in the browser. Nothing was uploaded.", "CISA Known Exploited Vulnerabilities, MFA, backups, and EDR are not waivable.", ""];
    detailed.forEach(function (item, i) {
      const row = item.row;
      lines.push((i + 1) + ". " + (row.control || "Other") + (item.notWaivable ? " — Not waivable" : ""));
      lines.push("  System: " + ((row.system || "").trim() || "Not entered"));
      lines.push("  Owner: " + ((row.owner || "").trim() || "Not entered"));
      lines.push("  Reason: " + ((row.reason || "").trim() || "Not entered"));
      lines.push("  Compensating control: " + ((row.compensating || "").trim() || "Not entered"));
      lines.push("  Funded fix: " + (row.funded === "yes" ? "Yes" : "No") + ((row.amount || "").trim() ? " (" + row.amount + ")" : ""));
      lines.push("  Expiry: " + ((row.expiry || "").trim() || "Not entered"));
      lines.push("  Accepted by: " + ((row.accepted || "").trim() || "Not entered"));
      lines.push("  Flags: " + (item.flags.length ? item.flags.join(" ") : "None"));
      lines.push("");
    });
    const hard = detailed.filter(function (item) { return item.notWaivable; }).length;
    const flagged = detailed.filter(function (item) { return item.flags.length; }).length;
    lines.push("Not waivable: " + hard + ". Rows with a missing owner, expiry, or funded fix, or an expiry inside 30 days: " + flagged + ".");
    return { worked: hard + " not waivable. " + flagged + " with another flag.", text: lines.join("\n").trim(), rows: detailed };
  }

  function csvCell(value) {
    const text = value == null ? "" : String(value);
    if (/[",\n]/.test(text)) return "\"" + text.replace(/"/g, "\"\"") + "\"";
    return text;
  }

  function toCsv(rows) {
    const lines = [FIELDS.join(",")];
    (rows || []).forEach(function (row) {
      lines.push(FIELDS.map(function (field) { return csvCell(row[field]); }).join(","));
    });
    return lines.join("\n");
  }

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let cell = "";
    let quoted = false;
    const src = String(text || "").replace(/^\uFEFF/, "");
    for (let i = 0; i < src.length; i++) {
      const ch = src[i];
      if (quoted) {
        if (ch === "\"") {
          if (src[i + 1] === "\"") { cell += "\""; i += 1; }
          else quoted = false;
        } else cell += ch;
      } else if (ch === "\"") quoted = true;
      else if (ch === ",") { row.push(cell); cell = ""; }
      else if (ch === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
      else if (ch !== "\r") cell += ch;
    }
    if (cell.length || row.length) { row.push(cell); rows.push(row); }
    return rows.filter(function (r) { return r.some(function (c) { return String(c).trim() !== ""; }); });
  }

  function fromCsv(text) {
    const table = parseCsv(text);
    if (!table.length) return [];
    const header = table[0].map(function (c) { return c.trim().toLowerCase(); });
    const start = header.indexOf("control") !== -1 ? 1 : 0;
    const index = {};
    FIELDS.forEach(function (field, i) { index[field] = header.indexOf(field) === -1 ? i : header.indexOf(field); });
    return table.slice(start).map(function (cells) {
      const row = {};
      FIELDS.forEach(function (field) { row[field] = (cells[index[field]] || "").trim(); });
      const control = row.control.toLowerCase();
      if (control.indexOf("kev") !== -1) row.control = "CISA KEV";
      else if (control === "mfa") row.control = "MFA";
      else if (control.indexOf("backup") !== -1) row.control = "Backups";
      else if (control === "edr") row.control = "EDR";
      else row.control = "Other";
      row.funded = /^y/i.test(row.funded) ? "yes" : "no";
      return row;
    });
  }

  return { register: register, toCsv: toCsv, fromCsv: fromCsv };
});
