const puppeteer = require('puppeteer');
const fs = require('fs');
const minimist = require('minimist');
const path = require('path');
const download = require('image-downloader');
const { ss3Images } = require('./ss3Images');
const { ss4Images } = require('./ss4Images');

// Parse command-line arguments
const args = minimist(process.argv.slice(2));
const url = args.url || process.argv[2]; // Default URL if --url parameter is not provided
const type = args.type || 'default'; // Optional type parameter with default value 'default'
if (!url) {
    console.error('Please provide a URL as a command-line parameter');
    process.exit(1);
}
if (!type) {
    console.error('No type given as a command-line parameter, using `default` type.');
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

    console.log(modifiedImageUrls);
    
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
    for (const imageUrl of modifiedImageUrls) {
        try {
            const urlPath = new URL(imageUrl).pathname;
            const subDir = path.dirname(urlPath);
            const destDir = path.join(domainDir, subDir);

            // Create subdirectories if they don't exist
            if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
            }

            const options = {
                url: imageUrl,
                dest: path.join(destDir, path.basename(imageUrl))
            };

            await download.image(options);
            console.log(`Downloaded ${imageUrl}`);
        } catch (error) {
            console.error(`Failed to download ${imageUrl}: ${error.message}`);
        }
    }

    // Save the image URLs to a text file
    const fileContent = `URL: ${url}\nType: ${type}\n\n${modifiedImageUrls.join('\n')}`;
    fs.writeFileSync('grabbedImages.txt', fileContent);

    console.log('Image URLs saved to grabbedImages.txt');

    await browser.close();
})();


