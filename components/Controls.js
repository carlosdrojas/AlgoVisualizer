// components/Controls.js
export default function Controls({
  running,
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
        <button
          className={mode === "wall" ? "active" : ""}
          onClick={() => setMode("wall")}
          disabled={running}
        >
          Wall
        </button>
        <button
          className={mode === "start" ? "active" : ""}
          onClick={() => setMode("start")}
          disabled={running}
        >
          Start
        </button>
        <button
          className={mode === "goal" ? "active" : ""}
          onClick={() => setMode("goal")}
          disabled={running}
        >
          Goal
        </button>
      </div>

      <div className="algos">
        <label>Algorithm:</label>
        <select
          value={algo}
          onChange={(e) => setAlgo(e.target.value)}
          disabled={running}
        >
          <option value="bfs">BFS</option>
          <option value="dfs">DFS</option>
        </select>
        <button onClick={onRunBFS} disabled={running}>Run BFS</button>
        <button onClick={onRunDFS} disabled={running}>Run DFS</button>
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
          disabled={running}
        />
        <span>{speed} ms</span>
      </div>

      <div className="resets">
        <button onClick={onResetVisited}>Reset Visited</button>
        <button onClick={onHardReset} disabled={running}>Hard Reset</button>
      </div>
    </div>
  );
}
