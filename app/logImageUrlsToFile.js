const fs = require('fs');

/**
 * Logs the modified image URLs to a file along with the original URL and type.
 *
 * @param {string[]} modifiedImageUrls - An array of modified image URLs.
 * @param {string} url - The original URL.
 * @param {string} type - The type of the image.
 */
function logImageUrlsToFile(modifiedImageUrls, url, type) {
    const fileContent = `URL: ${url}\nType: ${type}\n\n${modifiedImageUrls.join('\n')}`;
    fs.writeFileSync('grabbedImages.txt', fileContent);

    console.log('Image URLs saved to grabbedImages.txt');
}
exports.logImageUrlsToFile = logImageUrlsToFile;
