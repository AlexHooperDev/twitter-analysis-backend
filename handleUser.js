const fetchTweets = require('./tweetFetch');
const tweetParsing = require('./aws');
const parseTweets = tweetParsing.parseTweets;
const getKeyPhrases = tweetParsing.getKeyPhrases;
const getStats = require('./tweetStats');

async function handleUser(user) {
  console.log(user);
  const tweets = await awaitTweets(user)
    .then(tweets => parseTweets(tweets))
    .then(tweets => getStats(tweets))
    .then(sentiments => sentiments)
    .then (tweets => getKeyPhrases(tweets));
  return tweets;
};

const awaitTweets = async (user) => {
  const tweets = await fetchTweets(user);
  return tweets;
}

module.exports = handleUser;