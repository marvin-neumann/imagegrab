const { ss3Images } = require('./ss3Images');

describe('ss3Images', () => {
    test('should remove /_resampled/Fill from URLs', () => {
        const input = [
            'http://example.com/_resampled/Fill/image1.jpg',
            'http://example.com/_resampled/Fill/image2.jpg'
        ];
        const expectedOutput = [
            'http://example.com/image1.jpg',
            'http://example.com/image2.jpg'
        ];
        expect(ss3Images(input)).toEqual(expectedOutput);
    });

    test('should remove /_resampled/Crop from URLs', () => {
        const input = [
            'http://example.com/_resampled/Crop/image1.jpg',
            'http://example.com/_resampled/Crop/image2.jpg'
        ];
        const expectedOutput = [
            'http://example.com/image1.jpg',
            'http://example.com/image2.jpg'
        ];
        expect(ss3Images(input)).toEqual(expectedOutput);
    });

    test('should remove /_resampled/Scale from URLs', () => {
        const input = [
            'http://example.com/_resampled/Scale/image1.jpg',
            'http://example.com/_resampled/Scale/image2.jpg'
        ];
        const expectedOutput = [
            'http://example.com/image1.jpg',
            'http://example.com/image2.jpg'
        ];
        expect(ss3Images(input)).toEqual(expectedOutput);
    });

    test('should return URLs unchanged if no /_resampled/Fill, /_resampled/Crop, or /_resampled/Scale', () => {
        const input = [
            'http://example.com/image1.jpg',
            'http://example.com/image2.jpg'
        ];
        const expectedOutput = [
            'http://example.com/image1.jpg',
            'http://example.com/image2.jpg'
        ];
        expect(ss3Images(input)).toEqual(expectedOutput);
    });

    test('should handle mixed URLs correctly', () => {
        const input = [
            'http://example.com/_resampled/Fill/image1.jpg',
            'http://example.com/_resampled/FillWbdas6asdasj/image2.jpg',
            'http://example.com/_resampled/Crop/image3.jpg',
            'http://example.com/_resampled/Cropeasdadkw8q/image4.jpg',
            'http://example.com/_resampled/Scale/image5.jpg',
            'http://example.com/_resampled/Scalejfgasdgz/image6.jpg',
            'http://example.com/image7.jpg'
        ];
        const expectedOutput = [
            'http://example.com/image1.jpg',
            'http://example.com/image2.jpg',
            'http://example.com/image3.jpg',
            'http://example.com/image4.jpg',
            'http://example.com/image5.jpg',
            'http://example.com/image6.jpg',
            'http://example.com/image7.jpg'
        ];
        expect(ss3Images(input)).toEqual(expectedOutput);
    });
});