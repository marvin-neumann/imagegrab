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
 - `--formauth` or `--form` optional, default is false, if true enables Form Authentication for logging into admin forms using credentials and selectors from `puppeteerAuth.env`

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

## Form Authentication

To use Form Authentication (e.g., for admin login forms), add the following to your `puppeteerAuth.env` file:

```
FORM_USERNAME=your_admin_username
FORM_PASSWORD=your_admin_password
FORM_LOGIN_URL=https://www.example.com/admin/login
FORM_USERNAME_SELECTOR=#username
FORM_PASSWORD_SELECTOR=#password
FORM_SUBMIT_SELECTOR=button[type="submit"]
```

Then run the script with the `--formauth=true` flag:

```bash
node imageGrab.js --url=https://www.example.com/admin/dashboard --formauth=true
```

### Form Authentication Parameters

- `FORM_USERNAME`: The username for the login form
- `FORM_PASSWORD`: The password for the login form  
- `FORM_LOGIN_URL`: The URL of the login page
- `FORM_USERNAME_SELECTOR`: CSS selector for the username input field
- `FORM_PASSWORD_SELECTOR`: CSS selector for the password input field
- `FORM_SUBMIT_SELECTOR`: CSS selector for the submit button