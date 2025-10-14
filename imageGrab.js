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
const useBasicAuth = args.auth || args.basicauth || 'false'; // Optional basic auth parameter with default value 'false'
if (!url) {
    console.error('Please provide a URL as a command-line parameter');
    console.log('Usage: node imageGrab.js <URL> [options]');
    console.log('Options:');
    console.log('  --url=<URL>           Target URL to scrape');
    console.log('  --type=<default|ss3|ss4>  Image processing type (default: default)');
    console.log('  --log=<true|false>    Log URLs to file (default: false)');
    console.log('  --auth=<true|false>   Use basic authentication (default: false)');
    console.log('  --basicauth=<true|false>  Alias for --auth');
    process.exit(1);
}

// Read Puppeteer options from JSON file
const optionsFilePath = path.resolve(__dirname, 'puppeteerOptions.json');
const puppeteerOptions = JSON.parse(fs.readFileSync(optionsFilePath, 'utf8'));

(async () => {
    const browser = await puppeteer.launch(puppeteerOptions);
    const page = await browser.newPage();

    // Optional Basic Auth from environment file
    if (useBasicAuth !== 'false') {
        const envPath = path.resolve(__dirname, 'puppeteerAuth.env');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const lines = envContent.split('\n');
            let username = '', password = '';
            for (const line of lines) {
                if (line.startsWith('USERNAME=')) {
                    username = line.replace('USERNAME=', '').trim();
                }
                if (line.startsWith('PASSWORD=')) {
                    password = line.replace('PASSWORD=', '').trim();
                }
            }
            if (username && password) {
                await page.authenticate({ username, password });
            }
        } else {
            console.warn('Basic auth flag is set but puppeteerAuth.env file not found');
        }
    }

    // Optional fill in Form Auth from environment file

    // Wait for the page to load all scripts and events
    await page.goto(url, { waitUntil: 'networkidle2' });

    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 500;
            const delay = 400;
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
    await downloadImages(modifiedImageUrls, domainDir, useBasicAuth);

    if (log !== 'false') {
        // Save the image URLs to a text file
        logImageUrlsToFile(modifiedImageUrls, url, type);
    }

    await browser.close();
})();




