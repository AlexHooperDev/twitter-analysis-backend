const getStats = tweets => {
  // Most Positive tweet
  let currentHighestsentiment = { sentimentScore: { Positive: 0 } };

  tweets.tweets.forEach(tweet => {
    if (
      tweet.sentimentScore.Positive >
      currentHighestsentiment.sentimentScore.Positive
    ) {
      currentHighestsentiment = tweet;
      return;
    } else if (
      tweet.sentimentScore.Positive <
      currentHighestsentiment.sentimentScore.Positive
    ) {
      return;
    }
  });
  tweets.stats.mostPositiveTweet = currentHighestsentiment;

  let currentLowestsentiment = { sentimentScore: { Negative: 0 } };

  tweets.tweets.forEach(tweet => {
    if (
      tweet.sentimentScore.Negative >
      currentLowestsentiment.sentimentScore.Negative
    ) {
      currentLowestsentiment = tweet;
      return;
    } else if (
      tweet.sentimentScore.Negative <
      currentLowestsentiment.sentimentScore.Negative
    ) {
      return;
    }
  });
  tweets.stats.mostNegativeTweet = currentLowestsentiment;

  //TODO Average positivity per tweet
  // pull all the positive sentiment values into an array, then get an average value from all the items in that array

  return tweets;
};

module.exports = getStats;
