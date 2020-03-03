const AWS = require("aws-sdk");

// Setup AWS
AWS.config.update({ region: "us-west-2" });
var comprehend = new AWS.Comprehend();
const language = 'en';

const apiCall = (array, language) => {
  return new Promise((resolve, reject) => {
    comprehend.batchDetectSentiment(
      { LanguageCode: language, TextList: array },
      function (err, data) {
        if (err) console.log(err);
        else {
          resolve(data);
        }
      }
    );
  });
}

function getKeyByValue(object, value) {
  return Object.keys(object).find(key =>
    object[key] === value);
}


const getKeyPhrases = (tweets) => {
  // reduce all tweets to single long string
  let tweetArr = [];
  tweets.tweets.map(tweet => {
    return tweetArr = [...tweetArr, tweet.tweet];
  });
  let concatString = tweetArr.join('');

  var wordCounts = {};
  var words = concatString.split(/\b/);

  for (var i = 0; i < words.length; i++) {
    wordCounts["_" + words[i]] = (wordCounts["_" + words[i]] || 0) + 1;
  }

  console.log(wordCounts);

}



async function parseTweets(tweetObject) {
  let tweetStrings = tweetObject.tweets.map(tweet => tweet.tweet);
  var size = 25;
  // Split the array
  const newArray = new Array(Math.ceil(tweetStrings.length / size)).fill("")
    .map(function () { return this.splice(0, size) }, tweetStrings.slice());

  // Map through each array. await the result of the api fetch and assign it to the array
  const fetchedTweets = newArray.map((slicedArray, i) => {
    return apiCall(slicedArray, language);
  });

  return Promise.all(fetchedTweets).then(res => {
    let tempArr = [];

    res.forEach((object) => {
      object.ResultList.forEach((sentiment) => {
        tempArr = [...tempArr, sentiment];
      });
    });

    tweetObject.tweets.forEach((tweet, i) => {
      tweet.sentiment = tempArr[i].Sentiment;
      tweet.sentimentScore = tempArr[i].SentimentScore;
    });
    return tweetObject;
  });
}

module.exports = { parseTweets: parseTweets, getKeyPhrases: getKeyPhrases };