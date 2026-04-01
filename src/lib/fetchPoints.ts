import { put, list } from "@vercel/blob";
import { PlayerConfig, PlayerPoints, FantasyApiResponse, StoredPoints } from "./types";

const BLOB_FILENAME = "player-points.json";

function formatBuster(): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `${mm}${dd}${yyyy}${hh}${min}${ss}`;
}

async function loadStoredPoints(): Promise<StoredPoints> {
  try {
    const { blobs } = await list({ prefix: BLOB_FILENAME });
    if (blobs.length === 0) return {};
    const res = await fetch(blobs[0].url);
    return await res.json();
  } catch {
    return {};
  }
}

async function saveStoredPoints(points: StoredPoints): Promise<void> {
  await put(BLOB_FILENAME, JSON.stringify(points), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

async function fetchPlayerFromApi(player: PlayerConfig): Promise<FantasyApiResponse | null> {
  const buster = formatBuster();
  const url = `https://fantasy.iplt20.com/classic/api/feed/gameday-player/popup-cards?teamId=${player.teamId}&playerId=${player.playerId}&buster=${buster}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.warn(`Failed to fetch ${player.name}: HTTP ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.warn(`Error fetching ${player.name}:`, error);
    return null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchAllPoints(
  players: PlayerConfig[]
): Promise<PlayerPoints[]> {
  const stored = await loadStoredPoints();
  let hasNewData = false;
  const batchSize = 10;

  // Fetch from API in batches and merge new match data into stored points
  for (let i = 0; i < players.length; i += batchSize) {
    const batch = players.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (player) => {
        const data = await fetchPlayerFromApi(player);
        if (!data) return;

        const completed = data.Data?.Value?.Completed;
        if (!completed || completed.length === 0) return;

        const pid = String(player.playerId);
        if (!stored[pid]) stored[pid] = {};

        for (const match of completed) {
          const mid = String(match.MatchId);
          const points = match.GameDaypoints || 0;
          if (stored[pid][mid] !== points) {
            stored[pid][mid] = points;
            hasNewData = true;
          }
        }
      })
    );

    if (i + batchSize < players.length) {
      await sleep(100);
    }
  }

  // Save to Blob if we found new match data
  if (hasNewData) {
    await saveStoredPoints(stored);
  }

  // Build results from stored points
  return players.map((player) => {
    const pid = String(player.playerId);
    const matches = stored[pid] || {};
    const matchEntries = Object.values(matches);
    const totalPoints = matchEntries.reduce((sum, pts) => sum + pts, 0);

    return {
      name: player.name,
      playerId: player.playerId,
      totalPoints,
      matchesPlayed: matchEntries.length,
    };
  });
}
