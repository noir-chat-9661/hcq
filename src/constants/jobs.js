export const jobs = [
	{
		jobname: "剣士",
		charaname: "溌剌ボーイ",
		symbol: "戦",
		color: "bg-blue-700 text-blue-100 hover:bg-blue-600 hover:text-blue-50",
		hiden: ["未設定", "武神", "勇者の証", "剛腕ハンター"],
		status: [
			{ HP: 120, pow: 10, def: 10, tec: 10, as: 10, ms: 6 },
			{ HP: 1.1, pow: 0.4, def: 0.3, tec: 0.1 },
			{ HP: 0.1, pow: 0.5, def: 0.3, tec: 0 },
		]
	},
	{
		jobname: "魔法使い",
		charaname: "天才少女",
		symbol: "魔",
		color: "bg-red-600 text-red-100 hover:bg-red-500 hover:text-red-50",
		hiden: ["未設定", "魔力強化", "チアリーダー", "マジックバリア"],
		status: [
			{ HP: 100, pow: 10, def: 10, tec: 10, as: 9, ms: 5 },
			{ HP: 0.9, pow: 0.5, def: 0.2, tec: 0.4 },
			{ HP: -0.1, pow: 0.6, def: 0.1, tec: 0.3 },
		]
	},
	{
		jobname: "僧",
		charaname: "働くおじさん",
		symbol: "僧",
		color: "bg-yellow-400 text-yellow-900 hover:bg-yellow-300 hover:text-yellow-800",
		hiden: ["未設定", "開祖", "大僧正", "怒りの鉄拳", "異端"],
		status: [
			{ HP: 110, pow: 10, def: 10, tec: 10, as: 12, ms: 4 },
			{ HP: 1.0, pow: 0.3, def: 0.4, tec: 0.3 },
			{ HP: 0, pow: 0.2, def: 0.4, tec: 0.4 },
		]
	},
	{
		jobname: "忍者",
		charaname: "凄腕スタント",
		symbol: "忍",
		color: "bg-gray-500 text-gray-100 hover:bg-gray-400 hover:text-gray-50",
		hiden: ["未設定", "忍び足", "縮地", "常備薬"],
		status: [
			{ HP: 110, pow: 10, def: 10, tec: 10, as: 11, ms: 6 },
			{ HP: 1.0, pow: 0.3, def: 0.25, tec: 0.45 },
			{ HP: 0, pow: 0.3, def: 0.1, tec: 0.6 },
		]
	},
	{
		jobname: "メイド",
		charaname: "戦うナースさん",
		symbol: "メ",
		color: "bg-red-400 text-red-900 hover:bg-red-300 hover:text-red-800",
		hiden: ["未設定", "ドーピング", "勝利の女神", "スーパーナース"],
		status: [
			{ HP: 110, pow: 10, def: 10, tec: 10, as: 10, ms: 5 },
			{ HP: 1.0, pow: 0.35, def: 0.3, tec: 0.3 },
			{ HP: 0, pow: 0.3, def: 0.3, tec: 0.4 },
		]
	},
	{
		jobname: "パラディン",
		charaname: "真面目な騎士",
		symbol: "騎",
		color: "bg-teal-400 text-teal-900 hover:bg-teal-300 hover:text-teal-800",
		hiden: ["未設定", "百戦錬磨", "軍人", "ペネトレイト"],
		status: [
			{ HP: 120, pow: 10, def: 10, tec: 10, as: 11, ms: 4 },
			{ HP: 1.1, pow: 0.3, def: 0.3, tec: 0.24 },
			{ HP: 0, pow: 0.3, def: 0.4, tec: 0.3 },
		]
	},
	{
		jobname: "サモナー",
		charaname: "不思議ちゃん",
		symbol: "召",
		color: "bg-lime-200 text-lime-900 hover:bg-lime-100 hover:text-lime-800",
		hiden: ["未設定", "高等召喚士", "安全祈願", "一匹狼"],
		status: [
			{ HP: 110, pow: 10, def: 10, tec: 10, as: 10, ms: 5 },
			{ HP: 1.0, pow: 0.25, def: 0.45, tec: 0.3 },
			{ HP: 0, pow: 0.1, def: 0.55, tec: 0.35 },
		]
	},
];
