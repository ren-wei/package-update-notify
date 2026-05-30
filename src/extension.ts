import * as vscode from 'vscode';
import { Lang, msg } from './i18n';
import * as crypto from 'crypto';

let timer: ReturnType<typeof setInterval> | null = null;

let lang: Lang = "en-US";

let hasError = new Set<string>();

export function activate(context: vscode.ExtensionContext) {
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
    const language = vscode.workspace.getConfiguration("package-update-notify").get("language");
    if (language === "auto") {
        lang = vscode.env.language.startsWith("zh") ? "zh-cn" : "en-US";
    } else {
        lang = language === "English" ? "en-US" : "zh-cn";
    }
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
    let lastUpdate: { hostname: string; time: Date } | null = null;
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
            // Calculate hash of the HTML content
            const hash = crypto.createHash('sha256').update(text).digest('hex');
            const lastHash = context.workspaceState.get<string>(watch.address);
            const currentTime = new Date();
            
            // Check if this is old version data (time string format like "2024/01/15 10:30:00")
            // Old version stored time string, new version stores hash (64 hex chars)
            const isOldVersionData = lastHash && lastHash.length !== 64;
            
            if (lastHash !== hash) {
                if (lastHash && !isOldVersionData) {
                    vscode.window.showInformationMessage(msg.hasUpdate[lang].replace("${0}", watch.hostname));
                }
                context.workspaceState.update(watch.address, hash);
                context.workspaceState.update(watch.address + ':time', currentTime.toISOString());
            }
            
            // If old version data exists, clean it up (optional: migrate time if needed)
            if (isOldVersionData) {
                // Old data was a time string, we could try to preserve it
                // but since we don't have the corresponding hash, it's safer to just start fresh
                // The time will be set to current time above
            }
            
            // Track the most recent update
            const storedTime = context.workspaceState.get<string>(watch.address + ':time');
            const updateTime = storedTime ? new Date(storedTime) : currentTime;
            if (!lastUpdate || updateTime.getTime() > lastUpdate.time.getTime()) {
                lastUpdate = { hostname: watch.hostname, time: updateTime };
            }
            
            hasError.delete(watch.address + watch.hostname);
        } catch (error) {
            if (!hasError.has(watch.address + watch.hostname)) {
                hasError.add(watch.address + watch.hostname);
                vscode.window.showErrorMessage(msg.checkingError[lang].replace("${0}", watch.hostname) + ": " + String(error));
            }
        }
    }
    if (watchList.length) {
        if (lastUpdate) {
            bar.text = `${lastUpdate.hostname} ${formatTime(lastUpdate.time)} ${msg.update[lang]}`;
            bar.tooltip = [
                ...watchList.map(watch => {
                    const updateTime: string | undefined = context.workspaceState.get(watch.address + ':time');
                    return `${watch.hostname}: ${updateTime ? formatTime(new Date(updateTime)) : msg.unknown[lang]}`;
                })
            ].join("\n");
        } else {
            bar.text = msg.checkingAllError[lang];
        }
    } else {
        bar.text = msg.notConfig[lang];
    }
}

function formatTime(time: Date): string {
    const now = new Date();
    const diff = now.getTime() - time.getTime();
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
