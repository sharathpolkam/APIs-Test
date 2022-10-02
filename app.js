const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "moviesData.db");

const app = express();
module.exports = app;

app.use(express.json());

let database = null;

//Initializing DB and Server

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000);
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// This route returns as JSON the top 10 movies with the longest runTime
//The output contains tconst, primaryTitle, runtimeMinutes & genres

app.get("/api/v1/longest-duration-movies", async (request, response) => {
  const getMovieNamesQuery = `
      SELECT 
        tconst, primaryTitle, runtimeMinutes, genres
      FROM 
        movies
      ORDER BY 
        runtimeMinutes DESC
      LIMIT
       10;`;
  const moviesList = await database.all(getMovieNamesQuery);
  response.send(moviesList);
});

//This route returns as JSON the movies with an averageRating > 6.0, in sorted order by averageRating
//The output  contains  tconst, primaryTitle, genres & averageRating

app.get("/api/v1/top-rated-movies", async (request, response) => {
  const getMovieNamesQuery = `
      SELECT 
        movies.tconst, movies.primaryTitle, movies.runtimeMinutes, movies.genres, ratings.averageRating
      FROM 
        movies INNER JOIN ratings ON movies.tconst = ratings.tconst
      WHERE 
        averageRating > 6.0
      ORDER BY 
        averageRating;`;
  const moviesList = await database.all(getMovieNamesQuery);
  response.send(moviesList);
});

// Movie Post --2
app.post("/api/v1/new-movie", async (request, response) => {
  const body = request.body;
  const { type, title, runtime, genres } = body;
  const addMovieQuery = `
    INSERT INTO 
       movies(titleType, primaryTitle, runtimeMinutes, genres)
    VALUES
       ('${type}', '${title}', '${runtime}', '${genres}')`;
  const movie = await database.run(addMovieQuery);
  response.send("success");
});
