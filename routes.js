const express = require("express");
const cors = require("cors");
const app = express();
const port = 4000;

app.use(cors());

function Routes(articles) {
  app.get("/tweets", (req, res) => {
    res.send({ 'hello' });
  });

  app.listen(port, () => console.log("Example app is lstening on port 4000"));
}

module.exports = Routes;