const express = require("express");
const app = express();
const PORT = 4002;

// ?------------------- Required File Paths ------------------------
const routesController = require("./controllers/routes");
//const cors = require("cors");

// ?------------- App Functionality/What It Does Next --------------
app.use(express.json());

app.use(express.urlencoded());

app.use("/routes", routesController);

// ?------------------- Basic Functionality ------------------------
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});