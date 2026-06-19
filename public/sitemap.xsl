<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <xsl:output method="html" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>DailyHot Sitemap</title>
        <style>
          :root {
            color-scheme: light;
          }

          body {
            margin: 0;
            background: #f6f8fb;
            color: #172033;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }

          main {
            max-width: 1180px;
            margin: 0 auto;
            padding: 32px 20px 48px;
          }

          header {
            margin-bottom: 24px;
          }

          h1 {
            margin: 0 0 8px;
            font-size: 28px;
            line-height: 1.25;
          }

          p {
            margin: 0;
            color: #5f6b7a;
          }

          .summary {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin: 20px 0;
          }

          .pill {
            border: 1px solid #dce3ee;
            border-radius: 999px;
            background: #ffffff;
            padding: 8px 12px;
            font-size: 14px;
          }

          .table-wrap {
            overflow-x: auto;
            border: 1px solid #dce3ee;
            border-radius: 8px;
            background: #ffffff;
            box-shadow: 0 8px 28px rgba(23, 32, 51, 0.06);
          }

          table {
            width: 100%;
            min-width: 860px;
            border-collapse: collapse;
          }

          th,
          td {
            padding: 12px 14px;
            border-bottom: 1px solid #e8edf5;
            text-align: left;
            vertical-align: top;
          }

          th {
            background: #f0f4f9;
            color: #303b4d;
            font-size: 13px;
            font-weight: 650;
            white-space: nowrap;
          }

          td {
            font-size: 13px;
          }

          tr:hover td {
            background: #fafcff;
          }

          a {
            color: #1565c0;
            text-decoration: none;
          }

          a:hover {
            text-decoration: underline;
          }

          .count {
            color: #172033;
            font-weight: 650;
          }

          .muted {
            color: #758397;
          }

          .url {
            min-width: 360px;
            word-break: break-all;
          }

          @media (max-width: 720px) {
            main {
              padding: 24px 12px 36px;
            }

            h1 {
              font-size: 22px;
            }
          }
        </style>
      </head>
      <body>
        <main>
          <header>
            <h1>DailyHot Sitemap</h1>
            <p>用于运维核查的站点地图视图。搜索引擎读取的仍是同一份标准 XML 数据。</p>
          </header>

          <section class="summary" aria-label="Sitemap summary">
            <div class="pill">
              URL 数量：
              <span class="count">
                <xsl:value-of select="count(sitemap:urlset/sitemap:url)" />
              </span>
            </div>
            <div class="pill">多语言 alternate：<span class="count">hreflang</span></div>
          </section>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Lastmod</th>
                  <th>Changefreq</th>
                  <th>Priority</th>
                  <th>Alternates</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="sitemap:urlset/sitemap:url">
                  <tr>
                    <td class="url">
                      <a href="{sitemap:loc}">
                        <xsl:value-of select="sitemap:loc" />
                      </a>
                    </td>
                    <td>
                      <xsl:value-of select="sitemap:lastmod" />
                    </td>
                    <td>
                      <xsl:value-of select="sitemap:changefreq" />
                    </td>
                    <td>
                      <xsl:value-of select="sitemap:priority" />
                    </td>
                    <td class="muted">
                      <xsl:value-of select="count(xhtml:link)" />
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </div>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
