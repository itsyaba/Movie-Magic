const telegramBot = require("node-telegram-bot-api");
const dotenv = require("dotenv");
const axios = require("axios");
dotenv.config();

const bot = new telegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

let result;

bot.onText(/\/start/, async (msg) => {
  await bot.sendMessage(msg.chat.id, "Hello " + msg.chat.first_name + "!");
  await bot.sendMessage(
    msg.chat.id,
    "👋 Welcome to Movie Magic Recommender Bot! 🎬 Ready for a cinematic adventure? Type your mood or preferences, and let's find the perfect movie for you! 🍿✨",
    {
      reply_markup: {
        keyboard: [
          ["🎬 Get A Random Recommendation"],
          ["🌟 Top Movies", "🎭 Genres"],
          [" 💥Trending  "],
          [" 🔖 Get A Quote", " 🤘 About"],
        ],
        resize_keyboard: true,
        one_time_keyboard: false,
      },
    }
  );
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const message = msg.text;
  // console.log("@" + msg.chat.username, message);

  switch (message) {
    case "🎬 Get A Random Recommendation":
      await getRandomRecommendation(chatId);
      break;
    case "🌟 Top Movies":
      await getTopMovies(chatId);
      break;
    case "🎭 Genres":
      await getRecommendedMoviesByGenre(chatId);
      break;
    case "💥Trending":
      await getTrending(chatId);
      break;
    case "🔖 Get A Quote":
      await getAQuote(chatId);
      break;
    case "🤘 About":
      getAbout(chatId);
      break;

    default:
      console.log("Something is Wrong !!!");
      //       console.log(message);
      break;
  }
});

bot.on("callback_query", async (callback) => {
  const [action, page, type] = callback.data.split("-");
  const chatID = callback.message.chat.id;
  switch (action) {
    case "prev":
      if (type === "getTrending") {
        await getTrending(chatID, parseInt(page));
      } else if (type === "getTopMovies") {
        await getTopMovies(chatID, parseInt(page));
      }
      break;
    case "next":
      if (type === "getTrending") {
        await getTrending(chatID, parseInt(page));
      } else if (type === "getTopMovies") {
        await getTopMovies(chatID, parseInt(page));
      }
      break;
    case "Try Again":
      getRandomRecommendation(chatID);
      break;
  }
});

const APIRequest = async (type, page) => {
  try {
    const options = {
      method: "GET",
      url: `https://api.themoviedb.org/3/${type}?language=en-US&page=${page}`,
      headers: {
        accept: "application/json",
        Authorization: process.env.AUTHORIZATION,
      },
    };
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error("Error fetching data from API:", error);
    throw error;
  }
};

const getID = async (type) => {
  try {
    const options = {
      method: "GET",
      url: `https://api.themoviedb.org/3/${type}?language=en-US`,
      headers: {
        accept: "application/json",
        Authorization: process.env.AUTHORIZATION,
      },
    };
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error("Error fetching data from API:", error);
    throw error;
  }
};

const getGenreName = async (genreUrl, genre_ids) => {
  // const getGenre = await getID("genre/movie/list");
  // GenreUrl = genre/movie/list
  // Genre_ids = [12 , 34 , 123]
  const getGenre = await getID(genreUrl);
  const genreList = await getGenre.genres;
  let genreName = [];

  genre_ids.forEach((el) => {
    genreList.forEach((gl) => {
      if (el === gl.id) {
        genreName.push(gl.name);
      }
    });
  });
  return genreName;
};

const getRandomRecommendation = async (chatId) => {
  try {
    const randomPage = Math.floor(Math.random() * 454) + 1;
    const recommendations = await APIRequest("discover/movie", randomPage);

    if (!recommendations || !recommendations.results || recommendations.results.length === 0) {
      await bot.sendMessage(
        chatId,
        "Sorry, I couldn't find any recommendations at this time. Please try again later."
      );
      return;
    }
    let startsFrom = Math.floor(Math.random() * 20) + 1;
    let endsAt = startsFrom + 5;
    for (const movie of recommendations.results.slice(startsFrom, endsAt)) {
      const genreList = await getGenreName("genre/movie/list", movie.genre_ids);
      const message = {
        chat_id: chatId,
        photo: "https://image.tmdb.org/t/p/original" + movie.poster_path,
        caption:
          `⭐️ <b>${movie.original_title}</b> ⭐️\n \n ` +
          `<b>Rating : </b> ${movie.vote_average}/10\n` +
          `<b>Genre : </b> ${genreList.join(" , ")} \n` +
          // `<b>Release Date : </b> ${movie.release_date.toLocaleDateString()} \n \n ` +
          `<b> Release Date : </b> ${new Date(movie.release_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "2-digit",
          })}\n\n` +
          `✨<b> Description: </b>\n ` +
          `<i>${movie.overview}</i>\n \n `,

        parse_mode: "HTML",
      };
      try {
        await bot.sendPhoto(message.chat_id, message.photo, {
          caption: message.caption,
          parse_mode: message.parse_mode,
        });
      } catch (error) {
        console.log("Error while sending Image: " + error);
        await bot.sendMessage(chatId, "Oops, Error While Sending Image . Please try again later.");
      }
    }
  } catch (error) {
    await bot.sendMessage(chatId, "Oops, something went wrong ❌ . Please try again later.");
  }
};

