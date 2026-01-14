import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { createWss } from "./net/wss.js";
import { RoomManager } from "./game/room.js";
import { TICK_RATE } from "../../shared/constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function contentType(ext) {
    return ({
        ".html": "text/html",
        ".js": "text/javascript",
        ".css": "text/css",
        ".json": "application/json",
        ".png": "image/png"
    })[ext] || "application/octet-stream";
}

function serveStatic(req, res) {
    const url = req.url === "/" ? "/index.html" : req.url;
    const safe = url.replace(/\.\./g, "");

    let filePath;
    if (safe.startsWith("/shared/")) {
        filePath = path.join(__dirname, "..", "..", safe);
    } else {
        filePath = path.join(__dirname, "..", "..", "client", safe);
    }

    fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); return res.end("Not found"); }
        res.writeHead(200, { "Content-Type": contentType(path.extname(filePath).toLowerCase()) });
        res.end(data);
    });
}

const server = http.createServer(serveStatic);
const wss = createWss(server);
const rooms = new RoomManager();

wss.onConnection((client) => rooms.handleClient(client));

setInterval(() => rooms.tick(1 / TICK_RATE), 1000 / TICK_RATE);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`http://localhost:${PORT}`));
