import { initServer } from "./app/index";

async function init() {
  const app = await initServer();

  app.listen(8000, () => {
    console.log(`server running on 8000 `);
  });
}

init();
