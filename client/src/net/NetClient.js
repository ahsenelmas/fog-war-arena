import { MSG } from "/shared/protocol.js";

export default class NetClient {
    constructor() {
        this.ws = null;
        this.connected = false;
        this.handlers = new Map();
    }

    on(type, fn) { this.handlers.set(type, fn); }

    connect() {
        const url = (location.protocol === "https:" ? "wss://" : "ws://") + location.host;
        this.ws = new WebSocket(url);

        this.ws.onopen = () => { this.connected = true; };
        this.ws.onclose = () => { this.connected = false; };
        this.ws.onmessage = (ev) => {
            let msg;
            try { msg = JSON.parse(ev.data); } catch { return; }
            const fn = this.handlers.get(msg.type);
            if (fn) fn(msg);
        };
    }

    send(obj) {
        if (this.ws && this.ws.readyState === 1) this.ws.send(JSON.stringify(obj));
    }

    join(roomId) { this.send({ type: MSG.JOIN_ROOM, roomId }); }

    input(payload) { this.send({ type: MSG.INPUT, ...payload }); }
}
