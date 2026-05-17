# Contributing

## Content Images

You can place screenshots and other content images next to the Markdown or MDX file that uses them.

```md
---
title: Example Guide
coverImage: "./cover.webp"
---

![Dashboard screenshot](./dashboard.webp)
```

After the content is pushed, automation uploads those images, rewrites the content to use permanent `https://files.arvid.tech/...` URLs, deletes the local image files, and opens a cleanup pull request.

You do not need to upload images yourself. If a check mentions image files under `content/`, wait for the automated cleanup pull request or ask a maintainer for help.
