const fs = require('fs');
const download = require('image-downloader');
const path = require('path');




/**
 * Downloads images from the provided URLs and saves them to the specified directory.
 *
 * @param {string[]} modifiedImageUrls - An array of image URLs to download.
 * @param {string} domainDir - The base directory where images will be saved.
 * @returns {Promise<void>} A promise that resolves when all images have been downloaded.
 */
async function downloadImages(modifiedImageUrls, domainDir) {
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
}
exports.downloadImages = downloadImages;
