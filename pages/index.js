// pages/index.js
import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useEffect, useRef, useState } from "react";
import Grid from "@/components/Grid";
import Controls from "@/components/Controls";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const NROWS = 25;
const NCOLS = 25;

function emptyGrid() {
  return Array.from({ length: NROWS }, (_, r) =>
    Array.from({ length: NCOLS }, (_, c) => ({
      r, c,
      wall: false,
      visited: false,
      onPath: false,
      start: false,
      goal: false,
    }))
  );
}

export default function Home() {
  const [grid, setGrid] = useState(emptyGrid());
  const [mode, setMode] = useState("wall"); // 'start' | 'goal' | 'wall'
  const [running, setRunning] = useState(false);
  const [algo, setAlgo] = useState("bfs");
  const [speed, setSpeed] = useState(30);

  const startRef = useRef({ r: 12, c: 6 });
  const goalRef = useRef({ r: 12, c: 18 });
  const animRef = useRef(null);

  useEffect(() => {
    setGrid((g) => {
      const ng = g.map((row) => row.map((cell) => ({ ...cell })));
      ng[startRef.current.r][startRef.current.c].start = true;
      ng[goalRef.current.r][goalRef.current.c].goal = true;
      return ng;
    });
  }, []);

  function resetVisited() {
    if (animRef.current) { clearTimeout(animRef.current); animRef.current = null; }
    setRunning(false);
    setGrid((g) => g.map((row) => row.map((cell) => ({ ...cell, visited: false, onPath: false }))));
  }

  function hardReset() {
    if (animRef.current) { clearTimeout(animRef.current); animRef.current = null; }
    setRunning(false);
    setGrid(emptyGrid());
    setTimeout(() => {
      setGrid((g) => {
        const ng = g.map((row) => row.map((cell) => ({ ...cell })));
        ng[startRef.current.r][startRef.current.c].start = true;
        ng[goalRef.current.r][goalRef.current.c].goal = true;
        return ng;
      });
    }, 0);
  }

  function handleCellClick(r, c) {
    if (running) return;
    setGrid((g) => {
      const ng = g.map((row) => row.map((cell) => ({ ...cell })));
      if (mode === "start") {
        ng.forEach((row) => row.forEach((cell) => (cell.start = false)));
        ng[r][c].start = true;
        startRef.current = { r, c };
      } else if (mode === "goal") {
        ng.forEach((row) => row.forEach((cell) => (cell.goal = false)));
        ng[r][c].goal = true;
        goalRef.current = { r, c };
      } else {
        if (!ng[r][c].start && !ng[r][c].goal) ng[r][c].wall = !ng[r][c].wall;
      }
      return ng;
    });
  }

  // Draw walls (mouse drag / touch move)
  function onWallPaint(r, c) {
    if (running) return;
    setGrid((g) => {
      const ng = g.map((row) => row.map((cell) => ({ ...cell })));
      const cell = ng[r][c];
      if (!cell.start && !cell.goal) cell.wall = !cell.wall; // paint ON while dragging
      return ng;
    });
  }

  async function runAlgorithm(kind) {
    if (running) return;
    resetVisited();
    setAlgo(kind);
    setRunning(true);

    const payload = {
      grid: grid.map((row) => row.map((cell) => (cell.wall ? 1 : 0))),
      start: startRef.current,
      goal: goalRef.current,
    };

    const res = await fetch(`/api/${kind}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    const { visitedOrder, parent } = data;

    let i = 0;
    const step = () => {
      if (i < visitedOrder.length) {
        const { r, c } = visitedOrder[i++];
        setGrid((g) => {
          const ng = g.map((row) => row.map((cell) => ({ ...cell })));
          if (!ng[r][c].start && !ng[r][c].goal && !ng[r][c].wall) ng[r][c].visited = true;
          return ng;
        });
        animRef.current = setTimeout(step, speed);
      } else {
        const key = (n) => `${n.r},${n.c}`;
        const goalKey = key(goalRef.current);
        if (!parent[goalKey]) { setRunning(false); return; }

        // reconstruct path
        const path = [];
        let curKey = goalKey;
        while (parent[curKey]) {
          const [pr, pc] = parent[curKey].split(",").map(Number);
          path.push({ r: pr, c: pc });
          curKey = parent[curKey];
          if (curKey === key(startRef.current)) break;
        }
        setGrid((g) => {
          const ng = g.map((row) => row.map((cell) => ({ ...cell })));
          path.forEach(({ r, c }) => {
            if (!ng[r][c].start && !ng[r][c].goal) ng[r][c].onPath = true;
          });
          return ng;
        });
        setRunning(false);
      }
    };
    step();
  }

  return (
    <>
      <Head>
        <title>Algorithms Visualizer</title>
        <meta name="description" content="BFS/DFS visualizer built with Next.js + Node.js + React" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}>
        <main className={styles.main}>
          <h1 style={{ marginBottom: 8, fontSize: "clamp(1.4rem, 3vw, 2rem)" }}>Algorithms Visualizer</h1>
          <p style={{ opacity: 0.7, marginTop: 0, marginBottom: 16, fontSize: "clamp(.9rem, 2.5vw, 1rem)" }}>
            Next.js + Node.js API routes (BFS / DFS) + React UI
          </p>

          <Controls
            running={running}
            mode={mode}
            setMode={setMode}
            algo={algo}
            setAlgo={setAlgo}
            speed={speed}
            setSpeed={setSpeed}
            onRunBFS={() => runAlgorithm("bfs")}
            onRunDFS={() => runAlgorithm("dfs")}
            onResetVisited={resetVisited}
            onHardReset={hardReset}
          />

          {/* Auto-fit square grid */}
          <div className="grid-wrapper">
            <Grid
              grid={grid}
              mode={mode}
              running={running}
              onCellClick={handleCellClick}
              onWallPaint={onWallPaint}
            />
          </div>

          <p style={{ marginTop: 12, opacity: 0.7, fontSize: "clamp(.85rem, 2.3vw, .95rem)" }}>
            Tip: set <b>Start</b>/<b>Goal</b>, then tap or drag to draw <b>Walls</b>, and run BFS/DFS.
          </p>
        </main>
      </div>
    </>
  );
}
