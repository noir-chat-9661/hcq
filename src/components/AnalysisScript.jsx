import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
	Download,
	FileText,
	AlertCircle,
	CheckCircle2,
	Play,
	Loader2,
	Code,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

const DeobfuscatorTool = () => {
	const [code, setCode] = useState("");
	const [processedCode, setProcessedCode] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);
	const [status, setStatus] = useState("ready");
	const [progress, setProgress] = useState(0);
	const [prettierLoaded, setPrettierLoaded] = useState(false);
	const [stringArray, setStringArray] = useState([]);
	const [obfuscatedFunctionName, setObfuscatedFunctionName] = useState("");

	// Prettierライブラリの動的読み込み
	const loadPrettier = async () => {
		if (window.prettier) {
			setPrettierLoaded(true);
			return;
		}

		try {
			await loadScript("https://unpkg.com/prettier@3.5.3/standalone.js");
			await loadScript(
				"https://unpkg.com/prettier@3.5.3/plugins/babel.js"
			);
			await loadScript(
				"https://unpkg.com/prettier@3.5.3/plugins/estree.js"
			);

			await new Promise((resolve) => setTimeout(resolve, 100));

			if (window.prettier) {
				setPrettierLoaded(true);
			} else {
				throw new Error("Prettier failed to load");
			}
		} catch {
			setStatus("error");
			toast.error("必要なパッケージの読み込みに失敗しました。");
		}
	};

	// スクリプトの動的読み込み関数
	const loadScript = (src) => {
		return new Promise((resolve, reject) => {
			const script = document.createElement("script");
			script.src = src;
			script.onload = resolve;
			script.onerror = reject;
			document.head.appendChild(script);
		});
	};

	// 文字列配列を解析して抽出
	const extractStringArray = (code) => {
		try {
			// 文字列配列の定義を探す (例: var _0x1234 = ['string1', 'string2', ...])
			const arrayMatch = code.match(
				/var (_0x[a-f0-9]+) = (\[\n(\t+"[^"]+",?\n)+\t*\])/
			);
			if (!arrayMatch) {
				throw new Error("String array not found");
			}

			const arrayString = arrayMatch[2].replaceAll(/\s/g, "");
			
			// 配列の内容を解析
			let strings = [];
			try {
				// 安全に配列を解析
				strings = JSON.parse(arrayString);
			} catch {
				// JSONパースに失敗した場合は正規表現で抽出
				const stringMatches = arrayString.match(
					/'([^'\\]|\\.)*'|"([^"\\]|\\.)*"/g
				);
				if (stringMatches) {
					strings = stringMatches.map((s) => s.slice(1, -1));
				}
			}

			setStringArray(strings);
			return { strings };
		} catch (err) {
			throw new Error("Failed to extract string array: " + err.message);
		}
	};

	// シフト関数を解析（配列の回転処理）
	const extractShiftFunction = (code, strings) => {
		try {
			// シフト関数のパターンを探す
			const offset = code.match(/\$\[_0x[0-9a-f]+\(0x([0-9a-f]+)\)\]\(\{\s+type:/)[1];

			return { shiftAmount: strings.indexOf("ajax") - parseInt(offset, 16) };
		} catch {
			return 0;
		}
	};

	// 文字列を復元する関数
	const decodeString = (index, strings, shiftAmount = 0) => {
		try {
			const actualIndex = index + shiftAmount;
			return strings.at(actualIndex) || "";
		} catch {
			return `/* DECODE_ERROR_${index} */`;
		}
	};

	// 難読化された文字列呼び出しを復元
	const deobfuscateStrings = (code, fName, strings, shiftAmount) => {
		try {
			// _0x1234(0x123) のパターンを探して置換
			const functionCallRegex = new RegExp(
				`${fName}\\s*\\(\\s*(0x[a-f0-9]+)\\s*\\)`,
				"g"
			);

			const deobfuscatedCode = code.replace(
				functionCallRegex,
				(match, hexIndex) => {
					const index = parseInt(hexIndex, 16);
					const decodedString = decodeString(
						index,
						strings,
						shiftAmount
					);
					// 文字列をエスケープしてJavaScriptリテラルとして安全に埋め込む
					return JSON.stringify(decodedString);
				}
			);
			return removeObfuscationFunctions(deobfuscatedCode, fName);
		} catch (err) {
			throw new Error("Failed to deobfuscate strings: " + err.message);
		}
	};

	// ブラケット記法を ドット記法に変換
	const convertBracketNotation = (code) => {
		try {
			// obj['property'] を obj.property に変換
			return code.replace(/\[(['"])([\w$]+)\1\]/g, ".$2");
		} catch {
			return code;
		}
	};

	// 不要な関数定義を削除
	const removeObfuscationFunctions = (code, functionName) => {
		try {
			// 文字列配列定義1
			const arrayDefRegex = new RegExp(
				`\\s*var _0x[0-9a-f]+ = ${functionName};`,
				"g"
			);
			code = code.replace(arrayDefRegex, "");
			// 文字列配列定義2
			const arrayDef2Regex = new RegExp(
				`_0x[0-9a-f]+ = ${functionName},\\s*`,
				"g"
			);
			code = code.replace(arrayDef2Regex, "");
			
			// 空行を整理
			code = code.replace(/\n\s*\n/g, "\n");

			return code;
		} catch {
			return code;
		}
	};

	useEffect(() => {
		const initializeApp = async () => {
			try {
				setStatus("loading");
				setProgress(10);

				// Prettierライブラリの読み込み
				await loadPrettier();
				setProgress(30);

				// hcqscript.jsを読み込む
				const response = await fetch("/files/hcqscript.js", {
					cache: "no-store",
				});

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const initialCode = await response.text();
				setProgress(70);

				// prettierで整形
				if (window.prettier && prettierLoaded) {
					const formattedCode = await window.prettier.format(
						initialCode,
						{
							parser: "babel",
							useTabs: true,
							plugins: window.prettierPlugins,
						}
					);
					setCode(formattedCode);
				} else {
					setCode(initialCode);
				}

				setProgress(100);
				setStatus("ready");
			} catch {
				toast.error("ファイルの読み込みに失敗しました。");
				setStatus("error");
				setProgress(0);
			}
		};

		initializeApp();
	}, [prettierLoaded]);

	const processCode = async () => {
		if (!code) return;

		setIsProcessing(true);
		setStatus("processing");
		setProgress(0);

		try {
			let workingCode = code;
			setProgress(10);

			const functionName = workingCode.split("\n")[0].split(" ")[3].replaceAll(/[^a-fx0-9_]/g, "");
			setObfuscatedFunctionName(functionName);

			// 1. 文字列配列を抽出
			const { strings } = extractStringArray(workingCode);
			setProgress(20);

			// 2. シフト量を取得
			const { shiftAmount } = extractShiftFunction(workingCode, strings);
			setProgress(30);
			
			// 3. 難読化された文字列を復元
			const functionNames = workingCode.match(
				new RegExp(`(_0x[0-9a-f]+)(?= \\= ${functionName})`, "g")
			);

			functionNames.forEach((fName) => {
				workingCode = deobfuscateStrings(
					workingCode,
					fName,
					strings,
					shiftAmount
				);
			})
			setProgress(60);

			// 4. ブラケット記法をドット記法に変換
			workingCode = convertBracketNotation(workingCode);
			setProgress(80);

			// 5. 不要な関数定義を削除
			workingCode = removeObfuscationFunctions(workingCode, functionName);
			setProgress(90);

			// 6. prettierで整形
			if (window.prettier && prettierLoaded) {
				workingCode = await window.prettier.format(workingCode, {
					parser: "babel",
					plugins: window.prettierPlugins,
					useTabs: true,
				});
			}

			setProcessedCode(workingCode);
			setProgress(100);
			setStatus("completed");
			toast.success("コードの処理が完了しました。");
		} catch {
			toast.error(`コードの処理に失敗しました`);
			setStatus("error");
			setProgress(0);
		} finally {
			setIsProcessing(false);
		}
	};

	const downloadCode = () => {
		if (!processedCode) return;

		const blob = new Blob([processedCode], { type: "text/javascript" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "hcqscript.js";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	const getStatusBadge = () => {
		switch (status) {
			case "loading":
				return (
					<Badge variant="secondary" className="gap-1">
						<Loader2 className="h-3 w-3 animate-spin" />
						読み込み中
					</Badge>
				);
			case "processing":
				return (
					<Badge variant="secondary" className="gap-1">
						<Loader2 className="h-3 w-3 animate-spin" />
						処理中
					</Badge>
				);
			case "completed":
				return (
					<Badge variant="default" className="gap-1 bg-green-500">
						<CheckCircle2 className="h-3 w-3" />
						完了
					</Badge>
				);
			case "error":
				return (
					<Badge variant="destructive" className="gap-1">
						<AlertCircle className="h-3 w-3" />
						エラー
					</Badge>
				);
			default:
				return (
					<Badge variant="outline" className="gap-1">
						<FileText className="h-3 w-3" />
						準備完了
					</Badge>
				);
		}
	};

	const codeStats = {
		original: code.length,
		processed: processedCode.length,
		lines: code.split("\n").length,
		processedLines: processedCode.split("\n").length,
		stringsFound: stringArray.length,
	};

	return (
		<div className="container mx-auto p-6 max-w-7xl">
			<Breadcrumb className="absolute top-3 left-5 inline-block mx-5 w-3/4">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink asChild>
							<Link to="/">トップ</Link>
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>解析ツール</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<Toaster richColors position="top-right" />
			<Card className="mb-6">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-2xl flex items-center gap-2">
								<Code className="h-6 w-6" />
								ヒマクエスクリプト難読化解除ツール
							</CardTitle>
							<CardDescription>
								このツールは、ヒマクエの難読化されたJavaScriptコードを解析するツールです。
							</CardDescription>
						</div>
						{getStatusBadge()}
					</div>
				</CardHeader>

				<CardContent>
					{(status === "loading" || status === "processing") && (
						<div className="mb-4">
							<Progress value={progress} className="w-full" />
							<p className="text-sm text-muted-foreground mt-1">
								{status === "loading"
									? "スクリプトを読み込んでいます..."
									: "解析処理をしています..."}
							</p>
						</div>
					)}

					{obfuscatedFunctionName && (
						<Alert className="mb-4">
							<FileText className="h-4 w-4" />
							<AlertDescription>
								核となる関数:
								<code className="bg-muted mx-1 px-1 rounded">
									{obfuscatedFunctionName}
								</code>
								{stringArray.length > 0 &&
									`配列のデータ数：${stringArray.length}`}
							</AlertDescription>
						</Alert>
					)}

					<div className="flex flex-wrap gap-2 mb-6">
						<Button
							onClick={processCode}
							disabled={status != "ready"}
							className="gap-2"
						>
							{isProcessing ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Play className="h-4 w-4" />
							)}
							{isProcessing
								? "処理中..."
								: "解析処理をする"}
						</Button>

						<Button
							onClick={downloadCode}
							disabled={!processedCode}
							variant="outline"
							className="gap-2"
						>
							<Download className="h-4 w-4" />
							ダウンロード
						</Button>

						{!prettierLoaded && (
							<Badge variant="outline" className="gap-1">
								<Loader2 className="h-3 w-3 animate-spin" />
								必要なパッケージを読み込んでいます...
							</Badge>
						)}
					</div>

					{(code || processedCode) && (
						<div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
							<Card>
								<CardContent className="p-4">
									<div className="text-2xl font-bold text-blue-600">
										{codeStats.original.toLocaleString()}
									</div>
									<p className="text-xs text-muted-foreground">
										ファイル文字数
									</p>
								</CardContent>
							</Card>
							<Card>
								<CardContent className="p-4">
									<div className="text-2xl font-bold text-green-600">
										{codeStats.processed.toLocaleString()}
									</div>
									<p className="text-xs text-muted-foreground">
										解読済みファイル文字数
									</p>
								</CardContent>
							</Card>
							<Card>
								<CardContent className="p-4">
									<div className="text-2xl font-bold text-purple-600">
										{codeStats.lines.toLocaleString()}
									</div>
									<p className="text-xs text-muted-foreground">
										ファイル行数
									</p>
								</CardContent>
							</Card>
							<Card>
								<CardContent className="p-4">
									<div className="text-2xl font-bold text-orange-600">
										{codeStats.processedLines.toLocaleString()}
									</div>
									<p className="text-xs text-muted-foreground">
										解読済みファイル行数
									</p>
								</CardContent>
							</Card>
							<Card>
								<CardContent className="p-4">
									<div className="text-2xl font-bold text-red-600">
										{codeStats.stringsFound.toLocaleString()}
									</div>
									<p className="text-xs text-muted-foreground">
										難読化対象の種類の数
									</p>
								</CardContent>
							</Card>
						</div>
					)}
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">元のファイル(整形済み)</CardTitle>
						<CardDescription>
							難読化はそのままの整形されたJavaScriptコード
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Textarea
							readOnly
							value={code}
							onChange={(e) => setCode(e.target.value)}
							placeholder="元のコード"
							className="min-h-[500px] font-mono text-sm resize-none"
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-lg">
							解析済みファイル(整形済み)
						</CardTitle>
						<CardDescription>
							難読化解除されたJavaScriptコード
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Textarea
							value={processedCode}
							readOnly
							placeholder="処理後にここにコードが表示されます..."
							className="min-h-[500px] font-mono text-sm resize-none bg-muted/30"
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default DeobfuscatorTool;
