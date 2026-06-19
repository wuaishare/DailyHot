# DailyHot Indexing SEO Design

## Goal

Improve crawl discovery for `hot.wuaishare.cn` by fixing static route shell coverage, strengthening sitemap signals, and completing webmaster submission for Google and Bing.

## Findings

- Google Search Console had no submitted sitemap before this run. `https://hot.wuaishare.cn/sitemap.xml` was submitted successfully and Google reported `1,055` discovered URLs.
- Bing Webmaster Tools had no submitted sitemap before this run. `https://hot.wuaishare.cn/sitemap.xml` was submitted successfully for processing.
- Production `robots.txt` is crawlable and points to the correct sitemap.
- Production category and rank detail routes return static HTML with `index,follow`, canonical, route-specific title, meta description, and JSON-LD.
- Locale home routes such as `/en/`, `/zh-tw/`, `/ja/`, and `/ko/` are present in the sitemap but currently return the default Chinese homepage shell.
- `generate-route-shells.cjs` currently extracts every `name:` token from the store, which also includes built-in category names. That creates unnecessary static shells such as category names under `/rank/...`.

## Design

Add home route shell generation for every supported locale, including `/`, `/en/`, `/zh-tw/`, `/ja/`, and `/ko/`. The home shells will use existing localized `seo.home*` messages, canonical URLs, localized `html lang`, Open Graph URL, and WebSite JSON-LD.

Use the same default source-list extraction rule for sitemap generation and route shell generation: only source names inside `defaultNewsArr` are rank sources. Built-in category names remain category routes, not rank routes.

Add `hreflang` alternate links to generated home, category, and rank shells so crawlers can connect equivalent language variants without relying on JavaScript.

Enhance `sitemap.xml` with `changefreq`, `priority`, and `xhtml:link` alternate entries. Keep one sitemap because the URL count is far below the 50,000 URL sitemap limit.

Add an IndexNow key file and a small submission script that reads the live sitemap and submits up to 10,000 same-host URLs to Bing/IndexNow after deployment.

## Verification

- Run `pnpm build`.
- Confirm `postbuild` generates the same count as sitemap URLs.
- Check raw HTML for `/`, `/en/`, `/zh-tw/`, `/category/ai`, and `/rank/clawhub/plugins-recommended`.
- Confirm sitemap URL count, canonical URLs, and alternate links.
- Deploy production, submit IndexNow, and verify raw production HTML plus sitemap.
