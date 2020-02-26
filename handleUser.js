const fetchTweets = require('./tweetFetch');
const parseTweets = require('./aws');

async function handleUser(user) {
  console.log(user);
  const tweets = await awaitTweets(user)
    .then(tweets => parseTweets(tweets))
    .then(sentiments => sentiments);
  return tweets;
};

const awaitTweets = async (user) => {
  const tweets = await fetchTweets(user);
  return tweets;
}

module.exports = handleUser;