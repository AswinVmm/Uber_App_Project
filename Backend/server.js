const http = require('http');
const app = require('./app');
const port = process.env.PORT || 4000;
const express = require("express");
const { Server } = require("socket.io");
const socketHandler = require("./socket/socket");
const cors = require("cors");
app.use(cors());
app.use(express.json());
const admin = require("firebase-admin");
app.use("/api/maps", require("./routes/maps.routes"));
app.use("/api/rides", require("./routes/rides.routes"));

// const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

socketHandler(io);

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});



const db = require("./config/firebase");

// Test route
app.get("/", (req, res) => {
    res.send("Firebase Server Running Successfully !");
});

