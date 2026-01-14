export function createFog(scene) {
  const w = scene.scale.width;
  const h = scene.scale.height;

  // Fog overlay (black)
  const fog = scene.add
    .rectangle(0, 0, w, h, 0x000000, 0.85)
    .setOrigin(0, 0)
    .setScrollFactor(0)
    .setDepth(9999);

  // Mask graphics (we will draw the visible circle here)
  const maskGfx = scene.add.graphics().setScrollFactor(0).setDepth(10000);
  maskGfx.setVisible(false); // <<< IMPORTANT: don’t render the white circle!

  // Create a geometry mask and invert it => show fog everywhere EXCEPT circle
  const mask = maskGfx.createGeometryMask();
  mask.setInvertAlpha(true); // <<< IMPORTANT: invert so circle becomes "hole"

  fog.setMask(mask);

  // Keep refs
  return { fog, maskGfx };
}

export function updateFog(scene, fogObj, worldX, worldY, radius) {
  const cam = scene.cam ?? scene.cameras.main;

  // world -> screen
  const sx = worldX - cam.scrollX;
  const sy = worldY - cam.scrollY;

  fogObj.maskGfx.clear();
  fogObj.maskGfx.fillStyle(0xffffff, 1);

  // draw visible hole
  fogObj.maskGfx.fillCircle(sx, sy, radius);
  fogObj.maskGfx.fillCircle(sx, sy, radius * 0.85);
}
