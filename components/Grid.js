
export default function Grid({ grid, onCellClick, running }) {
    return (
        <div className="grid">
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
                            onClick={() => !running && onCellClick(cell.r, cell.c)}
                            role="button"
                            aria-label={`cell ${cell.r},${cell.c}`}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}