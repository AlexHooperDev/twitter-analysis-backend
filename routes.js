const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const port = 4000;
const handleUser = require("./handleUser");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function Routes() {
  app.post("/user", (req, res) => {
    // run entire tweet sequence
    handleUser(req.body.user)
      .then(data => {
        if (data instanceof Error) {
          throw new Error(404);
        } else {
          return data;
        }
      })
      .then(data => res.send(data))
      .catch(err => res.status(err).send(404));
  });
}

app.listen(port, () => console.log("Example app is lstening on port 4000"));

module.exports = Routes;
