const fetchTweets = require('./tweetFetch');
const tweetParsing = require('./aws');

const { parseTweets } = tweetParsing;
const { getKeyPhrases } = tweetParsing;
const getStats = require('./tweetStats');

const awaitTweets = async (user) => {
  let tweets = await fetchTweets(user);
  return tweets;
};

async function handleUser(user) {
  console.log(user);
  let tweets = await awaitTweets(user)
    .then((tweets) => {
      if (tweets instanceof Error) {
        throw new Error('404');
      } else {
        return tweets;
      }
    })
    .then((tweets) => parseTweets(tweets))
    .then((tweets) => getStats(tweets))
    // .then((sentiments) => sentiments)
    .then((tweets) => getKeyPhrases(tweets))
    .catch((err) => err);
  return tweets;
}

module.exports = handleUser;
