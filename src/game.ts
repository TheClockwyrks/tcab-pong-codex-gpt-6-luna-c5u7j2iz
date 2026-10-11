import type {
  Game,
  InitApi,
  RenderApi,
  UpdateApi,
} from "@clockwyrks/simple-2d";
import type { DeepReadonly } from "ts-essentials";
import {
  AI_DEADZONE,
  AI_HOME_DEADZONE,
  AI_HOME_Y,
  AI_REACT,
  AI_SPEED,
  ACTIONS,
  BALL_R,
  BINDINGS,
  CUES,
  FIELD_CX,
  FIELD_CY,
  FIELD_H,
  FIELD_W,
  HOLD_TIME,
  MAX_BOUNCE_ANGLE,
  MAX_SUBSTEP,
  NET_X,
  OBSTACLE_CENTERS,
  OBSTACLES,
  P1_X0,
  P1_X1,
  P2_X0,
  P2_X1,
  PADDLE_HALF,
  PADDLE_H,
  PADDLE_MAX_CY,
  PADDLE_MIN_CY,
  PADDLE_SPEED,
  PADDLE_W,
  SERVE_ANGLE,
  SERVE_SPEED,
  SPIN_CLAMP,
  SPIN_FROM_PADDLE,
  SPIN_HALFLIFE,
  SPEED_CAP,
  SPEED_MULT,
  TITLE_ITEMS,
  TITLE_TEXT,
  PAUSE_ITEMS,
  MATCHOVER_ITEMS,
  TRAIL_TIME,
  WIN_LEAD,
  WIN_SCORE,
  CAROM_DEBUG_VERSION,
  type ActionName,
} from "./constants";

export type Screen =
  "title" | "howto" | "countdown" | "playing" | "paused" | "matchover";
export type Mode = "solo" | "versus";
export type Side = "left" | "right";
export interface PaddleState {
  readonly cy: number;
  readonly vy: number;
  readonly driven: boolean;
  readonly drivenVy: number;
}
export interface AiState {
  readonly tracking: boolean;
  readonly movement: boolean;
}
export interface TrailSample {
  readonly x: number;
  readonly y: number;
  readonly t: number;
}
export interface BallState {
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
  readonly spin: number;
  readonly held: boolean;
  readonly holdTimer: number;
  readonly serveSign: 1 | -1;
  readonly trail: readonly TrailSample[];
}
export interface ObstacleState {
  readonly index: number;
  readonly cx: number;
  readonly cy: number;
}
export interface CaromState {
  readonly screen: Screen;
  readonly mode: Mode;
  readonly menuIndex: number;
  readonly titleIndex: number;
  readonly resumeScreen: "countdown" | "playing";
  readonly score: { readonly p1: number; readonly p2: number };
  readonly winner: Side | null;
  readonly paddles: { readonly left: PaddleState; readonly right: PaddleState };
  readonly ai: AiState;
  readonly receiver: Side;
  readonly ball: BallState | null;
  readonly obstacles: readonly ObstacleState[];
  readonly simTime: number;
  readonly muted: boolean;
}
export interface Snapshot extends Omit<CaromState, "ball"> {
  readonly version: number;
  readonly ball: (BallState & { readonly speed: number }) | null;
}
export interface CaromDebugApi {
  version: number;
  clearWorld(s: DeepReadonly<CaromState>): CaromState;
  spawnBall(s: DeepReadonly<CaromState>): CaromState;
  spawnObstacle(s: DeepReadonly<CaromState>, index: number): CaromState;
  reset(s: DeepReadonly<CaromState>): CaromState;
  reconcile(s: DeepReadonly<CaromState>): CaromState;
  setScreen(s: DeepReadonly<CaromState>, v: Screen): CaromState;
  setMode(s: DeepReadonly<CaromState>, v: Mode): CaromState;
  setMenuIndex(s: DeepReadonly<CaromState>, v: number): CaromState;
  setTitleIndex(s: DeepReadonly<CaromState>, v: number): CaromState;
  setResumeScreen(
    s: DeepReadonly<CaromState>,
    v: "countdown" | "playing",
  ): CaromState;
  setScore(s: DeepReadonly<CaromState>, p1: number, p2: number): CaromState;
  setWinner(s: DeepReadonly<CaromState>, v: Side | null): CaromState;
  setReceiver(s: DeepReadonly<CaromState>, v: Side): CaromState;
  setPaddleCy(s: DeepReadonly<CaromState>, side: Side, cy: number): CaromState;
  setPaddleVy(s: DeepReadonly<CaromState>, side: Side, vy: number): CaromState;
  setPaddleDriven(
    s: DeepReadonly<CaromState>,
    side: Side,
    driven: boolean,
  ): CaromState;
  setBallPosition(
    s: DeepReadonly<CaromState>,
    x: number,
    y: number,
  ): CaromState;
  setBallVelocity(
    s: DeepReadonly<CaromState>,
    vx: number,
    vy: number,
  ): CaromState;
  setBallSpin(s: DeepReadonly<CaromState>, spin: number): CaromState;
  setBallHeld(s: DeepReadonly<CaromState>, held: boolean): CaromState;
  setBallHoldTimer(s: DeepReadonly<CaromState>, seconds: number): CaromState;
  setBallServeSign(s: DeepReadonly<CaromState>, sign: 1 | -1): CaromState;
  drawBallServeSign(s: DeepReadonly<CaromState>): CaromState;
  setAiTracking(s: DeepReadonly<CaromState>, enabled: boolean): CaromState;
  setAiMovement(s: DeepReadonly<CaromState>, enabled: boolean): CaromState;
  setMuted(s: DeepReadonly<CaromState>, muted: boolean): CaromState;
  snapshot(s: DeepReadonly<CaromState>): Snapshot;
  menuItemRect(
    s: DeepReadonly<CaromState>,
    index: number,
  ): { x: number; y: number; w: number; h: number } | null;
}

