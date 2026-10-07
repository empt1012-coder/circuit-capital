(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document === "undefined") return;

  const KEY = "cc-tool-ai-cost";
  const MAX = 4;

  function example() {
    return {
      models: [
        { name: "Example: low list price", inPrice: "0.50", outPrice: "2", inTok: "2000", outTok: "800", success: "60", retries: "2", minutes: "15", hourly: "80" },
        { name: "Example: higher list price", inPrice: "3", outPrice: "15", inTok: "1500", outTok: "400", success: "95", retries: "0", minutes: "10", hourly: "80" }
      ],
      host: { gpu: "4000", opsHours: "10", opsRate: "90", throughput: "50000000", apiPrice: "8" }
    };
  }

  function readModel(node) {
    function v(name) { return (node.querySelector("[data-field='" + name + "']").value || "").trim(); }
    return { name: v("name"), inPrice: v("inPrice"), outPrice: v("outPrice"), inTok: v("inTok"), outTok: v("outTok"), success: v("success"), retries: v("retries"), minutes: v("minutes"), hourly: v("hourly") };
  }

  function readAll() {
    return {
      models: Array.prototype.map.call(document.querySelectorAll("[data-model]"), readModel),
      host: {
        gpu: document.getElementById("host-gpu").value.trim(),
        opsHours: document.getElementById("host-hours").value.trim(),
        opsRate: document.getElementById("host-rate").value.trim(),
        throughput: document.getElementById("host-throughput").value.trim(),
        apiPrice: document.getElementById("host-api").value.trim()
      }
    };
  }

  function field(name, label, value, mode) {
    const wrap = document.createElement("div");
    const id = "m-" + Math.random().toString(36).slice(2, 8);
    const lab = document.createElement("label");
    lab.htmlFor = id;
    lab.textContent = label;
    const input = document.createElement("input");
    input.id = id;
    input.setAttribute("data-field", name);
    input.value = value == null ? "" : value;
    input.autocomplete = "off";
    if (mode) input.inputMode = mode;
    wrap.appendChild(lab);
    wrap.appendChild(input);
    return wrap;
  }

  function renderModel(model, index, total) {
    const box = document.createElement("fieldset");
    box.setAttribute("data-model", "");
    const legend = document.createElement("legend");
    legend.textContent = "Model " + (index + 1);
    box.appendChild(legend);
    const grid = document.createElement("div");
    grid.className = "form-grid";
    grid.appendChild(field("name", "Name", model.name, null));
    grid.appendChild(field("inPrice", "Input price per 1M tokens", model.inPrice, "decimal"));
    grid.appendChild(field("outPrice", "Output price per 1M tokens", model.outPrice, "decimal"));
    grid.appendChild(field("inTok", "Average input tokens per attempt", model.inTok, "numeric"));
    grid.appendChild(field("outTok", "Average output tokens per attempt", model.outTok, "numeric"));
    grid.appendChild(field("success", "Success rate, percent", model.success, "decimal"));
    grid.appendChild(field("retries", "Average retries per task", model.retries, "decimal"));
    grid.appendChild(field("minutes", "Review minutes per failed task", model.minutes, "decimal"));
    grid.appendChild(field("hourly", "Review hourly rate", model.hourly, "decimal"));
    box.appendChild(grid);
    if (total > 2) {
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "btn row-remove";
      remove.textContent = "Remove model";
      remove.addEventListener("click", function () {
        box.remove();
        draw(readAll(), "Showing what you typed.");
      });
      box.appendChild(remove);
    }
    return box;
  }

  function paint(persist) {
    const data = readAll();
    if (persist !== false) {
      try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
    }
    const result = api.cost(data);
    document.getElementById("cost-worked").textContent = result.worked;
    document.getElementById("cost-out").value = result.text;
    document.getElementById("cost-printout").textContent = result.text;
    document.getElementById("cost-chart").innerHTML = result.chart;
    document.getElementById("add-model").disabled = data.models.length >= MAX;
  }

  function draw(data, sourceNote) {
    const host = document.getElementById("models");
    host.innerHTML = "";
    data.models.forEach(function (model, i) {
      host.appendChild(renderModel(model, i, data.models.length));
    });
    document.getElementById("host-gpu").value = data.host.gpu;
    document.getElementById("host-hours").value = data.host.opsHours;
    document.getElementById("host-rate").value = data.host.opsRate;
    document.getElementById("host-throughput").value = data.host.throughput;
    document.getElementById("host-api").value = data.host.apiPrice;
    document.getElementById("cost-source").textContent = sourceNote;
    paint(sourceNote.indexOf("example") === -1);
  }

  document.getElementById("cost-form").addEventListener("input", function () {
    document.getElementById("cost-source").textContent = "Showing what you typed.";
    paint();
  });
  document.getElementById("cost-form").addEventListener("submit", function (event) {
    event.preventDefault();
    document.getElementById("cost-source").textContent = "Showing what you typed.";
    paint();
  });
  document.getElementById("add-model").addEventListener("click", function () {
    const data = readAll();
    if (data.models.length >= MAX) return;
    data.models.push({ name: "", inPrice: "", outPrice: "", inTok: "", outTok: "", success: "", retries: "0", minutes: "0", hourly: "" });
    draw(data, "Showing what you typed.");
  });
  document.getElementById("cost-clear").addEventListener("click", function () {
    try { localStorage.removeItem(KEY); } catch (e) {}
    draw(example(), "Showing the example. Replace it with your prices.");
  });
  document.getElementById("cost-copy").addEventListener("click", function () {
    const out = document.getElementById("cost-out");
    out.focus();
    out.select();
    if (navigator.clipboard && out.value) navigator.clipboard.writeText(out.value).catch(function () {});
  });
  document.getElementById("cost-print").addEventListener("click", function () { window.print(); });

  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { saved = null; }
  if (saved && saved.models && saved.models.length >= 2 && saved.host) draw(saved, "Showing your saved inputs.");
  else draw(example(), "Showing the example. Replace it with your prices.");
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

  function money(n) {
    if (!Number.isFinite(n)) return "—";
    return "$" + fmt(n);
  }

  function modelCost(model) {
    const inPrice = num(model.inPrice);
    const outPrice = num(model.outPrice);
    const inTok = num(model.inTok);
    const outTok = num(model.outTok);
    const success = num(model.success);
    const retries = num(model.retries);
    const minutesBlank = model.minutes === "" || model.minutes == null;
    const hourlyBlank = model.hourly === "" || model.hourly == null;
    const minutes = minutesBlank ? 0 : num(model.minutes);
    const hourly = hourlyBlank ? 0 : num(model.hourly);
    const fields = [inPrice, outPrice, inTok, outTok, success, retries, minutes, hourly];
    if (fields.some(function (n) { return n == null; })) return { error: "Enter every model field. Review minutes and the hourly rate can be 0." };
    if (!minutesBlank && minutes > 0 && hourlyBlank) return { error: "Enter the review hourly rate, or set review minutes to 0." };
    if ([inPrice, outPrice, inTok, outTok, retries, minutes, hourly].some(function (n) { return n < 0; }) || success < 0 || success > 100) {
      return { error: "Prices, tokens, and retries cannot be negative. Success rate has to be from 0 to 100." };
    }
    const attempt = (inTok / 1e6) * inPrice + (outTok / 1e6) * outPrice;
    const attempts = 1 + retries;
    const tokenCost = attempts * attempt;
    const p = success / 100;
    const review = (1 - p) * (minutes / 60) * hourly;
    const started = tokenCost + review;
    return {
      name: (model.name || "").trim() || "Unnamed model",
      attempt: attempt,
      attempts: attempts,
      tokenCost: tokenCost,
      review: review,
      started: started,
      success: p,
      perSuccess: p === 0 ? null : started / p,
      perThousand: started * 1000
    };
  }

  function chartSvg(fixed, apiPrice, throughput, evenDaily) {
    const width = 640;
    const height = 280;
    const left = 56;
    const right = 16;
    const top = 16;
    const bottom = 36;
    const xMax = Math.max(evenDaily * 1.45, throughput, 1);
    const yApi = (xMax * 30 / 1e6) * apiPrice;
    const yMax = Math.max(fixed, yApi, 1) * 1.08;
    function x(v) { return left + (v / xMax) * (width - left - right); }
    function y(v) { return top + (1 - v / yMax) * (height - top - bottom); }
    const steps = 32;
    let api = "";
    for (let i = 0; i <= steps; i++) {
      const xv = (xMax * i) / steps;
      const yv = (xv * 30 / 1e6) * apiPrice;
      api += (i === 0 ? "M" : "L") + x(xv).toFixed(1) + " " + y(yv).toFixed(1) + " ";
    }
    const hostEnd = Math.min(throughput, xMax);
    const host = "M" + x(0).toFixed(1) + " " + y(fixed).toFixed(1) + " L" + x(hostEnd).toFixed(1) + " " + y(fixed).toFixed(1);
    const evenX = Math.min(Math.max(evenDaily, 0), xMax);
    const label = "Self-host is the flat line, up to its daily limit. The API is the rising line. They meet at " + fmt(evenDaily) + " tokens a day.";
    return "<svg class=\"tool-chart\" viewBox=\"0 0 " + width + " " + height + "\" role=\"img\" aria-label=\"" + label + "\">" +
      "<title>" + label + "</title>" +
      "<line x1=\"" + left + "\" y1=\"" + y(0) + "\" x2=\"" + (width - right) + "\" y2=\"" + y(0) + "\" stroke=\"#2c3138\" stroke-width=\"1\"/>" +
      "<line x1=\"" + left + "\" y1=\"" + top + "\" x2=\"" + left + "\" y2=\"" + y(0) + "\" stroke=\"#2c3138\" stroke-width=\"1\"/>" +
      "<path d=\"" + api + "\" fill=\"none\" stroke=\"#c45c26\" stroke-width=\"2\"/>" +
      "<path d=\"" + host + "\" fill=\"none\" stroke=\"#12151a\" stroke-width=\"2\"/>" +
      "<circle cx=\"" + x(evenX).toFixed(1) + "\" cy=\"" + y((evenDaily * 30 / 1e6) * apiPrice).toFixed(1) + "\" r=\"3.5\" fill=\"#9a4318\"/>" +
      "<text x=\"" + left + "\" y=\"14\" fill=\"#2c3138\" font-size=\"12\" font-family=\"IBM Plex Sans, sans-serif\">Monthly cost</text>" +
      "<text x=\"" + (width / 2) + "\" y=\"" + (height - 8) + "\" text-anchor=\"middle\" fill=\"#2c3138\" font-size=\"12\" font-family=\"IBM Plex Sans, sans-serif\">Daily tokens</text>" +
      "</svg>";
  }

  function cost(input) {
    const rows = (input.models || []).map(modelCost);
    const bad = rows.find(function (row) { return row.error; });
    if (bad) return { worked: bad.error, text: "Incomplete. No cost was invented.", chart: "" };
    if (rows.length < 2) return { worked: "Add at least two models.", text: "Incomplete. No cost was invented.", chart: "" };

    const ranked = rows.filter(function (row) { return row.perSuccess != null; }).slice().sort(function (a, b) { return a.perSuccess - b.perSuccess; });
    const listed = rows.slice().sort(function (a, b) { return a.attempt - b.attempt; });
    const lines = [
      "Numbers are in the units you typed. This page does not call a model.",
      "Listed cost is one attempt, before retries, failures, and review.",
      "Attempts per task = 1 + average retries.",
      "Cost per successful task = (token cost of those attempts + review on the failed share) / success rate.",
      ""
    ];
    rows.forEach(function (row) {
      lines.push(row.name);
      lines.push("  Listed cost of one attempt: " + money(row.attempt));
      lines.push("  Attempts per task: " + fmt(row.attempts));
      lines.push("  Cost per successful finished task: " + (row.perSuccess == null ? "None. Success rate is 0." : money(row.perSuccess)));
      lines.push("  Cost per 1,000 started tasks: " + money(row.perThousand));
      lines.push("");
    });
    let worked = "Compared " + rows.length + " models.";
    if (!ranked.length) {
      lines.push("No model has a success rate above 0, so none has a finished-task cost.");
    } else {
      const best = ranked[0];
      const tied = ranked.filter(function (row) { return Math.abs(row.perSuccess - best.perSuccess) < 1e-9; });
      lines.push("Cheapest per finished task: " + tied.map(function (row) { return row.name; }).join(", ") + " at " + money(best.perSuccess) + ".");
      worked = "Cheapest per finished task: " + tied.map(function (row) { return row.name; }).join(", ") + ".";
      if (listed[0] && tied.indexOf(listed[0]) === -1 && listed[0].attempt < tied[0].attempt - 1e-12) {
        const note = listed[0].name + " has the lower listed cost of one attempt (" + money(listed[0].attempt) + ") and loses on cost per finished task.";
        lines.push(note);
        worked += " " + note;
      }
    }

    const gpu = num(input.host && input.host.gpu);
    const opsHours = num(input.host && input.host.opsHours);
    const opsRate = num(input.host && input.host.opsRate);
    const throughput = num(input.host && input.host.throughput);
    const apiPrice = num(input.host && input.host.apiPrice);
    let chart = "";
    lines.push("", "Self-host break-even");
    if ([gpu, opsHours, opsRate, throughput, apiPrice].some(function (n) { return n == null; })) {
      lines.push("Enter the server cost, ops hours, ops rate, throughput, and API price to draw the break-even.");
    } else if ([gpu, opsHours, opsRate, throughput, apiPrice].some(function (n) { return n < 0; })) {
      lines.push("Self-host inputs cannot be negative.");
    } else if (apiPrice === 0) {
      lines.push("The API price is 0, so self-hosting does not win on price.");
    } else {
      const fixed = gpu + opsHours * opsRate;
      const evenDaily = fixed * 1e6 / (apiPrice * 30);
      lines.push("Monthly self-host cost = server + ops hours × hourly rate = " + money(fixed) + ". A month is counted as 30 days.");
      lines.push("The two costs are equal at " + fmt(evenDaily) + " tokens a day. Self-hosting costs less above that, if the server can carry the volume.");
      lines.push("Throughput limit: " + fmt(throughput) + " tokens a day.");
      if (throughput < evenDaily) lines.push("The limit is below the break-even volume. Self-hosting stays more expensive at every volume it can serve.");
      chart = chartSvg(fixed, apiPrice, throughput, evenDaily);
      worked += " Break-even is " + fmt(evenDaily) + " tokens a day.";
    }
    return { worked: worked, text: lines.join("\n").trim(), chart: chart, rows: rows };
  }

  return { cost: cost, example: function () { return null; } };
});
