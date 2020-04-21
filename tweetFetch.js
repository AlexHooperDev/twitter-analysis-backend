require("isomorphic-fetch");

const resObj = { user: {}, tweets: [], stats: {} };

const fetchStatusHandler = (response) => {
  console.log(response.status);
  if (response.status === 200) {
    return response;
  }
  throw new Error(response.status);
};

const fetchTweets = async (user) => {
  let joinedArray = [];

  async function fetchWithMaxID(maxID) {
    return fetch(
      `https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=${user}&include_rts=false&excludereplies=true&count=200&tweet_mode=extended${
        maxID ? "&max_id=" : ""
      }${maxID || ""}`,
      {
        headers: {
          Authorization:
            "Bearer AAAAAAAAAAAAAAAAAAAAAIPiCAEAAAAAydh%2BTZvtnQ1XM0de4SXDGi0M2nU%3DO8ZxGK0uxRGuaAT9aUbxDFpl0svsSN5myayfzWAso0UIXwDigp",
        },
      }
    )
      .then(fetchStatusHandler)
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 2) {
          joinedArray = [...joinedArray, ...data];
          fetchWithMaxID(data[data.length - 1].id);
        } else {
          joinedArray = [...joinedArray, ...data];
          console.log(joinedArray.length);
        }
      });
  }

  // async function fetchWithMaxID(maxID) {
  //   return fetch(
  //     `https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=${user}&include_rts=false&excludereplies=true&count=200&tweet_mode=extended&max_id=${maxID}`,
  //     {
  //       headers: {
  //         Authorization:
  //           'Bearer AAAAAAAAAAAAAAAAAAAAAIPiCAEAAAAAydh%2BTZvtnQ1XM0de4SXDGi0M2nU%3DO8ZxGK0uxRGuaAT9aUbxDFpl0svsSN5myayfzWAso0UIXwDigp',
  //       },
  //     },
  //   )
  //     .then(fetchStatusHandler)
  //     .then((res) => res.json())
  //     .then((data) => { joinedArray = [...joinedArray, ...data]; });
  // }

  const recursiveFetch = async (maxID) => {
    console.log(maxID);
    const maxIDParam = maxID ? `&max_id=${maxID}` : null;
    return fetch(
      `https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=${user}&include_rts=false&excludereplies=true&count=200&tweet_mode=extended${maxIDParam || ''}`,
      {
        headers: {
          Authorization:
            "Bearer AAAAAAAAAAAAAAAAAAAAAIPiCAEAAAAAydh%2BTZvtnQ1XM0de4SXDGi0M2nU%3DO8ZxGK0uxRGuaAT9aUbxDFpl0svsSN5myayfzWAso0UIXwDigp",
        },
      }
    )
      .then(fetchStatusHandler)
      .then((res) => res.json())
      .then((data) => {
        const savedData = data;
        if (data.length > 2) {
          joinedArray = [...joinedArray, ...data];
          return recursiveFetch(savedData[savedData.length - 1].id);
        }
        return (joinedArray = [...joinedArray, ...data]);
      });
  };

  const apiCall = recursiveFetch()
    .then(() => {
      joinedArray.map((tweet, i) => {
        resObj.tweets[i] = {
          tweet: tweet.full_text,
          date: tweet.created_at,
          followers: tweet.user.followers_count,
          sentiment: undefined,
          id: i,
        };
      });
    })
    .then(() => {
      const tweet = joinedArray[0];
      const { user } = resObj;
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

      joinedArray.forEach((tweet) => {
        if (tweet.favorite_count > currentHighestLike.favorite_count) {
          currentHighestLike = tweet;
        } else if (tweet.favorite_count < currentHighestLike.favorite_count) {
        }
      });
      resObj.stats.mostLikedTweet = currentHighestLike;

      // Most retweeted
      let currentHighestRetweeted = { retweet_count: 0 };

      joinedArray.forEach((tweet) => {
        if (tweet.retweet_count > currentHighestRetweeted.retweet_count) {
          currentHighestRetweeted = tweet;
        } else if (
          tweet.retweet_count < currentHighestRetweeted.retweet_count
        ) {
        }
      });

      resObj.stats.mostRetweetedTweet = currentHighestRetweeted;
    })
    .then(() => resObj)
    .catch((err) => err);
  return apiCall;
};

module.exports = fetchTweets;
