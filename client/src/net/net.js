import { MSG } from "../../../shared/protocol.js";

export class NetClient {
    constructor() {
        this.ws = null;
        this.handlers = new Map();
        this.id = null;
    }

    on(type, cb) { this.handlers.set(type, cb); }

    connect() {
        const proto = location.protocol === "https:" ? "wss" : "ws";
        this.ws = new WebSocket(`${proto}://${location.host}`);

        this.ws.onmessage = (ev) => {
            const msg = JSON.parse(ev.data);
            const h = this.handlers.get(msg.type);
            if (h) h(msg);
        };
    }

    send(obj) {
        if (this.ws && this.ws.readyState === 1) this.ws.send(JSON.stringify(obj));
    }

    join(roomId = "public-1") {
        this.send({ type: MSG.JOIN_ROOM, roomId });
    }

    input(payload) {
        this.send({ type: MSG.INPUT, ...payload });
    }
}
