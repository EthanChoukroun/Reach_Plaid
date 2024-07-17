const path = require("path");
const express = require("express");
const app = express();
const cors = require("cors");
const plaidAPIRouter = require("./plaidAPI/plaidAPI.router");
const accessTokenRouter = require("./tokenStorage/accessToken.router");
const notFound = require("./errors/notFound");
const errorHandler = require("./errors/errorHandler");
const cookieParser = require("cookie-parser");

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.options("*", cors());
app.use(cookieParser());
// CORS API access approval to requesting domain below
app.use(function (req, res, next) {
  
  const allowedDomains = ["http://localhost:3000", "https://acc-balance-and-transactions-app.vercel.app"];
  const origin = req.headers.origin;
  if (!allowedDomains.includes(origin)) {
    next({ status: 400, message: `Access to fetch at from origin ${origin} has been blocked by CORS policy.` })
  }
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
     res.header(
     "Access-Control-Allow-Headers",
     "Origin, X-Requested-With, Content-Type, Accept"
   );
   res.header("Access-Control-Allow-Credentials", "true");
  next();
});
 
//   // res.header("Access-Control-Allow-Origin", "https://acc-balance-and-transactions-application.vercel.app");
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Credentials", "true");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

app.use(express.json());

app.use("/", plaidAPIRouter);
app.use("/accessToken", accessTokenRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
