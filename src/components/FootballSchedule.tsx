import { useEffect, useState } from "react";

const FootballSchedule = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v4/matches")
      .then(res => res.json())
      .then(data => {
        setMatches(data.matches || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading matches...</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Football Schedule</h2>

      {matches.map(match => {
        const isLive = ["LIVE","IN_PLAY","PAUSED"].includes(match.status);
        const isEPL = match.competition.code === "PL";

        return (
          <div
            key={match.id}
            className="p-4 rounded-xl bg-card border border-border"
          >
            <div className="flex justify-between text-xs mb-2">
              <span>{isEPL ? "EPL" : match.competition.name}</span>
              {isLive && <span className="text-red-500">LIVE 🔴</span>}
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <img src={match.homeTeam.crest} className="w-6 h-6" />
                <span>{match.homeTeam.name}</span>
              </div>

              <span className="text-xs">VS</span>

              <div className="flex items-center gap-2">
                <img src={match.awayTeam.crest} className="w-6 h-6" />
                <span>{match.awayTeam.name}</span>
              </div>
            </div>

            <div className="text-xs mt-2 opacity-70">
              {new Date(match.utcDate).toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FootballSchedule;
