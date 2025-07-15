import { Link } from 'react-router-dom';

const Page404 = () => {
	return (
		<div className="absolute left-0 top-0 flex flex-col items-center justify-center w-screen h-dvh bg-gray-100">
			<h1 className="text-4xl font-bold mb-10">
				404 - Page Not Found
			</h1>
			<p>該当するページが見つかりませんでした。</p>
			<Link to="/" className="text-blue-500 hover:underline">
				ホームに戻る
			</Link>
		</div>
	);
}

export default Page404;
