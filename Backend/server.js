const express = require("express");
const http = require('http');
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();
// const app = require('./app');
const socketHandler = require("./socket/socket");
const paymentRoutes = require("./routes/payment");
const sosRoutes = require("./routes/sos.routes");
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
const admin = require("firebase-admin");
app.use("/api/sos", sosRoutes);
app.use("/api/payment", paymentRoutes);
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

// Test route
app.get("/", (req, res) => {
    res.send("Firebase Server Running Successfully !");
});

