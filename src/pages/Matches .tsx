import React from 'react';
import { useQuery } from '@tanstack/react-query';
import MatchesDisplay from '@/components/MatchesDisplay';
import { useFootballMatches } from '@/hooks/useFootballMatches';
import { supabase } from '@/integrations/supabase/client';

/**
 * Page: /matches
 * This replaces the default data source with football-data API if VITE_FOOTBALL_API_KEY is present.
 * Otherwise it falls back to local Supabase matches table (existing app behavior).
 */

const useAppMatches = () => {
  const apiKey = import.meta.env.VITE_FOOTBALL_API_KEY;
  // If API key set, use football-data; otherwise, fetch from supabase matches table
  const fd = useFootballMatches(); // fetch all statuses; hook internally polls
  const supabaseQuery = useQuery({
    queryKey: ['local-matches'],
    queryFn: async () => {
      const { data, error } = await supabase.from('matches').select('*').order('match_time', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !apiKey,
  });

  return {
    loading: apiKey ? fd.isLoading : supabaseQuery.isLoading,
    matches: apiKey ? fd.data || [] : (supabaseQuery.data as any) || [],
  };
};

const MatchesPage = () => {
  const apiKey = import.meta.env.VITE_FOOTBALL_API_KEY;
  const { loading, matches } = useAppMatches();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-4">Matches</h1>

      {loading ? (
        <div className="text-slate-300">Loading matches…</div>
      ) : (
        <MatchesDisplay matches={matches} />
      )}

      {!apiKey && (
        <div className="mt-6 text-sm text-slate-400">
          (Showing matches from local database. To use football-data.org set VITE_FOOTBALL_API_KEY and VITE_FOOTBALL_API_URL)
        </div>
      )}
    </div>
  );
};

export default MatchesPage;