const Routes = require("./routes");
const handleUser = require("./handleUser");

const awaitTweets = async () => {
  const tweets = await fetchTweets();
  return tweets;
};

Routes();

//wait for user to be pinged, then use that req.body as a

// awaitTweets()
//   .then(tweets => parseTweets(tweets)).then(sentiments => console.log(sentiments));
