import { createCanvas } from "@napi-rs/canvas";
import { ConstantClock, createEngine } from "@clockwyrks/simple-2d";
import { describe, expect, it } from "vitest";
import { game } from "./game";

async function fixture(step = 10) {
  const canvas = createCanvas(1280, 720) as unknown as HTMLCanvasElement;
  const events = new EventTarget();
  const engine = createEngine({
    canvas,
    width: 1280,
    height: 720,
    game,
    clock: new ConstantClock(step),
    surface: {
      cssWidth: () => 1280,
      cssHeight: () => 720,
      dpr: () => 1,
      events: () => events,
    },
  });
  await engine.initialize();
  return engine;
}

describe("Carom", () => {
  it("starts with a complete title state and supports pure debug poses", async () => {
    const engine = await fixture();
    expect(engine.debug.snapshot(engine.state)).toMatchObject({
      screen: "title",
      mode: "solo",
      score: { p1: 0, p2: 0 },
      ball: { x: 640, y: 360, held: true, speed: 0 },
      obstacles: [
        { index: 0, cx: 490, cy: 220 },
        { index: 1, cx: 790, cy: 500 },
      ],
    });
    const before = engine.state;
    engine.apply((s) => engine.debug.setBallVelocity(s, 300, 400));
    expect(engine.debug.snapshot(engine.state).ball?.speed).toBe(500);
    expect(engine.debug.snapshot(before).ball?.speed).toBe(0);
    expect(engine.debug.menuItemRect(engine.state, 0)).not.toBeNull();
    engine.destroy();
  });

  it("serves after the one second countdown and advances the rally", async () => {
    const engine = await fixture(10);
    engine.apply((s) => engine.debug.setScreen(s, "countdown"));
    await engine.advance(99);
    expect(engine.state.screen).toBe("countdown");
    await engine.advance(1);
    expect(engine.state.screen).toBe("playing");
    expect(engine.debug.snapshot(engine.state).ball?.held).toBe(false);
    await engine.advance(30);
    expect(engine.state.simTime).toBeCloseTo(1.3, 7);
    expect(engine.debug.snapshot(engine.state).ball?.x).not.toBe(640);
    engine.destroy();
  });

  it("moves a driven paddle at its posed rate with bounds", async () => {
    const engine = await fixture(10);
    engine.apply((s) => engine.debug.setPaddleDriven(s, "left", true));
    engine.apply((s) => engine.debug.setPaddleVy(s, "left", 400));
    engine.apply((s) => engine.debug.setScreen(s, "countdown"));
    await engine.advance(10);
    expect(engine.state.paddles.left.cy).toBeCloseTo(400);
    expect(engine.state.paddles.left.vy).toBe(400);
    engine.destroy();
  });
});
