import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto('https://share.gemini.google/cv5gfkuLR5b6', { waitUntil: 'networkidle2' });
    
    // Wait for the conversation blocks to render
    await page.waitForSelector('.message-content', { timeout: 10000 }).catch(() => {});
    
    const text = await page.evaluate(() => document.body.innerText);
    console.log(text.substring(0, 3000));
    await browser.close();
  } catch (err) {
    console.error(err);
  }
})();
