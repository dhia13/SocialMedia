require("dotenv").config();
const cors = require("cors");

const express = require("express");
const app = express();
app.use(cors());
const http = require("http").Server(app);
const mongoose = require("mongoose");
const morgan = require("morgan");
// const { Server } = require("socket.io");
// Routes
// const io = new Server(http, {
//   cors: {
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST"],
//   },
// });

const AuthRoute = require("./routes/AuthRoute");
const UsersRoute = require("./routes/UsersRoute");
const ActionsRoute = require("./routes/ActionsRoute");
const PostsRoute = require("./routes/PostsRoute");
const CommentsRoute = require("./routes/CommentsRoute");
const MessengerRoute = require("./routes/MessengerRoute");
//experss
//cors
//scoket

// io.on("connection", (socket) => {
//   console.log(`User Connected: ${socket.id}`);

//   socket.on("test-socket", (data) => {
//     console.log(data);
//   });
// });
// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));
//Routes
app.use("/", AuthRoute);
app.use("/User", UsersRoute);
app.use("/actions", ActionsRoute);
app.use("/Posts", PostsRoute);
app.use("/Comments", CommentsRoute);
app.use("/Messenger", MessengerRoute);
//Conection
const CONNECTION_URL = process.env.CONNECTION_URL;
const PORT = process.env.PORT || 5000;
mongoose
  .connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() =>
    http.listen(PORT, () =>
      console.log(`server is running on port http://localhost:${PORT}`)
    )
  )
  .catch((error) => console.log(`${error} did not connect`));
