import { useState, useEffect } from "react";
import { useCalc } from "@/hooks/use-calc";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { skills, weapons, options, jobs, charaDataTypes, defaultCharaData } from "@/constants";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

import { useParams, Link } from "react-router-dom";
import { Loader } from "lucide-react";

function CharaData () {
	const calc = useCalc();
	const [charaName, setCharaName] = useState("");
	const [recipes, setRecipes] = useState(["", ""]);
	const [statusText, setStatusText] = useState("");
	const [additionalStatusText, setAdditionalStatusText] = useState("");
	const [loading, setLoading] = useState(true);
	const { recipeId } = useParams();

	useEffect(() => {
		const fetchRecipe = async (id) => {
			try {
				const { info, error } = await fetch("https://api.pjeita.top/hcqcalc", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ id }),
				}).then(res => res.json());
				if (error == 4) {
					toast.error("レシピが見つかりませんでした。");
					return;
				}
				const { jobPoint, charaData: d } = info;
				const pointData = jobPoint.flat().map(Number)
				const charaData = { ...defaultCharaData };
				Object.entries(d).forEach(([key, value]) => {
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
					charaData[key] = v;
				});
				const status = calc(pointData, charaData);
				const skillPoints = Array.from({length: jobs.length}).map((_, index) => {
					const points = skills
						.filter(skill => skill.jobid === index)
						.reduce((sum, skill) => sum + (pointData[skill.id] * (pointData[skill.id] + 1) / 2 * (skill.point + 1)), 0)
					if (points < 5 && charaData.characterType === index) return 5;
					return points;
				})
				console.log("Fetched recipe:", skillPoints);
				let points = [...skillPoints];
				points = points.map((p, i) => {
					if ((charaData.remain == -1 && i === charaData.characterType) || (charaData.remain != -1 && i === charaData.remain)) {
						return p + (charaData.charalevel + 4 - points.reduce((a, b) => a + b, 0));
					}
					return p;
				})
				const createOutput = (l = true) => {
					const d = []
					if (l) {
						d.push(charaData.characterName);
						if (charaData.characterType != -1) {
							d.push(`キャラ：${jobs[charaData.characterType].charaname}`);
							if (charaData.hiden) d.push(`秘伝：${jobs[charaData.characterType].hiden[charaData.hiden]}`);
						}
						if (charaData.weapon != -1) {
							const w = [];
							w.push(`武具：${weapons.find(w => w.id == charaData.weapon).name}`)
							if (charaData.weaponPow || charaData.weaponPowPlus) w.push(`pow${charaData.weaponPow}+${charaData.weaponPowPlus}`);
							if (charaData.weaponDef || charaData.weaponDefPlus) w.push(`def${charaData.weaponDef}+${charaData.weaponDefPlus}`);
							if (charaData.weaponTec || charaData.weaponTecPlus) w.push(`tec${charaData.weaponTec}+${charaData.weaponTecPlus}`);
							if (charaData.weaponOption0 != -1 || charaData.weaponOption1 != -1 || charaData.weaponOption2 != -1) w.push(Array.from({length: 3}).map((_, i) => `[${options[0].find(o => o.id == charaData[`weaponOption${i}`]).name}]`).join(""));
							d.push(w.join(" "))
						}
						if (charaData.weaponOption3 != -1 || charaData.weaponOption4 != -1 || charaData.weaponOption5 != -1)
							d.push(`護石：${Array.from({length: 3}).map((_, i) => `[${options[1].find(o => o.id == charaData[`weaponOption${i + 3}`]).name}]`).join("")}`)
						if (charaData.bonusPow + charaData.bonusDef + charaData.bonusTec) 
							d.push(`ボーナス：POW+${charaData.bonusPow} DEF+${charaData.bonusDef} TEC+${charaData.bonusTec}`)
						const s = [];
						s.push(`HP ${status.HP}`);
						s.push(`SP ${status.SP / 5 + 200} (${status.SP * 0.15 + 150})/${status.SP}`);
						s.push(`POW ${status.stars ? `${Math.floor(status.pow * (status.stars / 10 + 1))} (${status.pow})` : status.pow}`);
						s.push(`DEF ${status.stars ? `${Math.floor(status.def * (status.stars / 10 + 1))} (${status.def})` : status.def}`);
						s.push(`TEC ${status.stars ? `${Math.floor(status.tec * (status.stars / 10 + 1))} (${status.tec})` : status.tec}`);
						s.push(`攻速 ${status.as}`);
						s.push(`移動 ${status.ms}`);
						d.push(`ステータス(Lv${charaData.charalevel}${charaData.stars ? `☆${charaData.stars}` : ""})：${s.join("  ")}`)
					}
					d.push(`職lv：${points.map((p, i) => `${jobs[i].symbol}${p}${(charaData.remain != -1 && skillPoints[i] != p) ? `(余${p - skillPoints[i]})` : ""}`).join(" ")} 計${skillPoints.reduce((a, b) => a + b, 0)}`);
					d.push(`技lv：${skills.filter(s => pointData[s.id]).map(s => `${s[l ? "name" : "short_name"]}${pointData[s.id]}`).join(" ")}`);
					return d.join("\n");
				}
				setCharaName(charaData.characterName);
				setRecipes([
					createOutput(true),
					createOutput(false)
				]);
				setStatusText(
					[
						`キャラ：${jobs[charaData.characterType].charaname}`,
						`秘伝：${jobs[charaData.characterType].hiden[charaData.hiden] || "なし"}`,
						`Lv.${charaData.charalevel} ☆${charaData.stars}`,
						`HP ${status.HP} SP ${status.SP / 5 + 200}(${status.SP * 0.15 + 150})/${status.SP}`,
						`POW ${charaData.stars ? `${Math.floor(status.pow * (charaData.stars / 10 + 1))}(${status.pow})` : status.pow} DEF ${charaData.stars ? `${Math.floor(status.def * (charaData.stars / 10 + 1))}(${status.def})` : status.def} TEC ${charaData.stars ? `${Math.floor(status.tec * (charaData.stars / 10 + 1))}(${status.tec})` : status.tec}`,
						`対戦時：POW ${Math.floor(Math.sqrt(status.pow))} DEF ${Math.floor(Math.sqrt(status.def))} TEC ${Math.floor(Math.sqrt(status.tec))}`,
						`攻速 ${status.as} 移動 ${status.ms}`
					].join("\n")
				);
				setAdditionalStatusText(
					[
						`${weapons.find(w => w.id == charaData.weapon).name}${charaData.weaponPowPlus + charaData.weaponDefPlus + charaData.weaponTecPlus ? `+${charaData.weaponPowPlus + charaData.weaponDefPlus + charaData.weaponTecPlus}` : ""}`,
						`POW ${charaData.weaponPow}+${charaData.weaponPowPlus} DEF ${charaData.weaponDef}+${charaData.weaponDefPlus} TEC ${charaData.weaponTec}+${charaData.weaponTecPlus}`,
						`オプション：${Array.from({length: 3}).map((_, i) => `[${options[0].find(o => o.id == charaData[`weaponOption${i}`]).name}]`).join("")}`,
						`土の護石 ${Array.from({length: 3}).map((_, i) => `[${options[1].find(o => o.id == charaData[`weaponOption${i + 3}`]).name}]`).join("")}`,
						`ボーナスポイント：POW+${charaData.bonusPow} DEF+${charaData.bonusDef} TEC+${charaData.bonusTec}`
					].join("\n")
				);
				setLoading(false);
			} catch (error) {
				console.error("Error fetching recipe:", error);
				toast.error("レシピの取得に失敗しました。");
			}
		}
		if (recipeId) {
			fetchRecipe(recipeId);
		}
	}, []);

	return (
		recipeId ? (
			loading ? (
				<div className="w-screen h-dvh fixed left-0 top-0 flex flex-col items-center justify-center bg-gray-100">
					<Loader className="animate-spin text-blue-500" size={48} />
					<h1 className="text-2xl">Now Loadgin</h1>
				</div>
			) : (
				<div className="w-screen absolute top-0 left-0 h-dvh bg-cyan-50 p-5 overflow-y-auto">
					<Toaster position="top-right" richColors />
					<h1 className="text-3xl font-bold mb-4">
						{charaName}のキャラデータ
					</h1>
					<Accordion collapsible className="w-3/5 mb-4 mx-auto">
						<AccordionItem value="recipe">
							<AccordionTrigger className="w-19/20">
								<h2 className="text-xl mb-2 text-center">レシピ</h2>
							</AccordionTrigger>
							<AccordionContent className="flex flex-col gap-4">
								<p>スレッド用</p>
								<Textarea
									value={recipes[0]}
									readOnly
									className="w-19/20 h-40 mx-auto mb-4 resize-none"
								/>
								<Button
									className="m-1 h-10 p-3 w-40 mx-auto"
									onClick={() => {
										navigator.clipboard.writeText(recipes[0]);
										toast.success("レシピをコピーしました。");
									}}
								>
									コピー
								</Button>
								<br />
								<p>チャット用(短縮)</p>
								<Textarea
									value={recipes[1]}
									readOnly
									className="w-19/20 h-20 mx-auto mb-4 resize-none"
								/>
								<Button
									className="m-1 h-10 p-3 w-40 mx-auto"
									onClick={() => {
										navigator.clipboard.writeText(recipes[1]);
										toast.success("レシピをコピーしました。");
									}}
								>
									コピー
								</Button>
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="status">
							<AccordionTrigger className="w-19/20">
								<h2 className="text-xl mb-2 text-center">ステータス</h2>
							</AccordionTrigger>
							<AccordionContent className="flex flex-col gap-4">
								<div className="w-19/20 mx-auto mb-4">
									{statusText.split("\n").map((line, index) => (
										<p key={index} className="text-sm mb-1">
											{line}
										</p>
									))}
								</div>
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="additionalStatus">
							<AccordionTrigger className="w-full">
								<h2 className="text-xl mb-2 text-center">武具・ボーナス</h2>
							</AccordionTrigger>
							<AccordionContent className="flex flex-col gap-4">
								<div className="w-19/20 mx-auto mb-4">
									{additionalStatusText.split("\n").map((line, index) => (
										<p key={index} className="text-sm mb-1">
											{line}
										</p>
									))}
								</div>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
					<Button className="m-1 h-10 p-3 w-50" onClick={() => sessionStorage.setItem("recipeId", recipeId)}>
						<Link to="/characalc">
							キャラ計算機を開く
						</Link>
					</Button>
				</div>
			)
		) : (
			<div className="absolute left-0 top-0 flex flex-col items-center justify-center w-screen h-dvh bg-gray-100">
				<h1 className="text-4xl font-bold mb-10">
					404 - Page Not Found
				</h1>
				<p>該当するページが見つかりませんでした。</p>
				<Link to="/" className="text-blue-500 hover:underline">
					ホームに戻る
				</Link>
			</div>
		)
	);
}

export default CharaData;