export const BACKGROUND = "#080d19";
const CYAN = "#55e7ff",
  PINK = "#ff668e",
  GOLD = "#ffcc70",
  TEXT = "#edf5ff";
const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));
const freshSign = (): 1 | -1 => (Math.random() < 0.5 ? -1 : 1);
const obstacles = () =>
  OBSTACLE_CENTERS.map((p, index) => ({ index, cx: p.x, cy: p.y }));
const paddle = (): PaddleState => ({
  cy: FIELD_CY,
  vy: 0,
  driven: false,
  drivenVy: 0,
});
const park = (): BallState => ({
  x: FIELD_CX,
  y: FIELD_CY,
  vx: 0,
  vy: 0,
  spin: 0,
  held: true,
  holdTimer: HOLD_TIME,
  serveSign: freshSign(),
  trail: [],
});
const initial = (muted = false): CaromState => ({
  screen: "title",
  mode: "solo",
  menuIndex: 0,
  titleIndex: 0,
  resumeScreen: "playing",
  score: { p1: 0, p2: 0 },
  winner: null,
  paddles: { left: paddle(), right: paddle() },
  ai: { tracking: true, movement: true },
  receiver: "left",
  ball: park(),
  obstacles: obstacles(),
  simTime: 0,
  muted,
});
const rectFor = (screen: Screen) =>
  screen === "title"
    ? { items: TITLE_ITEMS.map((x) => x), y: 366 }
    : screen === "howto"
      ? { items: ["BACK TO TITLE"], y: 586 }
      : screen === "paused"
        ? { items: PAUSE_ITEMS.map((x) => x), y: 376 }
        : screen === "matchover"
          ? { items: MATCHOVER_ITEMS.map((x) => x), y: 470 }
          : null;
const itemRect = (screen: Screen, index: number) => {
  const m = rectFor(screen);
  return !m || index < 0 || index >= m.items.length
    ? null
    : { x: FIELD_CX - 190, y: m.y + index * 58 - 22, w: 380, h: 44 };
};
const ballOf = (s: DeepReadonly<CaromState>): BallState => {
  if (!s.ball) throw new Error("Carom: no ball is present");
  return s.ball as BallState;
};
const withBall = (
  s: DeepReadonly<CaromState>,
  change: Partial<BallState>,
): CaromState => ({ ...s, ball: { ...ballOf(s), ...change } });
const stateClone = (s: DeepReadonly<CaromState>): CaromState => ({
  ...s,
  score: { ...s.score },
  paddles: { left: { ...s.paddles.left }, right: { ...s.paddles.right } },
  ai: { ...s.ai },
  obstacles: s.obstacles.map((o) => ({ ...o })),
  ball: s.ball
    ? { ...s.ball, trail: s.ball.trail.map((t) => ({ ...t })) }
    : null,
});
const rectMenu = (s: DeepReadonly<CaromState>, index: number) =>
  itemRect(s.screen, index);
