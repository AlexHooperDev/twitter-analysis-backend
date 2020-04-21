const AWS = require("aws-sdk");
const sentiment = require("./sentiment");

// Setup AWS
AWS.config.update({ region: "us-west-2" });
const comprehend = new AWS.Comprehend();
const language = "en";

const apiCall = (array, language) =>
  new Promise((resolve, reject) => {
    comprehend.batchDetectSentiment(
      { LanguageCode: language, TextList: array },
      (err, data) => {
        if (err) console.log(err);
        else {
          resolve(data);
        }
      }
    );
  });

const getTweetActivity = (tweetArr) => {
  try {
    // sort tweets into objexts with year as key
    const obj = {};
    const yearsAndMonthObj = {};

    const monthsObj = {
      Jan: 0,
      Feb: 0,
      Mar: 0,
      Apr: 0,
      May: 0,
      Jun: 0,
      Jul: 0,
      Aug: 0,
      Sep: 0,
      Oct: 0,
      Nov: 0,
      Dec: 0,
    };

    const resetMonths = () => {
      console.log("resetting months");
      Object.keys(monthsObj).map((key) => {
        monthsObj[key] = 0;
      });
    };

    // {year: {tweet: asd, date: date}, year: }
    const yearRegEx = /(19|20)[0-9]{2}/gm;
    const monthRegEx = /Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/gm;

    tweetArr.tweets.forEach((tweet) => {
      // get the year from the tweet.date value - then create a new key in the obj
      const year = tweet.date.match(yearRegEx);
      if (!obj[year]) {
        obj[year] = [{ ...tweet }];
      } else {
        obj[year] = [{ ...tweet }, ...obj[year]];
      }
    });

    Object.keys(obj).map((key, i) => {
      // this is going to loop 3-4 times
      // reset monthsObj here
      if (i === 0) resetMonths();
      obj[key].map((tweet, i) => {
        const month = tweet.date.match(monthRegEx);
        if (month) {
          monthsObj[month[0]] = monthsObj[month[0]] + 1;
        }
        if (i === obj[key].length - 1) {
          // save months obj to new obj with that specific year
          yearsAndMonthObj[key] = { ...monthsObj };
          resetMonths();
        }
        // if last value in map, then reset monthsObj here
      });
    });

    tweetArr.stats.tweetActivity = yearsAndMonthObj;
    // Count how many occ of a month there are in each year obj
  } catch (err) {
    console.log(err);
  }
};

const getKeyPhrases = (tweets) => {
  // reduce all tweets to single long string
  let tweetArr = [];
  tweets.tweets.map((tweet) => (tweetArr = [...tweetArr, tweet.tweet]));
  const concatString = tweetArr.join(" ").toLowerCase();

  const userMentions = concatString.match(/(@\S+\b)/gi);

  const getOccurance = (arr, value) => arr.filter((v) => v === value).length;

  const userMentionsFilter = Array.from(
    new Set(userMentions.map((value) => value))
  );

  const userMentionAmounts = userMentionsFilter.map((value) => ({
    user: value,
    count: getOccurance(userMentions, value),
  }));

  const top20Mentions = userMentionAmounts
    .filter((mention) => mention.count > 5)
    .map((key) => key)
    .sort((a, b) => b.count - a.count);

  getTweetActivity(tweets);

  tweets.stats.userMentions = top20Mentions;

  const hashTags = concatString.match(/(#\S+\b)/gi);

  const hashtagFilter = Array.from(new Set(hashTags.map((value) => value)));

  const hashtagAmounts = hashtagFilter.map((value) => ({
    hashtag: value,
    count: getOccurance(hashTags, value),
  }));

  const top20Hash = hashtagAmounts
    .filter((hashtag) => hashtag.count > 5)
    .map((key) => key)
    .sort((a, b) => b.count - a.count);
  tweets.stats.hashtags = top20Hash;

  const removedMentions = concatString.replace(/(@\S+\b)/gi, "");
  const removedHashtags = removedMentions.replace(/(#\S+\b)/gi, "");

  const wordCounts = {};
  const words = removedHashtags.split(/\b/);

  for (let i = 0; i < words.length; i++) {
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
    "then",
    " ",
  ];

  const isExcludedWord = (word) => excludedWords.includes(word);

  // filter words used more than 10 times
  const top20Words = Object.keys(wordCounts)
    .filter(
      (key) =>
        wordCounts[key] > 5 &&
        key.length > 2 &&
        !isExcludedWord(key) &&
        !/\s/.test(key)
    )
    .map((key) => ({ word: key, count: wordCounts[key] }))
    .sort((a, b) => b.count - a.count);
  tweets.stats.mostUsedWords = top20Words;
  return tweets;
};

const parseTweets = (tweetObject) => {
  const tweetStrings = tweetObject.tweets.map((tweet) => tweet.tweet);
  tweetStrings.forEach((tweet, i) => {
    tweetObject.tweets[i].sentiment = sentiment(tweet);
  });
  return tweetObject;
};

// async function parseTweets(tweetObject) {
//   const tweetStrings = tweetObject.tweets.map((tweet) => tweet.tweet);
//   const size = 25;
//   // Split the array
//   const newArray = new Array(Math.ceil(tweetStrings.length / size))
//     .fill('')
//     .map(function () {
//       return this.splice(0, size);
//     }, tweetStrings.slice());

//   // Map through each array. await the result of the api fetch and assign it to the array
//   const fetchedTweets = newArray.map((slicedArray, i) => apiCall(slicedArray, language));

//   return Promise.all(fetchedTweets).then((res) => {
//     let tempArr = [];

//     res.forEach((object) => {
//       object.ResultList.forEach((sentiment) => {
//         tempArr = [...tempArr, sentiment];
//       });
//     });

//     tweetObject.tweets.forEach((tweet, i) => {
//       tweet.sentiment = tempArr[i].Sentiment;
//       tweet.sentimentScore = tempArr[i].SentimentScore;
//     });
//     return tweetObject;
//   });
// }

module.exports = { getKeyPhrases, parseTweets};
