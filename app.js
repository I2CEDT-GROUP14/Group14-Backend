import express from "express";
import cors from "cors";

import statusRoute from "./routes/statusRoute.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use("/status", statusRoute);

export default app;