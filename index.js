require("dotenv").config(); 

const express = require("express");
const path = require("path");
const cors = require('cors');
const RouteManager = require('./Routes/RouteManager');
const morgan = require('morgan');
const cookieParser = require('cookie-parser')
const { createServer } = require("http");

const port = 5001;
const app = express();
const Server = createServer(app);
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser())
app.use(morgan('dev'));

RouteManager(app);

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../client/build")));
//   app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname, "../client", "build", "index.html"));
//   });
// }

Server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
