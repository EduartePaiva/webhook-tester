import express from "express";
import usersRouter from "./routes/users";
const PORT = 3000;

const app = express();
app.use("/api/users", usersRouter);

app.get("/api/users", (request, response, next) => {});

app.listen(PORT, () => {
    console.log(`listening on port: ${PORT}`);
});
