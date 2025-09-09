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
  const [algo, setAlgo] = useState("bfs"); // 'bfs' | 'dfs'
  const [speed, setSpeed] = useState(30); // ms per step

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
    if (animRef.current) {
      clearTimeout(animRef.current);
      animRef.current = null;
    }
    setRunning(false);
    setGrid((g) => g.map((row) => row.map((cell) => ({ ...cell, visited: false, onPath: false }))));
  }

  function hardReset() {
    if (animRef.current) {
      clearTimeout(animRef.current);
      animRef.current = null;
    }
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

  // Click handler (respects mode)
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
        // wall mode uses onWallPaint instead
        if (!ng[r][c].start && !ng[r][c].goal) ng[r][c].wall = !ng[r][c].wall;
      }
      return ng;
    });
  }

  // Drag painting walls only (never moves start/goal)
  function onWallPaint(r, c) {
    if (running) return;
    setGrid((g) => {
      const ng = g.map((row) => row.map((cell) => ({ ...cell })));
      const cell = ng[r][c];
      if (!cell.start && !cell.goal) {
        cell.wall = !cell.wall; // force paint "on" while dragging
        // If you'd prefer toggling while dragging, use: cell.wall = !cell.wall;
      }
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
        // unreachable-goal guard
        const key = (n) => `${n.r},${n.c}`;
        const goalKey = key(goalRef.current);
        if (!parent[goalKey]) {
          setRunning(false);
          return;
        }

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
          <h1 style={{ marginBottom: 8 }}>Algorithms Visualizer</h1>
          <p style={{ opacity: 0.7, marginTop: 0, marginBottom: 16 }}>
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

          <div style={{ marginTop: 12 }}>
            <Grid
              grid={grid}
              mode={mode}
              running={running}
              onCellClick={handleCellClick}
              onWallPaint={onWallPaint}
            />
          </div>

          <p style={{ marginTop: 12, opacity: 0.7 }}>
            Tip: switch modes to set <b>Start</b>/<b>Goal</b> or hold the mouse to <b>draw Walls</b>, then run BFS/DFS.
          </p>
        </main>

        <footer className={styles.footer}>
          <a href="https://nextjs.org/learn" target="_blank" rel="noopener noreferrer">Learn</a>
          <a href="https://vercel.com/templates?framework=next.js" target="_blank" rel="noopener noreferrer">Templates</a>
          <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer">nextjs.org →</a>
        </footer>
      </div>
    </>
  );
}
