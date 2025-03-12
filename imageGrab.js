const puppeteer = require('puppeteer');
const fs = require('fs');
const minimist = require('minimist');
const path = require('path');
const download = require('image-downloader');
const { ss3Images } = require('./ss3Images');
const { ss4Images } = require('./ss4Images');
const { downloadImages } = require('./downloadImages');
const { logImageUrlsToFile } = require('./logImageUrlsToFile');

// Parse command-line arguments
const args = minimist(process.argv.slice(2));
const url = args.url || process.argv[2]; // Default URL if --url parameter is not provided
exports.url = url;
const type = args.type || 'default'; // Optional type parameter with default value 'default'
exports.type = type;
const log = args.log || 'false'; // Optional log parameter with default value 'false'
if (!url) {
    console.error('Please provide a URL as a command-line parameter');
    process.exit(1);
}
if (!type) {
    console.error('No type given as a command-line parameter, using `default`.');
}
if (!log) {
    console.error('No log given as a command-line parameter, using `false`.');
}

// Read Puppeteer options from JSON file
const optionsFilePath = path.resolve(__dirname, 'puppeteerOptions.json');
const puppeteerOptions = JSON.parse(fs.readFileSync(optionsFilePath, 'utf8'));

(async () => {
    const browser = await puppeteer.launch(puppeteerOptions);
    const page = await browser.newPage();
    await page.goto(url); // Use the URL from the --url parameter or the default URL

    // Extract image URLs, filter out base64 encoded images, and remove duplicates
    const imageUrls = await page.evaluate(() => {
        const urls = Array.from(document.querySelectorAll('img'))
            .map(img => img.src)
            .filter(url => !url.startsWith('data:'));

        // Remove duplicates
        return [...new Set(urls)];
    });

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



