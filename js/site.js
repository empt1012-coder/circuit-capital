(function () {
  const base = document.body.getAttribute("data-base") || ".";
  const page = document.body.getAttribute("data-page") || "";
  const asset = (path) => base.replace(/\/$/, "") + "/" + path.replace(/^\//, "");

  const navItems = [
    ["Business", "categories/business.html"],
    ["Technology", "categories/technology.html"],
    ["Markets", "categories/markets.html"],
    ["Startups", "categories/startups.html"],
    ["Policy", "categories/policy.html"],
    ["Opinion", "categories/opinion.html"]
  ];

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  function headerHTML() {
    const links = navItems
      .map(([label, href]) => {
        const active = page === label.toLowerCase() ? " is-active" : "";
        return `<li><a class="${active.trim()}" href="${asset(href)}">${label}</a></li>`;
      })
      .join("");

    return `
      <a class="skip" href="#main">Skip to content</a>
      <div class="topbar">
        <div class="wrap">
          <div>Independent briefing · Est. 2026</div>
          <div class="topbar__links">
            <a href="${asset("about.html")}">About</a>
            <a href="${asset("advertise.html")}">Advertise</a>
            <a class="hide-sm" href="${asset("contact.html")}">Contact</a>
          </div>
        </div>
      </div>
      <header class="masthead">
        <div class="wrap masthead__row">
          <div class="masthead__date" id="masthead-date">${today}</div>
          <a class="brand" href="${asset("index.html")}">
            <img class="brand__mark" src="${asset("assets/images/mark.jpg")}" alt="">
            <span>
              <div class="brand__name">Circuit <span>&amp;</span> Capital</div>
              <div class="brand__tag">Business · Technology · Markets</div>
            </span>
          </a>
          <div class="masthead__actions">
            <button class="btn btn--ghost" type="button" data-toggle-search>Search</button>
            <a class="btn btn--copper" href="${asset("subscribe.html")}">Subscribe</a>
            <button class="menu-toggle" type="button" data-toggle-nav aria-label="Open menu">☰</button>
          </div>
        </div>
        <nav class="nav" id="site-nav">
          <ul class="wrap">${links}</ul>
        </nav>
        <div class="search-bar" id="search-bar">
          <form class="wrap" action="${asset("search.html")}" method="get">
            <input type="search" name="q" placeholder="Search briefings…" aria-label="Search">
            <button class="btn btn--copper" type="submit">Go</button>
          </form>
        </div>
      </header>`;
  }

  function footerHTML() {
    return `
      <footer class="site-foot">
        <div class="wrap foot-grid">
          <div>
            <h3>Circuit &amp; Capital</h3>
            <p>Original reporting and analysis at the intersection of business and technology. Ad-supported. Independent.</p>
          </div>
          <div>
            <h3>Sections</h3>
            <ul>
              ${navItems.map(([l, h]) => `<li><a href="${asset(h)}">${l}</a></li>`).join("")}
            </ul>
          </div>
          <div>
            <h3>Publishers</h3>
            <ul>
              <li><a href="${asset("advertise.html")}">Advertise</a></li>
              <li><a href="${asset("advertise.html")}#specs">Ad specs</a></li>
              <li><a href="${asset("about.html")}">Masthead</a></li>
            </ul>
          </div>
          <div>
            <h3>Legal</h3>
            <ul>
              <li><a href="${asset("privacy.html")}">Privacy</a></li>
              <li><a href="${asset("terms.html")}">Terms</a></li>
              <li><a href="${asset("contact.html")}">Contact</a></li>
            </ul>
          </div>
        </div>
        <div class="wrap foot-bottom">
          <div>© ${new Date().getFullYear()} Circuit &amp; Capital. All rights reserved.</div>
          <div>Placeholder ads until a live ad network is connected in js/config.js</div>
        </div>
      </footer>
      <div class="ad-sticky" aria-label="Advertisement">
        <button type="button" data-close-sticky aria-label="Close ad">×</button>
        <div class="ad-slot" data-slot="mobileSticky" data-ad-slot="">
          <span class="ad-slot__label">Advertisement</span>
          <div class="ad-slot__box">320 × 50</div>
        </div>
      </div>
      <div class="cookie" id="cookie">
        <p>We use cookies and similar tech for analytics and advertising. See our <a href="${asset("privacy.html")}">privacy policy</a>.</p>
        <div class="cookie__row">
          <button class="btn btn--copper" type="button" data-cookie="accept">Accept</button>
          <button class="btn btn--ghost" type="button" data-cookie="reject" style="border-color:#5a6570">Necessary only</button>
        </div>
      </div>
      <div class="toast" id="toast" role="status"></div>`;
  }

  const headerMount = document.getElementById("site-header");
  const footerMount = document.getElementById("site-footer");
  if (headerMount) headerMount.innerHTML = headerHTML();
  if (footerMount) footerMount.innerHTML = footerHTML();

  document.querySelector("[data-toggle-search]")?.addEventListener("click", () => {
    document.getElementById("search-bar")?.classList.toggle("is-open");
  });
  document.querySelector("[data-toggle-nav]")?.addEventListener("click", () => {
    document.getElementById("site-nav")?.classList.toggle("is-open");
  });

  const cookie = document.getElementById("cookie");
  if (cookie && !localStorage.getItem("cc-cookie")) cookie.classList.add("is-open");
  document.querySelectorAll("[data-cookie]").forEach((btn) => {
    btn.addEventListener("click", () => {
      localStorage.setItem("cc-cookie", btn.getAttribute("data-cookie"));
      cookie?.classList.remove("is-open");
    });
  });

  function toast(msg) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("is-open");
    setTimeout(() => el.classList.remove("is-open"), 2800);
  }

  const localHost = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  const desk = window.CC_CONFIG || {};

  document.querySelectorAll("[data-newsletter]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      if (!localHost) return;
      e.preventDefault();
      const email = form.querySelector("input[type=email]")?.value;
      if (!email) return;
      const to = desk.contactEmail || "editor@example.com";
      location.href = "mailto:" + encodeURIComponent(to) +
        "?subject=" + encodeURIComponent("Newsletter signup") +
        "&body=" + encodeURIComponent("Please add this address to the morning wire: " + email);
      toast("Opening your email app to finish signup.");
    });
  });

  document.querySelectorAll("[data-contact]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      if (!localHost) return;
      e.preventDefault();
      const name = form.querySelector("[name=name]")?.value || "";
      const email = form.querySelector("[name=email]")?.value || "";
      const topic = form.querySelector("[name=topic]")?.value || "";
      const message = form.querySelector("[name=message]")?.value || "";
      const to = topic.toLowerCase().includes("advert") ? (desk.adsEmail || desk.contactEmail) : desk.contactEmail;
      location.href = "mailto:" + encodeURIComponent(to || "editor@example.com") +
        "?subject=" + encodeURIComponent("Circuit & Capital: " + topic) +
        "&body=" + encodeURIComponent(name + " <" + email + ">\n\n" + message);
      toast("Opening your email app to send the note.");
    });
  });

  async function loadArticles() {
    const res = await fetch(asset("data/articles.json"));
    return (await res.json()).articles;
  }

  const searchRoot = document.getElementById("search-results");
  if (searchRoot) {
    const params = new URLSearchParams(location.search);
    const q = (params.get("q") || "").trim().toLowerCase();
    const input = document.querySelector("#search-page-input");
    if (input) input.value = params.get("q") || "";
    loadArticles().then((articles) => {
      const hits = q
        ? articles.filter((a) =>
            (a.title + " " + a.dek + " " + a.category + " " + a.body).toLowerCase().includes(q)
          )
        : articles;
      searchRoot.innerHTML = hits.length
        ? hits
            .map(
              (a) => `<article class="search-hit">
                <div class="kicker">${a.category}</div>
                <h2><a href="${asset("articles/" + a.slug + ".html")}">${a.title}</a></h2>
                <p>${a.dek}</p>
                <div class="meta">${a.author} · ${a.date} · ${a.readTime} min</div>
              </article>`
            )
            .join("")
        : `<p>No briefings matched “${params.get("q") || ""}”.</p>`;
    }).catch(() => {
      searchRoot.innerHTML = "<p>Could not load the index. Serve the site over HTTP (see README).</p>";
    });
  }

  document.querySelectorAll("[data-category-list]").forEach(async (root) => {
    const cat = root.getAttribute("data-category-list");
    try {
      const articles = await loadArticles();
      const list = articles.filter((a) => a.category.toLowerCase() === cat.toLowerCase());
      root.innerHTML = list
        .map(
          (a) => `<article class="latest-row">
            <a href="${asset("articles/" + a.slug + ".html")}"><img src="${asset(a.image)}" alt=""></a>
            <div>
              <div class="kicker">${a.category}</div>
              <h3><a href="${asset("articles/" + a.slug + ".html")}">${a.title}</a></h3>
              <p>${a.dek}</p>
              <div class="meta">${a.author} · ${a.date} · ${a.readTime} min read</div>
            </div>
          </article>`
        )
        .join("");
    } catch {
      root.innerHTML = "<p>Serve the site over HTTP to load this section.</p>";
    }
  });
})();
