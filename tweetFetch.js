require('isomorphic-fetch');
let resObj = {user: {}, tweets: [], stats: {}};

const fetchTweets = async (user) => {
  const apiCall = fetch(`https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=${user}&include_rts=false&excludereplies=true&count=200&tweet_mode=extended`, {
    headers: {
      'Authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAAIPiCAEAAAAAydh%2BTZvtnQ1XM0de4SXDGi0M2nU%3DO8ZxGK0uxRGuaAT9aUbxDFpl0svsSN5myayfzWAso0UIXwDigp'
    }
  })
    .then(res => res.json())
    .then(data => {
      const tweet = data[0];
      // Tweet sentiments
      data.map((tweet, i) => {
        resObj.tweets[i] = { tweet: tweet.full_text, sentiment: undefined, id: i };
      });
      // User info
      resObj.user.handle = tweet.user.screen_name;
      resObj.user.name = tweet.user.name;
      resObj.user.bio = tweet.user.description;
      resObj.user.avatar = tweet.user.profile_image_url_https.split('_normal').join('');
      resObj.user.followers = tweet.user.followers_count;
      resObj.user.following = tweet.user.friends_count;

      // Most liked
      let currentHighestLike = {favorite_count: 0};

      data.forEach(tweet => {
        if (tweet.favorite_count > currentHighestLike.favorite_count) {
          currentHighestLike = tweet;
          return;
        } else if (tweet.favorite_count < currentHighestLike.favorite_count) {
          return;
        }
      });
      resObj.stats.mostLikedTweet = currentHighestLike;

      // Most retweeted
      let currentHighestRetweeted = {retweet_count: 0};

      data.forEach(tweet => {
        if (tweet.retweet_count > currentHighestRetweeted.retweet_count) {
          currentHighestRetweeted = tweet;
          return;
        } else if (tweet.retweet_count < currentHighestRetweeted.retweet_count) {
          return;
        }
      });
      resObj.stats.mostRetweetedTweet = currentHighestRetweeted;
    }
    )
    .then (() => resObj);
    return apiCall;
}

module.exports = fetchTweets;