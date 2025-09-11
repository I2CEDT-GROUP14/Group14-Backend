import express from "express";
import cors from "cors";

import statusRoute from "./routes/statusRoute.js";
import quizRoute from "./routes/quizRoute.js";
import tagRoute from "./routes/tagRoute.js";

import "./db/db.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use("/status", statusRoute);
app.use("/quiz", quizRoute);
app.use("/tag", tagRoute);

// app.use("/" , (req, res) => {
//     res.sendFile('static/bonk.jpg', { root: process.cwd() }, (err) => {
//         if (err) res.status(err.status || 500).end();
//     });
// });

export default app;