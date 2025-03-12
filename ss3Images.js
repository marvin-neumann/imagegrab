function ss3Images(urls) {
    return urls.map(url => url.replace(/\/_resampled\/[^/]+\//, '/'));
}
exports.ss3Images = ss3Images;
