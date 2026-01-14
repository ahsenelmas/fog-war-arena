# 🎮 Fog War Arena

<img width="1908" height="906" alt="image" src="https://github.com/user-attachments/assets/6162f69d-7dfc-4388-9327-c8a7a778eb5d" />

A real-time multiplayer top-down shooter with **fog-of-war mechanics**, built for modern web technologies.

<img width="1910" height="897" alt="image" src="https://github.com/user-attachments/assets/8ebb06ce-7d12-42b7-a2b4-c1aac845bd3a" />

Players explore a dark arena, fight opponents, collect health pickups, and survive using fast movement and precise shooting.

---

## ✨ Features

- 🌫️ Dynamic Fog of War (visibility based on player position)
- 🧑‍🤝‍🧑 Real-time multiplayer using WebSockets
- 🔫 Shooting with bullet trails & wall ricochet
- ❤️ Health system with HP bars
- 💥 Hit effects (red flash + spark particles)
- 📦 Health pickups
- 🧭 Camera follow & smooth interpolation
- 🗺️ Custom map with walls
- 🏆 Score tracking

---

## 🕹 Controls

| Key | Action |
|-----|--------|
| W A S D | Move |
| K | Shoot |

---

## 🧰 Tech Stack

**Client**
- Phaser 3
- JavaScript (ES Modules)

**Server**
- Node.js
- WebSocket

**Shared**
- Custom game protocol
- Snapshot interpolation
- Deterministic game loop

---

## 📂 Project Structure

<img width="367" height="193" alt="image" src="https://github.com/user-attachments/assets/d7c9efff-97e0-4e10-8428-7369c9ee2d34" />

---

## 🚀 Run Locally

### 1️⃣ Install dependencies

```bash
cd server
npm install
npm start
http://localhost:8080


