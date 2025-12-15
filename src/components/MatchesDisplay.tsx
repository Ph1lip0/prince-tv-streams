import React, { useEffect, useMemo, useState } from 'react';
import type { FDMatch } from '@/hooks/useFootballMatches';

type Props = {
  matches: FDMatch[];
  /**
   * Optional: custom logo lookup function (teamName) => url
   * If not provided, component will use team.crest (if present) or fallback to avatars.
   */
  logoLookup?: (teamName: string, team?: { id?: number; crest?: string | null }) => string;
  /**
   * Default match duration in minutes (used to mark finished when is_live isn't set)
   */
  defaultMatchDurationMin?: number;
};

const two = (n: number) => n.toString().padStart(2, '0');
const formatTimeLeft = (ms: number) => {
  if (ms <= 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${two(hours)}:${two(minutes)}:${two(seconds)}`;
};

const defaultLogo = (team: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(team)}&background=0D3B66&color=fff&rounded=true&size=128`;

const MatchesDisplay: React.FC<Props> = ({ matches, logoLookup, defaultMatchDurationMin = 90 }) => {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const enriched = useMemo(() => {
    return matches.map((m) => {
      const startTs = new Date(m.utcDate).getTime();
      const endTs = startTs + defaultMatchDurationMin * 60 * 1000;
      const nowTs = now.getTime();

      // statuses from football-data: SCHEDULED, TIMED, LIVE, IN_PLAY, PAUSED, FINISHED, POSTPONED
      const isLiveStatus = m.status === 'LIVE' || m.status === 'IN_PLAY' || m.status === 'PAUSED';
      const isFinished = m.status === 'FINISHED' || m.status === 'POSTPONED';

      let status: 'upcoming' | 'live' | 'finished' = 'upcoming';
      if (isLiveStatus) status = 'live';
      else if (isFinished) status = 'finished';
      else if (nowTs >= startTs && nowTs < endTs) status = 'live';
      else if (nowTs >= endTs) status = 'finished';

      const leagueName = m.competition?.name || null;

      return {
        original: m,
        id: m.id,
        title: `${m.homeTeam.name} vs ${m.awayTeam.name}`,
        team_home: m.homeTeam.name,
        team_away: m.awayTeam.name,
        match_time: m.utcDate,
        is_live: status === 'live',
        status,
        league: leagueName,
        team_home_obj: m.homeTeam,
        team_away_obj: m.awayTeam,
        _timeUntilStartMs: startTs - nowTs,
        _timeUntilEndMs: endTs - nowTs,
      };
    });
  }, [matches, now, defaultMatchDurationMin]);

  const getLogo = (teamName: string, teamObj?: { id?: number; crest?: string | null }) => {
    if (logoLookup) return logoLookup(teamName, teamObj);
    if (teamObj?.crest) return teamObj.crest;
    return defaultLogo(teamName);
  };

  if (!matches || matches.length === 0) {
    return <div className="p-6 text-center text-slate-300">Hakuna mechi za kuonyesha.</div>;
  }

  return (
    <div className="space-y-4">
      {enriched.map((m) => (
        <article
          key={m.id}
          className="flex items-center justify-between gap-4 p-4 rounded-lg shadow"
          style={{ background: 'linear-gradient(180deg,#07142b 0%, #042038 100%)' }}
        >
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center text-center min-w-[120px]">
              <img
                src={getLogo(m.team_home, m.team_home_obj)}
                alt={m.team_home}
                onError={(e) => ((e.currentTarget as HTMLImageElement).src = defaultLogo(m.team_home))}
                className="w-16 h-16 rounded-full object-cover border-2 border-slate-800"
              />
              <span className="mt-2 text-sm font-semibold text-white">{m.team_home}</span>
            </div>

            <div className="flex flex-col items-center px-4">
              {m.league && (
                <div className="mb-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-white/90">
                    {m.league.toLowerCase().includes('premier') ||
                    m.league.toLowerCase().includes('epl') ||
                    (m.league || '').toLowerCase().includes('english premier')
                      ? `EPL • ${m.league}`
                      : m.league}
                  </span>
                </div>
              )}
              <div className="text-center">
                <div className="text-sm text-white/90">{m.title}</div>
                <div className="text-xs text-slate-300 mt-1">
                  {new Date(m.match_time).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center text-center min-w-[120px]">
              <img
                src={getLogo(m.team_away, m.team_away_obj)}
                alt={m.team_away}
                onError={(e) => ((e.currentTarget as HTMLImageElement).src = defaultLogo(m.team_away))}
                className="w-16 h-16 rounded-full object-cover border-2 border-slate-800"
              />
              <span className="mt-2 text-sm font-semibold text-white">{m.team_away}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {m.is_live ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  LIVE
                </span>
              </div>
            ) : m.status === 'finished' ? (
              <div className="text-sm px-3 py-1 rounded-full bg-slate-700 text-slate-200 font-medium">
                Finished
              </div>
            ) : (
              <div className="text-sm px-3 py-1 rounded-full bg-slate-800 text-slate-200">
                Upcoming
              </div>
            )}

            <div className="text-right">
              {m.status === 'upcoming' && (
                <div className="text-lg font-mono text-white">{formatTimeLeft(m._timeUntilStartMs)}</div>
              )}
              {m.is_live && <div className="text-sm text-slate-200">In-play • {formatTimeLeft(Math.max(0, m._timeUntilEndMs))}</div>}
              {m.status === 'finished' && <div className="text-sm text-slate-400">Match ended</div>}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default MatchesDisplay;