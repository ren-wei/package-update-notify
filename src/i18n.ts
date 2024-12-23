export const msg: Record<string, Record<Lang, string>> = {
	checkingInit: {
		"en-US": "Checking for environment updates",
		"zh-cn": "正在检查环境更新"
	},
	checking: {
		"en-US": "Checking ${0}",
		"zh-cn": "正在检查 ${0}"
	},
	checkingStart: {
		"en-US": "Checking",
		"zh-cn": "正在检查"
	},
    checkingError: {
        "en-US": "Failed to check ${0}",
        "zh-cn": "检查 ${0} 失败"
    },
    checkingAllError: {
        "en-US": "All checks failed",
        "zh-cn": "所有检查失败"
    },
	hasUpdate: {
		"en-US": "${0} has update",
		"zh-cn": "${0} 有更新"
	},
	lastUpdate: {
		"en-US": "and last update time: ",
		"zh-cn": "最后更新时间："
	},
	update: {
		"en-US": "update",
		"zh-cn": "更新"
	},
	unknown: {
		"en-US": "unknown",
		"zh-cn": "未知"
	},
	notConfig: {
		"en-US": "Check isn't configured",
		"zh-cn": "环境检查未配置"
	},
	just: {
		"en-US": "Just now",
		"zh-cn": "刚刚"
	},
	minutesAgo: {
		"en-US": " minutes ago",
		"zh-cn": "分钟前"
	},
	hoursAgo: {
		"en-US": " hours ago",
		"zh-cn": "小时前"
	},
	yesterday: {
		"en-US": "Yesterday",
		"zh-cn": "昨天"
	},
	dayBeforeYesterday: {
		"en-US": "The day before yesterday",
		"zh-cn": "前天"
	},
	daysAgo: {
		"en-US": " days ago",
		"zh-cn": "天前"
	},
	valueIsArray: {
		"en-US": "The value type should be an array",
		"zh-cn": "配置值类型应该是列表"
	},
	configNotAddress: {
		"en-US": "The configuration item field `address` does not exist",
		"zh-cn": "配置项字段 `address` 不存在"
	},
	configNotHomepath: {
		"en-US": "The configuration item field `homepath` does not exist",
		"zh-cn": "配置项字段 `homepath` 不存在"
	},
	configNotHostname: {
		"en-US": "The configuration item field `hostname` does not exist",
		"zh-cn": "配置项字段 `hostname` 不存在"
	},
};

export type Lang = "en-US" | "zh-cn";
