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