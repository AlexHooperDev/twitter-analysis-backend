const getStats = (tweets) => {
  // Most Positive tweet
  let currentHighestsentiment = {sentimentScore: {Positive: 0}};

  tweets.tweets.forEach(tweet => {
    if (tweet.sentimentScore.Positive > currentHighestsentiment.sentimentScore.Positive) {
      currentHighestsentiment = tweet;
      return;
    } else if (tweet.sentimentScore.Positive < currentHighestsentiment.sentimentScore.Positive) {
      return;
    }
  });
  tweets.stats.mostPositiveTweet = currentHighestsentiment;

  let currentLowestsentiment = {sentimentScore: {Negative: 0}};

  tweets.tweets.forEach(tweet => {
    if (tweet.sentimentScore.Negative > currentLowestsentiment.sentimentScore.Negative) {
      currentLowestsentiment = tweet;
      return;
    } else if (tweet.sentimentScore.Negative < currentLowestsentiment.sentimentScore.Negative) {
      return;
    }
  });
  tweets.stats.mostNegativeTweet = currentLowestsentiment;


  return tweets;
};

module.exports = getStats;