/**
 * Processes an array of image URLs by removing specific patterns used in Silverstripe 4.
 *
 * This function takes an array of image URLs and removes any occurrences of 
 * the patterns `__Fill`, `__Crop`, or `__Scale` followed by any characters 
 * except for a period or slash.
 *
 * @param {string[]} urls - An array of image URLs to be processed.
 * @returns {string[]} An array of processed image URLs with the specified patterns removed.
 */
function ss4Images(urls) {
    return urls.map(url => url.replace(/__(Fill|Crop|Scale)[^/.]*/g, ''));
}
exports.ss4Images = ss4Images;
