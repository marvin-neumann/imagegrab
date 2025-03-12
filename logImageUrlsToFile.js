const fs = require('fs');
const { url, type } = require('./imageGrab');

function logImageUrlsToFile(modifiedImageUrls) {
    const fileContent = `URL: ${url}\nType: ${type}\n\n${modifiedImageUrls.join('\n')}`;
    fs.writeFileSync('grabbedImages.txt', fileContent);

    console.log('Image URLs saved to grabbedImages.txt');
}
exports.logImageUrlsToFile = logImageUrlsToFile;
