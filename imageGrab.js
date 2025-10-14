const puppeteer = require('puppeteer');
const fs = require('fs');
const minimist = require('minimist');
const path = require('path');
const download = require('image-downloader');
const { ss3Images } = require('./app/ss3Images');
const { ss4Images } = require('./app/ss4Images');
const { downloadImages } = require('./app/downloadImages');
const { logImageUrlsToFile } = require('./app/logImageUrlsToFile');
const { extractImageUrls } = require('./extractImageUrls');

// Parse command-line arguments
const args = minimist(process.argv.slice(2));
const url = args.url || process.argv[2]; // Default URL if --url parameter is not provided
const type = args.type || 'default'; // Optional type parameter with default value 'default'
const log = args.log || 'false'; // Optional log parameter with default value 'false'
const useBasicAuth = args.auth || args.basicauth || 'false'; // Optional basic auth parameter with default value 'false'
const useFormAuth = args.formauth || args.form || 'false'; // Optional form auth parameter with default value 'false'
if (!url) {
    console.error('Please provide a URL as a command-line parameter');
    console.log('Usage: node imageGrab.js <URL> [options]');
    console.log('Options:');
    console.log('  --url=<URL>           Target URL to scrape');
    console.log('  --type=<default|ss3|ss4>  Image processing type (default: default)');
    console.log('  --log=<true|false>    Log URLs to file (default: false)');
    console.log('  --auth=<true|false>   Use basic authentication (default: false)');
    console.log('  --basicauth=<true|false>  Alias for --auth');
    console.log('  --formauth=<true|false>   Use form authentication (default: false)');
    console.log('  --form=<true|false>   Alias for --formauth');
    process.exit(1);
}

// Read Puppeteer options from JSON file
const optionsFilePath = path.resolve(__dirname, 'puppeteerOptions.json');
const puppeteerOptions = JSON.parse(fs.readFileSync(optionsFilePath, 'utf8'));

(async () => {
    const browser = await puppeteer.launch(puppeteerOptions);
    const page = await browser.newPage();

    // Optional Basic Auth from environment file
    if (useBasicAuth !== 'false') {
        const envPath = path.resolve(__dirname, 'puppeteerAuth.env');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
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
                await page.authenticate({ username, password });
            }
        } else {
            console.warn('Basic auth flag is set but puppeteerAuth.env file not found');
        }
    }

    // Optional fill in Form Auth from environment file
    if (useFormAuth !== 'false') {
        const envPath = path.resolve(__dirname, 'puppeteerAuth.env');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const lines = envContent.split('\n');
            let username = '', password = '', loginUrl = '', usernameSelector = '', passwordSelector = '', submitSelector = '';
            
            for (const line of lines) {
                if (line.startsWith('FORM_USERNAME=')) {
                    username = line.replace('FORM_USERNAME=', '').trim();
                }
                if (line.startsWith('FORM_PASSWORD=')) {
                    password = line.replace('FORM_PASSWORD=', '').trim();
                }
                if (line.startsWith('FORM_LOGIN_URL=')) {
                    loginUrl = line.replace('FORM_LOGIN_URL=', '').trim();
                }
                if (line.startsWith('FORM_USERNAME_SELECTOR=')) {
                    usernameSelector = line.replace('FORM_USERNAME_SELECTOR=', '').trim();
                }
                if (line.startsWith('FORM_PASSWORD_SELECTOR=')) {
                    passwordSelector = line.replace('FORM_PASSWORD_SELECTOR=', '').trim();
                }
                if (line.startsWith('FORM_SUBMIT_SELECTOR=')) {
                    submitSelector = line.replace('FORM_SUBMIT_SELECTOR=', '').trim();
                }
            }
            
            if (username && password && loginUrl && usernameSelector && passwordSelector && submitSelector) {
                try {
                    console.log('Performing form authentication...');
                    
                    // Navigate to login page
                    await page.goto(loginUrl, { waitUntil: 'networkidle2' });
                    
                    // Fill in login form
                    await page.waitForSelector(usernameSelector, { timeout: 10000 });
                    await page.type(usernameSelector, username);
                    await page.type(passwordSelector, password);
                    
                    // Submit form and wait for navigation
                    await Promise.all([
                        page.waitForNavigation({ waitUntil: 'networkidle2' }),
                        page.click(submitSelector)
                    ]);
                    
                    console.log('Form authentication completed successfully');
                } catch (error) {
                    console.error(`Form authentication failed: ${error.message}`);
                    console.error('Please check your form selectors and login credentials');
                }
            } else {
                console.warn('Form auth flag is set but required form auth credentials/selectors are missing in puppeteerAuth.env');
                console.warn('Required: FORM_USERNAME, FORM_PASSWORD, FORM_LOGIN_URL, FORM_USERNAME_SELECTOR, FORM_PASSWORD_SELECTOR, FORM_SUBMIT_SELECTOR');
            }
        } else {
            console.warn('Form auth flag is set but puppeteerAuth.env file not found');
        }
    }

    // Wait for the page to load all scripts and events
    await page.goto(url, { waitUntil: 'networkidle2' });

    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 500;
            const delay = 400;
            const timer = setInterval(() => {
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= document.body.scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, delay);
        });
    });
    // Extract image URLs, filter out base64 encoded images, and remove duplicates
    const imageUrls = await extractImageUrls(page);

    let modifiedImageUrls = [];
    if (type === 'ss4') {
        modifiedImageUrls = ss4Images(imageUrls);
    }

    if (type === 'ss3') {
        modifiedImageUrls = ss3Images(imageUrls);
    }

    if (type === 'default') {
        modifiedImageUrls = imageUrls;
    }
    
    // Create the images directory if it doesn't exist
    const imagesDir = path.resolve(__dirname, 'grabbedImages');
    if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir);
    }

    // Create a subdirectory using the domain name of the URL parameter
    const urlObj = new URL(url);
    const domainDir = path.join(imagesDir, urlObj.hostname);
    if (!fs.existsSync(domainDir)) {
        fs.mkdirSync(domainDir);
    }

    // Download each image and save it to the images directory
    await downloadImages(modifiedImageUrls, domainDir, useBasicAuth);

    if (log !== 'false') {
        // Save the image URLs to a text file
        logImageUrlsToFile(modifiedImageUrls, url, type);
    }

    await browser.close();
})();




