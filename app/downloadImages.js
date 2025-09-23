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

            // Load basic auth credentials from puppeteerAuth.env if available
            let headers = {};
            const envPath = path.resolve(__dirname, '../puppeteerAuth.env');
            if (fs.existsSync(envPath)) {
                const envContent = fs.readFileSync(envPath, 'utf-8');
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
                    const auth = Buffer.from(`${username}:${password}`).toString('base64');
                    headers['Authorization'] = `Basic ${auth}`;
                }
            }

            const options = {
                url: imageUrl,
                dest: path.join(destDir, path.basename(imageUrl)),
                headers: Object.keys(headers).length ? headers : undefined
            };

            await download.image(options);
            console.log(`Downloaded ${imageUrl}`);
        } catch (error) {
            console.error(`Failed to download ${imageUrl}: ${error.message}`);
        }
    }
}
exports.downloadImages = downloadImages;
