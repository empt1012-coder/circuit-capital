(function () {
  const page = document.body.getAttribute("data-page") || "";
  const ads = (window.CC_CONFIG && window.CC_CONFIG.ads) || {};
  const client = String(ads.adsenseClient || "").trim();
  const enabled = ads.enabled === true;
  const live =
    enabled &&
    ads.provider === "adsense" &&
    /^ca-pub-\d+$/.test(client);

  function loadAdsense() {
    if (document.querySelector('script[src*="adsbygoogle.js"]')) return;
    const script = document.createElement("script");
    script.async = true;
    script.dataset.ccAdsense = "1";
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(client);
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }

  function fillSlot(slot) {
    if (!live || !slot) return;
    const key = slot.getAttribute("data-slot");
    const unitId = slot.getAttribute("data-ad-slot") || (ads.slots && ads.slots[key]);
    if (!unitId) return;
    slot.setAttribute("data-ad-slot", unitId);
    let box = slot.querySelector(".ad-slot__box");
    if (!box) {
      box = document.createElement("div");
      box.className = "ad-slot__box";
      slot.appendChild(box);
    }
    const unit = document.createElement("ins");
    unit.className = "adsbygoogle";
    unit.style.display = "block";
    unit.setAttribute("data-ad-client", client);
    unit.setAttribute("data-ad-slot", unitId);
    unit.setAttribute("data-ad-format", slot.getAttribute("data-ad-format") || "auto");
    unit.setAttribute("data-full-width-responsive", "true");
    box.innerHTML = "";
    box.appendChild(unit);
    box.dataset.filled = "1";
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.push({});
  }

  function hideIdleSlots() {
    document.querySelector(".ad-sticky")?.remove();
    document.querySelectorAll(".ad-slot").forEach((el) => {
      el.hidden = true;
    });
  }

  if (!live) {
    hideIdleSlots();
    return;
  }

  loadAdsense();

  if (page === "home") {
    hideIdleSlots();
    return;
  }

  function unitFor(slot) {
    const key = slot.getAttribute("data-slot");
    return (slot.getAttribute("data-ad-slot") || (ads.slots && ads.slots[key]) || "").trim();
  }

  if (page === "guides") {
    document.querySelector(".ad-sticky")?.remove();
    document.querySelectorAll(".ad-slot:not(#ad-guide-mid):not(#ad-guide-end)").forEach((el) => el.remove());
    ["ad-guide-mid", "ad-guide-end"].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const unit = unitFor(el);
      if (!unit) {
        el.hidden = true;
        return;
      }
      el.hidden = false;
      el.classList.add("is-live");
      el.setAttribute("data-ad-slot", unit);
      fillSlot(el);
    });
    return;
  }

  document.querySelectorAll(".ad-slot__box").forEach((box) => {
    if (!box.dataset.filled) box.textContent = "";
  });

  document.querySelectorAll(".ad-slot").forEach((slot) => {
    const unit = unitFor(slot);
    if (!unit) {
      slot.hidden = true;
      return;
    }
    slot.hidden = false;
    slot.classList.add("is-live");
    slot.setAttribute("data-ad-slot", unit);
    fillSlot(slot);
  });

  const sticky = document.querySelector(".ad-sticky");
  const stickySlot = sticky && sticky.querySelector(".ad-slot");
  if (!stickySlot || stickySlot.hidden) {
    sticky?.remove();
  } else if (sticky) {
    document.body.classList.add("has-live-ads");
  }
  document.querySelector("[data-close-sticky]")?.addEventListener("click", () => {
    sticky?.remove();
    document.body.classList.remove("has-live-ads");
  });
})();
