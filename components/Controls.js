export default function Controls({
  mode,
  setMode,
  algo,
  setAlgo,
  speed,
  setSpeed,
  onRunBFS,
  onRunDFS,
  onResetVisited,
  onHardReset,
}) {
  return (
    <div className="controls">
      <div className="modes">
        <label>Mode:</label>
        <button className={mode === "wall" ? "active" : ""} onClick={() => setMode("wall")}>Wall</button>
        <button className={mode === "start" ? "active" : ""} onClick={() => setMode("start")}>Start</button>
        <button className={mode === "goal" ? "active" : ""} onClick={() => setMode("goal")}>Goal</button>
      </div>

      <div className="algos">
        <label>Algorithm:</label>
        <select value={algo} onChange={(e) => setAlgo(e.target.value)}>
          <option value="bfs">BFS</option>
          <option value="dfs">DFS</option>
        </select>
        <button onClick={onRunBFS}>Run BFS</button>
        <button onClick={onRunDFS}>Run DFS</button>
      </div>

      <div className="speed">
        <label>Speed:</label>
        <input
          type="range"
          min={5}
          max={200}
          step={5}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
        />
        <span>{speed} ms</span>
      </div>

      <div className="resets">
        <button onClick={onResetVisited}>Reset Visited</button>
        <button onClick={onHardReset}>Hard Reset</button>
      </div>
    </div>
  );
}
