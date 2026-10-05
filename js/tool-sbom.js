(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document === "undefined") return;

  const fields = api.fields;
  const body = document.getElementById("sbom-rows");
  fields.forEach(function (field) {
    const tr = document.createElement("tr");
    tr.innerHTML = "<td>" + field + "</td><td>Asked</td><td><label><input type=\"checkbox\" data-field=\"" + field + "\"> Received</label></td><td class=\"missing\" data-missing=\"" + field + "\">Missing</td>";
    body.appendChild(tr);
  });

  function val(id) {
    return (document.getElementById(id).value || "").trim();
  }

  function paint() {
    document.querySelectorAll("[data-missing]").forEach(function (cell) {
      const box = document.querySelector('input[data-field="' + cell.getAttribute("data-missing") + '"]');
      const missing = !box.checked;
      cell.textContent = missing ? "Missing" : "Received";
      cell.className = missing ? "missing is-missing" : "missing";
    });
  }

  body.addEventListener("change", paint);

  document.getElementById("sbom-form").addEventListener("submit", function (event) {
    event.preventDefault();
    document.getElementById("sbom-out").value = api.email({
      vendor: val("sbom-vendor"),
      product: val("sbom-product"),
      kind: val("sbom-kind"),
      buyer: val("sbom-buyer")
    });
    paint();
  });

  document.getElementById("sbom-copy").addEventListener("click", function () {
    const out = document.getElementById("sbom-out");
    out.focus();
    out.select();
    if (navigator.clipboard && out.value) navigator.clipboard.writeText(out.value).catch(function () {});
  });
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const fields = [
    "Supplier name",
    "Component name",
    "Version",
    "Unique identifier",
    "Dependency relationship",
    "Author of SBOM data",
    "Timestamp",
    "License",
    "Known vulnerabilities"
  ];

  function email(input) {
    const kind = input.kind || "the product as sold";
    return [
      "To: " + (input.vendor || "Vendor"),
      "Subject: SBOM request for " + (input.product || "the product"),
      "",
      "We are buying " + (input.product || "this product") + " (" + kind + ").",
      "Please send an ingredients list that meets the 2026 CISA minimum elements, including for SaaS and AI software, not only code we compile.",
      "",
      "For each component, include:",
      "- Supplier name",
      "- Component name",
      "- Version",
      "- Unique identifier",
      "- Dependency relationship",
      "- Author of the SBOM data",
      "- Timestamp",
      "- License",
      "- Known vulnerabilities",
      "",
      "A logo slide is not an ingredients list.",
      "",
      input.buyer || "Buyer"
    ].join("\n");
  }

  return { fields: fields, email: email };
});
