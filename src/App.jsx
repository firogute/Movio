import React, { useState, useEffect } from "react";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "./appwrite";

const API_BASE_URL = "https://api.themoviedb.org/3";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
// console.log(API_KEY);

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movies, setMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debounceTerm, setDebounceTerm] = useState("");

  useDebounce(() => setDebounceTerm(searchTerm), 600, [searchTerm]);

  const fetchMovies = async (query = "") => {
    setLoading(true);
    setErrorMessage("");
    try {
      const endPoints = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by = popularity.desc`;
      const response = await fetch(endPoints, API_OPTIONS);
      if (!response.ok) {
        throw new Error(`Failed to fetch movies`);
      }
      const data = await response.json();

      if (data.response === "False") {
        setErrorMessage(data.Error || "Failed to fetch movies");
        setMovies([]);
        return;
      }
      setMovies(data.results || []);

      if (query && data.results.length > 0) {
        updateSearchCount(query, data.results[0]);
      }
    } catch (e) {
      console.error(e);
      setErrorMessage("Error Fetching Movies. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMovies(debounceTerm);
  }, [debounceTerm]);

  useEffect(() => {
    loadTrendingMovies();
    console.log(trendingMovies);
  }, []);

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="/hero.png" alt="Herro Banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> You`ll Enjoy
            Without the Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}
        <section className="all-movies">
          <h2 className="mt-[40px]">All Movies</h2>
          {loading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movies.map((movie) => (
                <MovieCard movie={movie} key={movie.id} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
