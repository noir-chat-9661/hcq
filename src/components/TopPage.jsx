import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	Accordion,
	AccordionItem,
	AccordionContent,
	AccordionTrigger,
} from "@radix-ui/react-accordion";
import { Button } from "./ui/button";
import { SquareArrowOutUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const TopPage = () => {
	const codes = [
		`javascript:(()=>{if (document.getElementById('addonwindow')?.innerHTML) return;if(this.LoadedAddonPage)return $().append(2);layercount++;$("#layerroot").append(%60<div class='layer' id='layer\${layercount}'><h2 class='sourcespace'>読み込み中</h2><button class='layerclosebtn' id='addonwindow' style='display:none' onclick='myremove(this.parentNode)'>×</button></div>%60);fetch("https://addon.pjeita.top/code.js",{cache:'no-store'}).then(n=>n.text()).then(n=>eval(n))})()`,
		"javascript:fetch(%22kari_MovepointChange.php%22,%7B%20%09%09%09method:%20%22post%22,%20%09%09%09headers:%20%7B%20%22Content-Type%22:%20%22application/x-www-form-urlencoded%22%20%7D,%20body:%20%60marumie=$%7BSID%7D&seskey=$%7BSKEY%7D&px=30&py=50%60%7D)",
		"javascript:fetch(%22kari_MovepointChange.php%22,%7B%20%09%09%09method:%20%22post%22,%20%09%09%09headers:%20%7B%20%22Content-Type%22:%20%22application/x-www-form-urlencoded%22%20%7D,%20body:%20%60marumie=$%7BSID%7D&seskey=$%7BSKEY%7D&px=60&py=50%60%7D)",
		"javascript:fetch(%22kari_MovepointChange.php%22,%7B%20%09%09%09method:%20%22post%22,%20%09%09%09headers:%20%7B%20%22Content-Type%22:%20%22application/x-www-form-urlencoded%22%20%7D,%20body:%20%60marumie=$%7BSID%7D&seskey=$%7BSKEY%7D&px=50&py=50%60%7D)",
		"javascript:fetch(%22kari_MovepointChange.php%22,%7B%20%09%09%09method:%20%22post%22,%20%09%09%09headers:%20%7B%20%22Content-Type%22:%20%22application/x-www-form-urlencoded%22%20%7D,%20body:%20%60marumie=$%7BSID%7D&seskey=$%7BSKEY%7D&px=prompt('移動先のx座標を入力',%2050)&py=prompt('移動先のy座標を入力',%2050)%60%7D)",
		"javascript:fetch(%22shokuan_JobChange.php%22,%20%7Bmethod:%20%22post%22,headers:%20%7B%22Content-Type%22:%22application/x-www-form-urlencoded%22%20%7D,body:%60marumie=$%7BSID%7D&seskey=$%7BSKEY%7D&jobid=0%60%7D).then(()=%3Ealert(%22変更完了%22))",
	];
	const [copied, setCopied] = useState(new Array(codes.length).fill(0));

	const handleCopyCode = (index) => {
		navigator.clipboard.writeText(codes[index]).then(() => {
			if (copied[index]) clearTimeout(copied[index]);
			setCopied(copied.toSpliced(index, 1, setTimeout(() => setCopied(copied.toSpliced(index, 1, 0)), 2000)));
		});
	};

	return (
		<div className="absolute w-dvw h-dvh overflow-hidden bg-cyan-100 top-0 left-0">
			<div className="w-full h-25 flex flex-col items-center justify-center bg-cyan-100 fixed top-0 left-0 z-20">
				<h1 className="text-3xl font-bold absolute top-10">
					ヒマクエ補助ツール
				</h1>
			</div>
			<div className="flex flex-col items-center justify-start w-screen z-10 absolute left-0 top-20 h-[calc(100dvh-var(--spacing)*20)] p-5 overflow-y-auto">
				<Accordion collapsible className="w-19/20">
					<Card className="bg-white p-3 shadow-md m-4">
						<AccordionItem value="item-1">
							<AccordionTrigger className="w-full">
								<CardHeader>
									<h2 className="w-stretch text-2xl">
										複窓ヒマクエ
									</h2>
								</CardHeader>
							</AccordionTrigger>
							<AccordionContent className="flex flex-col gap-4 w-stretch">
								<CardContent>
									<p>
										複数のヒマクエを極力重くならないようにしながら同時に操作できるツールです。
									</p>
									<br />
									<Button className="m-1 h-10 p-3">
										<Link
											to="http://multihcq.pjeita.top/"
											target="_blank"
										>
											<SquareArrowOutUpRight className="mr-2 inline-block align-sub" />
											ページへ移動
										</Link>
									</Button>
								</CardContent>
							</AccordionContent>
						</AccordionItem>
					</Card>
				</Accordion>
				<Accordion collapsible className="w-19/20">
					<Card className="bg-white p-3 shadow-md m-4">
						<AccordionItem value="item-1">
							<AccordionTrigger className="w-full">
								<CardHeader>
									<h2 className="w-stretch text-2xl">
										計算機
									</h2>
								</CardHeader>
							</AccordionTrigger>
							<AccordionContent className="flex flex-col gap-4">
								<CardContent>
									<h3 className="w-stretch text-xl w-full">
										キャラレシピ計算機
									</h3>
									<p>キャラのレシピを出す計算機です。</p>
									<br />
									<Button className="m-1 h-10 p-3">
										<Link to="/characalc">
											キャラレシピ計算機
										</Link>
									</Button>
									<Button className="m-1 h-10 p-3">
										<Link
											to="https://remichi.blue/hcq/joblvcalc.php"
											target="_blank"
										>
											<SquareArrowOutUpRight className="mr-2 inline-block align-sub" />
											しづきさん作成版
										</Link>
									</Button>
								</CardContent>
							</AccordionContent>
						</AccordionItem>
					</Card>
				</Accordion>
				<Accordion collapsible className="w-19/20">
					<Card className="bg-white p-4 shadow-md m-4">
						<AccordionItem value="item-3">
							<AccordionTrigger className="w-full">
								<CardHeader>
									<h2 className="w-stretch text-2xl">
										アドオン
									</h2>
								</CardHeader>
							</AccordionTrigger>
							<AccordionContent className="flex flex-col gap-4">
								<CardContent>
									<p>
										ヒマクエのアドオンです。アドオンでは細かい便利機能が追加されます。
									</p>
									<p>
										ヒマクエのページを開いてから起動して読み込んでください。
									</p>
									<br />
									<p>
										ブックマークレットからアドオンを起動する場合
									</p>
									<Button
										className={`m-1 h-10 p-3${
											copied[0]
												? " bg-green-400 hover:bg-green-300"
												: ""
										}`}
										onClick={() => handleCopyCode(0)}
									>
										{copied[0] ? "✔ コピー" : "📄 コピー"}
									</Button>
									<p>専用ブラウザでアドオンを起動する場合</p>
									<Button className="m-1 h-10 p-3">
										<Link
											to="https://addon.pjeita.top/"
											target="_blank"
										>
											<SquareArrowOutUpRight className="mr-2 inline-block align-sub" />
											ダウンロードページ
										</Link>
									</Button>
								</CardContent>
							</AccordionContent>
						</AccordionItem>
					</Card>
				</Accordion>
				<Accordion collapsible className="w-19/20">
					<Card className="bg-white p-4 shadow-md m-4">
						<AccordionItem value="item-4">
							<AccordionTrigger className="w-full">
								<CardHeader>
									<h2 className="w-stretch text-2xl">
										ブックマークレット
									</h2>
								</CardHeader>
							</AccordionTrigger>
							<AccordionContent className="flex flex-col gap-4">
								<CardContent>
									<h3 className="text-xl">移動系</h3>
									<p>x:30 y:50へ移動(地帯チア法用)</p>
									<Button
										className={`m-1 h-10 p-3${
											copied[1] ? " bg-green-400 hover:bg-green-300" : ""
										}`}
										onClick={() => handleCopyCode(1)}
									>
										{copied[1] ? "✔ コピー" : "📄 コピー"}
									</Button>
									<p>x:60 y:60へ移動(地帯諸天法用)</p>
									<Button
										className={`m-1 h-10 p-3${
											copied[2] ? " bg-green-400 hover:bg-green-300" : ""
										}`}
										onClick={() => handleCopyCode(2)}
									>
										{copied[2] ? "✔ コピー" : "📄 コピー"}
									</Button>
									<p>x:50 y:50へ移動</p>
									<Button
										className={`m-1 h-10 p-3${
											copied[3] ? " bg-green-400 hover:bg-green-300" : ""
										}`}
										onClick={() => handleCopyCode(3)}
									>
										{copied[3] ? "✔ コピー" : "📄 コピー"}
									</Button>
									<p>任意座標へ移動</p>
									<Button
										className={`m-1 h-10 p-3${
											copied[4] ? " bg-green-400 hover:bg-green-300" : ""
										}`}
										onClick={() => handleCopyCode(4)}
									>
										{copied[4] ? "✔ コピー" : "📄 コピー"}
									</Button>
									<br />
									<br />
									<h3 className="text-xl">状態変更系</h3>
									<p>無職に変更</p>
									<Button
										className={`m-1 h-10 p-3${
											copied[5] ? " bg-green-400 hover:bg-green-300" : ""
										}`}
										onClick={() => handleCopyCode(5)}
									>
										{copied[5] ? "✔ コピー" : "📄 コピー"}
									</Button>
								</CardContent>
							</AccordionContent>
						</AccordionItem>
					</Card>
				</Accordion>
				<Accordion collapsible className="w-19/20">
					<Card className="bg-white p-4 shadow-md m-4">
						<AccordionItem value="item-4">
							<AccordionTrigger className="w-full">
								<CardHeader>
									<h2 className="w-stretch text-2xl">wiki</h2>
								</CardHeader>
							</AccordionTrigger>
							<AccordionContent className=" w-stretchflex flex-col gap-4">
								<CardContent>
									<p>ヒマクエの情報をまとめたwikiです。</p>
									<Button className="m-1 h-10 p-3">
										<Link
											to="https://wiki.pjeita.top/"
											target="_blank"
										>
											<SquareArrowOutUpRight className="mr-2 inline-block align-sub" />
											新wiki
										</Link>
									</Button>
									<Button className="m-1 h-10 p-3">
										<Link
											to="https://w.atwiki.jp/himachatquest/"
											target="_blank"
										>
											<SquareArrowOutUpRight className="mr-2 inline-block align-sub" />
											旧wiki
										</Link>
									</Button>
								</CardContent>
							</AccordionContent>
						</AccordionItem>
					</Card>
				</Accordion>
			</div>
		</div>
	);
};

export default TopPage;
