## Movie Magic Recommender Bot - README   ✨

This is the README file for the Movie Magic Recommender Bot, your one-stop shop for cinematic adventures on Telegram!  

**Looking for a movie that matches your mood?  This bot's got you covered!**

**Here's what the Movie Magic Recommender Bot can do for you:**

* Find the perfect movie for you with a **random recommendation** 
* Explore the **top-rated movies** and discover hidden gems 
* Dive into specific genres and get recommendations for **movies or TV shows**   
* Stay on top of the latest trends with **trending movies and TV shows** 
* Get a dose of inspiration with a **random inspirational quote**  

**Ready to get started? Let's go!**  ➡️

**What you'll need:**

* Node.js and npm (or yarn)
* A Telegram Bot API token (get yours here: [https://core.telegram.org/widgets/login](https://core.telegram.org/widgets/login))
* TMDB API authorization (sign up for free here: [https://developer.themoviedb.org/reference/intro/getting-started](https://developer.themoviedb.org/reference/intro/getting-started))

**Setting Up the Magic:**

1. Clone this repository.
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the project directory and add these secrets (replace with your own):

   ```
   TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
   AUTHORIZATION=Bearer YOUR_TMDB_API_KEY
   ```

**Let's Make Some Movie Magic!** ✨

1. Start the bot using:
   ```bash
   node index.js
   ```

**How it Works:**

The bot uses the Telegram Bot API to chat with you and the TMDB API to find all the movie info you need. When you send a command, the bot uses different functions to handle your requests, make API calls, and send messages and photos.

**Take a Peek Inside the Code Vault:**

* **index.js:** The main entrance for the bot.
* **.env:** Keeps your secret API keys safe and sound.
* **APIRequest.js:** Makes requests to the TMDB API.
* **getID.js:** Fetches genre lists and other data from TMDB.
* **getGenreName.js:** Decodes genre IDs into actual genre names.
* **getRandomRecommendation.js:** Picks a random movie recommendation just for you.
* **getRecommendedMoviesByGenre.js:** Recommends movies based on the genre you choose.
* **getTopMovies.js:** Shows you the top-rated movies.
* **getTrending.js:** Unveils the hottest trending movies and TV shows.
* **getAQuote.js:** Finds and sends you a random inspirational quote.
* **getAbout.js:** Tells you all about the bot's creator.
* **getNavButton.js:** Creates buttons to navigate through pages of results (top movies, trending).

**We've Got Your Back!**

The code has error handling built-in, so if anything goes wrong, the bot will log the error and send you a helpful message.

**This is Just the Beginning!**  

There's always room for more magic! Here are some ideas for future features:

* Search for specific movies or actors.
* Remember your preferences and personalize recommendations.
* Include more detailed movie information.

**We hope you enjoy using the Movie Magic Recommender Bot!**   ✨
