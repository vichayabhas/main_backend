import express from "express";
import { config } from "dotenv";
import cors from "cors";

import user from "./src/routes/user";
import connectDB from "./config/db";
import cookieParser from "cookie-parser";
import camp from "./src/routes/camp";
import admin from "./src/routes/admin";
import randomthing from "./src/routes/randomthing";
import subFrontend from "./src/routes/subFrontend";
import { createServer } from "http";
import { Server } from "socket.io";
import { socketEvents } from "./src/models/interface";

config({ path: "./config/config.env" });

connectDB();

const app = express();
app.use(cookieParser());
//Body parser
app.use(express.json());

app.use(cors());
app.use("/randomthing", randomthing);
app.use("/admin", admin);
app.use("/subFunction", subFrontend);

app.use("/camp", camp);
app.use("/api/v1/auth", user);
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: { origin: "*" },
});
io.on("connection", (socket) => {
  socketEvents.map((v) => {
    socket.on(`${v}Send`, (a, b) => {
      io.emit(v, a, b);
    });
  });
});

const PORT = process.env.PORT || 5000;
const server = httpServer.listen(PORT, () =>
  console.log(
    "Server running in ",
    process.env.NODE_ENV,
    " mode on port ",
    PORT
  )
);

process.on("unhandledRejection", (err: Error) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
export default httpServer;
//console.log('jjjjjjjjjjjjjjjjjjjbutfyiknjjjjj')
