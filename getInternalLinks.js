const puppeteer = require('puppeteer');
const minimist = require('minimist');
const path = require('path');
const fs = require('fs');


// Parse command-line arguments
const args = minimist(process.argv.slice(2));
const url = args.url || process.argv[2]; // Default URL if --url parameter is not provided
if (!url) {
    console.error('Please provide a URL as a command-line parameter');
    process.exit(1);
}

// Read Puppeteer options from JSON file
const optionsFilePath = path.resolve(__dirname, 'puppeteerOptions.json');
const puppeteerOptions = JSON.parse(fs.readFileSync(optionsFilePath, 'utf8'));


(async () => {
    const browser = await puppeteer.launch(puppeteerOptions);
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' }); // Wait for the page to load all scripts and events

    // Get all internal links
    const internalLinks = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a'));
        const hrefs = anchors
            .map(anchor => anchor.href.replace(/#$/, '')) // Remove trailing # character
            .filter(href => href.startsWith(window.location.origin) && href.trim() !== '');
        return [...new Set(hrefs)]; // Remove duplicates
    });

    console.log(internalLinks);

    await browser.close();
})();