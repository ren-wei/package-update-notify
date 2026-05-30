# package-update-notify

Show notify on the package was update.

## Installed extensions

Search for `package-update-notify` in the `vscode` extension, and then click to install.

## Prerequisites

The extension periodically fetches the HTML content from the configured address and calculates its SHA256 hash value. When the hash changes, it indicates the website has been updated, and the plugin displays a notification.

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

The address of home is `${address}${homepath}`. The extension will fetch this URL and calculate the hash of the HTML content.

## Issues

If you encounter any problem in use, you can create a [Issues](https://github.com/ren-wei/package-update-notify/issues) and we will solve it for you as soon as possible.
