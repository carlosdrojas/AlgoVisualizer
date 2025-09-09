// components/Grid.js
import { useEffect, useRef, useState } from "react";

export default function Grid({ grid, mode, running, onCellClick, onWallPaint }) {
  const [isDown, setIsDown] = useState(false);
  const isDownRef = useRef(false);

  useEffect(() => {
    const up = () => {
      isDownRef.current = false;
      setIsDown(false);
    };
    window.addEventListener("mouseup", up);
    window.addEventListener("mouseleave", up);
    return () => {
      window.removeEventListener("mouseup", up);
      window.removeEventListener("mouseleave", up);
    };
  }, []);

  function handleMouseDown(r, c) {
    if (running) return;
    isDownRef.current = true;
    setIsDown(true);

    if (mode === "wall") {
      onWallPaint(r, c); // paint/toggle wall immediately on mousedown
    } else {
      onCellClick(r, c); // start/goal placement still via click
    }
  }

  function handleMouseEnter(r, c) {
    if (running) return;
    // only paint on drag while in wall mode
    if (isDownRef.current && mode === "wall") {
      onWallPaint(r, c);
    }
  }

  return (
    <div className="grid" aria-label="grid">
      {grid.map((row, rIdx) => (
        <div className="row" key={rIdx}>
          {row.map((cell) => (
            <div
              key={`${cell.r}-${cell.c}`}
              className={[
                "cell",
                cell.wall ? "wall" : "",
                cell.visited ? "visited" : "",
                cell.onPath ? "path" : "",
                cell.start ? "start" : "",
                cell.goal ? "goal" : "",
              ].join(" ")}
              role="button"
              aria-label={`cell ${cell.r},${cell.c}`}
              onMouseDown={() => handleMouseDown(cell.r, cell.c)}
              onMouseEnter={() => handleMouseEnter(cell.r, cell.c)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
