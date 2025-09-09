import { bfsCore } from "../../lib/algorithms";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { grid, start, goal } = req.body || {};
    if (!grid || !start || !goal) return res.status(400).json({ error: "Missing grid/start/goal" });
    const result = bfsCore(grid, start, goal);
    return res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
}