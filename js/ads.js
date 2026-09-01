(function () {
  const ads = (window.CC_CONFIG && window.CC_CONFIG.ads) || {};
  if (!ads.enabled) {
    document.querySelectorAll(".ad-slot, .ad-sticky").forEach((el) => el.remove());
    return;
  }

  const label = (slot) => {
    const name = slot.getAttribute("data-slot") || "ad";
    const sizes = {
      leaderboard: "728 × 90",
      sidebar: "300 × 250",
      skyscraper: "300 × 600",
      inarticle: "300 × 250",
      mobileSticky: "320 × 50",
      native: "Sponsored placement"
    };
    const box = slot.querySelector(".ad-slot__box");
    if (box && !box.dataset.filled) box.textContent = sizes[name] || "Ad";
  };

  document.querySelectorAll(".ad-slot").forEach(label);

  if (ads.provider === "adsense" && ads.adsenseClient.indexOf("XXXX") === -1) {
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + ads.adsenseClient;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);

    document.querySelectorAll(".ad-slot[data-ad-slot]").forEach((slot) => {
      const unit = document.createElement("ins");
      unit.className = "adsbygoogle";
      unit.style.display = "block";
      unit.setAttribute("data-ad-client", ads.adsenseClient);
      unit.setAttribute("data-ad-slot", slot.getAttribute("data-ad-slot"));
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
  }

  const sticky = document.querySelector(".ad-sticky");
  const liveAds = ads.provider === "adsense" && ads.adsenseClient.indexOf("XXXX") === -1;
  if (sticky && !liveAds) sticky.remove();
  const close = document.querySelector("[data-close-sticky]");
  if (close && sticky && liveAds) {
    document.body.classList.add("has-live-ads");
    close.addEventListener("click", () => {
      sticky.remove();
      document.body.classList.remove("has-live-ads");
    });
  }
})();