const makeDebug = (
  setRuntimeMuted: (value: boolean) => void,
): CaromDebugApi => ({
  version: CAROM_DEBUG_VERSION,
  clearWorld: (s) => ({ ...s, ball: null, obstacles: [] }),
  spawnBall: (s) => ({ ...s, ball: park() }),
  spawnObstacle: (s, index) => {
    if (index !== 0 && index !== 1)
      throw new Error(`Carom: invalid obstacle index ${index}`);
    const p = OBSTACLE_CENTERS[index]!;
    return {
      ...s,
      obstacles: [
        ...s.obstacles.filter((o) => o.index !== index),
        { index, cx: p.x, cy: p.y },
      ].sort((a, b) => a.index - b.index),
    };
  },
  reset: (s) => initial(s.muted),
  reconcile: (s) => stateClone(s),
  setScreen: (s, v) => ({ ...s, screen: v }),
  setMode: (s, v) => ({ ...s, mode: v }),
  setMenuIndex: (s, v) => ({ ...s, menuIndex: v }),
  setTitleIndex: (s, v) => ({ ...s, titleIndex: v }),
  setResumeScreen: (s, v) => ({ ...s, resumeScreen: v }),
  setScore: (s, p1, p2) => ({ ...s, score: { p1, p2 } }),
  setWinner: (s, v) => ({ ...s, winner: v }),
  setReceiver: (s, v) => ({ ...s, receiver: v }),
  setPaddleCy: (s, side, cy) => ({
    ...s,
    paddles: { ...s.paddles, [side]: { ...s.paddles[side], cy } },
  }),
  setPaddleVy: (s, side, vy) => ({
    ...s,
    paddles: { ...s.paddles, [side]: { ...s.paddles[side], drivenVy: vy } },
  }),
  setPaddleDriven: (s, side, driven) => ({
    ...s,
    paddles: { ...s.paddles, [side]: { ...s.paddles[side], driven } },
  }),
  setBallPosition: (s, x, y) => withBall(s, { x, y }),
  setBallVelocity: (s, vx, vy) => withBall(s, { vx, vy }),
  setBallSpin: (s, spin) => withBall(s, { spin }),
  setBallHeld: (s, held) => withBall(s, { held }),
  setBallHoldTimer: (s, holdTimer) =>
    withBall(s, { holdTimer, ...(holdTimer === 0 ? { held: false } : {}) }),
  setBallServeSign: (s, serveSign) => withBall(s, { serveSign }),
  drawBallServeSign: (s) => withBall(s, { serveSign: freshSign() }),
  setAiTracking: (s, tracking) => ({ ...s, ai: { ...s.ai, tracking } }),
  setAiMovement: (s, movement) => ({ ...s, ai: { ...s.ai, movement } }),
  setMuted: (s, muted) => {
    setRuntimeMuted(muted);
    return { ...s, muted };
  },
  snapshot: (s) =>
    ({
      ...s,
      version: CAROM_DEBUG_VERSION,
      ball: s.ball
        ? { ...s.ball, speed: Math.hypot(s.ball.vx, s.ball.vy) }
        : null,
    }) as Snapshot,
  menuItemRect: (s, index) => rectMenu(s, index),
});

