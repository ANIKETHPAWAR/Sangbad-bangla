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

  const overs = Array.isArray(data?.Overbyover) ? data.Overbyover : [];
  const shortA = meta?.teams?.shortA || '';
  const shortB = meta?.teams?.shortB || '';

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/cricket" className="text-sm text-gray-600 hover:underline">← Back to Cricket</Link>
          <span className="text-xs text-gray-400">Code: {code}</span>
        </div>
        <div className="text-xs text-gray-600">{meta?.status}</div>
      </div>

      <div className="rounded-xl p-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {shortA && <img src={teamLogoUrl(shortA)} alt={shortA} className="w-6 h-6 rounded-sm" />}
            <div className="font-semibold">{meta?.title || 'Scorecard'}</div>
            {shortB && <img src={teamLogoUrl(shortB)} alt={shortB} className="w-6 h-6 rounded-sm" />}
          </div>
          <div className="text-right text-xs opacity-90">
            <div>{meta?.venue}</div>
            {meta?.equation && <div>{meta.equation}</div>}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-lg border bg-white p-4">
          <div className="text-sm font-semibold mb-2">Over by over</div>
          {loading ? (
            <div className="py-6 flex items-center"><div className="animate-spin h-5 w-5 border-2 border-white border-t-indigo-600 rounded-full mr-2" /> Loading…</div>
          ) : error ? (
            <div className="text-red-600 text-sm">{error}</div>
          ) : waiting ? (
            <div className="text-sm text-gray-700">Waiting for scorecard to be published. This page will auto-refresh…</div>
          ) : (
            <div className="flex flex-wrap">
              {overs.flatMap((o) => o?.Balls || []).map((b, i) => (
                <Ball key={i} value={b?.Outcome || b} />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm font-semibold mb-2">Current Players</div>
          {overs.length > 0 ? (
            <>
              <div className="text-xs font-semibold text-gray-700 mb-1">Batsmen</div>
              <table className="w-full text-xs mb-3">
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

              <div className="text-xs font-semibold text-gray-700 mb-1">Bowler</div>
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
            </>
          ) : (
            <div className="text-xs text-gray-600">No live player data.</div>
          )}
        </div>
      </div>
    </div>
  );
}


