// script.js
const API_KEY = '94a389862ae25549eb47055e4812a191';
const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const weatherResults = document.getElementById('weather-results');
const searchHistory = document.getElementById('search-history');
const clearSearchHistoryButton = document.getElementById('clear-search-history');
const australianCitiesContainer = document.getElementById('australian-cities');
const majorCitiesContainer = document.getElementById('major-cities');

// Default list of Australian capital cities
const australianCapitalCities = ["Adelaide", "Melbourne", "Perth", "Darwin", "Hobart", "Canberra", "Sydney"];

// Default list of major cities
const majorCities = [
  'New York', 'London', 'Tokyo', 'Beijing', 'Dubai'
];

// Display Australian capital cities as buttons and update the search history
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


  
// Display 1-day weather forecast for major cities
majorCities.forEach(city => {
  fetchWeatherData(city, 1)
    .then(data => {
      displayWeatherForecast(city, data);
    })
    .catch(error => {
      console.error(`Error fetching data for ${city}:`, error);
    });
});


// Function to fetch weather data from OpenWeatherMap API
async function fetchWeatherData(city, days = 5) {
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

function updateWeatherResults(cityData) {
    const weatherHtml = `
      <h2>${cityData.name}</h2>
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

// Function to display the 1-day weather forecast for major cities
function displayWeatherForecast(city, cityData) {
    const majorCityHtml = `
      <div class="col-md-4 mb-4">
        <div class="weather-card">
          <h2>${city}</h2>
          <p>Date: ${cityData.forecast[0].date}</p>
          <img src="https://openweathermap.org/img/wn/${cityData.forecast[0].icon}.png" alt="Weather Icon">
          <p>Temperature: ${cityData.forecast[0].temperature} °C</p>
          <p>Humidity: ${cityData.forecast[0].humidity}%</p>
          <p>Wind Speed: ${cityData.forecast[0].windSpeed} m/s</p>
        </div>
      </div>
    `;
  
    majorCitiesContainer.innerHTML += majorCityHtml;
  }


// Function to update the search history section
function updateSearchHistory(cityName) {
    const searchItem = document.createElement('li');
    searchItem.textContent = cityName;
    searchItem.addEventListener('click', () => {
        localStorage.setItem('selectedCity', cityName);
        window.location.href = 'city_weather.html';
    });

    searchHistory.appendChild(searchItem);
}

// Function to clear the search history from local storage and remove list items
function clearSearchHistory() {
    localStorage.removeItem('searchHistory'); // Remove the 'searchHistory' key from local storage
    searchHistory.innerHTML = ''; // Clear the displayed search history list
}

// Event listener for the "Clear Search History" button
clearSearchHistoryButton.addEventListener('click', () => {
    clearSearchHistory(); // Call the function to clear search history
});

// Event listener for the search form submission
searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
        updateSearchHistory(city); // Call the function to update search history
        saveSearchHistoryToLocalStorage(city); // Save search history to local storage
        localStorage.setItem('selectedCity', city);
        fetchWeatherData(city) // Fetch weather data for the searched city
            .then(data => {
                displayWeatherForecast(city, data); // Display the weather forecast for the searched city
            })
            .catch(error => {
                handleFetchError(error);
            });
        window.location.href = 'city_weather.html';
    }
});

// Get the selected city from localStorage and display the weather forecast
const selectedCity = localStorage.getItem('selectedCity');
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

// Load and display search history on page load
const searchHistoryItems = localStorage.getItem('searchHistory');
if (searchHistoryItems) {
    const historyItems = JSON.parse(searchHistoryItems);
    historyItems.forEach(cityName => {
        updateSearchHistory(cityName);
    });
}

// Save search history to local storage when a new search is made
function saveSearchHistoryToLocalStorage(cityName) {
    let searchHistoryItems = localStorage.getItem('searchHistory');
    if (!searchHistoryItems) {
        searchHistoryItems = JSON.stringify([]);
    }
    const historyItems = JSON.parse(searchHistoryItems);
    historyItems.push(cityName);
    localStorage.setItem('searchHistory', JSON.stringify(historyItems));
}


