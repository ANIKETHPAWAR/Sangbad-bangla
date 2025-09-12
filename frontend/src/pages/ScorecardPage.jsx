import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { fetchScorecard, teamLogoUrl } from '../services/api';

function Ball({ value }) {
  const text = String(value || '').toUpperCase();
  let cls = 'inline-flex items-center justify-center w-6 h-6 rounded text-[11px] font-semibold mr-1 mb-1 border';
  if (text === '6') cls += ' bg-green-100 text-green-700 border-green-300';
  else if (text === '4') cls += ' bg-blue-100 text-blue-700 border-blue-300';
  else if (text === 'W' || /WKT|WK/.test(text)) cls += ' bg-red-100 text-red-700 border-red-300';
  else cls += ' bg-gray-100 text-gray-700 border-gray-300';
  return <span className={cls}>{text}</span>;
}

export default function ScorecardPage() {
  const { code } = useParams();
  const location = useLocation();
  const meta = (location.state && location.state.meta) || {};
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [waiting, setWaiting] = React.useState(false);

  const isLive = /live|progress/i.test(meta?.status || '');

  const load = React.useCallback(async (signal) => {
    if (!code) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetchScorecard(code, signal);
      if (!res) {
        setWaiting(true);
        setData(null);
        return;
      }
      setWaiting(false);
      setData(res);
    } catch (e) {
      setError(e?.message || 'Failed to load scorecard');
    } finally {
      setLoading(false);
    }
  }, [code]);

  React.useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  React.useEffect(() => {
    const controller = new AbortController();
    const intervalMs = isLive || waiting ? 15000 : 60000;
    const t = setInterval(() => load(controller.signal), intervalMs);
    return () => { controller.abort(); clearInterval(t); };
  }, [isLive, waiting, load]);

  // Detect formats: new consolidated match JSON vs legacy over-by-over JSON
  const isNew = Array.isArray(data?.Innings);
  const innings = isNew ? (data.Innings?.[0] || null) : null;
  const overs = !isNew && Array.isArray(data?.Overbyover) ? data.Overbyover : [];

  // Helpers for new format
  const teamsMap = isNew ? (data?.Teams || {}) : {};
  const battingTeamKey = innings?.Battingteam;
  const bowlingTeamKey = innings?.Bowlingteam;
  const battingShort = battingTeamKey && teamsMap[battingTeamKey]?.Name_Short;
  const bowlingShort = bowlingTeamKey && teamsMap[bowlingTeamKey]?.Name_Short;
  const shortA = meta?.teams?.shortA || battingShort || '';
  const shortB = meta?.teams?.shortB || bowlingShort || '';

  const getPlayerName = React.useCallback((playerId) => {
    const id = String(playerId || '').trim();
    if (!id) return '';
    for (const key of Object.keys(teamsMap)) {
      const p = teamsMap[key]?.Players?.[id];
      if (p) return p?.Name_Short || p?.Name_Full || id;
    }
    return id;
  }, [teamsMap]);

  const asList = React.useCallback((maybe) => {
    if (!maybe) return [];
    if (Array.isArray(maybe)) return maybe;
    if (typeof maybe === 'object') return Object.values(maybe);
    return [];
  }, []);

  // Build team-wise latest score from Innings
  const teamScores = React.useMemo(() => {
    const result = {};
    if (!isNew || !Array.isArray(data?.Innings)) return result;
    data.Innings.forEach((inn) => {
      const key = inn?.Battingteam;
      if (!key) return;
      result[key] = {
        runs: inn?.Total,
        wkts: inn?.Wickets,
        overs: inn?.Overs || inn?.Overall_Overs || inn?.Playedovers || inn?.Overs_Played || inn?.Current_Over || inn?.Currentover || '',
      };
    });
    return result;
  }, [isNew, data]);

  const leftKey = battingTeamKey || Object.keys(teamsMap)[0];
  const rightKey = bowlingTeamKey || Object.keys(teamsMap).find((k) => k !== leftKey);
  const leftShort = shortA || (leftKey && teamsMap[leftKey]?.Name_Short) || '';
  const rightShort = shortB || (rightKey && teamsMap[rightKey]?.Name_Short) || '';
  const leftScore = teamScores[leftKey] || {};
  const rightScore = teamScores[rightKey] || {};

  const formatScore = (s) => {
    if (!s) return '';
    const parts = [];
    if (s.runs != null && s.wkts != null) parts.push(`${s.runs}/${s.wkts}`);
    else if (s.runs != null) parts.push(String(s.runs));
    if (s.overs) parts.push(`(${s.overs})`);
    return parts.join(' ');
  };

  const resultText = meta?.equation || data?.Status || data?.Result || '';

  const parsedBatsmen = React.useMemo(() => {
    if (!isNew || !innings) return [];
    return asList(innings.Batsmen)
      .map((b) => ({
        id: b?.Batsman,
        name: getPlayerName(b?.Batsman),
        runs: b?.Runs || '0',
        balls: b?.Balls || '0',
        fours: b?.Fours || '0',
        sixes: b?.Sixes || '0',
        sr: b?.Strikerate || '-',
        howout: b?.Howout_short || b?.Howout || (b?.Isbatting ? 'Batting' : ''),
        isBatting: !!b?.Isbatting,
      }));
  }, [isNew, innings, getPlayerName, asList]);

  const extras = React.useMemo(() => {
    if (!isNew || !innings) return null;
    const num = (v) => Number(v || 0);
    const B = num(innings.Byes);
    const LB = num(innings.Legbyes);
    const WD = num(innings.Wides);
    const NB = num(innings.Noballs);
    const P = num(innings.Penalty);
    return { total: B + LB + WD + NB + P, B, LB, WD, NB, P };
  }, [isNew, innings]);

  const bowlers = React.useMemo(() => {
    if (!isNew || !innings) return [];
    return asList(innings.Bowlers).map((bl) => ({
      id: bl?.Bowler,
      name: getPlayerName(bl?.Bowler),
      overs: bl?.Overs || bl?.Overall_Overs || '-',
      runs: bl?.Runs || '0',
      wickets: bl?.Wickets || '0',
      econ: bl?.Economyrate || bl?.Overall_Economyrate || '-',
    }));
  }, [isNew, innings, getPlayerName, asList]);

  // Fallback builders when Batsmen/Bowlers are missing from Innings
  const battingRows = React.useMemo(() => {
    if (!isNew || !innings) return [];
    if (parsedBatsmen.length) return parsedBatsmen;
    const parts = asList(innings.Partnerships);
    if (!parts.length) return [];
    const order = [];
    const idToRow = new Map();
    const upsert = (id) => {
      if (!idToRow.has(id)) {
        idToRow.set(id, { id, name: getPlayerName(id), runs: 0, balls: 0, fours: 0, sixes: 0, sr: '-', howout: '', isBatting: false });
        order.push(id);
      }
      return idToRow.get(id);
    };
    parts.forEach((p) => {
      asList(p.Batsmen).forEach((b) => {
        const row = upsert(b?.Batsman);
        row.runs += Number(b?.Runs || 0);
        row.balls += Number(b?.Balls || 0);
      });
    });
    // Count 4s/6s from commentary when available
    const balls = asList(data?.commentary);
    balls.forEach((ev) => {
      if (!ev?.Isball) return;
      const id = ev?.Batsman;
      if (!idToRow.has(id)) return;
      const val = String(ev?.Batsman_Runs || ev?.Runs || '').trim();
      if (val === '4') idToRow.get(id).fours += 1;
      if (val === '6') idToRow.get(id).sixes += 1;
    });
    // Current batters from IsCurrent partnership if present
    const current = parts.find((p) => String(p?.IsCurrent) === 'true') || parts[parts.length - 1];
    if (current) {
      asList(current.Batsmen).forEach((b) => {
        const row = upsert(b?.Batsman);
        row.isBatting = true;
      });
    }
    // Howout from wicket events in commentary
    balls.forEach((ev) => {
      const dismissed = ev?.Dismissed;
      if (!dismissed || !idToRow.has(dismissed)) return;
      if (!idToRow.get(dismissed).isBatting) {
        idToRow.get(dismissed).howout = ev?.Howout || 'out';
      }
    });
    // Compute SR
    order.forEach((id) => {
      const r = idToRow.get(id);
      r.sr = r.balls ? (Math.round((r.runs / r.balls) * 10000) / 100).toFixed(2) : '-';
    });
    return order.map((id) => idToRow.get(id));
  }, [isNew, innings, parsedBatsmen, asList, data, getPlayerName]);

  const bowlerRows = React.useMemo(() => {
    if (!isNew || !innings) return [];
    if (bowlers.length) return bowlers;
    const events = asList(data?.commentary).filter((e) => e?.Bowler && e?.Bowler_Details);
    if (!events.length) return [];
    const idToRow = new Map();
    const order = [];
    events.forEach((ev) => {
      const id = ev.Bowler;
      if (!idToRow.has(id)) {
        order.push(id);
      }
      const det = ev.Bowler_Details || {};
      idToRow.set(id, {
        id,
        name: getPlayerName(id),
        overs: det.Overs || '-',
        runs: det.Runs || '0',
        wickets: det.Wickets || '0',
        econ: (() => {
          const o = parseFloat(det.Overs);
          const r = Number(det.Runs || 0);
          if (!Number.isFinite(o) || o === 0) return '-';
          return (r / o).toFixed(2);
        })(),
      });
    });
    return order.map((id) => idToRow.get(id));
  }, [isNew, innings, bowlers, data, getPlayerName, asList]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/cricket" className="text-sm text-gray-600 hover:underline">← Back to Cricket Page</Link>
        
        </div>
      </div>

      {/* Match banner with teams and scores */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            width: '100%',
            maxWidth: 980,
            borderRadius: 8,
            overflow: 'hidden',
            backgroundColor: '#2B1B6F',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}
        >
          <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{meta?.title || 'Scorecard'}</div>
            <span style={{ fontSize: 12, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, padding: '2px 8px' }}>
              {isLive ? 'LIVE' : (/(result|won|beat|tie|draw|abandon|no\s*result)/i.test(meta?.status || '') ? 'Results' : 'Match')}
            </span>
          </div>
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 1fr', alignItems: 'center', gap: 12 }}>
              {/* Left: team and score */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {leftShort && <img src={teamLogoUrl(leftShort)} alt={leftShort} style={{ width: 28, height: 28, borderRadius: 4 }} />}
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{teamsMap[leftKey]?.Name_Full || leftShort}</div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{formatScore(leftScore) || '—'}</div>
              </div>
              {/* Center divider */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 32, height: 32, borderRadius: 16, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>—</div>
              </div>
              {/* Right: score then team */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{formatScore(rightScore) || '—'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, textAlign: 'right' }}>{teamsMap[rightKey]?.Name_Full || rightShort}</div>
                  {rightShort && <img src={teamLogoUrl(rightShort)} alt={rightShort} style={{ width: 28, height: 28, borderRadius: 4 }} />}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, opacity: 0.95 }}>
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>{resultText}</div>
              <div style={{ opacity: 0.8 }}>{meta?.venue}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main scorecard or Over-by-over (fallback) */}
        <div className="lg:col-span-2 rounded-lg border bg-white p-5">
          {loading ? (
            <div className="py-6 flex items-center"><div className="animate-spin h-5 w-5 border-2 border-white border-t-indigo-600 rounded-full mr-2" /> Loading…</div>
          ) : error ? (
            <div className="text-red-600 text-sm">{error}</div>
          ) : waiting ? (
            <div className="text-sm text-gray-700">Waiting for scorecard to be published. This page will auto-refresh…</div>
          ) : isNew && innings ? (
            <div className="space-y-5">
              <div className="text-sm font-semibold mb-1">Batting ({battingShort || 'Batting'})</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: '8px 0' }}>
                  <colgroup>
                    <col style={{ width: '32%' }} />
                    <col style={{ width: '38%' }} />
                    <col style={{ width: '6%' }} />
                    <col style={{ width: '6%' }} />
                    <col style={{ width: '6%' }} />
                    <col style={{ width: '6%' }} />
                    <col style={{ width: '6%' }} />
                  </colgroup>
                  <thead>
                    <tr className="text-left text-gray-600">
                      <th className="py-2 pr-3">Batter</th>
                      <th className="py-2 pr-3"></th>
                      <th className="py-2 pr-3 text-right">R</th>
                      <th className="py-2 pr-3 text-right">B</th>
                      <th className="py-2 pr-3 text-right">4s</th>
                      <th className="py-2 pr-3 text-right">6s</th>
                      <th className="py-2 pr-3 text-right">SR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(battingRows.length ? battingRows : parsedBatsmen).map((bt, i) => (
                      <tr key={`${bt.id}-${i}`} className="border-t">
                        <td className="py-2 pr-3">{bt.name}{bt.isBatting ? '*' : ''}</td>
                        <td className="py-2 pr-3 text-gray-600">{bt.howout}</td>
                        <td className="py-2 pr-3 text-right">{bt.runs}</td>
                        <td className="py-2 pr-3 text-right">{bt.balls}</td>
                        <td className="py-2 pr-3 text-right">{bt.fours}</td>
                        <td className="py-2 pr-3 text-right">{bt.sixes}</td>
                        <td className="py-2 pr-3 text-right">{bt.sr}</td>
                      </tr>
                    ))}
                    {extras && (
                      <tr className="border-t font-semibold">
                        <td colSpan={7} className="py-2 text-gray-800">
                          Extras {extras.total}: B: {extras.B}, LB: {extras.LB}, WD: {extras.WD}, NB: {extras.NB}, P: {extras.P}
                        </td>
                      </tr>
                    )}
                    {innings && (
                      <tr className="border-t font-semibold">
                        <td colSpan={7} className="py-2 text-gray-900">
                          Total {innings.Total}/{innings.Wickets} ({innings.Runrate} Runs Per Over)
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {Array.isArray(innings?.FallofWickets) && innings.FallofWickets.length > 0 && (
                <div className="text-[12px] text-gray-700">
                  <div className="font-medium mb-1">Fall of the wicket:</div>
                  <div>
                    {innings.FallofWickets.map((w, idx) => (
                      <span key={idx} className="mr-2">
                        {`${idx + 1}-${w.Score} (${getPlayerName(w.Batsman)}, ${w.Overs} ov)`}{idx < innings.FallofWickets.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bowlers table */}
              <div className="pt-2">
                <div className="text-sm font-semibold mb-1">Bowler</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: '8px 0' }}>
                    <thead>
                      <tr className="text-left text-gray-600">
                        <th className="py-2 pr-3">Bowler</th>
                        <th className="py-2 pr-3 text-right">O</th>
                        <th className="py-2 pr-3 text-right">R</th>
                        <th className="py-2 pr-3 text-right">W</th>
                        <th className="py-2 pr-3 text-right">Econ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(bowlerRows.length ? bowlerRows : bowlers).map((bl, i) => (
                        <tr key={`${bl.id}-${i}`} className="border-t">
                          <td className="py-2 pr-3">{bl.name}</td>
                          <td className="py-2 pr-3 text-right">{bl.overs}</td>
                          <td className="py-2 pr-3 text-right">{bl.runs}</td>
                          <td className="py-2 pr-3 text-right">{bl.wickets}</td>
                          <td className="py-2 pr-3 text-right">{bl.econ}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            // Legacy fallback: show over-by-over chips
            <>
              <div className="text-sm font-semibold mb-2">Over by over</div>
              <div className="flex flex-wrap gap-1">
                {overs.flatMap((o) => o?.Balls || []).map((b, i) => (
                  <Ball key={i} value={b?.Outcome || b} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right: Current players panel */}
        <div className="rounded-lg border bg-white p-5">
          <div className="text-sm font-semibold mb-2">Current Players</div>
          {isNew && innings?.Partnership_Current ? (
            <>
              <div className="text-xs font-semibold text-gray-700 mb-1">Batsmen</div>
              <table className="w-full text-sm mb-3" style={{ borderCollapse: 'separate', borderSpacing: '8px 0' }}>
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-2 pr-3">Batsman</th>
                    <th className="py-2 pr-3 text-right">R</th>
                    <th className="py-2 pr-3 text-right">B</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const list = Array.isArray(innings.Partnership_Current.Batsmen)
                      ? innings.Partnership_Current.Batsmen
                      : (typeof innings.Partnership_Current.Batsmen === 'object' ? Object.values(innings.Partnership_Current.Batsmen) : []);
                    return list.map((bt, i) => (
                      <tr key={i} className="border-t">
                        <td className="py-2 pr-3">{getPlayerName(bt.Batsman)}{bt.IsStriker ? '*' : ''}</td>
                        <td className="py-2 pr-3 text-right">{bt.Runs}</td>
                        <td className="py-2 pr-3 text-right">{bt.Balls}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>

              <div className="text-xs text-gray-700">
                Partnership: {innings.Partnership_Current.Runs}/{innings.Partnership_Current.Balls} • RR {innings.Partnership_Current.Runrate}
              </div>
            </>
          ) : overs.length > 0 ? (
            <>
              <div className="text-xs font-semibold text-gray-700 mb-1">Batsmen</div>
              <table className="w-full text-sm mb-3" style={{ borderCollapse: 'separate', borderSpacing: '8px 0' }}>
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-2 pr-3">Batsman</th>
                    <th className="py-2 pr-3 text-right">R</th>
                    <th className="py-2 pr-3 text-right">B</th>
                    <th className="py-2 pr-3 text-right">4s</th>
                    <th className="py-2 pr-3 text-right">6s</th>
                    <th className="py-2 pr-3 text-right">SR</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(overs[overs.length - 1]?.Batsmen || {}).map((bt, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-2 pr-3">{bt?.Batsman}</td>
                      <td className="py-2 pr-3 text-right">{bt?.Runs}</td>
                      <td className="py-2 pr-3 text-right">{bt?.Balls}</td>
                      <td className="py-2 pr-3 text-right">{bt?.Fours}</td>
                      <td className="py-2 pr-3 text-right">{bt?.Sixes}</td>
                      <td className="py-2 pr-3 text-right">{bt?.Strikerate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="text-xs font-semibold text-gray-700 mb-1">Bowler</div>
              <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: '8px 0' }}>
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-2 pr-3">Bowler</th>
                    <th className="py-2 pr-3 text-right">O</th>
                    <th className="py-2 pr-3 text-right">R</th>
                    <th className="py-2 pr-3 text-right">W</th>
                    <th className="py-2 pr-3 text-right">Econ</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(overs[overs.length - 1]?.Bowlers || {}).map((bl, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-2 pr-3">{bl?.Bowler}</td>
                      <td className="py-2 pr-3 text-right">{bl?.Overall_Overs}</td>
                      <td className="py-2 pr-3 text-right">{bl?.Runs}</td>
                      <td className="py-2 pr-3 text-right">{bl?.Wickets}</td>
                      <td className="py-2 pr-3 text-right">{bl?.Overall_Economyrate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <div className="text-xs text-gray-600">No live player data.</div>
          )}
        </div>
      </div>
    </div>
  );
}


