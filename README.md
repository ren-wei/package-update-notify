# package-update-notify

Show notify on the package was update.

## Installed extensions

Search for `package-update-notify` in the `vscode` extension, and then click to install.

## Prerequisites

The build time of the website must be clearly displayed in the `src="**/index.**.js"` file of the listening address. The extension periodically extracts a time-formatted string from it to compare it, and the plugin displays a notification if the extracted time changes.

## Getting Started

After install and enable the extension, use `package-update-notify.watch` to configure the address you want to listen to.

Its type is `WatchItem[]`, which is defined as follows:

```ts
export interface WatchItem {
    address: string;
    homepath: string;
    hostname: string;
}
```

The address of home is `${address}${homepath}`. The address of `index.js` is `${address}${indexUrl}` and `indexUrl` comes from something like `src="/js/index.xxx.js"`.

## Suggestions

Use a build tool such as webpack to embed the build time in a packaged `index.js` file.

## Issues

If you encounter any problem in use, you can create a [Issues](https://github.com/ren-wei/package-update-notify/issues) and we will solve it for you as soon as possible.
