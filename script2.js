// script.js

const API_KEY = '94a389862ae25549eb47055e4812a191';
const weatherResults = document.getElementById('weather-results');
const australianCitiesContainer = document.getElementById('australian-cities');


// Default list of Australian capital cities
const australianCapitalCities = ["Adelaide", "Melbourne", "Perth", "Darwin", "Hobart", "Canberra", "Sydney"];

// Display Australian capital cities as buttons
australianCapitalCities.forEach(city => {
    const cityButton = document.createElement('button');
    cityButton.classList.add('btn', 'btn-primary', 'mb-2');
    cityButton.textContent = city;
    cityButton.addEventListener('click', () => {
      localStorage.setItem('selectedCity', city);
      window.location.href = 'city_weather.html';
    });
    australianCitiesContainer.appendChild(cityButton);
  });

// Function to fetch weather data from OpenWeatherMap API
async function fetchWeatherData(city, days = 6) {
  try {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.cod !== '200') {
      throw new Error(data.message);
    }

    const cityData = {
      name: data.city.name,
      forecast: parseForecastData(data.list, days),
    };

    return cityData;
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    throw error;
  }
}

// Function to parse the forecast data from API response
function parseForecastData(forecastList, days) {
  return forecastList
    .slice(0, days)
    .map(item => ({
      date: new Date(item.dt * 1000).toLocaleDateString(),
      icon: item.weather[0].icon,
      temperature: item.main.temp,
      humidity: item.main.humidity,
      windSpeed: item.wind.speed,
    }));
}

// Function to display the 5-day weather forecast for the city
function displayWeatherForecast(cityData) {
  const weatherHtml = `
    <h2 class="mb-3">${cityData.name}</h2>
    <div class="row">
      ${cityData.forecast.map(day => `
        <div class="col-md-4">
          <div class="weather-card">
            <p>Date: ${day.date}</p>
            <img src="https://openweathermap.org/img/wn/${day.icon}.png" alt="Weather Icon">
            <p>Temperature: ${day.temperature} °C</p>
            <p>Humidity: ${day.humidity}%</p>
            <p>Wind Speed: ${day.windSpeed} m/s</p>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  weatherResults.innerHTML = weatherHtml;
}

// Function to handle errors when fetching weather data
function handleFetchError(error) {
  const errorMessage = `
    <div class="alert alert-danger" role="alert">
      Error fetching weather data: ${error.message}
    </div>
  `;

  weatherResults.innerHTML = errorMessage;
}

// Get the selected city from localStorage
const selectedCity = localStorage.getItem('selectedCity');

// Fetch weather data for the selected city and display the forecast
if (selectedCity) {
  fetchWeatherData(selectedCity)
    .then(data => {
      displayWeatherForecast(data);
    })
    .catch(error => {
      handleFetchError(error);
    });
} else {
  const errorMessage = `
    <div class="alert alert-warning" role="alert">
      No city selected. Please go back and select a city.
    </div>
  `;

  weatherResults.innerHTML = errorMessage;
}

