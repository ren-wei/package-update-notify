import * as vscode from 'vscode';
import { Lang, msg } from './i18n';

let timer: NodeJS.Timeout | null = null;

let lang: Lang = "en-US";

export function activate(context: vscode.ExtensionContext) {
    lang = vscode.env.language as Lang;
    if (!msg.checkingInit[lang]) {
        lang = "en-US";
    }
    const bar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
    const disposable = vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration("package-update-notify")) {
            init(context, bar);
        }
    });

    bar.show();
    init(context, bar);
    context.subscriptions.push(disposable);
}

function init(context: vscode.ExtensionContext, bar: vscode.StatusBarItem) {
    deactivate();
    bar.text = msg.checkingInit[lang];
    const watchList: WatchItem[] | undefined = vscode.workspace.getConfiguration("package-update-notify").get("watch");
    const interval: number | undefined = vscode.workspace.getConfiguration("package-update-notify").get("interval");
    if (watchList) {
        const msg = validateConfig(watchList);
        if (msg) {
            vscode.window.showErrorMessage(msg);
        } else {
            getAddressUpdateTime(watchList, bar, context);
            timer = setInterval(() => getAddressUpdateTime(watchList, bar, context), interval ? interval * 1000 : 60000);
        }
    }
}

async function getAddressUpdateTime(watchList: WatchItem[], bar: vscode.StatusBarItem, context: vscode.ExtensionContext) {
    let lastTime = "";
    let lastHostname = "";
    for (const watch of watchList) {
        if (bar.text.startsWith(msg.checkingStart[lang])) {
            bar.text = msg.checking[lang].replace("${0}", watch.hostname);
        }
        // Fetch response from address
        try {
            const response = await fetch(watch.address + watch.homepath);
            if (response.status !== 200) {
                vscode.window.showErrorMessage(msg.checkingError[lang].replace("${0}", watch.hostname));
                continue;
            }
            const text = await response.text();
            // find a string like `src="**/index.**.js"`
            const reg = /src="([^"]*\/index\.([^"]*\.js))"/g;
            const result = reg.exec(text);
            const indexUrl = result?.at(1);
            if (indexUrl) {
                // Fetch response from indexUrl
                const response = await fetch(watch.address + indexUrl);
                const text = await response.text();
                // Find a date string
                const reg = /(\d{4}[\/-]\d{2}[\/-]\d{2} ([上下]午)?\d{1,2}:\d{2}:\d{2}( [AP]M)?)/g;
                const result = reg.exec(text);
                const updateTime = result?.at(1);
                if (updateTime) {
                    if (!lastTime || new Date(updateTime).getTime() > new Date(lastTime).getTime()) {
                        lastTime = updateTime;
                        lastHostname = watch.hostname;
                    }
                    const lastUpdateTime = context.workspaceState.get(watch.address);
                    if (lastUpdateTime !== updateTime) {
                        if (lastUpdateTime) {
                            vscode.window.showInformationMessage(msg.hasUpdate[lang].replace("${0}", watch.hostname), `${msg.lastUpdate[lang].replace("${0}", watch.hostname)} ${updateTime}(${formatTime(updateTime)})`);
                        }
                        context.workspaceState.update(watch.address, updateTime);
                    }
                }
            }
        } catch (error) {
            vscode.window.showErrorMessage(msg.checkingError[lang].replace("${0}", watch.hostname) + ": " + String(error));
        }
    }
    if (watchList.length) {
        if (lastTime) {
            bar.text = `${lastHostname} ${formatTime(lastTime)}${msg.update[lang]}`;
            bar.tooltip = [
                ...watchList.map(watch => {
                    const updateTime: string | undefined = context.workspaceState.get(watch.address);
                    return `${watch.hostname}: ${updateTime ? formatTime(updateTime) : msg.unknown[lang]}`;
                })
            ].join("\n");
        } else {
            bar.text = msg.checkingAllError[lang];
        }
    } else {
        bar.text = msg.notConfig[lang];
    }
}

function formatTime(time: string): string {
    const date = new Date(time);
    if (isNaN(date.getTime())) {
        return time;
    }
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffSeconds = diff / 1000;
    const diffMinutes = diffSeconds / 60;
    const diffHours = diffMinutes / 60;
    const diffDays = diffHours / 24;
    if (diffSeconds < 60) {
        return msg.just[lang];
    } else if (diffMinutes < 60) {
        return Math.floor(diffMinutes) + msg.minutesAgo[lang];
    } else if (diffHours < 24) {
        return Math.floor(diffHours) + msg.hoursAgo[lang];
    } else if (diffDays < 2) {
        return msg.yesterday[lang];
    } else if (diffDays < 3) {
        return msg.dayBeforeYesterday[lang];
    } else {
        return Math.floor(diffDays) + msg.daysAgo[lang];
    }
}

/** Check the configuration item and return the error message information if there is error. */
function validateConfig(config: WatchItem[]): string {
    if (!Array.isArray(config)) {
        return msg.valueIsArray[lang];
    }
    for (const item of config) {
        if (!item.address) {
            return msg.configNotAddress[lang];
        }
        if (!item.homepath) {
            return msg.configNotHomepath[lang];
        }
        if (!item.hostname) {
            return msg.configNotHostname[lang];
        }
    }
    return "";
}

export function deactivate() {
    if (timer) {
        clearInterval(timer);
    }
}

export interface WatchItem {
    address: string;
    homepath: string;
    hostname: string;
}
