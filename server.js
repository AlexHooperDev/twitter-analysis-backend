const fetchTweets = require('./tweetFetch');
const parseTweets = require('./aws');


const awaitTweets = async () => {
  const tweets = await fetchTweets();
  return tweets;
}

awaitTweets()
  .then(tweets => parseTweets(tweets));