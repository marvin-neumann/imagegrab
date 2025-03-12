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