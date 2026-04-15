# Current TODO

## Version 2 - Phase 3

### Current chunk
- [ ] Update `sampling/sampleHydrogenState.js` to support a `resampleBatch(existingPositions, count, t)` method.
- [ ] Randomly resample points rejected by new probability density on a scintillating geometry buffera.
- [ ] Modify `sceneController.js` to stream coordinate updates per frame for time-dependent scenes.

## Version 2 - Phase 4
- [ ] Create `renderables/shaders/volumetric.js`
- [ ] Implement bounding-box cube `ShaderMaterial` designed to raymarch space
- [ ] Bind uniform data array $(n, l, m)$, active time $t$
- [ ] Scene mode toggling between Point Cloud vs Volumetric rendering

## Version 1 and Version 2 (Phases 1-2) status
* Version 1, V2 Phase 1, and V2 Phase 2 implementation complete.
* See `DONE.md` for historical completion record.
