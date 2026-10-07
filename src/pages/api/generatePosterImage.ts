/*
 * @Author: wxingheng
 * @Date: 2024-11-28 14:20:13
 * @LastEditTime: 2025-07-09 17:53:09
 * @LastEditors: wxingheng
 * @Description: 生成海报; 返回海报图片 url。支持主题、尺寸、字体、背景，以及多卡 JSON / ZIP。
 * @FilePath: /markdown-to-image-serve/src/pages/api/generatePosterImage.ts
 */
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { formatExtension, resolveSize } from "@/lib/cardPresets";
import { posterPublicUrl, savePosterFile } from "@/lib/posterFiles";
import { API_DEFAULTS, parsePosterRecord, posterPath } from "@/lib/posterRequest";
import { screenshotPosterCards } from "@/lib/screenshotCards";
import { zipStore } from "@/lib/zipStore";

const chromium = require("@sparticuz/chromium-min");
const puppeteer = require("puppeteer-core");

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
    console.log("===============>", process.env.NODE_ENV, process.env.CHROME_PATH);

    console.time("chromium.font");
    try {
      await chromium.font(path.posix.join(process.cwd(), "public", "fonts", "SimSun.ttf"));
    } catch (error: any) {
      if (error.code !== "EEXIST") throw error;
    }
    console.timeEnd("chromium.font");

    console.time("puppeteer.launch");
    browser = await puppeteer.launch({
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--hide-scrollbars",
        ...(process.env.NODE_ENV === "production" ? chromium.args : []),
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: process.env.CHROME_PATH,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
    console.timeEnd("puppeteer.launch");

    const page = await browser.newPage();
    const size = resolveSize(job.settings);
    await page.setViewport({ width: Math.max(1200, size.width + 80), height: 1600 });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const fullUrl = `${baseUrl}${posterPath(job.markdown, job.settings)}`;
    console.log("fullUrl", fullUrl);
    await page.goto(fullUrl, { waitUntil: "load", timeout: 30000 });

    const buffers = await screenshotPosterCards(page, job.format);
    const stamp = Date.now();
    if (job.zip) {
      const ext = formatExtension(job.format);
      const zipped = zipStore(
        buffers.map((buffer, index) => ({
          name: `card-${index + 1}.${ext}`,
          data: new Uint8Array(buffer),
        }))
      );
      const fileName = savePosterFile(`poster-${stamp}.zip`, zipped);
      return res.status(200).json({
        url: posterPublicUrl(baseUrl, fileName),
        count: buffers.length,
        zip: true,
      });
    }

    const selected = job.all ? buffers : [buffers[Math.min(job.cardIndex, buffers.length - 1)]];
    const ext = formatExtension(job.format);
    const urls = selected.map((buffer, index) => {
      const fileName = savePosterFile(`poster-${stamp}-${index}.${ext}`, buffer);
      return posterPublicUrl(baseUrl, fileName);
    });
    if (!job.all) return res.status(200).json({ url: urls[0] });
    return res.status(200).json({ url: urls[0], urls, count: urls.length });
  } catch (error) {
    console.error(error);
    if (!res.headersSent) res.status(500).json({ error: "Failed to generate poster" });
  } finally {
    if (browser) await browser.close().catch(() => undefined);
  }
}
