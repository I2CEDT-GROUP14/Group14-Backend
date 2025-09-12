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

app.use("/" , (req, res) => {
    //randomly send file bonk.jpg from static folder
    // const fileName = Math.random() < 0.5 ? '1.jpg' : '2.jpg';
    // res.sendFile(`static/${fileName}`, { root: process.cwd() }, (err) => {
    //     if (err) res.status(err.status || 500).end();
    // });
    // res.send("Welcome to Quiz API");
    // res.sendFile('static/1.jpg', { root: process.cwd() }, (err) => {
    //     if (err) res.status(err.status || 500).end();
    // });
    //send base64 encoded image
    res.send("(╯‵□′)╯︵┻━┻");
});

export default app;