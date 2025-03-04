# DDEV Config

-  add to `.ddev/config.yaml`

```yaml
omit_containers: [db]
nodejs_version: "22"
webimage_extra_packages: [chromium]
```
- install packages `ddev npm install`
- run `ddev exec node extractImages.js --url=https://www.example.com`