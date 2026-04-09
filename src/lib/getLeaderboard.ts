import { unstable_cache } from "next/cache";
import { fetchAllPoints } from "./fetchPoints";
import { TeamStanding } from "./types";
import teamsData from "@/data/teams.json";

async function buildLeaderboard(): Promise<TeamStanding[]> {
  const allPlayers = teamsData.teams.flatMap((team) =>
    team.players.map((player) => ({ ...player, _teamName: team.teamName, _ownerName: team.ownerName }))
  );

  const allPoints = await fetchAllPoints(allPlayers);

  let pointIndex = 0;
  const standings: TeamStanding[] = teamsData.teams.map((team) => {
    const teamPlayers = allPoints.slice(pointIndex, pointIndex + team.players.length);
    pointIndex += team.players.length;

    teamPlayers.sort((a, b) => b.totalPoints - a.totalPoints);

    const totalPoints = teamPlayers
      .slice(0, 11)
      .reduce((sum, p) => sum + p.totalPoints, 0);

    return {
      teamName: team.teamName,
      ownerName: team.ownerName,
      totalPoints,
      players: teamPlayers,
    };
  });

  standings.sort((a, b) => b.totalPoints - a.totalPoints);
  return standings;
}

export const getLeaderboard = unstable_cache(buildLeaderboard, ["leaderboard"], {
  revalidate: 3600,
  tags: ["leaderboard"],
});
