#!/usr/bin/env python3
"""Add full article HTML to feed.xml as <content:encoded> (idempotent).

feed.xml items (title/link/guid/pubDate/description) are maintained by hand;
this script fills in each item's full body from the article's <article class="prose">.
Runs as the Netlify build command so new articles get full content automatically.
"""
import re, sys, pathlib
from urllib.parse import urljoin
from bs4 import BeautifulSoup

ROOT = pathlib.Path(__file__).resolve().parent.parent
BASE = "https://circuits.fit/"
FEED = ROOT / "feed.xml"
NS = 'xmlns:content="http://purl.org/rss/1.0/modules/content/"'

def body_for(url):
    path = ROOT / url.replace(BASE, "", 1)
    if not path.is_file():
        return None
    soup = BeautifulSoup(path.read_text(encoding="utf-8"), "html.parser")
    art = soup.select_one("article.prose") or soup.find("article") or soup.find("main")
    if not art:
        return None
    for sel in ["script", "style", "noscript", "ins", "form", "iframe", "nav", "header", "footer",
                "aside", ".ad-slot", ".ad-sticky", "[class*=ad-slot]", ".newsletter", ".author-box"]:
        for el in art.select(sel):
            el.decompose()
    for tag, attr in (("a", "href"), ("img", "src"), ("source", "src")):
        for el in art.find_all(tag):
            v = el.get(attr)
            if v and not v.startswith(("#", "mailto:", "tel:", "data:")):
                el[attr] = urljoin(url, v)
    for el in art.find_all("img"):
        if el.get("srcset"):
            el["srcset"] = ", ".join(" ".join([urljoin(url, p.split()[0])] + p.split()[1:]) for p in el["srcset"].split(","))
    html = art.decode_contents().strip()
    return html.replace("]]>", "]]]]><![CDATA[>")

def main():
    xml = FEED.read_text(encoding="utf-8")
    xml = re.sub(r"\s*<content:encoded>.*?</content:encoded>", "", xml, flags=re.S)
    if "xmlns:content" not in xml:
        xml = xml.replace('<rss version="2.0">', f'<rss version="2.0" {NS}>', 1)
    ok, failed = 0, []
    def repl(m):
        nonlocal ok
        item = m.group(0)
        link = re.search(r"<link>(.*?)</link>", item).group(1).strip()
        body = body_for(link)
        if not body or len(body) < 200:
            failed.append(link); return item
        ok += 1
        return item.replace("</item>", f"<content:encoded><![CDATA[{body}]]></content:encoded>\n</item>")
    xml = re.sub(r"<item>.*?</item>", repl, xml, flags=re.S)
    FEED.write_text(xml, encoding="utf-8")
    print(f"feed.xml: {ok} items with full content, {len(failed)} failed")
    for f in failed: print("  FAILED:", f)

if __name__ == "__main__":
    main()
