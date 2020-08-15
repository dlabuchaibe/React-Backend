const express = require("express");
const router = express.Router();
const paginate = require("express-paginate");
const Tweet = require("./../../models/tweets");
const User = require("./../../models/users");
const Hashtag = require("./../../models/hashtag")
const auth = require("./../../middlewares/auth");

router
  .route("/")
  .get(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const tweets = await Tweet.find({}, [
      "content",
      "image",
      "createdAt",
      "likes",
    ])
      .populate("user", ["username"])
      .populate("comments.userId", ["username"])
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    const count = await Tweet.countDocuments();
    const pageCount = Math.ceil(count / limit);

    res.json({
      tweets,
      totalPages: pageCount,
      count: count,
      currentPage: page,
      hasMore: paginate.hasNextPages(req)(pageCount),
    });
  })
  .post(auth, (req, res) => {
    //crear el objeto que se va a guardar
    const content = req.body.content;
    const image = req.body.image;
    const user = req._id;
    const likes = 0;
    const tweet = {
      content,
      image,
      user,
      likes,
    };
    if (tweet.content.includes("#")){
      const hashtags = tweet.content.split(" ").filter(words => words.startsWith("#")).map(word => word.replace(/[^a-zA-Z0-9_]/g,""))
      for (let words of hashtags) {
        Hashtag.find({wordTag: words}).then((word => {
          if (word.length > 0) {
            console.log("Bien")
            Hashtag.updateOne({wordTag: words}, { $inc: { wordCount: 1 } }).then(console.log("ok")).catch(err => console.log(err));
          } else {
            const newWord = {
              wordTag: words,
              wordCount
            }
            console.log(newWord)
            const addWord = new Hashtag (newWord);
            addWord.save();
          }
        }));
      };
    };
    Tweet.find({ content: tweet.content }).then((tweets) => {
      if (tweets.length > 0) {
        res
          .status(500)
          .send({ message: "Ya existe un elemento con el mismo contenido" });
      } else {
        const newTweet = new Tweet(tweet);
        newTweet.save().then((response) => {
          res.status(200).send(response);
        });
      }
    });
  })
  .put(auth, (req, res) => {
    const tweet = {
      id: req.body.id,
      content: req.body.content,
    };
    Tweet.update({ _id: tweet.id }, { content: tweet.content }).then(() => {
      res.status(200).send({ message: "El elemento fue actualizado" });
    });

    res.status(200).send({ message: "El tweet ha sido actualizado" });
  })
  .delete(auth, (req, res) => {
    const tweet = {
      id: req.body.id,
    };
    console.log(tweet.id);
    Tweet.deleteOne({ _id: tweet.id })
      .then(() => {
        res.status(200).send({ message: "Tweet eliminado" });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send({ message: "No fue posible eliminar el tweet" });
      });
  });

router.route("/like").post(auth, (req, res) => {
  const id = req.body.id;
  Tweet.update({ _id: id }, { $inc: { likes: 1 } }).then((response) => {
    res.sendStatus(200);
  });
});

router
.route("/comments")
.post(auth, (req, res)=>{
  const id = req.body.id;
  const comment = {
    userComment: req.body.content,
    userId: req._id
  };

  Tweet.updateOne({ _id: id }, { $addToSet: { comments:  comment} })
  .then((response) => {
    res.sendStatus(200);
  })
  .catch((err) => {
    res.sendStatus(500);
  });

});


router
.route("/comments/:id")
.get((req, res) => {
  const id = req.params.id;
  
  Tweet.find({ _id: id }, ["content", "image", "createdAt", "likes", "comments"])
  .populate("user", ["username"])
  .populate("comments.userId", ["username"])
  .sort({ createdAt: -1 })
  .then((tweets) => {
    res.json({
      tweets,
    });
  })
  .catch((err) => {
    res.sendStatus(500);
  });
});

router.route("/:username")
.get((req, res) => {
  const username = req.params.username;
  User.find({ username: username })
    .then((user) => {
      userId = user[0]._id;
      Tweet.find({ user: userId }, ["content", "image", "createdAt", "likes"])
        .populate("user", ["username"])
        .populate("comments.userId", ["username"])
        .sort({ createdAt: -1 })
        .then((tweets) => {
          res.json({
            tweets,
          });
        });
    })
    .catch((err) => {
      res.status(400).send({ message: "No existe el usuario" });
    });
});

module.exports = router;