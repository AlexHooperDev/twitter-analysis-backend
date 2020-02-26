require('isomorphic-fetch');
let tweetStrings = [];

const fetchTweets = async (user) => {
  const apiCall = fetch(`https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=${user}&include_rts=false&excludereplies=true&count=200&tweet_mode=extended`, {
    headers: {
      'Authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAAIPiCAEAAAAAydh%2BTZvtnQ1XM0de4SXDGi0M2nU%3DO8ZxGK0uxRGuaAT9aUbxDFpl0svsSN5myayfzWAso0UIXwDigp'
    }
  })
    .then(res => res.json())
    .then(data => data.map((tweet, i) => {
      return tweetStrings[i] = { tweet: tweet.full_text, sentiment: undefined, id: i }
    }));
    return apiCall;
}

module.exports = fetchTweets;