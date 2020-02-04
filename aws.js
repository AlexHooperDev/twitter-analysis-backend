const AWS = require("aws-sdk");
const fetchTweets = require('./tweetFetch');

// Setup AWS
AWS.config.update({ region: "us-west-2" });
var comprehend = new AWS.Comprehend();
const language = 'en';
sentiments = [];

async function apiCall(language, newArray) {
  const data = newArray.map((smallArray, i) => {
    comprehend.batchDetectSentiment(
      { LanguageCode: language, TextList: smallArray },
      function (err, data) {
        if (err) console.log(err, err.stack);
        else {
          sentiments = [...sentiments, ...data.ResultList];
        }
      }
    );
  });
  return data;
}

async function parseTweets(tweetObjects) {
  let tweetStrings = tweetObjects.map(tweet => tweet.tweet);
  var size = 25;

  var newArray = new Array(Math.ceil(tweetStrings.length / size)).fill("")
    .map(function () { return this.splice(0, size) }, tweetStrings.slice());
  const values = await apiCall(language, newArray);
  return values;
}

module.exports = parseTweets;