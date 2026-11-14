"use strict";

const { execFileSync } = require("child_process");
const fs = require("fs");
const https = require("https");
const os = require("os");
const path = require("path");

const PREV_PATH = path.join(os.tmpdir(), "circuits-fit-prev-sitemap.xml");
const LIVE_SITEMAP = "https://circuits.fit/sitemap.xml";

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 20000 }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return fetchUrl(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    });
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error(`timeout fetching ${url}`));
    });
  });
}

module.exports = {
  async onPreBuild() {
    try {
      const xml = await fetchUrl(LIVE_SITEMAP);
      fs.writeFileSync(PREV_PATH, xml);
      console.log(`IndexNow: saved previous sitemap (${xml.length} bytes)`);
    } catch (err) {
      try {
        fs.unlinkSync(PREV_PATH);
      } catch (_) {
        // no previous file to remove
      }
      console.log(
        `IndexNow: could not fetch previous sitemap (${err.message}); will submit the full list after deploy`
      );
    }
  },

  async onSuccess({ constants, utils }) {
    const root = constants.PUBLISH_DIR || process.cwd();
    const script = path.join(root, "scripts", "indexnow.sh");
    const args = fs.existsSync(PREV_PATH) ? ["--changed-from", PREV_PATH] : [];
    try {
      const out = execFileSync(script, args, {
        encoding: "utf8",
        cwd: root,
        timeout: 60000,
      });
      console.log(out);
      const lines = (out || "").trim().split("\n").filter(Boolean);
      utils.status.show({
        title: "IndexNow",
        summary: (lines[0] || "IndexNow ping finished").slice(0, 200),
      });
    } catch (err) {
      const detail = [err.stdout, err.stderr, err.message].filter(Boolean).join("\n");
      console.log(`IndexNow ping failed (non-fatal):\n${detail}`);
      try {
        utils.status.show({
          title: "IndexNow",
          summary: "IndexNow ping failed (non-fatal)",
          text: String(detail).slice(0, 2000),
        });
      } catch (_) {
        // status API is best-effort
      }
    }
  },
};
