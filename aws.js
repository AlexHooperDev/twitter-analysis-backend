const AWS = require("aws-sdk");
const fetchTweets = require('./tweetFetch');

// Setup AWS
AWS.config.update({ region: "us-west-2" });
var comprehend = new AWS.Comprehend();
const language = 'en';

async function parseTweets(tweetObjects) {
  let tweetStrings = tweetObjects.map(tweet => tweet.tweet);
  var size = 25;
  var newArray = new Array(Math.ceil(tweetStrings.length / size)).fill("")
    .map(function () { return this.splice(0, size) }, tweetStrings.slice());
  let resultsObj;

  // console.log(newArray);
  const results = newArray.map((smallArray, i) => {
    comprehend.batchDetectSentiment(
      { LanguageCode: language, TextList: smallArray },
      function (err, data) {
        if (err) console.log(err, err.stack);
        else {
          // return data;
          // TODO Feed this sentiment value back into the original array
          console.log(data);

        }
      }
    );
  });
  
}

module.exports = parseTweets;