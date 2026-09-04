(function () {
  if (document.body.getAttribute("data-page") === "home") {
    document.querySelector(".ad-sticky")?.remove();
    return;
  }

  const ads = (window.CC_CONFIG && window.CC_CONFIG.ads) || {};
  const client = String(ads.adsenseClient || "").trim();
  const live =
    ads.enabled !== false &&
    ads.provider === "adsense" &&
    /^ca-pub-\d+$/.test(client);

  document.querySelectorAll(".ad-slot__box").forEach((box) => {
    if (!box.dataset.filled) box.textContent = "";
  });

  document.querySelectorAll(".ad-slot").forEach((slot) => {
    const key = slot.getAttribute("data-slot");
    const unit = ads.slots && ads.slots[key];
    if (unit) slot.setAttribute("data-ad-slot", unit);
  });

  if (!live) {
    const sticky = document.querySelector(".ad-sticky");
    if (sticky) sticky.remove();
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(client);
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);

  document.querySelectorAll(".ad-slot").forEach((slot) => {
    const unitId = slot.getAttribute("data-ad-slot");
    if (!unitId) return;
    const unit = document.createElement("ins");
    unit.className = "adsbygoogle";
    unit.style.display = "block";
    unit.setAttribute("data-ad-client", client);
    unit.setAttribute("data-ad-slot", unitId);
    unit.setAttribute("data-ad-format", slot.getAttribute("data-ad-format") || "auto");
    unit.setAttribute("data-full-width-responsive", "true");
    const box = slot.querySelector(".ad-slot__box");
    if (box) {
      box.innerHTML = "";
      box.appendChild(unit);
      box.dataset.filled = "1";
    }
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.push({});
  });

  const sticky = document.querySelector(".ad-sticky");
  if (sticky) document.body.classList.add("has-live-ads");
  document.querySelector("[data-close-sticky]")?.addEventListener("click", () => {
    sticky?.remove();
    document.body.classList.remove("has-live-ads");
  });
})();
