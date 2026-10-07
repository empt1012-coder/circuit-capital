(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document === "undefined") return;

  const KEY = "cc-tool-agent-inventory";
  const FIELDS = ["name", "owner", "purpose", "runs", "identity", "read", "write", "spend", "messages", "sensitivity", "reviewed"];

  function iso(offsetDays) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + offsetDays);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function example() {
    return [
      { name: "Example: invoice drafter", owner: "A. Patel", purpose: "Draft invoice notes", runs: "Company tenant", identity: "own", read: "Billing", write: "None", spend: "no", messages: "no", sensitivity: "Internal", reviewed: iso(-10) },
      { name: "Example: support reply", owner: "", purpose: "Reply to tickets", runs: "Helpdesk", identity: "person", read: "Tickets", write: "Ticket comments", spend: "no", messages: "yes", sensitivity: "Customer", reviewed: iso(-120) }
    ];
  }

  function rowNode(row) {
    const tr = document.createElement("tr");
    FIELDS.forEach(function (field) {
      const td = document.createElement("td");
      let el;
      if (field === "identity" || field === "spend" || field === "messages") {
        el = document.createElement("select");
        const options = field === "identity"
          ? [["own", "Its own account"], ["person", "A person's account"], ["shared", "A shared account"]]
          : [["no", "No"], ["yes", "Yes"]];
        options.forEach(function (pair) {
          const opt = document.createElement("option");
          opt.value = pair[0];
          opt.textContent = pair[1];
          el.appendChild(opt);
        });
        el.value = row[field] || options[0][0];
      } else {
        el = document.createElement("input");
        el.type = field === "reviewed" ? "date" : "text";
        el.value = row[field] || "";
        el.autocomplete = "off";
      }
      el.setAttribute("data-field", field);
      el.setAttribute("aria-label", {
        name: "Agent name", owner: "Owner", purpose: "Business purpose", runs: "Where it runs",
        identity: "Identity it uses", read: "Systems it can read", write: "Systems it can write to",
        spend: "Can it spend money", messages: "Can it send external messages",
        sensitivity: "Data sensitivity", reviewed: "Last access review date"
      }[field]);
      td.appendChild(el);
      tr.appendChild(td);
    });
    const flags = document.createElement("td");
    flags.className = "row-flags";
    tr.appendChild(flags);
    const td = document.createElement("td");
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "btn row-remove";
    remove.textContent = "Remove";
    remove.addEventListener("click", function () {
      if (document.querySelectorAll("#agent-rows tr").length <= 1) return;
      tr.remove();
      paint("Showing what you typed.");
    });
    td.appendChild(remove);
    tr.appendChild(td);
    return tr;
  }

  function readRows() {
    return Array.prototype.map.call(document.querySelectorAll("#agent-rows tr"), function (tr) {
      const row = {};
      FIELDS.forEach(function (field) { row[field] = tr.querySelector("[data-field='" + field + "']").value.trim(); });
      return row;
    });
  }

  function draw(rows, sourceNote) {
    const body = document.getElementById("agent-rows");
    body.innerHTML = "";
    rows.forEach(function (row) { body.appendChild(rowNode(row)); });
    paint(sourceNote);
  }

  function paint(sourceNote) {
    const rows = readRows();
    if (sourceNote.indexOf("example") === -1) {
      try { localStorage.setItem(KEY, JSON.stringify(rows)); } catch (e) {}
    }
    const result = api.inventory(rows, new Date());
    document.getElementById("agent-source").textContent = sourceNote;
    document.getElementById("agent-worked").textContent = result.worked;
    document.getElementById("agent-out").value = result.text;
    document.getElementById("agent-printout").textContent = result.text;
    Array.prototype.forEach.call(document.querySelectorAll("#agent-rows tr"), function (tr, i) {
      const cell = tr.querySelector(".row-flags");
      const flags = result.rows[i].flags;
      cell.textContent = flags.length ? flags.join(" ") : "No flag";
      cell.className = "row-flags" + (flags.length ? " is-missing" : "");
    });
  }

  document.getElementById("agent-form").addEventListener("input", function () { paint("Showing what you typed."); });
  document.getElementById("agent-form").addEventListener("submit", function (event) {
    event.preventDefault();
    paint("Showing what you typed.");
  });
  document.getElementById("agent-add").addEventListener("click", function () {
    document.getElementById("agent-rows").appendChild(rowNode({ identity: "own", spend: "no", messages: "no" }));
    paint("Showing what you typed.");
  });
  document.getElementById("agent-clear").addEventListener("click", function () {
    try { localStorage.removeItem(KEY); } catch (e) {}
    draw(example(), "Showing the example. Replace it with your agents.");
  });
  document.getElementById("agent-copy").addEventListener("click", function () {
    const out = document.getElementById("agent-out");
    out.focus();
    out.select();
    if (navigator.clipboard && out.value) navigator.clipboard.writeText(out.value).catch(function () {});
  });
  document.getElementById("agent-print").addEventListener("click", function () { window.print(); });
  document.getElementById("agent-export").addEventListener("click", function () {
    const csv = api.toCsv(readRows());
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "agent-inventory.csv";
    a.click();
    URL.revokeObjectURL(url);
  });
  document.getElementById("agent-import-btn").addEventListener("click", function () {
    document.getElementById("agent-import").click();
  });
  document.getElementById("agent-import").addEventListener("change", function (event) {
    const file = event.target.files && event.target.files[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () {
      const rows = api.fromCsv(String(reader.result || ""));
      if (!rows.length) {
        document.getElementById("agent-worked").textContent = "That file had no rows.";
        return;
      }
      draw(rows, "Showing the imported file. It was read in this browser and not uploaded.");
    };
    reader.readAsText(file);
  });

  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { saved = null; }
  if (Array.isArray(saved) && saved.length) draw(saved, "Showing your saved inputs.");
  else draw(example(), "Showing the example. Replace it with your agents.");
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const FIELDS = ["name", "owner", "purpose", "runs", "identity", "read", "write", "spend", "messages", "sensitivity", "reviewed"];

  function blankWrite(value) {
    return /^(none|no|n\/a|na|—|-)?$/i.test((value || "").trim());
  }

  function dayKey(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function flagsFor(row, today) {
    const flags = [];
    if (row.identity === "person" || row.identity === "shared") flags.push("Reuses a person's or shared identity.");
    if (!blankWrite(row.write) && !(row.owner || "").trim()) flags.push("Write access with no owner.");
    if (!(row.reviewed || "").trim()) flags.push("No review date.");
    else {
      const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(row.reviewed);
      if (!parts) flags.push("Review date is not a date.");
      else {
        const reviewed = new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]));
        const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const days = Math.round((now - reviewed) / 86400000);
        if (days >= 90) flags.push("Last review was " + days + " days ago.");
      }
    }
    return flags;
  }

  function identityLabel(value) {
    if (value === "person") return "A person's account";
    if (value === "shared") return "A shared account";
    return "Its own account";
  }

  function inventory(rows, today) {
    const now = today || new Date();
    const detailed = (rows || []).map(function (row) {
      return { row: row, flags: flagsFor(row, now) };
    });
    const count = detailed.reduce(function (sum, item) { return sum + item.flags.length; }, 0);
    const lines = ["AI agent inventory", "Inputs stayed in the browser. Nothing was uploaded.", ""];
    detailed.forEach(function (item, i) {
      const row = item.row;
      lines.push((i + 1) + ". " + ((row.name || "").trim() || "Unnamed agent"));
      lines.push("  Owner: " + ((row.owner || "").trim() || "Not entered"));
      lines.push("  Purpose: " + ((row.purpose || "").trim() || "Not entered"));
      lines.push("  Where it runs: " + ((row.runs || "").trim() || "Not entered"));
      lines.push("  Identity: " + identityLabel(row.identity));
      lines.push("  Can read: " + ((row.read || "").trim() || "Not entered"));
      lines.push("  Can write: " + ((row.write || "").trim() || "Not entered"));
      lines.push("  Can spend money: " + (row.spend === "yes" ? "Yes" : "No"));
      lines.push("  Can send external messages: " + (row.messages === "yes" ? "Yes" : "No"));
      lines.push("  Data sensitivity: " + ((row.sensitivity || "").trim() || "Not entered"));
      lines.push("  Last access review: " + ((row.reviewed || "").trim() || "Not entered"));
      lines.push("  Flags: " + (item.flags.length ? item.flags.join(" ") : "None"));
      lines.push("");
    });
    lines.push("Flag count: " + count + ".");
    return { worked: count + (count === 1 ? " flag." : " flags."), text: lines.join("\n").trim(), rows: detailed, count: count, today: dayKey(now) };
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
    const start = FIELDS.every(function (field) { return header.indexOf(field) !== -1; }) ? 1 : 0;
    const index = {};
    FIELDS.forEach(function (field, i) { index[field] = header.indexOf(field) === -1 ? i : header.indexOf(field); });
    return table.slice(start).map(function (cells) {
      const row = {};
      FIELDS.forEach(function (field) { row[field] = (cells[index[field]] || "").trim(); });
      if (row.identity !== "own" && row.identity !== "person" && row.identity !== "shared") {
        const id = row.identity.toLowerCase();
        row.identity = id.indexOf("person") !== -1 ? "person" : id.indexOf("shared") !== -1 ? "shared" : "own";
      }
      row.spend = /^y/i.test(row.spend) ? "yes" : "no";
      row.messages = /^y/i.test(row.messages) ? "yes" : "no";
      return row;
    });
  }

  return { inventory: inventory, toCsv: toCsv, fromCsv: fromCsv };
});