function integrate(p: PaddleState, requested: number, dt: number): PaddleState {
  if (dt <= 0) return { ...p, vy: 0 };
  const cy = clamp(p.cy + requested * dt, PADDLE_MIN_CY, PADDLE_MAX_CY);
  return { ...p, cy, vy: (cy - p.cy) / dt };
}
function hitRect(
  b: BallState,
  x0: number,
  x1: number,
  y0: number,
  y1: number,
): { ball: BallState; face: number } | null {
  if (!(
    b.x > x0 - BALL_R &&
    b.x < x1 + BALL_R &&
    b.y > y0 - BALL_R &&
    b.y < y1 + BALL_R
  ))
    return null;
  const ds = [
    b.x - (x0 - BALL_R),
    x1 + BALL_R - b.x,
    b.y - (y0 - BALL_R),
    y1 + BALL_R - b.y,
  ];
  let face = 0;
  for (let i = 1; i < 4; i++) if (ds[i]! < ds[face]!) face = i;
  let { x, y, vx, vy } = b;
  if (face === 0) {
    x = x0 - BALL_R;
    if (vx > 0) vx = -vx;
  } else if (face === 1) {
    x = x1 + BALL_R;
    if (vx < 0) vx = -vx;
  } else if (face === 2) {
    y = y0 - BALL_R;
    if (vy > 0) vy = -vy;
  } else {
    y = y1 + BALL_R;
    if (vy < 0) vy = -vy;
  }
  return { ball: { ...b, x, y, vx, vy }, face };
}
function physics(
  ball: BallState,
  s: DeepReadonly<CaromState>,
  dt: number,
  api: UpdateApi,
): BallState {
  let b = ball;
  const speed = Math.hypot(b.vx, b.vy),
    n = Math.max(1, Math.ceil((speed * dt) / MAX_SUBSTEP)),
    h = dt / n;
  for (let step = 0; step < n; step++) {
    const sp = Math.hypot(b.vx, b.vy);
    if (sp > 0) {
      const a = (b.spin / sp) * h,
        c = Math.cos(a),
        sn = Math.sin(a);
      b = { ...b, vx: b.vx * c - b.vy * sn, vy: b.vx * sn + b.vy * c };
    }
    b = {
      ...b,
      spin: b.spin * Math.pow(0.5, h / SPIN_HALFLIFE),
      x: b.x + b.vx * h,
      y: b.y + b.vy * h,
    };
    if (b.y - BALL_R < 0 && b.vy < 0) {
      b = { ...b, y: BALL_R, vy: -b.vy };
      api.audio.play(CUES.wallBounce);
    } else if (b.y + BALL_R > FIELD_H && b.vy > 0) {
      b = { ...b, y: FIELD_H - BALL_R, vy: -b.vy };
      api.audio.play(CUES.wallBounce);
    }
    for (const side of ["left", "right"] as const) {
      const pp = s.paddles[side],
        r =
          side === "left"
            ? hitRect(b, P1_X0, P1_X1, pp.cy - PADDLE_HALF, pp.cy + PADDLE_HALF)
            : hitRect(
                b,
                P2_X0,
                P2_X1,
                pp.cy - PADDLE_HALF,
                pp.cy + PADDLE_HALF,
              );
      if (r) {
        b = r.ball;
        if (r.face < 2) {
          const offset = clamp((b.y - pp.cy) / PADDLE_HALF, -1, 1),
            theta = offset * MAX_BOUNCE_ANGLE,
            vel = Math.min(Math.hypot(b.vx, b.vy) * SPEED_MULT, SPEED_CAP),
            dir = side === "left" ? 1 : -1;
          b = {
            ...b,
            x: side === "left" ? P1_X1 + BALL_R : P2_X0 - BALL_R,
            vx: dir * vel * Math.cos(theta),
            vy: vel * Math.sin(theta),
            spin: clamp(
              b.spin + pp.vy * SPIN_FROM_PADDLE,
              -SPIN_CLAMP,
              SPIN_CLAMP,
            ),
          };
          api.audio.play(CUES.paddleHit);
        } else api.audio.play(CUES.wallBounce);
      }
    }
    for (const obs of s.obstacles) {
      const rr = OBSTACLES[obs.index];
      if (!rr) continue;
      const r = hitRect(b, rr.x0, rr.x1, rr.y0, rr.y1);
      if (r) {
        b = r.ball;
        api.audio.play(CUES.obstacleBounce);
      }
    }
  }
  return b;
}
const BG_STYLE = "#10182a";
function serve(b: BallState, receiver: Side): BallState {
  const d = receiver === "left" ? -1 : 1;
  return {
    ...b,
    held: false,
    holdTimer: 0,
    vx: d * SERVE_SPEED * Math.cos(SERVE_ANGLE),
    vy: b.serveSign * SERVE_SPEED * Math.sin(SERVE_ANGLE),
    trail: [],
  };
}
function startMatch(s: DeepReadonly<CaromState>, mode: Mode): CaromState {
  return {
    ...s,
    screen: "countdown",
    mode,
    menuIndex: 0,
    resumeScreen: "playing",
    score: { p1: 0, p2: 0 },
    winner: null,
    receiver: "left",
    ball: park(),
    paddles: { left: paddle(), right: paddle() },
  };
}
function toTitle(s: DeepReadonly<CaromState>): CaromState {
  const n = initial(s.muted);
  return {
    ...n,
    titleIndex: s.titleIndex,
    menuIndex: s.titleIndex,
    simTime: s.simTime,
  };
}
function advanceMenu(s: CaromState, delta: number, count: number): CaromState {
  return { ...s, menuIndex: (s.menuIndex + delta + count) % count };
}
function confirm(s: CaromState): CaromState {
  if (s.screen === "title") {
    const ix = s.menuIndex;
    if (ix === 0) return { ...startMatch(s, "solo"), titleIndex: ix };
    if (ix === 1) return { ...startMatch(s, "versus"), titleIndex: ix };
    return { ...s, screen: "howto", menuIndex: 0, titleIndex: ix };
  }
  if (s.screen === "howto") return toTitle(s);
  if (s.screen === "paused") {
    if (s.menuIndex === 0) return { ...s, screen: s.resumeScreen };
    if (s.menuIndex === 1) return startMatch(s, s.mode);
    return toTitle(s);
  }
  if (s.screen === "matchover")
    return s.menuIndex === 0 ? startMatch(s, s.mode) : toTitle(s);
  return s;
}
function movePaddles(s: CaromState, api: UpdateApi, dt: number): CaromState {
  const active = s.screen === "countdown" || s.screen === "playing";
  if (!active) return s;
  const val = (...names: string[]) =>
    names.reduce((a, n) => a + api.input.value(n), 0);
  let left = s.paddles.left,
    right = s.paddles.right;
  if (left.driven) left = integrate(left, left.drivenVy, dt);
  else {
    const up = val("p1-up", ...(s.mode === "solo" ? ["p2-up"] : [])),
      down = val("p1-down", ...(s.mode === "solo" ? ["p2-down"] : []));
    left = integrate(left, (down - up) * PADDLE_SPEED, dt);
  }
  if (right.driven) right = integrate(right, right.drivenVy, dt);
  else if (s.mode === "versus")
    right = integrate(
      right,
      (val("p2-down") - val("p2-up")) * PADDLE_SPEED,
      dt,
    );
  else if (s.ai.movement) {
    let target = AI_HOME_Y,
      dead = AI_HOME_DEADZONE;
    if (s.ai.tracking && s.screen === "playing" && s.ball && s.ball.vx > 0) {
      target = s.ball.y - s.ball.vy * AI_REACT;
      dead = AI_DEADZONE;
    }
    const diff = target - right.cy;
    right = integrate(
      right,
      Math.abs(diff) <= dead
        ? 0
        : Math.sign(diff) *
            Math.min(AI_SPEED, dt > 0 ? Math.abs(diff) / dt : 0),
      dt,
    );
  } else right = { ...right, vy: 0 };
  return { ...s, paddles: { left, right } };
}
function menuPointer(
  s: CaromState,
  api: UpdateApi,
): { state: CaromState; confirm: boolean } {
  let selected: number | null = null,
    down: number | null = null,
    up: number | null = null;
  const inside = (x: number, y: number) => {
    const m = rectFor(s.screen);
    if (!m) return null;
    for (let i = 0; i < m.items.length; i++) {
      const r = itemRect(s.screen, i)!;
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return i;
    }
    return null;
  };
  for (const sample of api.input.pointerSamples()) {
    const ix = inside(sample.x, sample.y);
    if (sample.type === "move" && ix !== null) selected = ix;
    if (sample.type === "down" && sample.button === "primary") down = ix;
    if (sample.type === "up" && sample.button === "primary") {
      up = ix;
      if (ix !== null) selected = ix;
    }
  }
  for (const c of api.input.pointerContacts()) {
    const ix = inside(c.x, c.y);
    if (ix !== null) selected = ix;
  }
  const state = selected === null ? s : { ...s, menuIndex: selected };
  return { state, confirm: down !== null && down === up && down !== null };
}
function rounded(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  color: string,
): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}
function drawField(
  s: DeepReadonly<CaromState>,
  ctx: CanvasRenderingContext2D,
  dim = false,
): void {
  ctx.fillStyle = BG_STYLE;
  ctx.fillRect(0, 0, FIELD_W, FIELD_H);
  ctx.strokeStyle = "#26344d";
  ctx.lineWidth = 2;
  ctx.setLineDash([12, 14]);
  ctx.beginPath();
  ctx.moveTo(NET_X, 42);
  ctx.lineTo(NET_X, FIELD_H - 42);
  ctx.stroke();
  ctx.setLineDash([]);
  for (const o of s.obstacles)
    rounded(ctx, o.cx - 10, o.cy - 70, 20, 140, 10, "#ad83ff");
  const l = s.paddles.left,
    r = s.paddles.right;
  rounded(ctx, P1_X0, l.cy - PADDLE_H / 2, PADDLE_W, PADDLE_H, 8, CYAN);
  rounded(ctx, P2_X0, r.cy - PADDLE_H / 2, PADDLE_W, PADDLE_H, 8, PINK);
  if (s.ball) {
    const b = s.ball;
    if (!b.held) {
      for (let i = 0; i < b.trail.length; i++) {
        const t = b.trail[i]!,
          a = (i + 1) / b.trail.length;
        ctx.globalAlpha = 0.04 + a * 0.22;
        ctx.fillStyle = GOLD;
        ctx.beginPath();
        ctx.arc(t.x, t.y, Math.max(2, BALL_R * a * 0.75), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    ctx.shadowColor = GOLD;
    ctx.shadowBlur = 22;
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  if (dim) {
    ctx.fillStyle = "rgba(4,8,16,.68)";
    ctx.fillRect(0, 0, FIELD_W, FIELD_H);
  }
}
function drawMenu(
  ctx: CanvasRenderingContext2D,
  screen: Screen,
  index: number,
): void {
  const m = rectFor(screen);
  if (!m) return;
  m.items.forEach((label, i) => {
    const r = itemRect(screen, i)!;
    ctx.textAlign = "center";
    ctx.font = "600 19px system-ui, sans-serif";
    ctx.fillStyle = i === index ? "#08101d" : "#b8c5d8";
    if (i === index) {
      rounded(ctx, r.x, r.y, r.w, r.h, 12, CYAN);
      ctx.fillStyle = "#08101d";
    }
    ctx.fillText(label, FIELD_CX, r.y + 29);
  });
}
export const game: Game<CaromState, CaromDebugApi> = {
  initialize(api: InitApi<CaromState>) {
    ACTIONS.forEach((a) =>
      api.input.register(a, { keys: [...BINDINGS[a as ActionName]] }),
    );
    api.audio.define(CUES.paddleHit, {
      freq: 510,
      freqTo: 260,
      durationMs: 70,
    });
    api.audio.define(CUES.wallBounce, {
      freq: 320,
      freqTo: 210,
      durationMs: 55,
    });
    api.audio.define(CUES.obstacleBounce, {
      freq: 740,
      freqTo: 390,
      durationMs: 85,
    });
    api.audio.define(CUES.score, { freq: 220, freqTo: 880, durationMs: 260 });
    for (const [name, read] of Object.entries({
      screen: (s: DeepReadonly<CaromState>) => s.screen,
      mode: (s: DeepReadonly<CaromState>) => s.mode,
      score: (s: DeepReadonly<CaromState>) => `${s.score.p1} : ${s.score.p2}`,
      ball: (s: DeepReadonly<CaromState>) =>
        s.ball ? `${s.ball.x.toFixed(0)},${s.ball.y.toFixed(0)}` : "absent",
      velocity: (s: DeepReadonly<CaromState>) =>
        s.ball ? `${s.ball.vx.toFixed(0)},${s.ball.vy.toFixed(0)}` : "—",
      speed: (s: DeepReadonly<CaromState>) =>
        s.ball ? Math.hypot(s.ball.vx, s.ball.vy).toFixed(0) : "—",
      spin: (s: DeepReadonly<CaromState>) => s.ball?.spin.toFixed(0) ?? "—",
      p1: (s: DeepReadonly<CaromState>) =>
        `${s.paddles.left.cy.toFixed(0)} / ${s.paddles.left.vy.toFixed(0)}`,
      p2: (s: DeepReadonly<CaromState>) =>
        `${s.paddles.right.cy.toFixed(0)} / ${s.paddles.right.vy.toFixed(0)}`,
    }))
      api.diagnostics.register(name, read);
    const state = initial(false);
    return [state, makeDebug(() => {})];
  },
  update(state, api, dt) {
    let s = stateClone(state);
    s = { ...s, simTime: s.simTime + dt };
    const muteEdge = api.input.pressed("mute");
    if (muteEdge) api.audio.setMuted(!api.audio.muted());
    s = { ...s, muted: api.audio.muted() };
    const screenAtStart = s.screen;
    if (
      s.screen === "title" ||
      s.screen === "howto" ||
      s.screen === "paused" ||
      s.screen === "matchover"
    ) {
      if (s.screen === "title") {
        const up = api.input.pressed("p1-up") || api.input.pressed("p2-up"),
          down = api.input.pressed("p1-down") || api.input.pressed("p2-down");
        if (up) s = advanceMenu(s, -1, TITLE_ITEMS.length);
        else if (down) s = advanceMenu(s, 1, TITLE_ITEMS.length);
      } else if (s.screen === "paused") {
        if (api.input.pressed("pause") || api.input.pressed("back"))
          s = { ...s, screen: s.resumeScreen };
        else {
          const up = api.input.pressed("p1-up") || api.input.pressed("p2-up"),
            down = api.input.pressed("p1-down") || api.input.pressed("p2-down");
          if (up) s = advanceMenu(s, -1, PAUSE_ITEMS.length);
          else if (down) s = advanceMenu(s, 1, PAUSE_ITEMS.length);
        }
      } else if (s.screen === "matchover") {
        const up = api.input.pressed("p1-up") || api.input.pressed("p2-up"),
          down = api.input.pressed("p1-down") || api.input.pressed("p2-down");
        if (up) s = advanceMenu(s, -1, MATCHOVER_ITEMS.length);
        else if (down) s = advanceMenu(s, 1, MATCHOVER_ITEMS.length);
      }
      const ptr = menuPointer(s, api);
      s = ptr.state;
      const keyConfirm = api.input.pressed("confirm");
      if (s.screen === "title") {
        if (keyConfirm) {
          const selected = s.menuIndex;
          s = confirm(s);
          if (screenAtStart === "title") s = { ...s, titleIndex: selected };
        } else if (ptr.confirm) {
          const selected = s.menuIndex;
          s = confirm(s);
          if (screenAtStart === "title") s = { ...s, titleIndex: selected };
        }
      } else if (s.screen === "howto") {
        if (
          api.input.pressed("confirm") ||
          api.input.pressed("back") ||
          ptr.confirm
        )
          s = toTitle(s);
      } else if (s.screen === "paused") {
        if (keyConfirm || ptr.confirm) s = confirm(s);
      } else if (s.screen === "matchover") {
        if (keyConfirm || ptr.confirm) s = confirm(s);
        else if (api.input.pressed("back")) s = toTitle(s);
      }
    } else if (s.screen === "countdown" || s.screen === "playing") {
      if (api.input.pressed("pause")) {
        s = { ...s, resumeScreen: s.screen, screen: "paused", menuIndex: 0 };
      } else {
        s = movePaddles(s, api, dt);
        if (s.ball) {
          let b = s.ball;
          if (s.screen === "countdown") {
            const timer = b.holdTimer - dt;
            if (timer <= 0) {
              b = serve({ ...b, holdTimer: 0 }, s.receiver);
              s = { ...s, screen: "playing" };
            } else b = { ...b, holdTimer: timer };
          } else if (!b.held) {
            b = physics(b, s, dt, api);
            if (b.x - BALL_R > FIELD_W || b.x + BALL_R < 0) {
              const scorer = b.x - BALL_R > FIELD_W ? "left" : "right",
                p1 = s.score.p1 + (scorer === "left" ? 1 : 0),
                p2 = s.score.p2 + (scorer === "right" ? 1 : 0);
              api.audio.play(CUES.score);
              const win =
                p1 >= WIN_SCORE && p1 - p2 >= WIN_LEAD
                  ? "left"
                  : p2 >= WIN_SCORE && p2 - p1 >= WIN_LEAD
                    ? "right"
                    : null;
              s = {
                ...s,
                score: { p1, p2 },
                winner: win,
                receiver: scorer === "left" ? "right" : "left",
                screen: win ? "matchover" : "countdown",
                menuIndex: 0,
                ball: win ? b : park(),
              };
              if (win) return s;
              b = s.ball!;
            }
          }
          const trail = [...b.trail, { x: b.x, y: b.y, t: s.simTime }].filter(
            (t) => s.simTime - t.t <= TRAIL_TIME,
          );
          s = { ...s, ball: { ...b, trail } };
        }
      }
    }
    return s;
  },
  render(state, api: RenderApi) {
    const ctx = api.ctx as CanvasRenderingContext2D;
    const live =
      state.screen === "playing" ||
      state.screen === "countdown" ||
      state.screen === "paused" ||
      state.screen === "matchover";
    drawField(
      state,
      ctx,
      state.screen === "title" ||
        state.screen === "howto" ||
        state.screen === "paused" ||
        state.screen === "matchover",
    );
    if (live) {
      ctx.textAlign = "center";
      ctx.fillStyle = TEXT;
      ctx.font = "700 48px system-ui, sans-serif";
      ctx.fillText(String(state.score.p1), FIELD_CX - 120, 90);
      ctx.fillText(String(state.score.p2), FIELD_CX + 120, 90);
      ctx.font = "600 13px system-ui, sans-serif";
      ctx.fillStyle = "#9aaac2";
      ctx.fillText(
        state.mode === "solo" ? "SOLO · FIRST TO 11" : "VERSUS · FIRST TO 11",
        FIELD_CX,
        124,
      );
    }
    if (state.screen === "title") {
      ctx.textAlign = "center";
      ctx.font = "900 78px system-ui, sans-serif";
      ctx.fillStyle = TEXT;
      ctx.fillText(TITLE_TEXT, FIELD_CX, 255);
      ctx.font = "500 17px system-ui, sans-serif";
      ctx.fillStyle = "#98abc4";
      ctx.fillText("A duel of angles, timing, and spin", FIELD_CX, 293);
      drawMenu(ctx, "title", state.menuIndex);
      ctx.font = "500 14px system-ui, sans-serif";
      ctx.fillStyle = "#8293aa";
      ctx.fillText(
        "W / S · MOVE     ENTER · SELECT     M · SOUND",
        FIELD_CX,
        616,
      );
    } else if (state.screen === "howto") {
      ctx.textAlign = "center";
      ctx.fillStyle = TEXT;
      ctx.font = "800 42px system-ui, sans-serif";
      ctx.fillText("HOW TO PLAY", FIELD_CX, 180);
      ctx.font = "500 19px system-ui, sans-serif";
      ctx.fillStyle = "#bcc9dc";
      [
        "Move your paddle to meet the ball.",
        "Your paddle's motion adds spin at impact.",
        "Bank shots around the two fixed obstacles.",
        "First to 11, with a two point lead, wins.",
      ].forEach((line, i) => ctx.fillText(line, FIELD_CX, 280 + i * 42));
      ctx.font = "500 15px system-ui, sans-serif";
      ctx.fillText(
        "SOLO: W / S or ↑ / ↓     VERSUS: W / S and ↑ / ↓",
        FIELD_CX,
        490,
      );
      drawMenu(ctx, "howto", state.menuIndex);
    } else if (state.screen === "paused") {
      ctx.textAlign = "center";
      ctx.fillStyle = TEXT;
      ctx.font = "800 54px system-ui, sans-serif";
      ctx.fillText("PAUSED", FIELD_CX, 275);
      drawMenu(ctx, "paused", state.menuIndex);
    } else if (state.screen === "matchover") {
      ctx.textAlign = "center";
      ctx.fillStyle = TEXT;
      ctx.font = "800 48px system-ui, sans-serif";
      ctx.fillText(
        state.winner === "left" ? "PLAYER ONE WINS" : "PLAYER TWO WINS",
        FIELD_CX,
        265,
      );
      ctx.font = "600 21px system-ui, sans-serif";
      ctx.fillStyle = "#aebbd0";
      ctx.fillText(`${state.score.p1}  —  ${state.score.p2}`, FIELD_CX, 310);
      drawMenu(ctx, "matchover", state.menuIndex);
    } else if (state.screen === "countdown" && state.ball) {
      ctx.textAlign = "center";
      ctx.font = "700 18px system-ui, sans-serif";
      ctx.fillStyle = TEXT;
      ctx.fillText("GET READY", FIELD_CX, FIELD_CY - 44);
    }
  },
};
