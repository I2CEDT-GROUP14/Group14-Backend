import "./db/db.js" ;
import { config } from "dotenv";

config();

import app from "./app.js";

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend Server ready at http://localhost:${PORT}`);
});
