import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Guest.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css';
import 'leaflet-defaulticon-compatibility';
import L from 'leaflet';
import Popup from '../Popup/Popup';

const Guest = () => {
    const [selectedFields, setSelectedFields] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [countries, setCountries] = useState([]);
    const [destinationById, setDestinationById] = useState(null);
    const [destinationId, setDestinationId] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [resultsPerPage, setResultsPerPage] = useState(5);
    const [showCountries, setShowCountries] = useState(false);
    const [map, setMap] = useState(null);
    const [marker, setMarker] = useState(null);
    const [mapVisible, setMapVisible] = useState(false);
 
    const fields = ['Destination', 'Region', 'Country'];
 
    const toggleFieldSelection = (field) => {
        setSelectedFields((prevFields) =>
            prevFields.includes(field)
                ? prevFields.filter((f) => f !== field)
                : [...prevFields, field]
        );
    };

    const handleSearch = async () => {
      if (selectedFields.length === 0 || !searchTerm) {
          setError('Please select at least one field and enter a search term.');
          return;
      }
  
      setError(''); // Clear previous errors
      setLoading(true);
  
      try {
          const queryParams = new URLSearchParams(
              selectedFields.reduce(
                  (acc, field) => ({
                      ...acc,
                      [field]: searchTerm,
                  }),
                  {}
              )
          );
  
          const response = await axios.get(`/api/search?${queryParams.toString()}`);
  
          if (response.data && Array.isArray(response.data)) {
              setSearchResults(response.data);
              setCurrentPage(1);
          } else {
              setSearchResults([]);
              setError('No matching destinations found.');
          }
      } catch (err) {
          if (err.response?.status === 404) {
              setSearchResults([]);
              setError('No matching destinations found.');
          } else {
              console.error('Error fetching search results:', err);
              setError('Error searching destinations. Please try again.');
          }
      } finally {
          setLoading(false);
      }
  };

  async function fetchCoordinates(destinationId) {
    try {
        const response = await fetch(`/api/destinations/${destinationId}/coordinates`);
        if (!response.ok) {
            throw new Error("Failed to fetch coordinates");
        }
        const { latitude, longitude } = await response.json();
        return { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
    } catch (error) {
        console.error("Error fetching coordinates:", error);
        alert("Could not fetch coordinates for the destination.");
    }
}

const onSearchCoordinates = async () => {
  if (!destinationId) {
      alert("Please enter a valid destination ID.");
      return;
  }

  // Fetch coordinates and update the map
  const coordinates = await fetchCoordinates(destinationId);
  if (coordinates) {
      updateMap(coordinates.latitude, coordinates.longitude);
  }
};

const updateMap = (latitude, longitude, destinationName = "Destination Location") => {
  if (!map) return;

  // Center the map on the new location
  map.setView([latitude, longitude], 13);

  // Add or update the default marker
  if (marker) {
    marker.setLatLng([latitude, longitude])
      .bindPopup(destinationName)
      .openPopup();
  } else {
    const newMarker = L.marker([latitude, longitude]).addTo(map)
      .bindPopup(destinationName)
      .openPopup();
    setMarker(newMarker); // Save the marker instance to state
  }

  // Ensure proper rendering
  map.invalidateSize();
};

const [lists, setLists] = useState([]);
const [listsLoading, setListsLoading] = useState(false);
const [listsError, setListsError] = useState('');


const fetchLists = async () => {
    setListsLoading(true);
    setListsError('');
    try {
      const response = await axios.get('${process.env.REACT_APP_API_URL}/lists');
      console.log('Fetched lists:', response.data);
      // Adjust this line to match the actual structure of the API response
      setLists(response.data.listsL || []); // Correct the key if needed
    } catch (err) {
      console.error('Error fetching lists:', err);
      setListsError('Failed to fetch lists. Please try again.');
    } finally {
      setListsLoading(false);
    }
  };

  
useEffect(() => {
  fetchLists();
}, []);

const [showLists, setShowLists] = useState(false);
const [isPopupVisible, setPopupVisible] = useState(false);
const [currentReviews, setCurrentReviews] = useState([]);
const [currentListName, setCurrentListName] = useState("");

const handleShowReviews = (listName, reviews) => {
  console.log(`Clicked on reviews for: ${listName}`, reviews);
  setCurrentListName(listName);
  setCurrentReviews(reviews);
  setPopupVisible(true);
};

const toggleShowLists = () => {
    console.log('Before toggle:', showLists);
    setShowLists((prev) => !prev);
    console.log('After toggle:', !showLists);
  };
  


const handleDestinationSelection = (destination) => {
  // Set the selected destination and make the map visible
  setDestinationById(destination);
  setMapVisible(true);

  if (destination.Latitude && destination.Longitude) {
    const lat = parseFloat(destination.Latitude);
    const lon = parseFloat(destination.Longitude);

    // Update the map with the selected destination's coordinates
    if (map) {
      updateMap(lat, lon, destination["Destination"] || "Destination Location");
    }
  }
};


useEffect(() => {
  const mapContainer = document.getElementById('map');

  if (mapVisible && mapContainer) {
    if (!map) {
      // Initialize the map only if it doesn't already exist
      const mapInstance = L.map(mapContainer).setView([51.505, -0.09], 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstance);
      setMap(mapInstance);
    }
  } else if (!mapVisible && map) {
    // Cleanup the map instance if the container is hidden
    map.remove();
    setMap(null);
    setMarker(null);
  }
}, [mapVisible, map]);

useEffect(() => {
  if (map && destinationById && destinationById.Latitude && destinationById.Longitude) {
    const lat = parseFloat(destinationById.Latitude);
    const lon = parseFloat(destinationById.Longitude);
    updateMap(lat, lon, destinationById["Destination"] || "Destination Location");
  }
}, [map, destinationById]);

useEffect(() => {
  if (map) {
      map.invalidateSize(); // Ensure proper rendering after initialization
  }
}, [map]);

  
useEffect(() => {
  if (map && destinationById) {
      const { Latitude, Longitude } = destinationById;
      if (Latitude && Longitude) {
          const lat = parseFloat(Latitude);
          const lon = parseFloat(Longitude);

          // Center the map on the new location
          map.setView([lat, lon], 13);

          // Update or create the marker
          if (marker) {
              marker.setLatLng([lat, lon])
                  .bindPopup(destinationById["﻿Destination"] || "Destination Location")
                  .openPopup();
          } else {
              const newMarker = L.marker([lat, lon])
                  .addTo(map)
                  .bindPopup(destinationById["﻿Destination"] || "Destination Location")
                  .openPopup();
              setMarker(newMarker);
          }

          // Resize the map to fit properly (if needed)
          map.invalidateSize();
      }
  }
}, [map, destinationById]);



    const indexOfLastResult = currentPage * resultsPerPage;
    const indexOfFirstResult = indexOfLastResult - resultsPerPage;
    const currentResults = searchResults.slice(indexOfFirstResult, indexOfLastResult);

    const handleNextPage = () => {
        if (currentPage * resultsPerPage < searchResults.length) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleResultsPerPageChange = (e) => {
        setResultsPerPage(Number(e.target.value));
        setCurrentPage(1); // Reset to the first page
    };

    const handleToggleCountries = async () => {
        if (!showCountries) {
            try {
                setLoading(true);
                const response = await axios.get('${process.env.REACT_APP_API_URL}/countries');
                setCountries(response.data);
                setError('');
            } catch (err) {
                console.error('Error fetching countries:', err);
                setError('Failed to fetch countries.');
            } finally {
                setLoading(false);
            }
        }
        setShowCountries(!showCountries); 
      }
      const [destinationByIdError, setDestinationByIdError] = useState('');

      const fetchDestinationById = async () => {
        if (!destinationId) {
          setDestinationByIdError('Please enter a valid destination ID.');
          setDestinationById(null);
          setMapVisible(false);
          return;
        }
      
        setLoading(true);
        setDestinationByIdError(''); // Clear previous errors
      
        try {
          const response = await axios.get(`/api/destinations/${destinationId.trim()}`);
          setDestinationById(response.data);
          setMapVisible(true); // Show map for valid destination
        } catch (err) {
          console.error('Error fetching destination by ID:', err);
          if (err.response?.status === 404) {
            setDestinationByIdError('Destination not found. Please enter a valid ID.');
          } else {
            setDestinationByIdError('Failed to fetch destination by ID.');
          }
          setDestinationById(null);
          setMapVisible(false); // Hide map for invalid destination
        } finally {
          setLoading(false);
        }
      }
      return (
        <div className="guest-container">
        {/* Title and About Section */}
        <header className="guest-header">
  <h1 className="guest-title">Destination Europe</h1>

  <p className="guest-about">
  Your ultimate guide to Europe’s top destinations. Search, plan, and customize your journey with ease using our curated platform.
  </p>

  <div className="guest-header-links">
    <p className="features">Want Access to More Features</p>
    <a href="/login">Login</a>
    <a href="/signup">Sign Up</a>
  </div>
</header>

        <div className="guest-page">
            <div className="left-side">
                {/* Search Container */}
                <div className="search-container">
                    <h2>Search Destinations</h2>
                    <div className="search-fields">
                        <input
                            type="text"
                            placeholder="Enter search term"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="dropdown">
                            <button className="dropdown-button">
                                {selectedFields.length > 0 ? selectedFields.join(', ') : 'Select Fields'}
                            </button>
                            <div className="dropdown-content">
                                {fields.map((field) => (
                                    <div className="toggle-field" key={field}>
                                        <span className="field-label">{field}</span>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.includes(field)}
                                                onChange={() => toggleFieldSelection(field)}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <button onClick={handleSearch} disabled={loading}>
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>
    
                {/* Additional Functions */}
                <div className="additional-functions-container">
                    <div className="function-buttons">
                        <button className="toggle-countries-button" onClick={handleToggleCountries}>
                            <span className="button-text">View All Countries</span>
                            <span className={`arrow ${showCountries ? 'arrow-up' : 'arrow-down'}`}></span>
                        </button>
    
                        {showCountries && (
                            <div className="countries-list-container">
                                {countries.length > 0 ? (
                                    <div className="countries-columns">
                                        {countries.map((country, index) => (
                                            <div key={index} className="country-item">
                                                {country}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p>No countries available.</p>
                                )}
                                {error && <p className="error">{error}</p>}
                            </div>
                        )}
    
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Enter Destination ID"
                                value={destinationId}
                                onChange={(e) => setDestinationId(e.target.value)}
                            />
                            <button onClick={fetchDestinationById} disabled={loading}>
                                {loading ? 'Loading...' : 'Get Destination by ID'}
                            </button>
                            {error && <p className="error-message">{destinationByIdError}</p>}
                        </div>
                    </div>
                </div>
                {destinationById && (
    <div className="destination-details-container">
        <h3 className="destination-title">{destinationById["﻿Destination"]}</h3>
        <div className="destination-details-grid">
            {/* Left Column */}
            <div className="details-column">
                <h4>General Information</h4>
                <p><strong>Country:</strong> {destinationById.Country}</p>
                <p><strong>Region:</strong> {destinationById.Region}</p>
                <p><strong>Category:</strong> {destinationById.Category}</p>
                <p><strong>Latitude:</strong> {destinationById.Latitude}</p>
                <p><strong>Longitude:</strong> {destinationById.Longitude}</p>
            </div>
            {/* Right Column */}
            <div className="details-column">
                <h4>Key Highlights</h4>
                <p><strong>Approximate Annual Tourists:</strong> {destinationById["Approximate Annual Tourists"]}</p>
                <p><strong>Cultural Significance:</strong> {destinationById["Cultural Significance"]}</p>
                <p><strong>Famous Foods:</strong> {destinationById["Famous Foods"]}</p>
                <p><strong>Description:</strong> {destinationById.Description}</p>
            </div>
            {/* Bottom Row */}
            <div className="details-row">
                <h4>Practical Information</h4>
                <p><strong>Currency:</strong> {destinationById.Currency}</p>
                <p><strong>Language:</strong> {destinationById.Language}</p>
                <p><strong>Best Time to Visit:</strong> {destinationById["Best Time to Visit"]}</p>
                <p><strong>Cost of Living:</strong> {destinationById["Cost of Living"]}</p>
                <p><strong>Safety:</strong> {destinationById.Safety}</p>
            </div>
        </div>
        <div className="map-container">
            <div className="map-header">
                <h4 className="map-title">Location on Map</h4>
                {destinationById["﻿Destination"] && (
                    <a
                        href={`https://duckduckgo.com/?q=${encodeURIComponent(destinationById["﻿Destination"])}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ddg-search-link"
                    >
                        Search on DuckDuckGo
                    </a>
                )}
            </div>
            <div id="map" style={{ height: '300px', width: '100%', border: '1px solid #ccc' }}></div>
        </div>
    </div>
)}


            </div>
    
            {/* Results and Lists on the Right */}
            <div className="right-side">
                {/* Results Container */}
                <div className="results-container">
                    <h2>Search Results</h2>
                    <div className="pagination-controls">
                        <div>
                            <label htmlFor="results-per-page">
                                Results per page:
                                <select id="results-per-page" value={resultsPerPage} onChange={handleResultsPerPageChange}>
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                </select>
                            </label>
                        </div>
                        <div className="pagination-buttons">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            <button
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        prev * resultsPerPage < searchResults.length ? prev + 1 : prev
                                    )
                                }
                                disabled={currentPage * resultsPerPage >= searchResults.length}
                            >
                                Next
                            </button>
                        </div>
                    </div>
    
                    <ul className="results-list">
                        {currentResults.length > 0 ? (
                            currentResults.map((result, index) => (
                                <li
                                    key={index}
                                    onClick={() => handleDestinationSelection(result)}
                                    className="clickable-result"
                                >
                                    <strong>{result["﻿Destination"]}</strong> - {result.Country}
                                    <p>{result.Description}</p>
                                    <p>
                                        <strong>Region:</strong> {result.Region}
                                    </p>
                                    <p>
                                        <strong>Category:</strong> {result.Category}
                                    </p>
                                </li>
                            ))
                        ) : (
                            !loading && error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
                        )}
                    </ul>
                </div>
    
                {/* Lists Container */}
                <div className="lists-container">
        <button className="toggle-lists-button" onClick={toggleShowLists}>
            <span className="button-text">{showLists ? "Hide Lists" : "View Lists"}</span>
            <span className={`arrow ${showLists ? "arrow-up" : "arrow-down"}`}></span>
        </button>

        {showLists && (
            <ul className="lists-list">
                {lists.map((list, index) => (
                    <li key={list._id} className="list-item">
                        <div className="list-header">
                            <span className="list-number">{index + 1}.</span>
                            <div className="list-title">{list.name}</div>
                            <div className="list-rating">
                                <div className="stars">
                                    {[...Array(5)].map((_, i) => (
                                        <span
                                            key={i}
                                            className={`star ${i < list.averageRating ? "filled" : "empty"}`}
                                            title={list.averageRating > 0 ? `${list.averageRating} stars` : "No ratings yet"}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                                <button
    className="view-reviews-link"
    onClick={(e) => {
        e.stopPropagation();
        console.log('Clicked on reviews!');
        handleShowReviews(list.name, list.reviews);
    }}
>
    View {list.reviews.length} Reviews
</button>
                            </div>
                        </div>
                        <p className="list-description">{list.description}</p>
                        <div className="list-details">
                            <div className="list-info">
                                <p><strong>Last Modified:</strong> {new Date(list.lastModified).toLocaleDateString()}</p>
                                <p><strong>Creator:</strong> {list.user.nickname}</p>
                            </div>
                            <ul className="destination-list">
                                {list.destinations.map((destination) => (
                                    <li
                                        key={destination._id}
                                        className="destination-item"
                                        onClick={() => handleDestinationSelection(destination)}
                                    >
                                        {destination.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </li>
                ))}
            </ul>
        )}
    </div>


            </div>

            {isPopupVisible && (
    <Popup isVisible={isPopupVisible} onClose={() => setPopupVisible(false)}>
        <h2 className="popup-title">Reviews for {currentListName}</h2>
        {currentReviews.length > 0 ? (
            <ul className="reviews-list">
                {currentReviews.map((review, index) => (
                    <li key={index} className="review-item">
                        <strong>Rating:</strong>
                        <div className="stars-container">
                            {[...Array(5)].map((_, i) => (
                                <span
                                    key={i}
                                    className={i < review.rating ? "star filled" : "star"}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                        <p>{review.comment}</p>
                        <div className="review-meta">
                            <span>
                                Reviewer: <strong>{review.nickname || "Anonymous"}</strong>
                            </span>
                            <span className="review-date">
                                Date: {new Date(review.date).toLocaleDateString()}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        ) : (
            <div className="no-reviews">
            <span className="no-reviews-icon">📄</span> {/* Optional Icon */}
            <p>No reviews available for this list.</p>
        </div>
        )}
    </Popup>
)}

        </div>
        </div>
    );
    
}
export default Guest;