"use client";

import { useState } from "react";
import { TeamStanding } from "@/lib/types";
import PlayerRow from "./PlayerRow";

const rankColors: Record<number, string> = {
  0: "border-yellow-500/30",
  1: "border-slate-400/30",
  2: "border-amber-700/30",
};

const teamColors: Record<string, string> = {
  "Team White": "from-slate-200/10 to-slate-200/5",
  "Team Red": "from-red-400/15 to-red-400/5",
  "Team Blue": "from-blue-400/15 to-blue-400/5",
  "Team Brown": "from-amber-800/15 to-amber-800/5",
  "Team Green": "from-green-400/15 to-green-400/5",
  "Team Orange": "from-orange-400/15 to-orange-400/5",
  "Team Pink": "from-pink-400/15 to-pink-400/5",
  "Team Yellow": "from-yellow-400/15 to-yellow-400/5",
};

export default function TeamCard({
  team,
  rank,
}: {
  team: TeamStanding;
  rank: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const borderClass =
    rankColors[rank] ?? "border-slate-700";
  const gradientClass =
    teamColors[team.teamName] ?? "from-slate-800 to-slate-800";

  return (
    <div
      className={`rounded-xl border bg-gradient-to-r ${gradientClass} ${borderClass} overflow-hidden`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold text-slate-400 w-8">
            #{rank + 1}
          </span>
          <div className="text-left">
            <h3 className="text-lg font-semibold">{team.teamName}</h3>
            <p className="text-sm text-slate-400">{team.ownerName}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold">{team.totalPoints}</span>
          <span
            className={`text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            ▼
          </span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-700/50 p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="py-2 px-3 text-left w-10">#</th>
                <th className="py-2 px-3 text-left">Player</th>
                <th className="py-2 px-3 text-center">Matches</th>
                <th className="py-2 px-3 text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {team.players.map((player, i) => (
                <PlayerRow key={player.playerId} player={player} index={i} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
