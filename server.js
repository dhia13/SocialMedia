require('dotenv').config()
const express = require('express')
// const mongoose = require('mongoose')
// const cors = require('cors')
// const morgan = require('morgan')
// // Routes
// const AuthRoute = require('./routes/AuthRoute')
// const UsersRoute = require('./routes/UsersRoute')
// const ActionsRoute = require('./routes/ActionsRoute')
// const PostsRoute = require('./routes/PostsRoute')
// const CommentsRoute = require('./routes/CommentsRoute')
//experss
const app = express();
//cors
console.log('starting server ....')
// var corsOptions = {
//     origin: "http://localhost:8000"
// };
// app.use(cors());
// // parse requests of content-type - application/json
// app.use(express.json());
// // parse requests of content-type - application/x-www-form-urlencoded
// app.use(express.urlencoded({ extended: true }));
// app.use(morgan('combined'))
// //Routes
// app.use('/', AuthRoute)
// app.use('/User', UsersRoute)
// app.use('/actions', ActionsRoute)
// app.use('/Posts', PostsRoute)
// app.use('/Comments', CommentsRoute)
//Conection
const CONNECTION_URL = process.env.CONNECTION_URL
const PORT = process.env.PORT || 5000;
mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => app.listen(PORT, () => console.log(`server is running on port http://localhost:${PORT}`)))
    .catch((error) => console.log(`${error} did not connect`));