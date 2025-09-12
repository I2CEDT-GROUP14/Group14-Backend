import express from "express";
import cors from "cors";

import statusRoute from "./routes/statusRoute.js";
import quizRoute from "./routes/quizRoute.js";
import tagRoute from "./routes/tagRoute.js";
import askRoute from "./routes/askRoute.js";

import "./db/db.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use("/status", statusRoute);
app.use("/quiz", quizRoute);
app.use("/tag", tagRoute);
app.use("/ask", askRoute);

app.use("/" , (req, res) => {
    res.send("(╯‵□′)╯︵┻━┻");
});

export default app;