const getRecommendedMoviesByGenre = async (chatId) => {
  let selectedGenre;
  let selectedType;
  const keyboard = [];
  const page = Math.floor(Math.random() * 500) + 1;

  const typeSelector = [
    [
      { text: "Tv Show", callback_data: "tv" },
      { text: "Movies", callback_data: "movie" },
    ],
  ];

  await bot.sendMessage(chatId, " Select A Categories : ", {
    reply_markup: {
      inline_keyboard: typeSelector,
    },
  });

  bot.on("callback_query", async (callback) => {
    if (callback.data === "tv" || callback.data === "movie") {
      // genre/tv/list
      const getGenre = await getID("genre/" + callback.data + "/list");
      const genreList = await getGenre.genres;
      selectedType = callback.data;

      for (let i = genreList.length - 1; i >= 0; i -= 2) {
        const row = [];
        row.push({ text: genreList[i].name, callback_data: genreList[i].name });
        if (i > 0) {
          row.push({ text: genreList[i - 1].name, callback_data: genreList[i - 1].name });
        }
        keyboard.push(row);
      }
      await bot.sendMessage(chatId, "Select A Genre : ", {
        reply_markup: {
          inline_keyboard: keyboard,
        },
      });
      keyboard.length = 0;

      bot.on("callback_query", async (call) => {
        selectedGenre = call.data;
        const apiUrl = "discover/" + selectedType;
        const apireq = await APIRequest(apiUrl, page);
        for (const movie of apireq.results) {
          const genreList = await getGenreName("genre/" + selectedType + "/list", movie.genre_ids);
          if (genreList.includes(selectedGenre)) {
            const message = {
              chat_id: chatId,
              photo: "https://image.tmdb.org/t/p/original" + movie.poster_path,
              caption:
                `⭐️ <b>${movie.original_title ? movie.original_title : movie.name}</b> ⭐️\n \n ` +
                `<b>Rating : </b> ${movie.vote_average}/10\n` +
                `<b>Genre : </b> ${genreList.join(" , ")} \n` +
                `<b> Release Date : </b> ${new Date(
                  movie.release_date ? movie.release_date : movie.first_air_date
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "2-digit",
                })}\n\n` +
                `✨<b> Description: </b>\n ` +
                `<i>${movie.overview}</i>\n \n `,

              parse_mode: "HTML",
            };
            try {
              await bot.sendPhoto(message.chat_id, message.photo, {
                caption: message.caption,
                parse_mode: message.parse_mode,
              });
            } catch (error) {
              console.log("Error while sending Image: " + error);
              await bot.sendMessage(
                chatId,
                "Oops, Error While Sending Image . Please try again later."
              );
            }
          }
        }
        await bot.sendMessage(chatId, "Try Again : ", {
          reply_markup: {
            inline_keyboard: [[{ text: "Try Again", callback_data: "Try Again" }]],
          },
        });
      });
    }
  });
};

