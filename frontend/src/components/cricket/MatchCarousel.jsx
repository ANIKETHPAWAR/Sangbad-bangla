import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y, Keyboard } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './MatchCarousel.css';
import {
	fetchFixtures,
	deriveStatus,
	getMatchCode,
	getTeams,
	getTeamShortCodes,
	teamLogoUrl,
	formatVenue,
	formatStartTime,
	formatScoreLine,
} from '../../services/api';
import {
    persistCompletedResults,
    getSavedCompletedResults,
} from '../../services/api';

const StatusBadge = ({ status }) => {
	const base = 'px-2 py-0.5 text-xs font-semibold rounded';
	const styles = {
		LIVE: 'bg-red-600 text-white ',
		UPCOMING: 'bg-gray-800 text-white',
		DELAYED: 'bg-yellow-500 text-black',
		RESULTS: 'bg-emerald-600 text-white',
	};
	return <span className={`${base} ${styles[status] || styles.UPCOMING}`}>{status}</span>;
};

export default function MatchCarousel({ onViewScorecard }) {
	const [matches, setMatches] = React.useState([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState('');
	const [filter, setFilter] = React.useState('ALL'); // ALL | LIVE | UPCOMING | RESULTS

	React.useEffect(() => {
		const controller = new AbortController();
		(async () => {
			try {
				setLoading(true);
				setError('');
				const data = await fetchFixtures(controller.signal);
				if (!data) return; // aborted
				// Handle multiple possible shapes. Prefer standard keys but support fallbacks
				const pickList = (...keys) => {
					for (const k of keys) {
						const v = data?.[k];
						if (Array.isArray(v) && v.length) return v;
					}
					return [];
				};
				// Results/completed
				const rawResults = pickList('results', 'completed', 'completedmatches', 'completed_matches');
				const apiResults = rawResults.map((m) => ({ ...m, type: 'result' }));
				if (apiResults.length) persistCompletedResults(apiResults);
				const savedResults = getSavedCompletedResults();
				// Merge and de-duplicate by match code; prefer newer/live data to override saved
				const byCode = new Map();
				const upsert = (arr, type) => {
					(arr || []).forEach((m) => {
						const code = getMatchCode(m);
						if (!code) return;
						byCode.set(code, { ...m, type: m?.type || type });
					});
				};
				upsert(savedResults, 'result');
				upsert(apiResults, 'result');
				const rawUpcoming = pickList('upcoming', 'upcomingmatches', 'upcoming_matches');
				const rawLive = pickList('live', 'livescores', 'live_matches', 'liveList');
				upsert(rawUpcoming, 'upcoming');
				upsert(rawLive, 'live');
				const list = Array.from(byCode.values());
				setMatches(list.filter(Boolean));
			} catch (err) {
				setError(err?.message || 'Failed to load matches');
			} finally {
				setLoading(false);
			}
		})();
		return () => controller.abort();
	}, []);

	// Compute derived values without additional hooks to avoid hook-order issues during HMR
	const filtered = filter === 'ALL' ? matches : matches.filter((m) => deriveStatus(m) === filter);

	if (loading) {
		return (
			<div className="w-full py-8 flex items-center justify-center">
				<div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-gray-900 rounded-full" />
				<span className="ml-3 text-sm text-gray-700">Loading matches…</span>
			</div>
		);
	}

	if (error) {
		return (
			<div className="w-full py-6 text-center text-sm text-red-600">
				{error}
			</div>
		);
	}

	if (!matches.length) {
		return (
			<div className="w-full py-6 text-center text-sm text-gray-600">
				No matches available at the moment.
			</div>
		);
	}

	// Re-initialize Swiper when filter or the set of slides changes
	const swiperKey = (() => {
		const sig = filtered.map((m) => getMatchCode(m) || '').join('|');
		return `sw-${filter}-${sig}`;
	})();

	return (
		<div className="w-full">
			{/* Filter bar */}
			<div
				className="w-full mb-4"
				style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}
			>
				{['ALL', 'LIVE', 'UPCOMING', 'RESULTS'].map((key) => (
					<button
						key={key}
						onClick={() => setFilter(key)}
						className={`rounded-full`}
						style={{
							padding: '6px 12px',
							fontSize: '12px',
							borderRadius: '9999px',
							border: '1px solid',
							borderColor: filter === key ? '#111827' : '#D1D5DB',
							backgroundColor: filter === key ? '#111827' : '#ffffff',
							color: filter === key ? '#ffffff' : '#1F2937',
							cursor: 'pointer',
						}}
						aria-pressed={filter === key}
					>
						{key}
					</button>
				))}
			</div>
			<Swiper
				modules={[Navigation, Pagination, A11y, Keyboard]}
				slidesPerView={1}
				spaceBetween={0}
				centeredSlides
				navigation
				pagination={false}
				keyboard
				key={swiperKey}
				className="cricket-swiper"
			>
				{filtered.map((m, idx) => {
					const status = deriveStatus(m);
					const code = getMatchCode(m);
					const { teamA, teamB } = getTeams(m);
					const { shortA, shortB } = getTeamShortCodes(m);
					const venue = formatVenue(m);
					const start = formatStartTime(m);
					const score = status === 'LIVE' ? formatScoreLine(m) : '';
					const seriesTitle = (
						m?.seriesname ||
						m?.matchdetail?.series?.name ||
						m?.tournamentname ||
						''
					);
					const topMetaLeft = [
						m?.matchnumber || m?.matchdetail?.match?.number,
						venue?.split(',')?.[0] || m?.city,
					].filter(Boolean).join(' • ');
					const rightTime = (() => {
						if (status === 'UPCOMING') {
							return (m?.matchdate_ist && m?.matchtime_ist) ? `${m.matchdate_ist}, ${m.matchtime_ist}` : start;
						}
						if (status === 'RESULTS') {
							return (m?.matchdate_ist && m?.matchtime_ist) ? `${m.matchdate_ist}, ${m.matchtime_ist}` : '';
						}
						return '';
					})();
					return (
						<SwiperSlide key={code || `idx-${idx}`}>
							<div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
								<div
									style={{
										width: '100%',
										maxWidth: 980,
										minHeight: 200,
										border: '1px solid #E5E7EB',
										borderRadius: 8,
										backgroundColor: '#ffffff',
										boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
										display: 'flex',
										flexDirection: 'column',
										overflow: 'hidden',
										opacity: code ? 1 : 0.6,
										cursor: code ? 'pointer' : 'default',
									}}
									onClick={() => code && onViewScorecard?.({
										code,
										meta: {
											title: `${teamA} vs ${teamB}`,
											venue,
											status,
											equation: m?.matchdetail?.equation || m?.matchstatus || '',
											teams: { shortA, shortB },
										},
									})}
									role="button"
									tabIndex={0}
									onKeyDown={(e) => { if (e.key === 'Enter' && code) { onViewScorecard?.({ code, meta: { title: `${teamA} vs ${teamB}`, venue, status, equation: m?.matchdetail?.equation || m?.matchstatus || '', teams: { shortA, shortB } } }); } }}
								>
									{/* Header */}
									<div style={{ padding: '8px 16px', background: '#1E3A8A', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
										<div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
											{seriesTitle ? `${seriesTitle}` : 'Cricket'}{topMetaLeft ? ` | ${topMetaLeft}` : ''}
										</div>
										<StatusBadge status={status} />
									</div>

									{/* Body: teams and scores */}
									<div style={{ padding: 24, flex: '1 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
										{/* Team A */}
										<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
											{shortA && <img src={teamLogoUrl(shortA)} alt={shortA} style={{ width: 36, height: 36, borderRadius: 4 }} loading="lazy" />}
											<div style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>{shortA || teamA}</div>
										</div>
										{/* VS */}
										<div style={{ width: 42, height: 42, borderRadius: 21, background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', fontWeight: 700 }}>VS</div>
										{/* Team B */}
										<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
											<div style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>{shortB || teamB}</div>
											{shortB && <img src={teamLogoUrl(shortB)} alt={shortB} style={{ width: 36, height: 36, borderRadius: 4 }} loading="lazy" />}
										</div>
									</div>
									{status === 'LIVE' && (
										<div style={{ textAlign: 'center', fontSize: 14, color: '#374151', marginTop: -8 }}>{score || 'Live score unavailable'}</div>
									)}

									{/* Footer: result / start time and action */}
									<div style={{ padding: '8px 16px', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 14, color: '#374151' }}>
										<div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 12 }}>
											{status === 'UPCOMING' ? (rightTime || start) : (m?.matchstatus || m?.matchdetail?.status || '')}
										</div>
										<div style={{ color: '#EA580C', fontWeight: 600 }}>View Full Scorecard ›</div>
									</div>
								</div>
							</div>
						</SwiperSlide>
					);
				})}
			</Swiper>
		</div>
	);
}


