import "./App.css";
import { Routes, Route } from 'react-router-dom'
import TopPage from "@/components/TopPage";
import CharaCalc from "@/components/CharaCalc";
import useRedirect from "@/hooks/use-redirect";

function App() {
	return (
		<>
			{
				useRedirect() && (
					<Routes>
						<Route path="/" element={<TopPage />} />
						<Route path="/characalc" element={<CharaCalc />} />
					</Routes>
				)
			}
		</>
	);
}

export default App;
