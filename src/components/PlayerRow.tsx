import { PlayerPoints } from "@/lib/types";

export default function PlayerRow({
  player,
  index,
  isTop11,
}: {
  player: PlayerPoints;
  index: number;
  isTop11: boolean;
}) {
  return (
    <tr className={`border-b border-slate-700/50 last:border-0 ${isTop11 ? "" : "opacity-40"}`}>
      <td className="py-2 px-3 text-slate-400 text-sm">{index + 1}</td>
      <td className="py-2 px-3">{player.name}</td>
      <td className="py-2 px-3 text-center text-slate-400">
        {player.matchesPlayed}
      </td>
      <td className="py-2 px-3 text-right font-semibold">
        {player.totalPoints}
      </td>
    </tr>
  );
}
