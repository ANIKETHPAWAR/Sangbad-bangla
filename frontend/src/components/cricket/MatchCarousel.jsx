import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y, Keyboard } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
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

const StatusBadge = ({ status }) => {
	const base = 'px-2 py-0.5 text-xs font-semibold rounded';
	const styles = {
		LIVE: 'bg-red-600 text-white',
		UPCOMING: 'bg-gray-800 text-white',
		DELAYED: 'bg-yellow-500 text-black',
	};
	return <span className={`${base} ${styles[status] || styles.UPCOMING}`}>{status}</span>;
};

export default function MatchCarousel({ onViewScorecard }) {
	const [matches, setMatches] = React.useState([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState('');

	React.useEffect(() => {
		const controller = new AbortController();
		(async () => {
			try {
				setLoading(true);
				setError('');
				const data = await fetchFixtures(controller.signal);
				if (!data) return; // aborted
				// According to API: { live: [...], upcoming: [...], results: [...] }
				const list = [
					...(Array.isArray(data.live) ? data.live.map((m) => ({ ...m, type: 'live' })) : []),
					...(Array.isArray(data.upcoming) ? data.upcoming.map((m) => ({ ...m, type: 'upcoming' })) : []),
				];
				setMatches(list.filter(Boolean));
			} catch (err) {
				setError(err?.message || 'Failed to load matches');
			} finally {
				setLoading(false);
			}
		})();
		return () => controller.abort();
	}, []);

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

	return (
		<div className="w-full">
			<Swiper
				modules={[Navigation, Pagination, A11y, Keyboard]}
				slidesPerView={1.1}
				spaceBetween={12}
				breakpoints={{
					480: { slidesPerView: 1.2, spaceBetween: 12 },
					640: { slidesPerView: 2, spaceBetween: 14 },
					768: { slidesPerView: 2.5, spaceBetween: 16 },
					1024: { slidesPerView: 3, spaceBetween: 16 },
					1280: { slidesPerView: 4, spaceBetween: 16 },
				}}
				navigation
				pagination={{ clickable: true }}
				keyboard
			>
				{matches.map((m, idx) => {
					const status = deriveStatus(m);
					const code = getMatchCode(m);
					const { teamA, teamB } = getTeams(m);
					const { shortA, shortB } = getTeamShortCodes(m);
					const venue = formatVenue(m);
					const start = formatStartTime(m);
					const score = status === 'LIVE' ? formatScoreLine(m) : '';
					const topMetaLeft = [
						m?.matchnumber || m?.matchdetail?.match?.number,
						venue?.split(',')?.[0] || m?.city,
					].filter(Boolean).join(' • ');
					const rightTime = status === 'UPCOMING' ? start : (m?.matchdate_ist && m?.matchtime_ist ? `${m.matchdate_ist}, ${m.matchtime_ist}` : '');
					return (
						<SwiperSlide key={`${code || idx}`}>
							<div
								className={`h-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm flex flex-col transition hover:shadow-md ${code ? 'cursor-pointer' : 'opacity-60'}`}
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
								<div className="flex items-start justify-between mb-3">
									<div className="flex items-center gap-2">
										<StatusBadge status={status} />
										{topMetaLeft && <span className="text-[11px] text-gray-600">{`• ${topMetaLeft}`}</span>}
									</div>
									{rightTime && <div className="text-[11px] text-gray-600 text-right ml-3">{rightTime}</div>}
								</div>

								<div className="space-y-2 mb-3">
									<div className="flex items-center gap-2 text-sm font-medium text-gray-900">
										{shortA && <img src={teamLogoUrl(shortA)} alt={shortA} className="w-5 h-5 rounded-sm" loading="lazy" />}
										<span>{teamA}</span>
									</div>
									<div className="flex items-center gap-2 text-sm font-medium text-gray-900">
										{shortB && <img src={teamLogoUrl(shortB)} alt={shortB} className="w-5 h-5 rounded-sm" loading="lazy" />}
										<span>{teamB}</span>
									</div>
								</div>

								{status === 'LIVE' && (
									<div className="mb-2">
										<div className="text-lg font-semibold text-gray-900">{score || 'Live score unavailable'}</div>
										{m?.matchdetail?.equation && <div className="text-[12px] text-gray-600 mt-1">{m.matchdetail.equation}</div>}
									</div>
								)}

								{status !== 'LIVE' && (
									<div className="text-[12px] text-gray-600 mt-auto">{m?.matchstatus || m?.matchdetail?.status || ''}</div>
								)}
							</div>
						</SwiperSlide>
					);
				})}
			</Swiper>
		</div>
	);
}


