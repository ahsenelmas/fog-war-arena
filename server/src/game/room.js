import { MSG } from "../../../shared/protocol.js";
import { World } from "./world.js";

let NEXT_ID = 1;

export class RoomManager {
    constructor() {
        this.rooms = new Map();
        this.ensureRoom("public-1");
    }

    ensureRoom(roomId) {
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, { world: new World(roomId), clients: new Set() });
        }
        return this.rooms.get(roomId);
    }

    handleClient(client) {
        client.id = String(NEXT_ID++);
        client.send({ type: MSG.WELCOME, id: client.id, rooms: ["public-1"] });

        client.onMessage((msg) => this.onMessage(client, msg));
        client.onClose(() => this.disconnect(client));
    }

    onMessage(client, msg) {
        if (msg.type === MSG.JOIN_ROOM) return this.joinRoom(client, msg.roomId || "public-1");

        const room = this.rooms.get(client.roomId);
        if (!room) return;

        if (msg.type === MSG.INPUT) room.world.applyInput(client.id, msg);
    }

    joinRoom(client, roomId) {
        if (client.roomId) this.disconnect(client);

        const room = this.ensureRoom(roomId);
        client.roomId = roomId;
        room.clients.add(client);

        room.world.addPlayer(client.id);
        client.send({ type: MSG.ROOM_JOINED, roomId, world: room.world.getWorldInfo() });
    }

    disconnect(client) {
        const room = this.rooms.get(client.roomId);
        if (!room) return;
        room.clients.delete(client);
        room.world.removePlayer(client.id);
        client.roomId = null;
    }

    tick(dt) {
        for (const room of this.rooms.values()) {
            room.world.tick(dt);
            for (const client of room.clients) {
                const snap = room.world.makeSnapshotFor(client.id);
                client.send({ type: MSG.SNAPSHOT, ...snap });
            }
        }
    }
}
