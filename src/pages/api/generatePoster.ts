/*
 * @Author: wxingheng
 * @Date: 2024-11-28 14:20:13
 * @LastEditTime: 2024-12-20 13:23:10
 * @LastEditors: wxingheng
 * @Description: 生成海报; 返回图片二进制。zip=true 或 cards=all 时返回 ZIP。
 * @FilePath: /markdown-to-image-serve/src/pages/api/generatePoster.ts
 */
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { formatExtension, ImageFormat, resolveSize } from "@/lib/cardPresets";
import { API_DEFAULTS, parsePosterRecord, posterPath } from "@/lib/posterRequest";
import { screenshotPosterCards } from "@/lib/screenshotCards";
import { zipStore } from "@/lib/zipStore";

const chromium = require("@sparticuz/chromium-min");
const puppeteer = require("puppeteer-core");

export const maxDuration = 60;

const MIME: Record<ImageFormat, string> = {
  png: "image/png",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "只支持 POST 请求" });
  }

  const job = parsePosterRecord(req.body || {}, API_DEFAULTS);
  if (!job.markdown.trim()) {
    return res.status(400).json({ error: "markdown 不能为空" });
  }

  let browser: any = null;
  try {
    try {
      await chromium.font(path.posix.join(process.cwd(), "public", "fonts", "SimSun.ttf"));
    } catch (error: any) {
      if (error.code !== "EEXIST") throw error;
    }

    browser = await puppeteer.launch({
      args: [
        ...(process.env.NODE_ENV === "production" ? chromium.args : []),
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--no-first-run",
        "--no-sandbox",
        "--disable-web-security",
        "--ignore-certificate-errors",
        "--disable-font-subpixel-positioning",
        "--font-render-hinting=none",
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath:
        process.env.NODE_ENV === "production"
          ? await chromium.executablePath(
              `https://github.com/Sparticuz/chromium/releases/download/v123.0.1/chromium-v123.0.1-pack.tar`
            )
          : process.env.CHROME_PATH,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      "Accept-Language": "zh-CN,zh;q=0.9",
    });
    const size = resolveSize(job.settings);
    await page.setViewport({ width: Math.max(1200, size.width + 80), height: 1600 });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const fullUrl = `${baseUrl}${posterPath(job.markdown, job.settings)}`;
    console.log("fullUrl==========>", fullUrl);
    await page.goto(fullUrl, {
      waitUntil: "load",
      timeout: 30000,
    });

    const buffers = await screenshotPosterCards(page, job.format);
    if (job.zip || job.all) {
      const ext = formatExtension(job.format);
      const zipped = zipStore(
        buffers.map((buffer, index) => ({
          name: `card-${index + 1}.${ext}`,
          data: new Uint8Array(buffer),
        }))
      );
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", 'attachment; filename="cards.zip"');
      res.send(Buffer.from(zipped));
      return;
    }

    const card = buffers[Math.min(job.cardIndex, buffers.length - 1)];
    res.setHeader("Content-Type", MIME[job.format]);
    res.send(card);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) res.status(500).json({ error: "Failed to generate poster" });
  } finally {
    if (browser) await browser.close().catch(() => undefined);
  }
}
