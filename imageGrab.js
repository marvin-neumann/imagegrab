const puppeteer = require('puppeteer');
const fs = require('fs');
const minimist = require('minimist');
const path = require('path');
const download = require('image-downloader');

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
    await page.goto(url); // Use the URL from the --url parameter or the default URL

    // Extract image URLs, filter out base64 encoded images, and remove duplicates
    const imageUrls = await page.evaluate(() => {
        const urls = Array.from(document.querySelectorAll('img'))
            .map(img => img.src)
            .filter(url => !url.startsWith('data:'));

        // Remove duplicates
        return [...new Set(urls)];
    });

    // Modify image URLs to remove "__Fill" or "__Crop" and succeeding characters until the first dot
    const modifiedImageUrls = imageUrls.map(url => {
        const fillIndex = url.indexOf('__Fill');
        const cropIndex = url.indexOf('__Crop');
        if (fillIndex !== -1) {
            const dotIndex = url.indexOf('.', fillIndex);
            return url.substring(0, fillIndex) + url.substring(dotIndex);
        } else if (cropIndex !== -1) {
            const dotIndex = url.indexOf('.', cropIndex);
            return url.substring(0, cropIndex) + url.substring(dotIndex);
        }
        return url;
    });
    // Create the images directory if it doesn't exist
    const imagesDir = path.resolve(__dirname, 'images');
    if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir);
    }

    // Download each image and save it to the images directory
    for (const imageUrl of modifiedImageUrls) {
        const options = {
            url: imageUrl,
            dest: path.join(imagesDir, path.basename(imageUrl))
        };

        try {
            await download.image(options);
            console.log(`Downloaded ${imageUrl}`);
        } catch (error) {
            console.error(`Failed to download ${imageUrl}: ${error.message}`);
        }
    }
    // Save the image URLs to a text file
    fs.writeFileSync('imageUrls.txt', imageUrls.join('\n'));

    console.log('Image URLs saved to imageUrls.txt');

    await browser.close();
})();
