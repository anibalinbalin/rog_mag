import assert from "node:assert/strict";
import { test } from "node:test";

import { getPatinaSceneState } from "./patinaMotion";

const settings = {
  dispBase: 0.008,
  lightZ: 0.55,
  viewArc: 0.38,
};

test("scrolling moves the observer while the cover geometry and table light stay fixed", () => {
  const top = getPatinaSceneState(0, false, settings);
  const bottom = getPatinaSceneState(1, false, settings);

  assert.equal(top.displacement, 0.008);
  assert.equal(bottom.displacement, 0.008);
  assert.deepEqual(bottom.light, top.light);
  assert.notEqual(bottom.observer.y, top.observer.y);
});

test("reduced motion keeps the observer fixed at the centered resting view", () => {
  const top = getPatinaSceneState(0, true, settings);
  const bottom = getPatinaSceneState(1, true, settings);

  assert.deepEqual(bottom, top);
});
