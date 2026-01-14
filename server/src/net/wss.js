import { WebSocketServer } from "ws";

export function createWss(httpServer) {
    const wss = new WebSocketServer({ server: httpServer });

    return {
        onConnection(fn) {
            wss.on("connection", (ws) => {
                const client = {
                    ws,
                    id: null,
                    roomId: null,
                    send(obj) {
                        if (ws.readyState === 1) ws.send(JSON.stringify(obj));
                    },
                    onMessage(cb) {
                        ws.on("message", (data) => {
                            try { cb(JSON.parse(String(data))); } catch { }
                        });
                    },
                    onClose(cb) {
                        ws.on("close", cb);
                    }
                };
                fn(client);
            });
        }
    };
}
