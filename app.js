import express from "express";
import cors from "cors";

import statusRoute from "./routes/statusRoute.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use("/" , (req, res) => {
    res.sendFile('static/bonk.jpg', { root: process.cwd() }, (err) => {
        if (err) res.status(err.status || 500).end();
    });
});
app.use("/status", statusRoute);

export default app;