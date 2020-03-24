const AWS = require("aws-sdk");

// Setup AWS
AWS.config.update({ region: "us-west-2" });
var comprehend = new AWS.Comprehend();
const language = "en";

const apiCall = (array, language) => {
  return new Promise((resolve, reject) => {
    comprehend.batchDetectSentiment(
      { LanguageCode: language, TextList: array },
      function(err, data) {
        if (err) console.log(err);
        else {
          resolve(data);
        }
      }
    );
  });
};

const getKeyPhrases = tweets => {
  // reduce all tweets to single long string
  let tweetArr = [];
  tweets.tweets.map(tweet => {
    return (tweetArr = [...tweetArr, tweet.tweet]);
  });
  let concatString = tweetArr.join(" ").toLowerCase();

  console.log(concatString);

  const userMentions = concatString.match(/(@\S+\b)/gi);

  const getOccurance = (arr, value) => arr.filter(v => v === value).length;

  const userMentionsFilter = Array.from(
    new Set(userMentions.map(value => value))
  );

  const userMentionAmounts = userMentionsFilter.map(value => {
    let obj = {};
    obj[value] = getOccurance(userMentions, value);
    return obj;
  });

  tweets.stats.userMentions = userMentionAmounts;

  const hashTags = concatString.match(/(#\S+\b)/gi);

  const hashtagFilter = Array.from(new Set(hashTags.map(value => value)));

  const hashtagAmounts = hashtagFilter.map(value => {
    let obj = {};
    obj[value] = getOccurance(hashTags, value);
    return obj;
  });

  tweets.stats.hashtags = hashtagAmounts;

  const removedMentions = concatString.replace(/(@\S+\b)/gi, "");
  const removedHashtags = removedMentions.replace(/(#\S+\b)/gi, "");

  var wordCounts = {};
  var words = removedHashtags.split(/\b/);

  for (var i = 0; i < words.length; i++) {
    wordCounts[words[i]] = (wordCounts[words[i]] || 0) + 1;
  }
  // filter out connectors, @, other symbols

  const excludedWords = [
    "the",
    "you",
    "for",
    "https",
    "http",
    "://",
    "...",
    "and",
    "was",
    "that",
    "this",
    "very",
    "are",
    "with",
    "but",
    "have",
    "not",
    "they",
    "before",
    "all",
    "just",
    "from",
    "only",
    "more",
    "can",
    "about",
    "would",
    "use",
    "-",
    "there",
    "say",
    "been",
    "get",
    "some",
    "one",
    "out",
    "... ",
    "- ",
    " -",
    "your",
    "what",
    "get",
    "see",
    "who",
    "because",
    "still",
    "when",
    "sure",
    "how",
    "why",
    "anyone",
    "had",
    "than",
    "will",
    "don",
    " .",
    ". ",
    "amp",
    ". ",
    ": ",
    "– ",
    "has",
    "way",
    "their",
    ". ",
    '.""',
    "then"
  ];

  const isExcludedWord = word => excludedWords.includes(word);
  // filter words used more than 10 times
  const top20Words = Object.keys(wordCounts)
    .filter(
      key => wordCounts[key] > 5 && key.length > 2 && !isExcludedWord(key)
    )
    .map(key => {
      return { word: key, count: wordCounts[key] };
    })
    .sort((a, b) => {
      return b.count - a.count;
    });

  tweets.stats.mostUsedWords = top20Words;
  return tweets;
};

async function parseTweets(tweetObject) {
  let tweetStrings = tweetObject.tweets.map(tweet => tweet.tweet);
  var size = 25;
  // Split the array
  const newArray = new Array(Math.ceil(tweetStrings.length / size))
    .fill("")
    .map(function() {
      return this.splice(0, size);
    }, tweetStrings.slice());

  // Map through each array. await the result of the api fetch and assign it to the array
  const fetchedTweets = newArray.map((slicedArray, i) => {
    return apiCall(slicedArray, language);
  });

  return Promise.all(fetchedTweets).then(res => {
    let tempArr = [];

    res.forEach(object => {
      object.ResultList.forEach(sentiment => {
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
