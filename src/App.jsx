import { useEffect, useState } from "react";
import "./App.css";

const conditions = {
0: ["Clear sky", "☀️"],
1: ["Mainly clear", "🌤️"],
2: ["Partly cloudy", "⛅"],
3: ["Overcast", "☁️"],
45: ["Foggy", "🌫️"],
48: ["Foggy", "🌫️"],
51: ["Light drizzle", "🌦️"],
53: ["Drizzle", "🌦️"],
55: ["Heavy drizzle", "🌧️"],
56: ["Freezing drizzle", "🌧️"],
57: ["Freezing drizzle", "🌧️"],
61: ["Light rain", "🌦️"],
63: ["Rain", "🌧️"],
65: ["Heavy rain", "🌧️"],
66: ["Freezing rain", "🌧️"],
67: ["Freezing rain", "🌧️"],
71: ["Light snow", "🌨️"],
73: ["Snow", "❄️"],
75: ["Heavy snow", "❄️"],
77: ["Snow grains", "🌨️"],
80: ["Rain showers", "🌦️"],
81: ["Rain showers", "🌧️"],
82: ["Heavy showers", "⛈️"],
85: ["Snow showers", "🌨️"],
86: ["Heavy snow showers", "❄️"],
95: ["Thunderstorm", "⛈️"],
96: ["Thunderstorm with hail", "⛈️"],
99: ["Thunderstorm with hail", "⛈️"],
};

function getCondition(code) {
return conditions[code] || ["Weather conditions", "🌤️"];
}

function formatTemperature(value, unit) {
const temperature =
unit === "F" ? (value * 9) / 5 + 32 : value;

return `${Math.round(temperature)}°${unit}`;
}

function App() {
const [cityInput, setCityInput] = useState("Delhi");
const [city, setCity] = useState("");
const [weather, setWeather] = useState(null);
const [forecast, setForecast] = useState([]);
const [unit, setUnit] = useState("C");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

async function searchWeather(cityName) {
const query = cityName.trim();

if (!query) {
  setError("Please enter a city name.");
  return;
}

setLoading(true);
setError("");

try {
  const geoUrl = new URL(
    "https://geocoding-api.open-meteo.com/v1/search"
  );

  geoUrl.search = new URLSearchParams({
    name: query,
    count: "1",
    language: "en",
    format: "json",
  });

  const geoResponse = await fetch(geoUrl);

  if (!geoResponse.ok) {
    throw new Error("Unable to search for this city.");
  }

  const geoData = await geoResponse.json();
  const place = geoData.results?.[0];

  if (!place) {
    throw new Error(
      "City not found. Check the spelling and try again."
    );
  }

  const weatherUrl = new URL(
    "https://api.open-meteo.com/v1/forecast"
  );

  weatherUrl.search = new URLSearchParams({
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min",
    timezone: "auto",
    forecast_days: "5",
  });

  const weatherResponse = await fetch(weatherUrl);

  if (!weatherResponse.ok) {
    throw new Error("Unable to load weather. Please try again.");
  }

  const data = await weatherResponse.json();

  setCity(
    [place.name, place.admin1, place.country]
      .filter(
        (part, index, all) =>
          part && all.indexOf(part) === index
      )
      .join(", ")
  );

  setWeather(data.current);

  setForecast(
    data.daily.time.map((date, index) => ({
      date,
      code: data.daily.weather_code[index],
      max: data.daily.temperature_2m_max[index],
      min: data.daily.temperature_2m_min[index],
    }))
  );
} catch (err) {
  setError(
    err.message || "Something went wrong. Please try again."
  );
} finally {
  setLoading(false);
}

}

useEffect(() => {
searchWeather("Delhi");
}, []);

function handleSubmit(event) {
event.preventDefault();
searchWeather(cityInput);
}

function getDayLabel(date, index) {
if (index === 0) return "Today";

return new Date(`${date}T12:00:00`).toLocaleDateString(
  "en-US",
  { weekday: "short" }
);

}

const currentCondition = weather
? getCondition(weather.weather_code)
: null;

return (
<main className="app">
<section className="weather-panel">
<header className="header">
<p className="eyebrow">YOUR DAILY FORECAST</p>
<h1>
Weather Now <span aria-hidden="true">☀️</span>
</h1>
<p className="subtitle">
Discover the weather in your city
</p>
</header>

    <form className="search-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={cityInput}
        onChange={(event) => setCityInput(event.target.value)}
        placeholder="Enter city name..."
        aria-label="City name"
      />

      <button type="submit" disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </button>
    </form>

    <div className="unit-row">
      <span>Live weather forecast</span>

      <div className="unit-toggle">
        <button
          type="button"
          className={unit === "C" ? "selected" : ""}
          aria-pressed={unit === "C"}
          onClick={() => setUnit("C")}
        >
          °C
        </button>

        <button
          type="button"
          className={unit === "F" ? "selected" : ""}
          aria-pressed={unit === "F"}
          onClick={() => setUnit("F")}
        >
          °F
        </button>
      </div>
    </div>

    {error && (
      <p className="error-message" role="alert">
        {error}
      </p>
    )}

    {loading && !weather && (
      <p className="status-message">
        Loading live weather...
      </p>
    )}

    {weather && currentCondition && (
      <>
        <section className="current-weather">
          <div className="current-details">
            <p className="location">📍 {city}</p>

            <h2>
              {formatTemperature(weather.temperature_2m, unit)}
            </h2>

            <p className="condition">
              {currentCondition[0]}
            </p>

            <p className="feels-like">
              Feels like{" "}
              {formatTemperature(
                weather.apparent_temperature,
                unit
              )}
            </p>
          </div>

          <div className="main-weather-icon" aria-hidden="true">
            {currentCondition[1]}
          </div>
        </section>

        <section className="details-grid">
          <article className="detail-card">
            <span>💧 Humidity</span>
            <strong>
              {weather.relative_humidity_2m}%
            </strong>
          </article>

          <article className="detail-card">
            <span>💨 Wind speed</span>
            <strong>{weather.wind_speed_10m} km/h</strong>
          </article>
        </section>

        <section className="forecast-section">
          <h3>5-Day Forecast</h3>

          <div className="forecast-grid">
            {forecast.map((day, index) => {
              const condition = getCondition(day.code);

              return (
                <article
                  className="forecast-card"
                  key={day.date}
                >
                  <p>{getDayLabel(day.date, index)}</p>

                  <span className="forecast-icon">
                    {condition[1]}
                  </span>

                  <strong>
                    {formatTemperature(day.max, unit)}
                  </strong>

                  <span className="min-temp">
                    {formatTemperature(day.min, unit)}
                  </span>
                </article>
              );
            })}
          </div>
        </section>
      </>
    )}

    <footer>
      Weather data provided by{" "}
      <a
        href="https://open-meteo.com/"
        target="_blank"
        rel="noreferrer"
      >
        Open-Meteo
      </a>
    </footer>
  </section>
</main>

);
}

export default App;