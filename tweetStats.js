const getStats = (tweets) => {
  // Most Positive tweet
  let currentHighestsentiment = { sentiment: { score: 0 } };

  tweets.tweets.forEach((tweet) => {
    if (tweet.sentiment.score > currentHighestsentiment.sentiment.score) {
      currentHighestsentiment = tweet;
    }
  });
  tweets.stats.mostPositiveTweet = currentHighestsentiment;

  let currentLowestsentiment = { sentiment: { score: 0 } };

  tweets.tweets.forEach((tweet) => {
    if (tweet.sentiment.score < currentLowestsentiment.sentiment.score) {
      currentLowestsentiment = tweet;
    }
  });
  tweets.stats.mostNegativeTweet = currentLowestsentiment;

  // TODO Average positivity per tweet
  // pull all the positive sentiment values into an array, then get an average value from all the items in that array
  return tweets;
};

module.exports = getStats;
