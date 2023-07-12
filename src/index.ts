import { initServer } from "./app/index";
import dotenv from "dotenv";

async function init() {
  dotenv.config();
  const app = await initServer();

  app.listen(8000, () => {
    console.log(`server running on 8000`);
  });
}

init();
