const { downloadImages } = require('../app/downloadImages');
const fs = require('fs');
const path = require('path');

// Mock the image-downloader module
jest.mock('image-downloader');
const download = require('image-downloader');

describe('downloadImages', () => {
    const testDir = path.join(__dirname, 'test-images');
    
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        
        // Mock fs.existsSync to return false by default
        jest.spyOn(fs, 'existsSync').mockReturnValue(false);
        jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {});
        jest.spyOn(fs, 'readFileSync').mockImplementation(() => {});
        
        // Mock console methods
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        
        // Mock download.image to resolve successfully
        download.image.mockResolvedValue();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('should download images without basic auth by default', async () => {
        const imageUrls = ['https://example.com/image1.jpg'];
        
        await downloadImages(imageUrls, testDir);
        
        expect(download.image).toHaveBeenCalledWith({
            url: 'https://example.com/image1.jpg',
            dest: expect.any(String),
            headers: undefined
        });
    });

    test('should not use basic auth when flag is false', async () => {
        const imageUrls = ['https://example.com/image1.jpg'];
        
        await downloadImages(imageUrls, testDir, 'false');
        
        expect(download.image).toHaveBeenCalledWith({
            url: 'https://example.com/image1.jpg',
            dest: expect.any(String),
            headers: undefined
        });
    });

    test('should attempt to use basic auth when flag is true but no env file exists', async () => {
        const imageUrls = ['https://example.com/image1.jpg'];
        
        await downloadImages(imageUrls, testDir, 'true');
        
        expect(console.warn).toHaveBeenCalledWith('Basic auth flag is set but puppeteerAuth.env file not found');
        expect(download.image).toHaveBeenCalledWith({
            url: 'https://example.com/image1.jpg',
            dest: expect.any(String),
            headers: undefined
        });
    });

    test('should use basic auth when flag is true and env file exists', async () => {
        const imageUrls = ['https://example.com/image1.jpg'];
        
        // Mock env file exists and content
        fs.existsSync.mockReturnValue(true);
        fs.readFileSync.mockReturnValue('USERNAME=testuser\nPASSWORD=testpass\n');
        
        await downloadImages(imageUrls, testDir, 'true');
        
        const expectedAuth = Buffer.from('testuser:testpass').toString('base64');
        expect(download.image).toHaveBeenCalledWith({
            url: 'https://example.com/image1.jpg',
            dest: expect.any(String),
            headers: {
                'Authorization': `Basic ${expectedAuth}`
            }
        });
    });
});