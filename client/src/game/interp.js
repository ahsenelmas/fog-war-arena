export class InterpBuffer {
    constructor() {
        this.buf = [];
        this.time = 0;
    }

    push(snap) {
        this.buf.push(snap);
        if (this.buf.length > 10) this.buf.shift();
    }

    step(dt) { this.time += dt; }

    get() {
        if (this.buf.length < 2) return null;
        const prev = this.buf[this.buf.length - 2];
        const next = this.buf[this.buf.length - 1];
        return { prev, next, alpha: 1 };
    }
}
