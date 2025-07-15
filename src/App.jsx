import "./App.css";
import { Routes, Route, useNavigate } from 'react-router-dom'
import TopPage from "@/components/TopPage";
import CharaCalc from "@/components/CharaCalc";
import AnalysisScript from "@/components/AnalysisScript";
import Page404 from "@/components/Page404";
import { useState, useEffect } from "react";
import { Loader } from "lucide-react";

function App() {
	const [ loading, setLoading ] = useState(true);
	const navigate = useNavigate();
	useEffect(() => {
		const path = sessionStorage.getItem("path");
		if (path) {
			sessionStorage.removeItem("path");
			if (path === "/chara_calc") 
				navigate("/characalc");
			else
				navigate(path);
			navigate(path);
		}
		setLoading(false);
	}, [])
	return (
		<>
			{
				loading ? (
					<div className="w-screen h-dvh fixed left-0 top-0 flex flex-col items-center justify-center bg-gray-100">
						<Loader className="animate-spin text-blue-500" size={48} />
						<h1 className="text-2xl">Loading...</h1>
					</div>
				) : (
					<Routes>
						<Route path="/" element={<TopPage />} />
						<Route path="/characalc" element={<CharaCalc />} />
						<Route path="/analysis" element={<AnalysisScript />} />
						<Route path="*" element={<Page404 />} />
					</Routes>
				)
			}
		</>
	);
}

export default App;