const getTopMovies = async (chatId, page = 1) => {
  try {
    const recommendations = await APIRequest("movie/top_rated", page);
    if (!recommendations || !recommendations.results || recommendations.results.length === 0) {
      await bot.sendMessage(
        chatId,
        "Sorry, I couldn't find any recommendations at this time. Please try again later."
      );
      return;
    }
    for (const movie of recommendations.results) {
      const genreList = await getGenreName("genre/movie/list", movie.genre_ids);

      const message = {
        chat_id: chatId,
        photo: "https://image.tmdb.org/t/p/original" + movie.poster_path,
        caption:
          `⭐️ <b>${movie.original_title}</b> ⭐️\n \n ` +
          `<b>Rating : </b> ${movie.vote_average}/10\n` +
          `<b>Genre : </b> ${genreList.join(" , ")} \n` +
          `<b> Release Date : </b> ${new Date(movie.release_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "2-digit",
          })}\n\n` +
          `✨<b> Description: </b>\n ` +
          `<i>${movie.overview}</i>\n \n `,
        parse_mode: "HTML",
      };
      try {
        await bot.sendPhoto(message.chat_id, message.photo, {
          caption: message.caption,
          parse_mode: message.parse_mode,
        });
      } catch (error) {
        await bot.sendMessage(chatId, "Oops, Error While Sending Image  . Please try again later.");
        console.log("Error while sending Image: " + error);
      }
    }

    getNavButton(chatId, page, "getTopMovies");
  } catch (error) {
    console.error("Error sending recommendations:", error);
    await bot.sendMessage(chatId, "Oops, something went wrong ❌ . Please try again later.");
  }
};

const getTrending = async (chatId, page = 1) => {
  try {
    const recommendations = await APIRequest("trending/all/week", page);

    if (!recommendations || !recommendations.results || recommendations.results.length === 0) {
      await bot.sendMessage(
        chatId,
        "Sorry, I couldn't find any recommendations at this time. Please try again later."
      );
      return;
    }

    for (const movie of recommendations.results) {
      const genreList = await getGenreName("genre/movie/list", movie.genre_ids);

      const message = {
        chat_id: chatId,
        photo: "https://image.tmdb.org/t/p/original" + movie.poster_path,
        caption:
          `<b><i>${movie.media_type.toUpperCase()}</i></b>\n\n` +
          `⭐️ <b>${movie.original_title ? movie.original_title : movie.name}</b> ⭐️\n \n ` +
          `<b>Rating : </b> ${movie.vote_average}/10\n` +
          `<b>Genre : </b> ${genreList.join(" , ")} \n` +
          // `<b>Release Date : </b> ${movie.release_date.toLocaleDateString()} \n \n ` +
          `<b> Release Date : </b> ${new Date(movie.release_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "2-digit",
          })}\n\n` +
          `✨<b> Description: </b>\n ` +
          `<i>${movie.overview}</i>\n \n `,

        parse_mode: "HTML",
      };
      try {
        await bot.sendPhoto(message.chat_id, message.photo, {
          caption: message.caption,
          parse_mode: message.parse_mode,
        });
      } catch (error) {
        console.log("Error while sending Image: " + error);
      }
    }
    getNavButton(chatId, page, "getTrending");
  } catch (error) {
    console.error("Error sending recommendations:", error);
    await bot.sendMessage(chatId, "Oops, something went wrong ❌ . Please try again later.");
  }
};

const getAQuote = async (chatId) => {
  axios
    .get("https://api.quotable.io/quotes/random")
    .then(async (result) => {
      const quote = result.data[0];
      const caption = `
      <i><b>${quote.content}</b></i>✨
      — <i>${quote.author}</i>
`;

      await bot.sendMessage(chatId, caption, { parse_mode: "HTML" });
    })
    .catch((err) => {
      bot.sendMessage(chatId, "Error While Getting The Quote . Please Try Again !!!");
    });
};

const getAbout = (chatId) => {
  const keyboard = [[{ text: "Contact Me ", url: "https://t.me/itsyaba" }]];

  bot.sendMessage(
    chatId,
    "✨ About the Bot: \n Movie Magic Recommender Bot is created by Yeabsira Tarekegn , a movie enthusiast and developer passionate about bringing the joy of cinema to Telegram users worldwide. Sit back, relax, and let Movie Magic Recommender Bot elevate your movie-watching experience to new heights!",
    {
      reply_markup: { inline_keyboard: keyboard },
    }
  );
};

const getNavButton = async (chatId, page, type) => {
  await bot.sendMessage(chatId, "Select A Page : ", {
    reply_markup: {
      inline_keyboard: [
        [{ text: `Page :  ${page}`, callback_data: " " }],
        [
          { text: "Prev", callback_data: `prev-${page - 1}-${type}` },
          { text: "Next", callback_data: `next-${page + 1}-${type}` },
        ],
      ],
    },
  });
};

bot.on("polling_error", (error) => {
  console.log("Polling Error " + error);
});

console.log("Server Is Running !!!");
