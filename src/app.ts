import initApp from "./server";
const port = process.env.PORT||3000;

initApp().then((app) => {
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
});