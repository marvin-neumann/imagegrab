/**
 * Processes an array of image URLs by removing specific patterns used in Silverstripe 3.
 *
 * @param {string[]} urls - An array of image URLs to be processed.
 * @returns {string[]} An array of processed image URLs with the resampling part removed.
 */
function ss3Images(urls) {
    return urls.map(url => url.replace(/\/_resampled\/[^/]+\//, '/').replace(/(\.(?:jpg|jpeg|png|gif|mp4))\?.*$/, '$1'));
}
exports.ss3Images = ss3Images;
