export function getMoveVector(keys, cursors) {
    const left = (cursors.left?.isDown ?? false) || (keys.A?.isDown ?? false);
    const right = (cursors.right?.isDown ?? false) || (keys.D?.isDown ?? false);
    const up = (cursors.up?.isDown ?? false) || (keys.W?.isDown ?? false);
    const down = (cursors.down?.isDown ?? false) || (keys.S?.isDown ?? false);

    let x = 0, y = 0;
    if (left) x -= 1;
    if (right) x += 1;
    if (up) y -= 1;
    if (down) y += 1;
    return { x, y };
}
