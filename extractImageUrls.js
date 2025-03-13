/**
 * Extracts image URLs from the given page.
 * 
 * This function retrieves image URLs from:
 * 1. `<img>` elements.
 * 2. Stylesheets (CSS rules with `background-image` or `background` properties).
 * 3. Inline styles (elements with `background-image` or `background` properties).
 * 
 * Data URLs (starting with `data:`) are excluded from the results.
 * 
 * @param {object} page - The Puppeteer page object.
 * @returns {Promise<string[]>} A promise that resolves to an array of unique image URLs.
 */
async function extractImageUrls(page) {
    return await page.evaluate(() => {
        const urls = Array.from(document.querySelectorAll('img'))
            .map(img => img.src)
            .filter(url => !url.startsWith('data:'));

        // Extract image URLs from stylesheets
        const styleUrls = Array.from(document.styleSheets)
            .flatMap(sheet => Array.from(sheet.cssRules))
            .filter(rule => rule.style && (rule.style.backgroundImage || rule.style.background))
            .map(rule => {
                const urlMatch = rule.style.backgroundImage || rule.style.background;
                const url = urlMatch.match(/url\(["']?([^"')]+)["']?\)/);
                return url ? url[1] : null;
            })
            .filter(url => url && !url.startsWith('data:'));

        // Extract image URLs from inline styles
        const inlineStyleUrls = Array.from(document.querySelectorAll('*'))
            .map(element => {
                const style = window.getComputedStyle(element);
                const backgroundImage = style.backgroundImage;
                const background = style.background;
                const urlMatch = backgroundImage || background;
                const url = urlMatch.match(/url\(["']?([^"')]+)["']?\)/);
                return url ? url[1] : null;
            })
            .filter(url => url && !url.startsWith('data:'));

        console.log('inlineStyleUrls', inlineStyleUrls);
        // Combine and remove duplicates
        return [...new Set([...urls, ...styleUrls, ...inlineStyleUrls])];
    });
}
exports.extractImageUrls = extractImageUrls;
