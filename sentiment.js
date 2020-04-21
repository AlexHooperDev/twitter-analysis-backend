const afinn = require('./afinn');

function tokenize(input) {
  // convert negative contractions into negate_<word>
  return input.replace('.', '')
    .replace('/ {2,}/', ' ')
    .replace(/[.,\/#!$%\^&\*;:{}=_`~()]/g, '')
    .toLowerCase()
    .replace(/\w+['’]t\s+(a\s+)?(.*?)/g, 'negate_$2')
    .split(' ');
}

function sentiment(phrase) {
  const tokens = tokenize(phrase);
  let score = 0;
  const words = [];
  const positive = [];
  const negative = [];

  // Iterate over tokens
  let len = tokens.length;
  while (len--) {
    let obj = tokens[len];
    const negate = obj.startsWith("negate_");

    if (negate) obj = obj.slice("negate_".length);

    if (!afinn.hasOwnProperty(obj)) continue;

    let item = afinn[obj];

    words.push(obj);
    if (negate) item *= -1.0;
    if (item > 0) positive.push(obj);
    if (item < 0) negative.push(obj);

    score += item;
  }

  const verdict = score == 0 ? "NEUTRAL" : score < 0 ? "NEGATIVE" : "POSITIVE";

  const result = {
    verdict,
    score,
    comparative: score / tokens.length,
    positive: [...new Set(positive)],
    negative: [...new Set(negative)],
  };

  return result;
}

module.exports = sentiment;
