const fetchTweets = require('./tweetFetch');
const parseTweets = require('./aws');


const awaitTweets = async () => {
  const tweets = await fetchTweets();
  return tweets;
}

const parser = async (tweets) => {
  const parsedValues = await parseTweets(tweets);
  return parsedValues;
}

awaitTweets()
  .then(tweets => parser(tweets))
  .then (parsed => console.log(parsed));