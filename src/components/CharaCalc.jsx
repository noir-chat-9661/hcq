import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
	Sidebar,
	SidebarProvider,
	SidebarContent,
	SidebarFooter,
	SidebarTrigger,
	SidebarInset,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Command,
	CommandEmpty,
	CommandInput,
	CommandItem,
	CommandList,
	CommandGroup,
} from "@/components/ui/command";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	jobs,
	weapons,
	options,
	skills,
	defaultCharaData,
	charaDataTypes,
} from "@/constants/";

import { useIsMobile } from "@/hooks/use-mobile";
import { useCalc } from "@/hooks/use-calc";
import { cn } from "@/lib/utils";

const version = "6.1.0";

function CharaCalc() {
	const levels = ["-", "Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ"];
	const isMobile = useIsMobile();
	const [nextMode, setNextMode] = useState("skill");
	const [mode, setMode] = useState("skill");
	const [currentSkill, setCurrentSkill] = useState(null);
	const [skillPoints, setSkillPoints] = useState(
		new Array(jobs.length).fill(0)
	);
	const [currentShowJobId, setCurrentShowJobId] = useState(0);
	const [skillData, setSkillData] = useState(skills);
	const [showSkillDescription, setShowSkillDescription] = useState(false);
	const [skillDescription, setSkillDescription] = useState([]);
	const [isWeaponMenuOpen, setWeaponMenuOpen] = useState(false);
	const [isWeaponOption0MenuOpen, setWeaponOption0MenuOpen] = useState(false);
	const [isWeaponOption1MenuOpen, setWeaponOption1MenuOpen] = useState(false);
	const [isWeaponOption2MenuOpen, setWeaponOption2MenuOpen] = useState(false);
	const [isWeaponOption3MenuOpen, setWeaponOption3MenuOpen] = useState(false);
	const [isWeaponOption4MenuOpen, setWeaponOption4MenuOpen] = useState(false);
	const [isWeaponOption5MenuOpen, setWeaponOption5MenuOpen] = useState(false);
	const [showAllWeapons, setShowAllWeapons] = useState(false);
	const [showAllOptions, setShowAllOptions] = useState(false);
	const [attribute, setAttribute] = useState(-1);
	const [disattribute, setDisattribute] = useState(-1);
	const [output, setOutput] = useState(["", "", ""]);
	const [outputError, setOutputError] = useState(false);
	const [outputContent, setOutputContent] = useState({
		characterName: true,
		characterType: true,
		hiden: true,
		remain: true,
		weapon: true,
		stone: true,
		charalevel: true,
		bonus: true,
	});
	const [charaData, setCharaData] = useState(defaultCharaData);
	const [inputJson, setInputJson] = useState("");
	const [status, setStatus] = useState({});
	const calcStatus = useCalc();

	useEffect(() => {
		setSkillPoints((skillPoints) =>
			skillPoints.map((_, index) => {
				const points = skillData
					.filter((skill) => skill.jobid === index)
					.reduce(
						(sum, skill) =>
							sum +
							((skill.level * (skill.level + 1)) / 2) *
								(skill.point + 1),
						0
					);
				if (points < 5 && charaData.characterType === index) return 5;
				return points;
			})
		);
	}, [skillData]);

	useEffect(() => {
		if (mode == nextMode) return;
		if (nextMode === "output") {
			if (outputError) {
				setOutputError(false);
				setNextMode(mode);
				return;
			}
			try {
				const result = calc();
				setOutput(result);
				setMode(nextMode);
			} catch (e) {
				toast.error(e.message);
				setOutputError(true);
				setNextMode(mode);
			}
		} else {
			if (nextMode === "data")
				setStatus(
					charaData.charalevel + 4 <
						skillPoints.reduce((a, b) => a + b, 0) ||
						charaData.characterType == -1
						? {}
						: calcStatus(skillPoints, charaData)
				);
			setMode(nextMode);
		}
	}, [nextMode]);

	useEffect(() => {
		if (currentSkill === null) return;
	}, [currentSkill]);

	useEffect(() => {
		const fetchRecipe = async (id) => {
			try {
				const { info, error } = await fetch(
					"https://api.pjeita.top/hcqcalc",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ id }),
					}
				).then((res) => res.json());
				if (error == 4) {
					toast.error("レシピが見つかりませんでした。");
					return;
				}
				const { jobPoint, charaData } = info;
				const pointData = jobPoint.flat().map(Number);
				setSkillData((prevData) => {
					return prevData.map((skill) => {
						return {
							...skill,
							level: parseInt(pointData[skill.id]) || 0,
						};
					});
				});

				const d = { ...defaultCharaData };
				Object.entries(charaData).forEach(([key, value]) => {
					let v = value;
					if (!(key in charaDataTypes)) return;
					if (typeof v != charaDataTypes[key]) {
						// 型が一致しない場合は変換
						if (charaDataTypes[key] === "number") {
							v = parseInt(value);
						} else if (charaDataTypes[key] === "string") {
							v = String(value);
						}
					}
					d[key] = v;
				});
				toast.success("IDからレシピを取得しました。");
				setCharaData(d);
			} catch {
				toast.error("レシピの取得に失敗しました。");
			}
		};
		if (sessionStorage.getItem("recipeId")) {
			const id = sessionStorage.getItem("recipeId");
			sessionStorage.removeItem("recipeId");
			fetchRecipe(id);
		}
	}, []);

	useEffect(() => {
		let attribute = -1,
			disattribute = -1;
		// タイプ：[物理, 魔法, 回復, 妨害, 補助, 召喚]
		switch (charaData.characterType) {
			case 0:
				attribute = 0;
				disattribute = 2;
				break;
			case 1:
				attribute = 1;
				disattribute = 0;
				break;
			case 2:
				attribute = 2;
				disattribute = 3;
				break;
			case 3:
				attribute = 3;
				disattribute = 2;
				break;
			case 4:
				attribute = 4;
				disattribute = 3;
				break;
			case 5:
				attribute = 0;
				disattribute = 1;
				break;
			case 6:
				attribute = 5;
				disattribute = 0;
				break;
		}
		switch (charaData.weapon) {
			case 39:
				attribute = disattribute == 0 ? -1 : 0;
				disattribute = disattribute == 0 ? -1 : disattribute;
				break;
			case 40:
				attribute = disattribute == 1 ? -1 : 1;
				disattribute = disattribute == 1 ? -1 : disattribute;
				break;
			case 41:
				attribute = disattribute == 5 ? -1 : 5;
				disattribute = disattribute == 5 ? -1 : disattribute;
				break;
			case 44:
				attribute = disattribute == 3 ? -1 : 3;
				disattribute = disattribute == 3 ? -1 : disattribute;
				break;
			case 45:
				attribute = disattribute == 2 ? -1 : 2;
				disattribute = disattribute == 2 ? -1 : disattribute;
				break;
			case 46:
				attribute = disattribute == 4 ? -1 : 4;
				disattribute = disattribute == 4 ? -1 : disattribute;
				break;
		}
		setAttribute(attribute);
		setDisattribute(disattribute);
	}, [charaData]);

	useEffect(() => {
		if (currentSkill === null) return setSkillDescription([]);
		const s = skillData.find((skill) => skill.id === currentSkill);
		if (Array.isArray(s.description)) {
			const d = [...s.description[s.level]];
			d[2] = "[得意]" + d[2];
			d[3] = "[苦手]" + d[3];
			d.splice(4, 0, "");
			setSkillDescription(
				d.map((n) =>
					typeof n == "object"
						? s.type == attribute
							? n[2]
							: s.type == disattribute
							? n[0]
							: n[1]
						: n
				)
			);
		} else {
			const d = s.description;
			if (s.level == 0) {
				setSkillDescription([
					`SP:${d.SP}`,
					`タイプ:召喚`,
					`ステータス(lv200): HP ${
						d.HP * 200 * (s.type == attribute ? 1.2 : 1)
					} POW ${
						d.pow * 200 * (s.type == attribute ? 1.2 : 1)
					} DEF ${
						d.def * 200 * (s.type == attribute ? 1.2 : 1)
					} TEC ${d.tec * 200 * (s.type == attribute ? 1.2 : 1)}`,
					"",
					...d.description,
				]);
			} else {
				let l =
					charaData.charalevel +
					charaData.stars * 7 +
					d.compensation[s.level - 1];
				if (l < 1) l = 1;
				const status = { ...d };
				delete status.compensation;
				delete status.description;
				delete status.SP;
				Object.keys(status).forEach(
					(k) => (status[k] = Math.floor(status[k] * l))
				);
				if (s.type == attribute)
					Object.keys(status).forEach(
						(k) => (status[k] = Math.floor(status[k] * 1.2))
					);
				setSkillDescription([
					`SP:${s.description.SP}`,
					`タイプ:召喚`,
					`ステータス(lv${l}): HP ${status.HP} POW ${status.pow} DEF ${status.def} TEC ${status.tec}`,
					"",
					...d.description,
				]);
			}
		}
		setShowSkillDescription(true);
	}, [currentSkill]);

	const setCharacterData = (k, v, a = false) => {
		if (!(k in charaData)) return;
		const d = { ...charaData };
		let s = skillPoints;
		if (k === "characterType" && charaData.characterType != v) {
			d.hiden = 0;

			const defaultSkill = skillData.find(
				(skill) => skill.jobid == v && skill.isDefault
			);
			if (!defaultSkill?.level && v != -1) {
				levelChange(defaultSkill.id, 1);
			} else {
				s = skillPoints.map((_, index) => {
					const points = skillData
						.filter((skill) => skill.jobid === index)
						.reduce(
							(sum, skill) =>
								sum +
								((skill.level * (skill.level + 1)) / 2) *
									(skill.point + 1),
							0
						);
					if (points < 5 && charaData.characterType === index)
						return 5;
					return points;
				});
				setSkillPoints(s);
			}
		}
		if (k === "weapon" && k.weapon != v) {
			d.weaponOption0 = -1;
			d.weaponOption1 = -1;
			d.weaponOption2 = -1;
			if (v === -1) {
				d.weaponPow = 0;
				d.weaponDef = 0;
				d.weaponTec = 0;
				d.weaponPowPlus = 0;
				d.weaponDefPlus = 0;
				d.weaponTecPlus = 0;
			} else {
				const weapon = weapons.find((w) => w.id === v);
				d.weaponPow = weapon.pow;
				d.weaponDef = weapon.def;
				d.weaponTec = weapon.tec;
				d.weaponPowPlus = 0;
				d.weaponDefPlus = 0;
				d.weaponTecPlus = 0;
			}
		}
		if (k == "weaponPow" || k == "weaponDef" || k == "weaponTec") {
			const weapon = weapons.find((w) => w.id === d.weapon);
			if (!weapon) {
				toast.error("武器を設定してから値を設定してください。");
				return;
			}
			const K = k.slice(6).toLowerCase();
			if (weapon[K] + 10 < v) {
				toast.error(
					`武器の鍛冶の値は${weapon[K] + 10}以下に設定してください。`
				);
				return;
			} else if (weapon[K] - 10 > v) {
				toast.error(
					`武器の鍛冶の値は${weapon[K] - 10}以上に設定してください。`
				);
				return;
			}
		}
		if (k == "bonusPow" || k == "bonusDef" || k == "bonusTec") {
			const sum =
				charaData.bonusPow + charaData.bonusDef + charaData.bonusTec;
			if (a) {
				const nowBonus = charaData[k];
				if (nowBonus + v < 0) {
					if (nowBonus === 0)
						return toast.error("値は0以上に設定してください。");
					d[k] = 0;
				} else if (sum + v > charaData.charalevel * 3) {
					if (sum === charaData.charalevel * 3)
						return toast.error(
							`値の合計は${
								charaData.charalevel * 3
							}以下に設定してください。`
						);
					d[k] =
						charaData.charalevel * 3 -
						(charaData.bonusPow +
							charaData.bonusDef +
							charaData.bonusTec -
							nowBonus);
				} else {
					d[k] = nowBonus + v;
				}
			} else {
				if (v < 0) {
					toast.error("値は0以上に設定してください。");
					return;
				}
				if (sum + v > charaData.charalevel * 3) {
					toast.error(
						`合計は${
							charaData.charalevel * 3
						}以下に設定してください。`
					);
					return;
				}
				d[k] = v;
			}
		} else if (
			k == "weaponPowPlus" ||
			k == "weaponDefPlus" ||
			k == "weaponTecPlus"
		) {
			const sum =
				d.weaponPowPlus + d.weaponDefPlus + d.weaponTecPlus - d[k] + v;
			if (v < 0) {
				toast.error("値は0以上に設定してください。");
				return;
			}
			if (d.weapon === -1) {
				toast.error("武器を設定してから値を設定してください。");
				return;
			}
			if (sum > 99) {
				toast.warning("武器の鍛冶の値の合計は99以下です。");
				d[k] =
					99 -
					(d.weaponPowPlus +
						d.weaponDefPlus +
						d.weaponTecPlus -
						d[k]);
			} else {
				d[k] = v;
			}
		} else {
			d[k] = v;
		}
		setCharaData(d);
		setStatus(
			d.charalevel + 4 < skillPoints.reduce((a, b) => a + b, 0) ||
				d.characterType == -1
				? {}
				: calcStatus(s, d)
		);
	};

	const calc = () => {
		if (charaData.charalevel + 4 < skillPoints.reduce((a, b) => a + b, 0)) {
			throw new Error(
				`技のポイントの合計値が許容量(${
					charaData.charalevel + 4
				})を超過しています。`
			);
		}
		if (charaData.characterType === -1) {
			throw new Error("キャラクターのタイプを設定してください。");
		}
		if (
			charaData.bonusPow + charaData.bonusDef + charaData.bonusTec >
			charaData.charalevel * 3
		) {
			toast.warning(
				`ボーナスの合計値が許容量(${
					charaData.charalevel * 3
				})を超過しています。`
			);
		}
		if (charaData.weapon !== -1) {
			const weapon = weapons.find((w) => w.id === charaData.weapon);
			if (
				charaData.weaponPow < weapon.pow - 10 ||
				charaData.weaponPow > weapon.pow + 10
			) {
				toast.warning(
					`武器のpow値が許容量(${weapon.pow - 10}～${
						weapon.pow + 10
					})を超過しています。`
				);
			}
			if (
				charaData.weaponDef < weapon.def - 10 ||
				charaData.weaponDef > weapon.def + 10
			) {
				toast.warning(
					`武器のdef値が許容量(${weapon.def - 10}～${
						weapon.def + 10
					})を超過しています。`
				);
			}
			if (
				charaData.weaponTec < weapon.tec - 10 ||
				charaData.weaponTec > weapon.tec + 10
			) {
				toast.warning(
					`武器のtec値が許容量(${weapon.tec - 10}～${
						weapon.tec + 10
					})を超過しています。`
				);
			}
			if (
				charaData.weaponPowPlus +
					charaData.weaponDefPlus +
					charaData.weaponTecPlus >
				99
			) {
				toast.warning("武器の鍛冶の値の合計は99以下です。");
			}
		}
		let points = [...skillPoints];
		if (points.reduce((a, b) => a + b, 0) < charaData.charalevel + 4) {
			points = points.map((p, i) => {
				if (
					(charaData.remain == -1 && i === charaData.characterType) ||
					(charaData.remain != -1 && i === charaData.remain)
				) {
					return (
						p +
						(charaData.charalevel +
							4 -
							points.reduce((a, b) => a + b, 0))
					);
				}
				return p;
			});
		}
		const status = calcStatus(points, charaData);
		const randomName = () => {
			const nametable = [
				[
					"ロドリゲス",
					"ビーモス",
					"マンティス",
					"トムソン",
					"トランザム",
					"ビッグナム",
					"ゴンザレス",
					"トーマス",
					"ウィンビン",
					"フローレン",
					"エルダス",
					"バゼルコ",
					"ゴルバッチョ",
					"ジャガー",
					"グレート",
					"マーフィー",
					"デストロヤー",
					"ダイヤモンド",
					"エドワード",
					"モンゴリアン",
					"ドレイク",
					"ブライアン",
					"ハロルド",
					"マーキュリー",
					"ディオス",
					"ジャッカル",
					"ロジャー",
					"ロバーツ",
					"ダスティン",
					"バレンタイン",
					"ウィリアム",
					"ジャイアント",
					"スターマイン",
					"モンスーン",
					"エルリック",
					"ヴォックス",
					"ベーカー",
					"ベネット",
					"ロベルト",
					"アンジェロ",
					"マグナム",
					"アグトゥス",
					"ドンキホーテ",
					"ダーマルセ",
					"ビーコフ",
					"ミートボール",
					"バロン",
					"ピーターソン",
					"ジョナサン",
					"ロコフスキー",
					"マンデル",
					"ビビタス",
					"リチャード",
					"ライトニング",
					"ジャック",
					"ライジング",
					"ノーブル",
					"ダイナマイト",
					"アリオン",
					"アルデバラン",
					"イーシス",
					"ペテルギウス",
					"デーモン",
					"ビッグバン",
					"エリザベス",
					"ダークネス",
					"ミトス",
					"アサシン",
					"クリス",
					"アレックス",
				],
				[
					"神条",
					"山口",
					"山田",
					"鈴木",
					"大木",
					"帝",
					"蒼紫",
					"覇王",
					"豊臣",
					"森田",
					"稲辺",
					"川村",
					"最強",
					"佐藤",
					"高橋",
					"田中",
					"渡辺",
					"大王",
					"伊藤",
					"山本",
					"中村",
					"小林",
					"加藤",
					"吉田",
					"松本",
					"井上",
					"斎藤",
					"木村",
					"清水",
					"山崎",
					"池田",
					"橋本",
					"山下",
					"佐助",
					"石川",
					"中島",
					"前田",
					"藤田",
					"小川",
					"岡田",
					"後藤",
					"村上",
					"近藤",
					"石井",
					"坂本",
					"遠藤",
					"青木",
					"西村",
					"藤井",
					"福田",
					"太田",
					"三浦",
					"藤原",
					"岡本",
					"松田",
					"中川",
					"中野",
					"原田",
					"小野",
					"竹内",
					"金子",
					"和田",
					"中山",
					"石田",
					"上田",
					"柴田",
					"酒井",
					"工藤",
					"横山",
					"宮崎",
					"宮本",
					"内田",
					"高木",
					"安藤",
					"谷口",
					"修造",
					"政宗",
					"信長",
					"将軍",
					"皇帝",
				],
			];
			const n = Math.floor(Math.random() * nametable[0].length);
			const m = Math.floor(Math.random() * nametable[1].length);
			if (Math.random() < 0.5) {
				return `${nametable[0][n]}${nametable[1][m]}`;
			} else {
				return `${nametable[1][m]}${nametable[0][n]}`;
			}
		};

		const createOutput = (l = true) => {
			const d = [];
			if (l) {
				if (outputContent.characterName) {
					let name = charaData.characterName;
					if (!name) {
						name = randomName();
						setCharacterData("characterName", name);
					}
					d.push(name);
				}
				if (
					outputContent.characterType &&
					charaData.characterType != -1
				) {
					d.push(
						`キャラ：${jobs[charaData.characterType].charaname}`
					);
					if (outputContent.hiden && charaData.hiden)
						d.push(
							`秘伝：${
								jobs[charaData.characterType].hiden[
									charaData.hiden
								]
							}`
						);
				}
				if (outputContent.weapon && charaData.weapon != -1) {
					const w = [];
					w.push(
						`武具：${
							weapons.find((w) => w.id == charaData.weapon).name
						}`
					);
					if (charaData.weaponPow || charaData.weaponPowPlus)
						w.push(
							`pow${charaData.weaponPow}+${charaData.weaponPowPlus}`
						);
					if (charaData.weaponDef || charaData.weaponDefPlus)
						w.push(
							`def${charaData.weaponDef}+${charaData.weaponDefPlus}`
						);
					if (charaData.weaponTec || charaData.weaponTecPlus)
						w.push(
							`tec${charaData.weaponTec}+${charaData.weaponTecPlus}`
						);
					if (
						charaData.weaponOption0 != -1 ||
						charaData.weaponOption1 != -1 ||
						charaData.weaponOption2 != -1
					)
						w.push(
							Array.from({ length: 3 })
								.map(
									(_, i) =>
										`[${
											options[0].find(
												(o) =>
													o.id ==
													charaData[
														`weaponOption${i}`
													]
											).name
										}]`
								)
								.join("")
						);
					d.push(w.join(" "));
				}
				if (
					outputContent.stone &&
					(charaData.weaponOption3 != -1 ||
						charaData.weaponOption4 != -1 ||
						charaData.weaponOption5 != -1)
				)
					d.push(
						`護石：${Array.from({ length: 3 })
							.map(
								(_, i) =>
									`[${
										options[1].find(
											(o) =>
												o.id ==
												charaData[
													`weaponOption${i + 3}`
												]
										).name
									}]`
							)
							.join("")}`
					);
				if (
					outputContent.bonus &&
					charaData.bonusPow + charaData.bonusDef + charaData.bonusTec
				)
					d.push(
						`ボーナス：POW+${charaData.bonusPow} DEF+${charaData.bonusDef} TEC+${charaData.bonusTec}`
					);
				if (outputContent.charalevel) {
					const s = [];
					s.push(`HP ${status.HP}`);
					s.push(
						`SP ${status.SP / 5 + 200} (${
							status.SP * 0.15 + 150
						})/${status.SP}`
					);
					s.push(
						`POW ${
							status.stars
								? `${Math.floor(
										status.pow * (status.stars / 10 + 1)
								  )} (${status.pow})`
								: status.pow
						}`
					);
					s.push(
						`DEF ${
							status.stars
								? `${Math.floor(
										status.def * (status.stars / 10 + 1)
								  )} (${status.def})`
								: status.def
						}`
					);
					s.push(
						`TEC ${
							status.stars
								? `${Math.floor(
										status.tec * (status.stars / 10 + 1)
								  )} (${status.tec})`
								: status.tec
						}`
					);
					s.push(`攻速 ${status.as}`);
					s.push(`移動 ${status.ms}`);
					d.push(
						`ステータス(Lv${charaData.charalevel}${
							charaData.stars ? `☆${charaData.stars}` : ""
						})：${s.join("  ")}`
					);
				}
			}
			d.push(
				`職lv：${points
					.map(
						(p, i) =>
							`${jobs[i].symbol}${p}${
								outputContent.remain &&
								(outputContent.characterType ||
									charaData.remain != -1) &&
								skillPoints[i] != p
									? `(余${p - skillPoints[i]})`
									: ""
							}`
					)
					.join(" ")} 計${points.reduce((a, b) => a + b, 0)}`
			);
			d.push(
				`技lv：${skillData
					.filter((s) => s.level)
					.map((s) => `${s[l ? "name" : "short_name"]}${s.level}`)
					.join(" ")}`
			);
			return d.join("\n");
		};

		return [
			createOutput(true),
			createOutput(false),
			JSON.stringify({
				jobPoint: jobs.map((_, i) =>
					skillData.filter((s) => s.jobid == i).map((s) => s.level)
				),
				charaData,
			}),
		];
	};

	const levelChange = (skillId, type) => {
		const nowLevel = skillData.find((skill) => skill.id === skillId).level;
		let level = nowLevel;
		const skill = skillData.find((skill) => skill.id === skillId);
		switch (type) {
			case 0:
				level = 5;
				break;
			case 1:
				level = nowLevel + 1;
				break;
			case 2:
				level = nowLevel - 1;
				break;
			case 3:
				level = 0;
				break;
		}
		if (
			skill.isDefault &&
			!level &&
			skill.jobid === charaData.characterType
		) {
			if (type == 2 || (type == 3 && nowLevel == 1))
				return toast.error(
					"キャラのデフォルト技は外すことができません。"
				);
			level = 1;
		}
		setSkillData((prevData) => {
			return prevData.map((skill) => {
				if (skill.id === skillId) {
					return { ...skill, level };
				}
				return skill;
			});
		});
	};

	const handleJsonImport = () => {
		const { jobPoint, charaData } = JSON.parse(inputJson);
		if (!jobPoint || !charaData) {
			toast.error("不正なJSON形式です。");
			return;
		}
		if (jobPoint.length !== jobs.length) {
			toast.error("不正なJSON形式です。");
			return;
		}
		const pointData = jobPoint.flat().map(Number);
		if (pointData.length !== skillData.length) {
			toast.error("不正なJSON形式です。");
			return;
		}
		if (
			pointData
				.map((n, m) => ((skillData[m].point + 1) * n * (n + 1)) / 2)
				.reduce((a, b) => a + b, 0) >
			parseInt(charaData.charalevel) + 4
		) {
			toast.error(
				`技のポイントの合計値が許容量(${
					parseInt(charaData.charalevel) + 4
				})を超過しています。`
			);
			return;
		}
		setSkillData((prevData) => {
			return prevData.map((skill) => {
				return { ...skill, level: parseInt(pointData[skill.id]) || 0 };
			});
		});

		const d = { ...defaultCharaData };
		Object.entries(charaData).forEach(([key, value]) => {
			let v = value;
			if (!(key in charaDataTypes)) return;
			if (typeof v != charaDataTypes[key]) {
				// 型が一致しない場合は変換
				if (charaDataTypes[key] === "number") {
					v = parseInt(value);
				} else if (charaDataTypes[key] === "string") {
					v = String(value);
				}
			}
			d[key] = v;
		});
		setCharaData(d);
		toast.success("JSONのインポートに成功しました。");
	};

	return (
<div className="fixed top-0 left-0 w-full h-full bg-cyan-100 m-0 p-5 overflow-y-auto">
			<SidebarProvider className="min-h-full" defaultOpen={false}>
				<Sidebar className="w-64 shadow-lg pointer-events-none">
					<SidebarContent className="flex flex-col gap-4 p-4 bg-cyan-50 pointer-events-auto">
						<h1 className="text-xl font-bold mb-4 text-center">
							キャラ計算機メニュー
						</h1>
						<h2 className="text-lg font-semibold text-center">
							ver.{version}
						</h2>
						<Separator className="my-2" />
						<Accordion
							collapsible
							onValueChange={(v) => v && setNextMode(v)}
							value={mode}
							className="text-lg font-semibold"
						>
							<AccordionItem value="skill">
								<AccordionTrigger>
									技操作
									<span
										className={
											"ml-2" +
											(skillPoints.reduce(
												(a, b) => a + b
											) >
											charaData.charalevel + 4
												? " text-red-400 font-bold"
												: "")
										}
									>
										計：
										{skillPoints.reduce((a, b) => a + b)}
									</span>
								</AccordionTrigger>
								<AccordionContent>
									{jobs.map((job, index) => (
										<div
											className="flex items-center justify-between"
											key={"sidebar-jobs-" + index}
										>
											<Button
												key={"sidebar-jobbtn-" + index}
												className={`w-32 m-1 ${
													job.color ||
													"bg-gray-200 text-gray-800"
												}`}
												onClick={() => {
													setCurrentShowJobId(index);
													setNextMode("skill");
												}}
											>
												{job.jobname}
											</Button>
											<span className="ml-3 text-center text-gray-600">
												{skillPoints[index]}
											</span>
										</div>
									))}
								</AccordionContent>
							</AccordionItem>
							<AccordionItem value="data">
								<AccordionTrigger>
									キャラデータ
								</AccordionTrigger>
								<AccordionContent>
									{charaData.charalevel + 4 <
									skillPoints.reduce((a, b) => a + b, 0) ? (
										<p className="text-red-500 font-bold mb-2">
											技のポイントの合計値が許容量(
											{charaData.charalevel + 4}
											)を超過しています。
										</p>
									) : charaData.characterType === -1 ? (
										<p className="text-red-500 font-bold mb-2">
											キャラクターのタイプを設定してください。
										</p>
									) : (
										<Table className="w-full">
											<TableHeader>
												<TableRow>
													<TableHead className="w-1/3 text-center">
														項目
													</TableHead>
													<TableHead className="w-2/3 text-left pl-10">
														値
													</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												<TableRow>
													<TableCell className="text-center">
														HP
													</TableCell>
													<TableCell className="text-left pl-10">
														{status.HP}
													</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="text-center">
														SP
													</TableCell>
													<TableCell className="text-left pl-10">
														{status.SP / 5 + 200} (
														{status.SP * 0.15 + 150}
														)/{status.SP}
													</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="text-center">
														POW
													</TableCell>
													<TableCell className="text-left pl-10">
														{status.pow}
													</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="text-center">
														DEF
													</TableCell>
													<TableCell className="text-left pl-10">
														{status.def}
													</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="text-center">
														TEC
													</TableCell>
													<TableCell className="text-left pl-10">
														{status.tec}
													</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="text-center">
														攻速
													</TableCell>
													<TableCell className="text-left pl-10">
														{status.as}
													</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="text-center">
														移動
													</TableCell>
													<TableCell className="text-left pl-10">
														{status.ms}
													</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="text-center">
														√後POW
													</TableCell>
													<TableCell className="text-left pl-10">
														{Math.floor(
															Math.sqrt(
																status.pow
															)
														)}{" "}
														(余り：
														{status.pow -
															Math.floor(
																Math.sqrt(
																	status.pow
																)
															) **
																2}
														)
													</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="text-center">
														√後DEF
													</TableCell>
													<TableCell className="text-left pl-10">
														{Math.floor(
															Math.sqrt(
																status.def
															)
														)}{" "}
														(余り：
														{status.def -
															Math.floor(
																Math.sqrt(
																	status.def
																)
															) **
																2}
														)
													</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="text-center">
														√後TEC
													</TableCell>
													<TableCell className="text-left pl-10">
														{Math.floor(
															Math.sqrt(
																status.tec
															)
														)}{" "}
														(余り：
														{status.tec -
															Math.floor(
																Math.sqrt(
																	status.tec
																)
															) **
																2}
														)
													</TableCell>
												</TableRow>
											</TableBody>
										</Table>
									)}
								</AccordionContent>
							</AccordionItem>
							<AccordionItem value="output">
								<AccordionTrigger>出力</AccordionTrigger>
								<AccordionContent>
									<div className="flex items-center justify-between">
										スレ用：
										<Button
											className="w-20 m-1 bg-green-500 text-white hover:bg-green-600"
											onClick={() => {
												const outputText = output[0];
												navigator.clipboard.writeText(
													outputText
												);
												toast.success(
													"レシピをコピーしました。"
												);
											}}
										>
											コピー
										</Button>
									</div>
									<div className="flex items-center justify-between">
										チャット用：
										<Button
											className="w-20 m-1 bg-blue-500 text-white hover:bg-blue-600"
											onClick={() => {
												const outputText = output[1];
												navigator.clipboard.writeText(
													outputText
												);
												toast.success(
													"短縮版のレシピをコピーしました。"
												);
											}}
										>
											コピー
										</Button>
									</div>
									<div className="flex items-center justify-between">
										JSON：
										<Button
											className="w-20 m-1 bg-yellow-500 text-white hover:bg-yellow-600"
											onClick={() => {
												const outputText = output[2];
												navigator.clipboard.writeText(
													outputText
												);
												toast.success(
													"JSONをコピーしました。"
												);
											}}
										>
											コピー
										</Button>
									</div>
								</AccordionContent>
							</AccordionItem>
							<AccordionItem value="other">
								<AccordionTrigger>その他</AccordionTrigger>
							</AccordionItem>
						</Accordion>
					</SidebarContent>
					<SidebarFooter />
				</Sidebar>
				<SidebarInset className="w-full m-0 pt-1 px-3 pb-3 bg-cyan-50">
					<Toaster
						richColors
						position="top-right"
						className="text-2xl"
					/>
					<header className="flex h-16 shrink-0 items-center gap-2">
						<div className="flex items-center gap-2 px-4">
							<SidebarTrigger className="-ml-1" />
							<Breadcrumb className="inline-block mx-5 w-3/4">
								<BreadcrumbList>
									<BreadcrumbItem>
										<BreadcrumbLink asChild>
											<Link to="/">トップ</Link>
										</BreadcrumbLink>
									</BreadcrumbItem>
									<BreadcrumbSeparator />
									<BreadcrumbItem>
										<BreadcrumbPage>
											キャラ計算
										</BreadcrumbPage>
									</BreadcrumbItem>
								</BreadcrumbList>
							</Breadcrumb>
						</div>
					</header>
					<Separator className="my-2 mb-5" />
					<h1 className="text-2xl my-2 text-center font-bold">
						キャラレシピ計算機
					</h1>
					<p>左上のボタンからメニューを開けます。</p>
					<Tabs
						defaultValue="skill"
						className="flex flex-col items-center m-3"
						value={mode}
						onValueChange={(v) => setNextMode(v)}
					>
						<TabsList className="justify-center">
							<TabsTrigger value="skill" className="m-1">
								技操作
							</TabsTrigger>
							<TabsTrigger value="data" className="m-1">
								キャラデータ
							</TabsTrigger>
							<TabsTrigger value="output" className="m-1">
								出力
							</TabsTrigger>
							<TabsTrigger value="other" className="m-1">
								その他
							</TabsTrigger>
						</TabsList>
					</Tabs>
					{mode === "skill" ? (
						<div>
							<h2
								className={
									"text-xl m-3" +
									(skillPoints.reduce((a, b) => a + b) >
									charaData.charalevel + 4
										? " text-red-400 font-bold"
										: "")
								}
							>
								合計：{skillPoints.reduce((a, b) => a + b)}
							</h2>
							<div>
								{jobs.map((job, index) => (
									<Button
										key={"jobbtn-" + index}
										className={`w-30 m-1 ${
											job.color ||
											"bg-gray-200 text-gray-800"
										}`}
										onClick={() => {
											setCurrentShowJobId(index);
											setNextMode("skill");
										}}
									>
										{job.jobname}({skillPoints[index]})
									</Button>
								))}
							</div>
							<Separator className="my-2" />
							<Dialog
								open={showSkillDescription}
								onOpenChange={(open) => {
									if (!open) {
										setShowSkillDescription(false);
										setSkillDescription([]);
										setCurrentSkill(null);
									}
								}}
							>
								<DialogContent>
									<DialogHeader>
										<DialogTitle className="text-2xl text-center">
											{(skillData.find(
												(s) => s.id == currentSkill
											)?.name ??
												(showSkillDescription
													? "不明な技"
													: "")) +
												["", "Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ"][
													skillData.find(
														(s) =>
															s.id == currentSkill
													)?.level ?? 0
												]}
										</DialogTitle>
										<DialogDescription className="text-lg text-center">
											{skillDescription.map((d) =>
												d ? (
													<>
														{d}
														<br />
													</>
												) : (
													<br />
												)
											)}
										</DialogDescription>
									</DialogHeader>
								</DialogContent>
							</Dialog>
							<Table className="w-5/6 mx-auto">
								<TableHeader>
									<TableRow>
										<TableHead className="w-3/10 text-center">
											技名
										</TableHead>
										<TableHead className="w-1/10 text-center">
											レベル
										</TableHead>
										<TableHead className="w-1/10 text-center">
											ポイント
										</TableHead>
										<TableHead className="w-1/2 text-center">
											ボタン
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{skillData
										.filter(
											(skill) =>
												skill.jobid === currentShowJobId
										)
										.map((skill) => (
											<TableRow
												key={"skill-" + skill.id}
												className={`cursor-pointer`}
											>
												<TableCell
													className={cn(
														"px-2 py-1",
														skill.type == attribute
															? "text-red-600"
															: skill.type ==
																	disattribute &&
																	"text-purple-600"
													)}
													onClick={() =>
														setCurrentSkill(
															skill.id
														)
													}
												>
													{skill.name}
												</TableCell>
												<TableCell className="px-2 py-1">
													{levels[skill.level]}
												</TableCell>
												<TableCell className="px-2 py-1">
													{((skill.level *
														(skill.level + 1)) /
														2) *
														(skill.point + 1)}
												</TableCell>
												<TableCell className="px-2 py-1">
													<Button
														className={
															"w-10 " +
															(skill.level != 5
																? "bg-sky-700 text-white hover:bg-sky-600"
																: "bg-gray-300 text-gray-500 cursor-not-allowed")
														}
														onClick={() =>
															levelChange(
																skill.id,
																0
															)
														}
														disabled={
															skill.level == 5
														}
													>
														↑
													</Button>
													<Button
														className={
															"w-10 " +
															(skill.level != 5
																? "bg-sky-600 text-white hover:bg-sky-500"
																: "bg-gray-300 text-gray-500 cursor-not-allowed")
														}
														onClick={() =>
															levelChange(
																skill.id,
																1
															)
														}
														disabled={
															skill.level == 5
														}
													>
														+
													</Button>
													<Button
														className={
															"w-10 " +
															(skill.level != 0
																? "bg-rose-600 text-white hover:bg-rose-500"
																: "bg-gray-300 text-gray-500 cursor-not-allowed")
														}
														onClick={() =>
															levelChange(
																skill.id,
																2
															)
														}
														disabled={
															skill.level == 0
														}
													>
														-
													</Button>
													<Button
														className={
															"w-10 " +
															(skill.level != 0
																? "bg-rose-700 text-white hover:bg-rose-600"
																: "bg-gray-300 text-gray-500 cursor-not-allowed")
														}
														onClick={() =>
															levelChange(
																skill.id,
																3
															)
														}
														disabled={
															skill.level == 0
														}
													>
														↓
													</Button>
												</TableCell>
											</TableRow>
										))}
								</TableBody>
							</Table>
							<Dialog
								open={currentSkill != null && 0}
								onOpenChange={(open) => {
									if (!open) setCurrentSkill(null);
								}}
							>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>
											{skillData.find(
												(s) => s.id == currentSkill
											)?.name ?? ""}
										</DialogTitle>
										<DialogDescription>
											{skillData
												.find(
													(s) => s.id == currentSkill
												)
												?.description?.[
													skillData.find(
														(s) =>
															s.id == currentSkill
													)?.level
												]?.map((d) =>
													Array.isArray(d) ? (
														<p>{d[0]}</p>
													) : (
														<p>{d}</p>
													)
												) ?? ""}
										</DialogDescription>
									</DialogHeader>
								</DialogContent>
							</Dialog>
						</div>
					) : mode == "data" ? (
						<div>
							<h2 className="text-xl m-3">キャラデータ</h2>
							<Table className="w-5/6 mx-auto">
								<TableHeader>
									<TableRow>
										<TableHead className="w-1/10 text-center">
											出力
										</TableHead>
										<TableHead className="w-3/10 text-center">
											項目
										</TableHead>
										<TableHead className="w-3/5 text-left p-3">
											値
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									<TableRow>
										<TableCell className="px-2 py-1">
											<Label className="w-full">
												<Checkbox
													checked={
														outputContent.characterName
													}
													onCheckedChange={(
														checked
													) =>
														setOutputContent({
															...outputContent,
															characterName:
																checked,
														})
													}
													className="align-center m-auto"
												/>
											</Label>
										</TableCell>
										<TableCell className="px-2 py-1">
											キャラ名
										</TableCell>
										<TableCell className="px-2 py-1">
											<Input
												type="text"
												value={charaData.characterName}
												onChange={(e) =>
													setCharacterData(
														"characterName",
														e.target.value
													)
												}
												className="w-45"
												maxLength="10"
											/>
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className="px-2 py-1">
											<Label className="w-full">
												<Checkbox
													checked={
														outputContent.charalevel
													}
													onCheckedChange={(
														checked
													) =>
														setOutputContent({
															...outputContent,
															charalevel: checked,
														})
													}
													className="align-center m-auto"
												/>
											</Label>
										</TableCell>
										<TableCell className="px-2 py-1">
											レベル・究極強化
										</TableCell>
										<TableCell className="px-2 py-1 text-left">
											<Input
												type="number"
												value={charaData.charalevel}
												max="200"
												min="1"
												onChange={(e) =>
													setCharacterData(
														"charalevel",
														parseInt(
															e.target.value != ""
																? e.target.value
																: 200
														)
													)
												}
												className="w-20 inline-block"
											/>
											<span className="m-1">☆</span>
											<Input
												type="number"
												value={charaData.stars}
												max="6"
												min="0"
												checked={charaData.stars}
												onChange={(e) =>
													setCharacterData(
														"stars",
														parseInt(
															e.target.value != ""
																? e.target.value
																: 0
														)
													)
												}
												className="w-20 inline-block"
											/>
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className="px-2 py-1">
											<Label className="w-full">
												<Checkbox
													checked={
														outputContent.characterType
													}
													onCheckedChange={(
														checked
													) =>
														setOutputContent({
															...outputContent,
															characterType:
																checked,
														})
													}
													className="align-center m-auto"
												/>
											</Label>
										</TableCell>
										<TableCell className="px-2 py-1">
											キャラタイプ
										</TableCell>
										<TableCell className="px-2 py-1">
											<Select
												defeultValue="-1"
												value={charaData.characterType}
												onValueChange={(value) =>
													setCharacterData(
														"characterType",
														parseInt(value)
													)
												}
												className="w-full"
											>
												<SelectTrigger className="w-40">
													<SelectValue placeholder="キャラタイプを選択" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value={-1}>
														未設定
													</SelectItem>
													{jobs.map((job, index) => (
														<SelectItem
															value={index}
														>
															{job.charaname}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</TableCell>
									</TableRow>
									{charaData.characterType !== -1 && (
										<TableRow>
											<TableCell className="px-2 py-1">
												<Label className="w-full">
													<Checkbox
														disabled={
															!outputContent.characterType
														}
														checked={
															outputContent.characterType &&
															outputContent.hiden
														}
														onCheckedChange={(
															checked
														) =>
															setOutputContent({
																...outputContent,
																hiden: checked,
															})
														}
														className="align-center m-auto"
													/>
												</Label>
											</TableCell>
											<TableCell className="px-2 py-1">
												秘伝
											</TableCell>
											<TableCell className="px-2 py-1">
												<Select
													value={charaData.hiden}
													onValueChange={(value) =>
														setCharacterData(
															"hiden",
															parseInt(value)
														)
													}
													className="w-full"
												>
													<SelectTrigger className="w-40">
														<SelectValue placeholder="秘伝を選択" />
													</SelectTrigger>
													<SelectContent>
														{jobs[
															charaData
																.characterType
														].hiden.map(
															(hiden, index) => (
																<SelectItem
																	value={
																		index
																	}
																	key={
																		"hiden-" +
																		index
																	}
																>
																	{hiden}
																</SelectItem>
															)
														)}
													</SelectContent>
												</Select>
											</TableCell>
										</TableRow>
									)}
									<TableRow>
										<TableCell className="px-2 py-1">
											<Label className="w-full">
												<Checkbox
													checked={
														outputContent.remain
													}
													onCheckedChange={(
														checked
													) =>
														setOutputContent({
															...outputContent,
															remain: checked,
														})
													}
													className="align-center m-auto"
												/>
											</Label>
										</TableCell>
										<TableCell className="px-2 py-1">
											余りポイント
										</TableCell>
										<TableCell className="px-2 py-1">
											<Select
												value={charaData.remain}
												onValueChange={(value) =>
													setCharacterData(
														"remain",
														parseInt(value)
													)
												}
												className="w-full"
											>
												<SelectTrigger className="w-50">
													<SelectValue placeholder="余りポイントを選択" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value={-1}>
														キャラタイプと同じ
													</SelectItem>
													{jobs.map((job, index) => (
														<SelectItem
															value={index}
														>
															{job.jobname}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className="px-2 py-1">
											<Label className="w-full">
												<Checkbox
													checked={
														outputContent.weapon
													}
													onCheckedChange={(
														checked
													) =>
														setOutputContent({
															...outputContent,
															weapon: checked,
														})
													}
													className="align-center m-auto"
												/>
											</Label>
										</TableCell>
										<TableCell className="px-2 py-1">
											武器
										</TableCell>
										<TableCell className="px-2 py-1 text-left">
											<Popover
												open={isWeaponMenuOpen}
												onOpenChange={setWeaponMenuOpen}
											>
												<PopoverTrigger asChild>
													<Button
														variant="outline"
														role="combobox"
														aria-expanded={
															isWeaponMenuOpen
														}
														className="w-40 justify-between bg-cyan-50 text-gray-800"
													>
														{charaData.weapon === -1
															? "未設定"
															: weapons.find(
																	(w) =>
																		w.id ==
																		charaData.weapon
															  ).name}
													</Button>
												</PopoverTrigger>
												<PopoverContent className="w-80">
													<Command>
														<CommandInput placeholder="武器を検索..." />
														<CommandList>
															<CommandEmpty>
																武器が見つかりません
															</CommandEmpty>
															<CommandGroup>
																{weapons
																	.filter(
																		(w) =>
																			showAllWeapons
																				? w
																				: w.special
																	)
																	.map(
																		(
																			weapon,
																			index
																		) => (
																			<CommandItem
																				key={
																					"weapon-" +
																					index
																				}
																				value={
																					weapon.name
																				}
																				onSelect={(
																					name
																				) => {
																					const value =
																						weapons.find(
																							(
																								o
																							) =>
																								o.name ===
																								name
																						)
																							?.id ||
																						-1;
																					setCharacterData(
																						"weapon",
																						parseInt(
																							value
																						)
																					);
																					setWeaponMenuOpen(
																						false
																					);
																				}}
																				className="cursor-pointer"
																			>
																				{
																					weapon.name
																				}
																			</CommandItem>
																		)
																	)}
															</CommandGroup>
														</CommandList>
													</Command>
												</PopoverContent>
											</Popover>
											<Label className="inline-block m-1">
												<Checkbox
													checked={showAllWeapons}
													onCheckedChange={(
														checked
													) =>
														setShowAllWeapons(
															checked
														)
													}
													className="m-1"
												/>
												全表示
											</Label>
										</TableCell>
									</TableRow>
									{charaData.weapon !== -1 && (
										<>
											<TableRow>
												<TableCell className="px-2 py-1">
													<Label className="w-full">
														<Checkbox
															checked={
																outputContent.weapon
															}
															onCheckedChange={(
																checked
															) =>
																setOutputContent(
																	{
																		...outputContent,
																		weapon: checked,
																	}
																)
															}
															className="align-center m-auto"
														/>
													</Label>
												</TableCell>
												<TableCell className="px-2 py-1">
													OP
												</TableCell>
												<TableCell className="px-2 py-1 text-left">
													<Popover
														open={
															isWeaponOption0MenuOpen
														}
														onOpenChange={
															setWeaponOption0MenuOpen
														}
													>
														<PopoverTrigger asChild>
															<Button
																variant="outline"
																role="combobox"
																aria-expanded={
																	isWeaponOption0MenuOpen
																}
																className="w-25 justify-between bg-cyan-50 text-gray-800"
															>
																{charaData.weaponOption0 ===
																-1
																	? "未設定"
																	: options[0].find(
																			(
																				o
																			) =>
																				o.id ==
																				charaData.weaponOption0
																	  ).name}
															</Button>
														</PopoverTrigger>
														<PopoverContent className="w-80">
															<Command>
																<CommandInput placeholder="武具OPを検索..." />
																<CommandList>
																	<CommandEmpty>
																		見つかりません
																	</CommandEmpty>
																	<CommandGroup>
																		{options[0]
																			.filter(
																				(
																					w
																				) =>
																					showAllOptions
																						? w
																						: w.level ==
																						  5
																			)
																			.map(
																				(
																					option,
																					index
																				) => (
																					<CommandItem
																						key={
																							"weapon-option0-" +
																							index
																						}
																						value={
																							option.name
																						}
																						onSelect={(
																							name
																						) => {
																							const value =
																								options[0].find(
																									(
																										o
																									) =>
																										o.name ===
																										name
																								)
																									?.id ||
																								-1;
																							setCharacterData(
																								"weaponOption0",
																								parseInt(
																									value
																								)
																							);
																							setWeaponOption0MenuOpen(
																								false
																							);
																						}}
																						className="cursor-pointer"
																					>
																						{
																							option.name
																						}
																					</CommandItem>
																				)
																			)}
																	</CommandGroup>
																</CommandList>
															</Command>
														</PopoverContent>
													</Popover>
													<Popover
														open={
															isWeaponOption1MenuOpen
														}
														onOpenChange={
															setWeaponOption1MenuOpen
														}
													>
														<PopoverTrigger asChild>
															<Button
																variant="outline"
																role="combobox"
																aria-expanded={
																	isWeaponOption1MenuOpen
																}
																className="w-25 justify-between bg-cyan-50 text-gray-800"
															>
																{charaData.weaponOption1 ===
																-1
																	? "未設定"
																	: options[0].find(
																			(
																				o
																			) =>
																				o.id ==
																				charaData.weaponOption1
																	  ).name}
															</Button>
														</PopoverTrigger>
														<PopoverContent className="w-80">
															<Command>
																<CommandInput placeholder="武具OPを検索..." />
																<CommandList>
																	<CommandEmpty>
																		見つかりません
																	</CommandEmpty>
																	<CommandGroup>
																		{options[0]
																			.filter(
																				(
																					w
																				) =>
																					showAllOptions
																						? w
																						: w.level ==
																						  5
																			)
																			.map(
																				(
																					option,
																					index
																				) => (
																					<CommandItem
																						key={
																							"weapon-option1-" +
																							index
																						}
																						value={
																							option.name
																						}
																						onSelect={(
																							name
																						) => {
																							const value =
																								options[0].find(
																									(
																										o
																									) =>
																										o.name ===
																										name
																								)
																									?.id ||
																								-1;
																							setCharacterData(
																								"weaponOption1",
																								parseInt(
																									value
																								)
																							);
																							setWeaponOption1MenuOpen(
																								false
																							);
																						}}
																						className="cursor-pointer"
																					>
																						{
																							option.name
																						}
																					</CommandItem>
																				)
																			)}
																	</CommandGroup>
																</CommandList>
															</Command>
														</PopoverContent>
													</Popover>
													<Popover
														open={
															isWeaponOption2MenuOpen
														}
														onOpenChange={
															setWeaponOption2MenuOpen
														}
													>
														<PopoverTrigger asChild>
															<Button
																variant="outline"
																role="combobox"
																aria-expanded={
																	isWeaponOption2MenuOpen
																}
																className="w-25 justify-between bg-cyan-50 text-gray-800"
															>
																{charaData.weaponOption2 ===
																-1
																	? "未設定"
																	: options[0].find(
																			(
																				o
																			) =>
																				o.id ==
																				charaData.weaponOption2
																	  ).name}
															</Button>
														</PopoverTrigger>
														<PopoverContent className="w-80">
															<Command>
																<CommandInput placeholder="武具OPを検索..." />
																<CommandList>
																	<CommandEmpty>
																		見つかりません
																	</CommandEmpty>
																	<CommandGroup>
																		{options[0]
																			.filter(
																				(
																					w
																				) =>
																					showAllOptions
																						? w
																						: w.level ==
																						  5
																			)
																			.map(
																				(
																					option,
																					index
																				) => (
																					<CommandItem
																						key={
																							"weapon-option2-" +
																							index
																						}
																						value={
																							option.name
																						}
																						onSelect={(
																							name
																						) => {
																							const value =
																								options[0].find(
																									(
																										o
																									) =>
																										o.name ===
																										name
																								)
																									?.id ||
																								-1;
																							setCharacterData(
																								"weaponOption2",
																								parseInt(
																									value
																								)
																							);
																							setWeaponOption2MenuOpen(
																								false
																							);
																						}}
																						className="cursor-pointer"
																					>
																						{
																							option.name
																						}
																					</CommandItem>
																				)
																			)}
																	</CommandGroup>
																</CommandList>
															</Command>
														</PopoverContent>
													</Popover>
													<Label className="inline-block m-1">
														<Checkbox
															checked={
																showAllOptions
															}
															onCheckedChange={(
																checked
															) =>
																setShowAllOptions(
																	checked
																)
															}
															className="m-1"
														/>
														全表示
													</Label>
												</TableCell>
											</TableRow>
											<TableRow>
												<TableCell className="px-2 py-1">
													<Label className="w-full">
														<Checkbox
															checked={
																outputContent.weapon
															}
															onCheckedChange={(
																checked
															) =>
																setOutputContent(
																	{
																		...outputContent,
																		weapon: checked,
																	}
																)
															}
															className="align-center m-auto"
														/>
													</Label>
												</TableCell>
												<TableCell className="px-2 py-1">
													鍛冶
												</TableCell>
												<TableCell className="px-2 py-1 text-left">
													pow:
													<Input
														type="number"
														readOnly={
															!weapons.find(
																(w) =>
																	w.id ==
																	charaData.weapon
															).makeable
														}
														value={
															charaData.weaponPow
														}
														onChange={(e) =>
															setCharacterData(
																"weaponPow",
																parseInt(
																	e.target
																		.value !=
																		""
																		? e
																				.target
																				.value
																		: weapons.find(
																				(
																					w
																				) =>
																					w.id ==
																					charaData.weapon
																		  )
																				?.pow ??
																				0
																)
															)
														}
														className="w-20 m-1 inline-block"
													/>
													+
													<Input
														type="number"
														value={
															charaData.weaponPowPlus
														}
														onChange={(e) =>
															setCharacterData(
																"weaponPowPlus",
																parseInt(
																	e.target
																		.value !=
																		""
																		? e
																				.target
																				.value
																		: 0
																)
															)
														}
														className="w-20 inline-block"
													/>
													<span className="m-1">
														={" "}
														{charaData.weaponPow +
															charaData.weaponPowPlus}
													</span>
													<br />
													def:
													<Input
														type="number"
														readOnly={
															!weapons.find(
																(w) =>
																	w.id ==
																	charaData.weapon
															).makeable
														}
														value={
															charaData.weaponDef
														}
														onChange={(e) =>
															setCharacterData(
																"weaponDef",
																parseInt(
																	e.target
																		.value !=
																		""
																		? e
																				.target
																				.value
																		: weapons.find(
																				(
																					w
																				) =>
																					w.id ==
																					charaData.weapon
																		  )
																				?.def ??
																				0
																)
															)
														}
														className="w-20 m-1 inline-block"
													/>
													+
													<Input
														type="number"
														value={
															charaData.weaponDefPlus
														}
														onChange={(e) =>
															setCharacterData(
																"weaponDefPlus",
																parseInt(
																	e.target
																		.value !=
																		""
																		? e
																				.target
																				.value
																		: 0
																)
															)
														}
														className="w-20 inline-block"
													/>
													<span className="m-1">
														={" "}
														{charaData.weaponDef +
															charaData.weaponDefPlus}
													</span>
													<br />
													tec:
													<Input
														type="number"
														readOnly={
															!weapons.find(
																(w) =>
																	w.id ==
																	charaData.weapon
															).makeable
														}
														value={
															charaData.weaponTec
														}
														onChange={(e) =>
															setCharacterData(
																"weaponTec",
																parseInt(
																	e.target
																		.value !=
																		""
																		? e
																				.target
																				.value
																		: weapons.find(
																				(
																					w
																				) =>
																					w.id ==
																					charaData.weapon
																		  )
																				?.tec ??
																				0
																)
															)
														}
														className="w-20 m-1 inline-block"
													/>
													+
													<Input
														type="number"
														value={
															charaData.weaponTecPlus
														}
														onChange={(e) =>
															setCharacterData(
																"weaponTecPlus",
																parseInt(
																	e.target
																		.value !=
																		""
																		? e
																				.target
																				.value
																		: 0
																)
															)
														}
														className="w-20 inline-block"
													/>
													<span className="m-1">
														={" "}
														{charaData.weaponTec +
															charaData.weaponTecPlus}{" "}
													</span>
												</TableCell>
											</TableRow>
										</>
									)}
									<TableRow>
										<TableCell className="px-2 py-1">
											<Label className="w-full">
												<Checkbox
													checked={
														outputContent.stone
													}
													onCheckedChange={(
														checked
													) =>
														setOutputContent({
															...outputContent,
															stone: checked,
														})
													}
													className="align-center m-auto"
												/>
											</Label>
										</TableCell>
										<TableCell className="px-2 py-1">
											護石
										</TableCell>
										<TableCell className="px-2 py-1 text-left">
											<Popover
												open={isWeaponOption3MenuOpen}
												onOpenChange={
													setWeaponOption3MenuOpen
												}
											>
												<PopoverTrigger asChild>
													<Button
														variant="outline"
														role="combobox"
														aria-expanded={
															isWeaponOption3MenuOpen
														}
														className="w-25 justify-between bg-cyan-50 text-gray-800"
													>
														{charaData.weaponOption3 ===
														-1
															? "未設定"
															: options[1].find(
																	(o) =>
																		o.id ==
																		charaData.weaponOption3
															  ).name}
													</Button>
												</PopoverTrigger>
												<PopoverContent className="w-80">
													<Command>
														<CommandInput placeholder="護石OPを検索..." />
														<CommandList>
															<CommandEmpty>
																見つかりません
															</CommandEmpty>
															<CommandGroup>
																{options[1]
																	.filter(
																		(w) =>
																			showAllOptions
																				? w
																				: w.level ==
																				  4
																	)
																	.map(
																		(
																			option,
																			index
																		) => (
																			<CommandItem
																				key={
																					"weapon-option3-" +
																					index
																				}
																				value={
																					option.name
																				}
																				onSelect={(
																					name
																				) => {
																					const value =
																						options[1].find(
																							(
																								o
																							) =>
																								o.name ===
																								name
																						)
																							?.id ||
																						-1;
																					setCharacterData(
																						"weaponOption3",
																						parseInt(
																							value
																						)
																					);
																					setWeaponOption3MenuOpen(
																						false
																					);
																				}}
																				className="cursor-pointer"
																			>
																				{
																					option.name
																				}
																			</CommandItem>
																		)
																	)}
															</CommandGroup>
														</CommandList>
													</Command>
												</PopoverContent>
											</Popover>
											<Popover
												open={isWeaponOption4MenuOpen}
												onOpenChange={
													setWeaponOption4MenuOpen
												}
											>
												<PopoverTrigger asChild>
													<Button
														variant="outline"
														role="combobox"
														aria-expanded={
															isWeaponOption4MenuOpen
														}
														className="w-25 justify-between bg-cyan-50 text-gray-800"
													>
														{charaData.weaponOption4 ===
														-1
															? "未設定"
															: options[1].find(
																	(o) =>
																		o.id ==
																		charaData.weaponOption4
															  ).name}
													</Button>
												</PopoverTrigger>
												<PopoverContent className="w-80">
													<Command>
														<CommandInput placeholder="護石OPを検索..." />
														<CommandList>
															<CommandEmpty>
																見つかりません
															</CommandEmpty>
															<CommandGroup>
																{options[1]
																	.filter(
																		(w) =>
																			showAllOptions
																				? w
																				: w.level ==
																				  4
																	)
																	.map(
																		(
																			option,
																			index
																		) => (
																			<CommandItem
																				key={
																					"weapon-option4-" +
																					index
																				}
																				value={
																					option.name
																				}
																				onSelect={(
																					name
																				) => {
																					const value =
																						options[1].find(
																							(
																								o
																							) =>
																								o.name ===
																								name
																						)
																							?.id ||
																						-1;
																					setCharacterData(
																						"weaponOption4",
																						parseInt(
																							value
																						)
																					);
																					setWeaponOption4MenuOpen(
																						false
																					);
																				}}
																				className="cursor-pointer"
																			>
																				{
																					option.name
																				}
																			</CommandItem>
																		)
																	)}
															</CommandGroup>
														</CommandList>
													</Command>
												</PopoverContent>
											</Popover>
											<Popover
												open={isWeaponOption5MenuOpen}
												onOpenChange={
													setWeaponOption5MenuOpen
												}
											>
												<PopoverTrigger asChild>
													<Button
														variant="outline"
														role="combobox"
														aria-expanded={
															isWeaponOption5MenuOpen
														}
														className="w-25 justify-between bg-cyan-50 text-gray-800"
													>
														{charaData.weaponOption5 ===
														-1
															? "未設定"
															: options[1].find(
																	(o) =>
																		o.id ==
																		charaData.weaponOption5
															  ).name}
													</Button>
												</PopoverTrigger>
												<PopoverContent className="w-80">
													<Command>
														<CommandInput placeholder="護石OPを検索..." />
														<CommandList>
															<CommandEmpty>
																見つかりません
															</CommandEmpty>
															<CommandGroup>
																{options[1]
																	.filter(
																		(w) =>
																			showAllOptions
																				? w
																				: w.level ==
																				  4
																	)
																	.map(
																		(
																			option,
																			index
																		) => (
																			<CommandItem
																				key={
																					"weapon-option5-" +
																					index
																				}
																				value={
																					option.name
																				}
																				onSelect={(
																					name
																				) => {
																					const value =
																						options[1].find(
																							(
																								o
																							) =>
																								o.name ===
																								name
																						)
																							?.id ||
																						-1;
																					setCharacterData(
																						"weaponOption5",
																						parseInt(
																							value
																						)
																					);
																					setWeaponOption5MenuOpen(
																						false
																					);
																				}}
																				className="cursor-pointer"
																			>
																				{
																					option.name
																				}
																			</CommandItem>
																		)
																	)}
															</CommandGroup>
														</CommandList>
													</Command>
												</PopoverContent>
											</Popover>
											<Label className="inline-block m-1">
												<Checkbox
													checked={showAllOptions}
													onCheckedChange={(
														checked
													) =>
														setShowAllOptions(
															checked
														)
													}
													className="m-1"
												/>
												全表示
											</Label>
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className="px-2 py-1">
											<Label className="w-full">
												<Checkbox
													checked={
														outputContent.bonus
													}
													onCheckedChange={(
														checked
													) =>
														setOutputContent({
															...outputContent,
															bonus: checked,
														})
													}
													className="align-center m-auto"
												/>
											</Label>
										</TableCell>
										<TableCell className="px-2 py-1">
											ボーナス
											<br />
											(残：
											{charaData.charalevel * 3 -
												(charaData.bonusPow +
													charaData.bonusDef +
													charaData.bonusTec)}
											)
										</TableCell>
										<TableCell className="px-2 py-1 text-left">
											POW
											<div className="m-1">
												<Button
													className="bg-sky-700 text-white hover:bg-sky-600"
													onClick={() =>
														setCharacterData(
															"bonusPow",
															charaData.charalevel *
																3,
															true
														)
													}
												>
													MAX
												</Button>
												{!isMobile && (
													<Button
														className="bg-sky-600 text-white hover:bg-sky-500"
														onClick={() =>
															setCharacterData(
																"bonusPow",
																100,
																true
															)
														}
													>
														100
													</Button>
												)}
												<Button
													className="bg-sky-500 text-white hover:bg-sky-400"
													onClick={() =>
														setCharacterData(
															"bonusPow",
															10,
															true
														)
													}
												>
													10
												</Button>
												<Button
													className="bg-sky-400 text-white hover:bg-sky-300"
													onClick={() =>
														setCharacterData(
															"bonusPow",
															1,
															true
														)
													}
												>
													1
												</Button>
												<Input
													type="number"
													value={charaData.bonusPow}
													onChange={(e) =>
														setCharacterData(
															"bonusPow",
															parseInt(
																e.target
																	.value != ""
																	? e.target
																			.value
																	: 0
															)
														)
													}
													className="w-20 inline-block m-1"
												/>
												<Button
													className="bg-rose-400 text-white hover:bg-rose-300"
													onClick={() =>
														setCharacterData(
															"bonusPow",
															-1,
															true
														)
													}
												>
													-1
												</Button>
												<Button
													className="bg-rose-500 text-white hover:bg-rose-400"
													onClick={() =>
														setCharacterData(
															"bonusPow",
															-10,
															true
														)
													}
												>
													-10
												</Button>
												{!isMobile && (
													<Button
														className="bg-rose-600 text-white hover:bg-rose-500"
														onClick={() =>
															setCharacterData(
																"bonusPow",
																-100,
																true
															)
														}
													>
														-100
													</Button>
												)}
												<Button
													className="bg-rose-700 text-white hover:bg-rose-600"
													onClick={() =>
														setCharacterData(
															"bonusPow",
															-Infinity,
															true
														)
													}
												>
													R
												</Button>
											</div>
											DEF
											<div className="m-1">
												<Button
													className="bg-sky-700 text-white hover:bg-sky-600"
													onClick={() =>
														setCharacterData(
															"bonusDef",
															charaData.charalevel *
																3,
															true
														)
													}
												>
													MAX
												</Button>
												{!isMobile && (
													<Button
														className="bg-sky-600 text-white hover:bg-sky-500"
														onClick={() =>
															setCharacterData(
																"bonusDef",
																100,
																true
															)
														}
													>
														100
													</Button>
												)}
												<Button
													className="bg-sky-500 text-white hover:bg-sky-400"
													onClick={() =>
														setCharacterData(
															"bonusDef",
															10,
															true
														)
													}
												>
													10
												</Button>
												<Button
													className="bg-sky-400 text-white hover:bg-sky-300"
													onClick={() =>
														setCharacterData(
															"bonusDef",
															1,
															true
														)
													}
												>
													1
												</Button>
												<Input
													type="number"
													value={charaData.bonusDef}
													onChange={(e) =>
														setCharacterData(
															"bonusDef",
															parseInt(
																e.target
																	.value != ""
																	? e.target
																			.value
																	: 0
															)
														)
													}
													className="w-20 inline-block m-1"
												/>
												<Button
													className="bg-rose-400 text-white hover:bg-rose-300"
													onClick={() =>
														setCharacterData(
															"bonusDef",
															-1,
															true
														)
													}
												>
													-1
												</Button>
												<Button
													className="bg-rose-500 text-white hover:bg-rose-400"
													onClick={() =>
														setCharacterData(
															"bonusDef",
															-10,
															true
														)
													}
												>
													-10
												</Button>
												{!isMobile && (
													<Button
														className="bg-rose-600 text-white hover:bg-rose-500"
														onClick={() =>
															setCharacterData(
																"bonusDef",
																-100,
																true
															)
														}
													>
														-100
													</Button>
												)}
												<Button
													className="bg-rose-700 text-white hover:bg-rose-600"
													onClick={() =>
														setCharacterData(
															"bonusDef",
															-Infinity,
															true
														)
													}
												>
													R
												</Button>
											</div>
											TEC
											<div className="m-1">
												<Button
													className="bg-sky-700 text-white hover:bg-sky-600"
													onClick={() =>
														setCharacterData(
															"bonusTec",
															charaData.charalevel *
																3,
															true
														)
													}
												>
													MAX
												</Button>
												{!isMobile && (
													<Button
														className="bg-sky-600 text-white hover:bg-sky-500"
														onClick={() =>
															setCharacterData(
																"bonusTec",
																100,
																true
															)
														}
													>
														100
													</Button>
												)}
												<Button
													className="bg-sky-500 text-white hover:bg-sky-400"
													onClick={() =>
														setCharacterData(
															"bonusTec",
															10,
															true
														)
													}
												>
													10
												</Button>
												<Button
													className="bg-sky-400 text-white hover:bg-sky-300"
													onClick={() =>
														setCharacterData(
															"bonusTec",
															1,
															true
														)
													}
												>
													1
												</Button>
												<Input
													type="number"
													value={charaData.bonusTec}
													onChange={(e) =>
														setCharacterData(
															"bonusTec",
															parseInt(
																e.target
																	.value != ""
																	? e.target
																			.value
																	: 0
															)
														)
													}
													className="w-20 inline-block m-1"
												/>
												<Button
													className="bg-rose-400 text-white hover:bg-rose-300"
													onClick={() =>
														setCharacterData(
															"bonusTec",
															-1,
															true
														)
													}
												>
													-1
												</Button>
												<Button
													className="bg-rose-500 text-white hover:bg-rose-400"
													onClick={() =>
														setCharacterData(
															"bonusTec",
															-10,
															true
														)
													}
												>
													-10
												</Button>
												{!isMobile && (
													<Button
														className="bg-rose-600 text-white hover:bg-rose-500"
														onClick={() =>
															setCharacterData(
																"bonusTec",
																-100,
																true
															)
														}
													>
														-100
													</Button>
												)}
												<Button
													className="bg-rose-700 text-white hover:bg-rose-600"
													onClick={() =>
														setCharacterData(
															"bonusTec",
															-Infinity,
															true
														)
													}
												>
													R
												</Button>
											</div>
										</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</div>
					) : mode == "output" ? (
						<div>
							<h2 className="text-xl m-3">出力</h2>
							<h3>スレ用</h3>
							<Textarea
								readOnly
								value={output[0]}
								className="w-5/6 mx-auto h-50 resize-none"
							/>
							<h3>チャット用(短縮)</h3>
							<Textarea
								readOnly
								value={output[1]}
								className="w-5/6 mx-auto h-10 resize-none"
							/>
							<h3>JSON</h3>
							<Textarea
								readOnly
								value={output[2]}
								className="w-5/6 mx-auto h-20 resize-none"
							/>
						</div>
					) : mode == "other" ? (
						<div className="w-5/6 mx-auto">
							<h2 className="text-xl m-3">その他</h2>
							<h3>JSON取り込み</h3>
							<Textarea
								value={inputJson}
								onChange={(e) => setInputJson(e.target.value)}
								className="w-2/3 left-1/2 -translate-x-1/2 h-45 resize-none absolute"
							/>
							<Button
								className="relative top-50"
								onClick={handleJsonImport}
							>
								取り込み
							</Button>
						</div>
					) : (
						<></>
					)}
				</SidebarInset>
			</SidebarProvider>
		</div>
	);
}

export default CharaCalc;
