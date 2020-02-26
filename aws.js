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
        if (err) reject('not working');
        else {
          resolve(data);
        }
      }
    );
  });
}

async function parseTweets(tweetObjects) {
  let tweetStrings = tweetObjects.map(tweet => tweet.tweet);
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

    tweetObjects.forEach((tweet, i) => {
      tweet.sentiment = tempArr[i].Sentiment;
    });
    return tweetObjects;
  });
}

module.exports = parseTweets;