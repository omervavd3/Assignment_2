import initApp from "./server";
const port = process.env.PORT||3000;

initApp().then((app) => {
  console.log("here")
  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });
}); 