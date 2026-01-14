export function interpEntity(prevMap, nextMap, id, alpha) {
    const a = prevMap.get(id);
    const b = nextMap.get(id);
    if (!b) return null;
    if (!a) return b;
    return {
        ...b,
        x: a.x + (b.x - a.x) * alpha,
        y: a.y + (b.y - a.y) * alpha
    };
}
