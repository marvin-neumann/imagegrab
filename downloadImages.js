const fs = require('fs');
const download = require('image-downloader');
const path = require('path');




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
