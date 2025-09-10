import React from 'react';
import {
	fetchScorecard,
} from '../../services/api';

function Ball({ value }) {
	const text = String(value || '').toUpperCase();
	let cls = 'inline-flex items-center justify-center w-6 h-6 rounded text-[11px] font-semibold mr-1 mb-1 border';
	if (text === '6') cls += ' bg-green-100 text-green-700 border-green-300';
	else if (text === '4') cls += ' bg-blue-100 text-blue-700 border-blue-300';
	else if (text === 'W' || /WKT|WK/.test(text)) cls += ' bg-red-100 text-red-700 border-red-300';
	else cls += ' bg-gray-100 text-gray-700 border-gray-300';
	return <span className={cls}>{text}</span>;
}

export default function ScorecardModal({ open, onClose, matchCode, matchMeta }) {
	const [data, setData] = React.useState(null);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState('');
	const [isLive, setIsLive] = React.useState(false);

	const load = React.useCallback(async (signal) => {
		if (!matchCode) return;
		setLoading(true);
		setError('');
		try {
			const res = await fetchScorecard(matchCode, signal);
			setData(res || null);
			const statusText = (res?.summary?.status || res?.status || '').toString();
			setIsLive(/live/i.test(statusText));
		} catch (e) {
			setError(e?.message || 'Failed to load scorecard');
		} finally {
			setLoading(false);
		}
	}, [matchCode]);

	React.useEffect(() => {
		if (!open) return;
		const controller = new AbortController();
		load(controller.signal);
		return () => controller.abort();
	}, [open, load]);

	React.useEffect(() => {
		if (!open || !isLive) return;
		const controller = new AbortController();
		const t = setInterval(() => load(controller.signal), 30000);
		return () => {
			controller.abort();
			clearInterval(t);
		};
	}, [open, isLive, load]);

	if (!open) return null;

	// Attempt to normalize some likely fields
	// Mapping for Overbyover JSON
	const overs = Array.isArray(data?.Overbyover) ? data.Overbyover : [];
	const venue = matchMeta?.venue || '';
	const title = matchMeta?.title || '';
	const shortA = matchMeta?.teams?.shortA || '';
	const shortB = matchMeta?.teams?.shortB || '';

	return (
		<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
			<div className="absolute inset-0 bg-black/40" onClick={onClose} />
			<div className="relative w-full sm:max-w-3xl bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
				<div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b bg-white rounded-t-2xl">
					<div>
						<div className="text-sm text-gray-500">{venue}</div>
						<div className="text-base font-semibold text-gray-900">Scorecard</div>
					</div>
					<button onClick={onClose} className="rounded-md p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900">
						✕
					</button>
				</div>

				<div className="p-4">
					{loading && (
						<div className="py-8 flex items-center justify-center">
							<div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-gray-900 rounded-full" />
							<span className="ml-3 text-sm text-gray-700">Loading…</span>
						</div>
					)}
					{error && (
						<div className="py-4 text-sm text-red-600">{error}</div>
					)}

					{!loading && !error && (
						<div className="space-y-6">
							{/* Summary */}
							<div className="rounded-lg border p-4">
								<div className="text-sm text-gray-600">{matchMeta?.status || ''}</div>
								<div className="text-lg font-semibold text-gray-900 flex items-center gap-2">
									{shortA && <img src={`https://www.hindustantimes.com/static-content/1y/cricket-logos/teams/logo/${encodeURIComponent(shortA)}.png?v4`} alt={shortA} className="w-5 h-5 rounded-sm" loading="lazy" />}
									{title}
									{shortB && <img src={`https://www.hindustantimes.com/static-content/1y/cricket-logos/teams/logo/${encodeURIComponent(shortB)}.png?v4`} alt={shortB} className="w-5 h-5 rounded-sm" loading="lazy" />}
								</div>
								{matchMeta?.equation && (
									<div className="text-sm text-gray-700">{matchMeta.equation}</div>
								)}
							</div>

							{/* Over by Over */}
							<div className="space-y-4">
								<div className="rounded-lg border p-4">
									<div className="text-xs text-gray-500 mb-2">Over by over</div>
									<div className="flex flex-wrap">
										{overs.flatMap((o) => o?.Balls || []).map((b, i) => (
											<Ball key={i} value={b?.Outcome || b} />
										))}
									</div>
								</div>

								{/* Batsmen (aggregated latest over entry) */}
								{overs.length > 0 && (
									<div className="rounded-lg border p-4">
										<div className="text-xs font-semibold text-gray-700 mb-2">Batsmen</div>
										<div className="overflow-x-auto">
											<table className="w-full text-xs">
												<thead>
													<tr className="text-left text-gray-600">
														<th className="py-1 pr-2">Batsman</th>
														<th className="py-1 pr-2">R</th>
														<th className="py-1 pr-2">B</th>
														<th className="py-1 pr-2">4s</th>
														<th className="py-1 pr-2">6s</th>
														<th className="py-1 pr-2">SR</th>
													</tr>
												</thead>
												<tbody>
													{Object.values(overs[overs.length - 1]?.Batsmen || {}).map((bt, i) => (
														<tr key={i} className="border-t">
															<td className="py-1 pr-2">{bt?.Batsman}</td>
															<td className="py-1 pr-2">{bt?.Runs}</td>
															<td className="py-1 pr-2">{bt?.Balls}</td>
															<td className="py-1 pr-2">{bt?.Fours}</td>
															<td className="py-1 pr-2">{bt?.Sixes}</td>
															<td className="py-1 pr-2">{bt?.Strikerate}</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</div>
								)}

								{/* Bowlers (aggregated latest over entry) */}
								{overs.length > 0 && (
									<div className="rounded-lg border p-4">
										<div className="text-xs font-semibold text-gray-700 mb-2">Bowlers</div>
										<div className="overflow-x-auto">
											<table className="w-full text-xs">
												<thead>
													<tr className="text-left text-gray-600">
														<th className="py-1 pr-2">Bowler</th>
														<th className="py-1 pr-2">O</th>
														<th className="py-1 pr-2">R</th>
														<th className="py-1 pr-2">W</th>
														<th className="py-1 pr-2">Econ</th>
													</tr>
												</thead>
												<tbody>
													{Object.values(overs[overs.length - 1]?.Bowlers || {}).map((bl, i) => (
														<tr key={i} className="border-t">
															<td className="py-1 pr-2">{bl?.Bowler}</td>
															<td className="py-1 pr-2">{bl?.Overall_Overs}</td>
															<td className="py-1 pr-2">{bl?.Runs}</td>
															<td className="py-1 pr-2">{bl?.Wickets}</td>
															<td className="py-1 pr-2">{bl?.Overall_Economyrate}</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</div>
								)}
							</div>
							</div>
						)}
				</div>
			</div>
		</div>
	);
}


