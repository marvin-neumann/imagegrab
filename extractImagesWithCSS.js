const puppeteer = require('puppeteer');
const fs = require('fs');
const minimist = require('minimist');
const path = require('path');

// Parse command-line arguments
const args = minimist(process.argv.slice(2));
const url = args.url || 'https://example.com'; // Default URL if --url parameter is not provided

// Read Puppeteer options from JSON file
const optionsFilePath = path.resolve(__dirname, 'puppeteerOptions.json');
const puppeteerOptions = JSON.parse(fs.readFileSync(optionsFilePath, 'utf8'));

(async () => {
    const browser = await puppeteer.launch(puppeteerOptions);
    const page = await browser.newPage();
    await page.goto(url); // Use the URL from the --url parameter or the default URL

    // Extract image URLs from img elements and stylesheets, filter out base64 encoded images, remove duplicates, and filter out empty URLs
    const imageUrls = await page.evaluate(() => {
        const urls = Array.from(document.querySelectorAll('img'))
            .map(img => img.src)
            .concat(Array.from(document.querySelectorAll('*'))
                .map(el => window.getComputedStyle(el).getPropertyValue('background-image'))
                .filter(bg => bg && bg !== 'none')
                .map(bg => bg.match(/url\(["']?([^"')]+)["']?\)/)[1]))
            .filter(url => url && !url.startsWith('data:image/')); // Filter out empty URLs and base64 encoded images

        // Remove duplicates
        return [...new Set(urls)];
    });

    // Save the image URLs to a text file
    fs.writeFileSync('imageUrls.txt', imageUrls.join('\n'));

    console.log('Image URLs saved to imageUrls.txt');

    await browser.close();
})();
