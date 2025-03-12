const { ss4Images } = require('./ss4Images');

describe('ss4Images', () => {
    test('should remove __Fill from URLs', () => {
        const input = [
            'http://example.com/image1__Fill.jpg',
            'http://example.com/image2__FillH1hA7b2s3d4.jpg',
            'http://example.com/image3__FillH1hA7b2s3d4.Dr.Klein.jpg'
        ];
        const expected = [
            'http://example.com/image1.jpg',
            'http://example.com/image2.jpg',
            'http://example.com/image3.Dr.Klein.jpg',
        ];
        expect(ss4Images(input)).toEqual(expected);
    });

    test('should remove __Crop from URLs', () => {
        const input = [
            'http://example.com/image1__Crop.jpg',
            'http://example.com/image2__CropA1h2bs2.jpg',
            'http://example.com/image3__Cropb1h2bs2.Dr.Klein.jpg'
        ];
        const expected = [
            'http://example.com/image1.jpg',
            'http://example.com/image2.jpg',
            'http://example.com/image3.Dr.Klein.jpg'
        ];
        expect(ss4Images(input)).toEqual(expected);
    });

    test('should remove __Scale from URLs', () => {
        const input = [
            'http://example.com/image1__Scale.jpg',
            'http://example.com/image2__ScaleF1b3f8.jpg',
            'http://example.com/image3__Scalec1b3f8.Dr.Klein.jpg'
        ];
        const expected = [
            'http://example.com/image1.jpg',
            'http://example.com/image2.jpg',
            'http://example.com/image3.Dr.Klein.jpg'
        ];
        expect(ss4Images(input)).toEqual(expected);
    });

    test('should handle multiple URLs', () => {
        const input = [
            'http://example.com/image1__Fill.jpg',
            'http://example.com/image2__Crop.jpg',
            'http://example.com/image3__Scale.jpg'
        ];
        const expected = [
            'http://example.com/image1.jpg',
            'http://example.com/image2.jpg',
            'http://example.com/image3.jpg'
        ];
        expect(ss4Images(input)).toEqual(expected);
    });

    test('should handle mixed URLs', () => {
        const input = [
            'http://example.com/image1__Filla3sd2as.jpg',
            'http://example.com/image2__Cropv2fg1.jpg',
            'http://example.com/image3__Scale.jpg'
        ];
        const expected = [
            'http://example.com/image1.jpg',
            'http://example.com/image2.jpg',
            'http://example.com/image3.jpg'
        ];
        expect(ss4Images(input)).toEqual(expected);
    });

    test('should return original URL if no __Fill, __Crop, or __Scale', () => {
        const input = ['http://example.com/image.jpg'];
        const expected = ['http://example.com/image.jpg'];
        expect(ss4Images(input)).toEqual(expected);
    });

    test('should handle URLs with multiple patterns', () => {
        const input = ['http://example.com/image__Fill__Crop__Scale.jpg'];
        const expected = ['http://example.com/image.jpg'];
        expect(ss4Images(input)).toEqual(expected);
    });
});