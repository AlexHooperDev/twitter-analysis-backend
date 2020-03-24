require("isomorphic-fetch");
let resObj = { user: {}, tweets: [], stats: {} };

const fetchStatusHandler = response => {
  console.log(response.status);
  if (response.status === 200) {
    return response;
  } else {
    throw new Error(response.status);
  }
};

const fetchTweets = async user => {
  joinedArray = [];

  async function fetchWithMaxID(maxID) {
    return fetch(
      `https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=${user}&include_rts=false&excludereplies=true&count=200&tweet_mode=extended&max_id=${maxID}`,
      {
        headers: {
          Authorization:
            "Bearer AAAAAAAAAAAAAAAAAAAAAIPiCAEAAAAAydh%2BTZvtnQ1XM0de4SXDGi0M2nU%3DO8ZxGK0uxRGuaAT9aUbxDFpl0svsSN5myayfzWAso0UIXwDigp"
        }
      }
    )
      .then(fetchStatusHandler)
      .then(res => res.json())
      .then(data => (joinedArray = [...joinedArray, ...data]));
  }

  const apiCall = fetch(
    `https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=${user}&include_rts=false&excludereplies=true&count=200&tweet_mode=extended`,
    {
      headers: {
        Authorization:
          "Bearer AAAAAAAAAAAAAAAAAAAAAIPiCAEAAAAAydh%2BTZvtnQ1XM0de4SXDGi0M2nU%3DO8ZxGK0uxRGuaAT9aUbxDFpl0svsSN5myayfzWAso0UIXwDigp"
      }
    }
  )
    .then(fetchStatusHandler)
    .then(res => res.json())
    .then(data => {
      joinedArray = [...data];
      return fetchWithMaxID(joinedArray[data.length - 1].id);
      // keep fetching until the returned data has a lenght of 1 or less
    })
    .then(() => {
      joinedArray.map((tweet, i) => {
        resObj.tweets[i] = {
          tweet: tweet.full_text,
          sentiment: undefined,
          id: i
        };
      });
    })
    .then(() => {
      const tweet = joinedArray[0];
      let { user } = resObj;
      // Tweet sentiments

      // User info
      user.handle = tweet.user.screen_name;
      user.name = tweet.user.name;
      user.bio = tweet.user.description;
      user.avatar = tweet.user.profile_image_url_https
        .split("_normal")
        .join("");
      user.followers = tweet.user.followers_count;
      user.following = tweet.user.friends_count;

      // Most liked
      let currentHighestLike = { favorite_count: 0 };

      joinedArray.forEach(tweet => {
        if (tweet.favorite_count > currentHighestLike.favorite_count) {
          currentHighestLike = tweet;
          return;
        } else if (tweet.favorite_count < currentHighestLike.favorite_count) {
          return;
        }
      });
      resObj.stats.mostLikedTweet = currentHighestLike;

      // Most retweeted
      let currentHighestRetweeted = { retweet_count: 0 };

      joinedArray.forEach(tweet => {
        if (tweet.retweet_count > currentHighestRetweeted.retweet_count) {
          currentHighestRetweeted = tweet;
          return;
        } else if (
          tweet.retweet_count < currentHighestRetweeted.retweet_count
        ) {
          return;
        }
      });

      resObj.stats.mostRetweetedTweet = currentHighestRetweeted;
    })
    .then(() => resObj)
    .catch(err => err);
  return apiCall;
};

module.exports = fetchTweets;
