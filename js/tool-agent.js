(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document === "undefined") return;

  const form = document.getElementById("agent-form");
  const out = document.getElementById("agent-out");

  function val(id) {
    return (document.getElementById(id).value || "").trim();
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    out.value = api.sheet({
      name: val("agent-name"),
      read: val("agent-read"),
      write: val("agent-write"),
      call: val("agent-call"),
      spend: val("agent-spend"),
      inherit: val("agent-inherit"),
      approve: val("agent-approve"),
      log: val("agent-log"),
      owner: val("agent-owner")
    }).text;
  });

  document.getElementById("agent-copy").addEventListener("click", function () {
    out.focus();
    out.select();
    if (navigator.clipboard && out.value) navigator.clipboard.writeText(out.value).catch(function () {});
  });
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function line(label, value) {
    return label + ": " + (value || "not listed");
  }

  function sheet(input) {
    const inherit = input.inherit === "yes";
    const gap = inherit
      ? "Gap: this agent still inherits a person's access. Do not turn it on until that is off, or until the limit is written down."
      : "Gap: none on inherit. The agent does not inherit a person's access.";
    const text = [
      "Agent: " + (input.name || "Unnamed agent"),
      "",
      "ALLOW",
      line("Read", input.read),
      line("Write", input.write),
      line("Call", input.call),
      line("Spend cap per day", input.spend),
      "Human approves write and spend: " + (input.approve === "yes" ? "Yes" : "No"),
      "Log retained: " + (input.log === "yes" ? "Yes" : "No"),
      "Owner: " + (input.owner || "not named"),
      "",
      "DENY",
      "Inherit the user's access: " + (inherit ? "Yes — this is the gap" : "No"),
      "",
      gap
    ].join("\n");
    return { text: text, gap: gap, inherit: inherit };
  }

  return { sheet: sheet };
});
