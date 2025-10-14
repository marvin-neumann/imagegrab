# imageGrab 

imageGrab uses the Puppeteer library to extract image URLs from a webpage and save them to a folder. 

## Requirements

- NodeJs
- Npm
- Chromium Browser

## DDEV config

I use ddev for development, this is how it is configured.

-  add to `.ddev/config.yaml`

```yaml
omit_containers: [db]
nodejs_version: "22"
webimage_extra_packages: [chromium]
```

- after `ddev start` install packages `ddev npm install`
- run `ddev exec node imageGrab.js --url=https://www.example.com`

## How to run
- install packages `npm install`
- run `node imageGrab.js --url=https://www.example.com`

### Parameters

 - `--url` url of the page to grab the images
 - `--type` optional, 
    - default type is `default` and will download all images, 
    - `ss3` and `ss4` downloads only the origial images and ignores scaled and cropped images
 - `--log` optional, default is false, if true Logs the modified image URLs to a file along with the original URL and type
 - `--auth` or `--basicauth` optional, default is false, if true enables HTTP Basic Authentication using credentials from `puppeteerAuth.env`

## Basic Authentication

To use HTTP Basic Authentication, create a file named `puppeteerAuth.env` in the project root with the following format:

```
USERNAME=your_username
PASSWORD=your_password
```

Then run the script with the `--auth=true` flag:

```bash
node imageGrab.js --url=https://www.example.com --auth=true
```