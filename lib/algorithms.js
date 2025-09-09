function key(n) { return `${n.r},${n.c}`; }
function isOpen(grid, r, c) {
  return grid[r] && grid[r][c] !== undefined && grid[r][c] === 0;
}

export function bfsCore(grid, start, goal) {
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  const q = [start];
  const seen = new Set([key(start)]);
  const parent = {};
  const visitedOrder = [];

  while (q.length) {
    const u = q.shift();
    visitedOrder.push(u);
    if (u.r === goal.r && u.c === goal.c) break;
    for (const [dr, dc] of dirs) {
      const v = { r: u.r + dr, c: u.c + dc };
      if (isOpen(grid, v.r, v.c)) {
        const kv = key(v);
        if (!seen.has(kv)) { seen.add(kv); parent[kv] = key(u); q.push(v); }
      }
    }
  }
  return { visitedOrder, parent };
}

export function dfsCore(grid, start, goal) {
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  const st = [start];
  const seen = new Set([key(start)]);
  const parent = {};
  const visitedOrder = [];

  while (st.length) {
    const u = st.pop();
    visitedOrder.push(u);
    if (u.r === goal.r && u.c === goal.c) break;
    for (const [dr, dc] of dirs) {
      const v = { r: u.r + dr, c: u.c + dc };
      if (isOpen(grid, v.r, v.c)) {
        const kv = key(v);
        if (!seen.has(kv)) { seen.add(kv); parent[kv] = key(u); st.push(v); }
      }
    }
  }
  return { visitedOrder, parent };
}