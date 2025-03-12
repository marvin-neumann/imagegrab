function ss4Images(urls) {
    return urls.map(url => url.replace(/__(Fill|Crop|Scale)[^/.]*/g, ''));
}
exports.ss4Images = ss4Images;
