import app from "./app.js";

const port = process.env.PORT;

app.listen(process.env.PORT, () => {
  console.log(`App Running: http://localhost:${port}/`);
});
