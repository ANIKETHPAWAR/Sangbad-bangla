const BASE_URL = 'https://www.hindustantimes.com/static-content/10s';

export async function fetchFixtures(signal) {
	const url = `${BASE_URL}/cricket-liupre_v2.json`;
	try {
		const response = await fetch(url, { signal, cache: 'no-store' });
		if (!response.ok) throw new Error('Failed to fetch fixtures');
		return response.json();
	} catch (err) {
		// Ignore abort errors caused by unmounts or re-renders
		if (err && (err.name === 'AbortError' || err.code === 20)) return null;
		throw err;
	}
}

export async function fetchScorecard(matchCode, signal) {
	if (!matchCode) throw new Error('matchCode is required');
	const url = `${BASE_URL}/${matchCode}_scoresoverbyover_2.json`;
	try {
		const response = await fetch(url, { signal, cache: 'no-store' });
		if (response.status === 404) return null; // not ready yet
		if (!response.ok) throw new Error('Failed to fetch scorecard');
		return response.json();
	} catch (err) {
		if (err && (err.name === 'AbortError' || err.code === 20)) return null;
		throw err;
	}
}

export function deriveStatus(match) {
	// Handles both shapes: live item with matchdetail.status and upcoming with matchstatus
	const rawStatus = match?.matchdetail?.status || match?.matchstatus || match?.status || '';
	const isLive = /live|progress/i.test(rawStatus) || match?.type === 'live';
	const isDelayed = /delay|stump|break/i.test(rawStatus);
	if (isLive) return 'LIVE';
	if (isDelayed) return 'DELAYED';
	return 'UPCOMING';
}

export function getMatchCode(match) {
	// live/results have matchdetail.match.code; upcoming has matchfile
	return (
		match?.matchdetail?.match?.code ||
		match?.matchfile ||
		match?.matchCode ||
		match?.code ||
		''
	);
}

export function formatVenue(match) {
	const venue = match?.matchdetail?.venue?.name || match?.venue;
	return Array.isArray(venue) ? venue.join(', ') : venue || '';
}

export function formatStartTime(match) {
	// upcoming has matchStartTimestamp; live does not need start time
	const startTime = match?.matchStartTimestamp || match?.match?.startTime || match?.startTime;
	if (!startTime) return '';
	const date = new Date(typeof startTime === 'number' ? startTime : String(startTime));
	if (Number.isNaN(date.getTime())) return String(startTime);
	return date.toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' });
}

export function formatScoreLine(match) {
	// For live items, use innings array from API to build runs/wkts/overs/RR
	const innings = match?.innings;
	if (Array.isArray(innings) && innings.length) {
		const current = innings[innings.length - 1];
		const runs = current?.total;
		const wkts = current?.wickets;
		const overs = current?.overs;
		const rr = current?.runrate;
		const parts = [];
		if (runs != null && wkts != null) parts.push(`${runs}/${wkts}`);
		if (overs) parts.push(`${overs} ov`);
		if (rr) parts.push(`RR ${rr}`);
		return parts.join(' • ');
	}
	// Fallback to equation/status text if available
	return match?.matchdetail?.equation || match?.matchdetail?.status || '';
}

export function getTeams(match) {
	// upcoming items expose teama/teamb; live exposes teamlist
	if (match?.teama || match?.teamb) {
		return { teamA: match?.teama_short || match?.teama || '', teamB: match?.teamb_short || match?.teamb || '' };
	}
	if (Array.isArray(match?.teamlist) && match.teamlist.length >= 2) {
		const a = match.teamlist[0];
		const b = match.teamlist[1];
		const pick = (t) => t?.name_Short || t?.name_Full || '';
		return { teamA: pick(a), teamB: pick(b) };
	}
	return { teamA: '', teamB: '' };
}

export function getTeamShortCodes(match) {
	// Prefer explicit short codes where available
	if (match?.teama_short || match?.teamb_short) {
		return { shortA: (match.teama_short || '').toUpperCase(), shortB: (match.teamb_short || '').toUpperCase() };
	}
	if (Array.isArray(match?.teamlist) && match.teamlist.length >= 2) {
		const a = (match.teamlist[0]?.name_Short || '').toUpperCase();
		const b = (match.teamlist[1]?.name_Short || '').toUpperCase();
		return { shortA: a, shortB: b };
	}
	return { shortA: '', shortB: '' };
}

export function teamLogoUrl(shortCode) {
	const code = (shortCode || '').toUpperCase().trim();
	if (!code) return '';
	return `https://www.hindustantimes.com/static-content/1y/cricket-logos/teams/logo/${encodeURIComponent(code)}.png?v4`;
}


