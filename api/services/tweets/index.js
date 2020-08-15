/*
[
    {
        id: auto,
        content: 'str',
        date: 'str',
        users: 'num'
    }
]

*/
const tweetsArray = [];

const newTweet = (tweet) => {
    tweetsArray.push(tweet);
};

const loadTweets = () => {
    return tweetsArray;
};

const arrayLenght = ()=> {
    return tweetsArray.length;
};

module.exports = { newTweet, loadTweets, arrayLenght};