import { useQuery } from '@tanstack/react-query';

export type FDTeam = {
  id: number;
  name: string;
  shortName?: string;
  tla?: string;
  crest?: string | null; // sometimes present
};

export type FDCompetition = {
  id: number;
  name: string;
  code?: string | null;
};

export type FDMatch = {
  id: number;
  utcDate: string; // ISO string
  status: 'SCHEDULED' | 'LIVE' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'POSTPONED' | string;
  competition?: FDCompetition;
  homeTeam: FDTeam;
  awayTeam: FDTeam;
  score?: {
    winner?: string | null;
    fullTime?: { home?: number | null; away?: number | null };
  };
};

const API_KEY = import.meta.env.VITE_FOOTBALL_API_KEY || '9170ec64b5034fe8986cefe145d52b51';
const API_URL = import.meta.env.VITE_FOOTBALL_API_URL || 'https://api.football-data.org/v4/matches';

/**
 * Fetch matches from football-data.org (or custom URL).
 * queryOptions:
 *  - status: 'LIVE' | 'SCHEDULED' | 'FINISHED' | undefined -> used to filter server-side if API supports query params
 */
export const useFootballMatches = (opts?: { status?: string }) => {
  return useQuery<FDMatch[], Error>({
    queryKey: ['football-matches', opts?.status || 'all'],
    queryFn: async () => {
      // Build URL (football-data supports ?status=LIVE etc.)
      const url = new URL(API_URL);
      if (opts?.status) url.searchParams.set('status', opts.status);

      const res = await fetch(url.toString(), {
        headers: {
          'X-Auth-Token': API_KEY,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Football API error: ${res.status} ${res.statusText} - ${text}`);
      }

      const json = await res.json();
      // API v4 returns { count, filters, matches: [...] }
      const matches: FDMatch[] = json.matches || [];
      return matches;
    },
    // Refetch every 20 seconds for live updates
    refetchInterval: (data) => {
      if (!data) return 20000;
      // If any match is live, poll frequently
      const hasLive = data.some((m) => m.status === 'LIVE' || m.status === 'IN_PLAY');
      return hasLive ? 5000 : 20000;
    },
    staleTime: 5000,
  });
};