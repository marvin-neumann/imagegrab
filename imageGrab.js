const puppeteer = require('puppeteer');
const fs = require('fs');
const minimist = require('minimist');
const path = require('path');
const download = require('image-downloader');
const { ss3Images } = require('./app/ss3Images');
const { ss4Images } = require('./app/ss4Images');
const { downloadImages } = require('./app/downloadImages');
const { logImageUrlsToFile } = require('./app/logImageUrlsToFile');
const { extractImageUrls } = require('./extractImageUrls');

// Parse command-line arguments
const args = minimist(process.argv.slice(2));
const url = args.url || process.argv[2]; // Default URL if --url parameter is not provided
const type = args.type || 'default'; // Optional type parameter with default value 'default'
const log = args.log || 'false'; // Optional log parameter with default value 'false'
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

    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const delay = 200;
            const timer = setInterval(() => {
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= document.body.scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, delay);
        });
    });
    // Extract image URLs, filter out base64 encoded images, and remove duplicates
    const imageUrls = await extractImageUrls(page);

    let modifiedImageUrls = [];
    if (type === 'ss4') {
        modifiedImageUrls = ss4Images(imageUrls);
    }

    if (type === 'ss3') {
        modifiedImageUrls = ss3Images(imageUrls);
    }

    if (type === 'default') {
        modifiedImageUrls = imageUrls;
    }
    
    // Create the images directory if it doesn't exist
    const imagesDir = path.resolve(__dirname, 'grabbedImages');
    if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir);
    }

    // Create a subdirectory using the domain name of the URL parameter
    const urlObj = new URL(url);
    const domainDir = path.join(imagesDir, urlObj.hostname);
    if (!fs.existsSync(domainDir)) {
        fs.mkdirSync(domainDir);
    }

    // Download each image and save it to the images directory
    await downloadImages(modifiedImageUrls, domainDir);

    if (log !== 'false') {
        // Save the image URLs to a text file
        logImageUrlsToFile(modifiedImageUrls, url, type);
    }

    await browser.close();
})();




