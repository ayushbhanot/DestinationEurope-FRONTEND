import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HomePage.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css';
import 'leaflet-defaulticon-compatibility';
import L from 'leaflet';
import Popup from '../Popup/Popup';

const Home = () => {
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
    const [newDestination, setNewDestination] = useState('');
const [destinationSuggestions, setDestinationSuggestions] = useState([]); // Initialize as empty array
const [userSpecificLists, setUserSpecificLists] = useState([]); // Initialize as empty array
const [isManageListsPopupVisible, setManageListsPopupVisible] = useState(false);
const [showSuggestions, setShowSuggestions] = useState(false);
const [newDestinations, setNewDestinations] = useState([]); // Selected destinations
 
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

console.log("newDestinations:", newDestinations);
console.log("destinationById:", destinationById);
console.log("selectedFields:", selectedFields);

const validDestinations = newDestinations.filter(
    (dest) => dest && dest.ID && dest.Destination
);

/*
useEffect(() => {
    setNewDestinations(validDestinations); // Reset `newDestinations` without invalid entries
}, []);*/


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

/* This limits the amount of lists to 10 for Guest Page
const fetchLists = async () => {
  setListsLoading(true);
  setListsError('');
  try {
      const response = await axios.get('${process.env.REACT_APP_API_URL}/lists');
      console.log("Fetched lists:", response.data);
      setLists(response.data.lists || []);
  } catch (err) {
      console.error('Error fetching lists:', err);
      setListsError('Failed to fetch lists. Please try again.');
  } finally {
      setListsLoading(false);
  }
}; */

const handleOpenManageListsPopup = async () => {
    if (userSpecificLists.length === 0) {
        console.log("Fetching user-specific lists...");
        await fetchUserSpecificLists(); // Fetch lists if they're not already loaded
      }
      console.log("Opening popup with user-specific lists:", userSpecificLists);
    setManageListsPopupVisible(true);
    
};

const handleCloseManageListsPopup = () => {
    setManageListsPopupVisible(false);
};



const [publicLists, setPublicLists] = useState([]);
const [userListsLoading, setUserListsLoading] = useState(false);
const [userListsError, setUserListsError] = useState('');
    const [newListName, setNewListName] = useState("");
    const [userLists, setUserLists] = useState([]);

const [totalPages, setTotalPages] = useState(1);
const [listsPerPage] = useState(10); // Default number of lists per page

const combinedLists = [
    ...userLists.map((list) => ({ ...list, type: 'user' })),
    ...publicLists.map((list) => ({ ...list, type: 'public' })),

  ];
  

  const sanitizeLists = (lists) =>
    lists.map((list) => ({
      ...list,
      destinations: list.destinations.filter(
        (destination) => destination && destination.name
      ),
    }));
  
    const fetchUserSpecificLists = async () => {
        setUserListsLoading(true);
        setUserListsError('');
        try {
          const token = localStorage.getItem('token');
          console.log("Fetching user-specific lists with token:", token);
      
          const response = await axios.get('${process.env.REACT_APP_API_URL}/lists/mine', {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("Fetched user-specific lists response:", response.data);
      
          const sanitizedLists = sanitizeLists(response.data);
          console.log("Sanitized user-specific lists:", sanitizedLists);
      
          setUserSpecificLists(sanitizedLists);
        } catch (err) {
          console.error('Error fetching user-specific lists:', err);
          setUserListsError('Failed to fetch your lists. Please try again.');
          setUserSpecificLists([]);
        } finally {
          setUserListsLoading(false);
        }
      };
      
      useEffect(() => {
        const token = localStorage.getItem('token');
        console.log("Token in localStorage:", token);
      }, []);
      


const fetchUserLists = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
        const response = await axios.get(`/api/lists/home`, {
            params: { page, limit: listsPerPage },
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const { publicLists, userLists } = response.data;
        setPublicLists(publicLists);
        setUserLists(userLists);

        const totalItems = publicLists.length + userLists.length;
        setListTotalPages(Math.ceil(totalItems / listsPerPage));
    } catch (err) {
        console.error('Error fetching lists:', err);
        setError('Failed to fetch lists. Please try again.');
    } finally {
        setLoading(false);
    }
};  

useEffect(() => {
  fetchUserLists();

}, []);

const [showLists, setShowLists] = useState(false);
const [isPopupVisible, setPopupVisible] = useState(false);
const [currentReviews, setCurrentReviews] = useState([]);
const [currentListName, setCurrentListName] = useState("");

const handleShowReviews = (listName, reviews, listId) => {
  console.log(`Clicked on reviews for: ${listName}`, reviews);
  setCurrentListName(listName);
  setCurrentReviews(reviews);
  setCurrentListId(listId);
  setPopupVisible(true);
};


const toggleShowLists = () => setShowLists((prev) => !prev);


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

      

      const [currentListPage, setCurrentListPage] = useState(1);
      const [listPage, setListPage] = useState(1); // For lists pagination
const [listTotalPages, setListTotalPages] = useState(1); // Total pages for lists
const indexOfLastList = listPage * listsPerPage;
const indexOfFirstList = indexOfLastList - listsPerPage;
const currentLists = combinedLists.slice(indexOfFirstList, indexOfLastList);


      useEffect(() => {
        const totalItems = userLists.length + publicLists.length;
        setListTotalPages(Math.ceil(totalItems / listsPerPage));
    }, [userLists, publicLists, listsPerPage]);
    
    const handleNextListPage = () => {
        if (listPage < listTotalPages) {
            setListPage((prevPage) => prevPage + 1);
        }
    };
    
    const handlePreviousListPage = () => {
        if (listPage > 1) {
            setListPage((prevPage) => prevPage - 1);
        }
    };

    const handleDeleteList = async (listId, listName) => {
        if (!window.confirm(`Are you sure you want to delete the list "${listName}"?`)) return;
    
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/lists/${listId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUserSpecificLists((prevLists) =>
                prevLists.filter((list) => list._id !== listId)
            );
        } catch (err) {
            console.error('Error deleting list:', err);
            alert('Failed to delete list. Please try again.');
        }
    };
    

    const [newListDescription, setNewListDescription] = useState('');
const [listBeingEdited, setListBeingEdited] = useState(null); // Stores the list currently being edited
const [privacy, setPrivacy] = useState('private'); // Default to private



const handleAddDestination = async () => {
    if (!newDestination.trim()) {
        alert("Destination ID cannot be empty.");
        return;
    }

    try {
        const response = await axios.get(`/api/destinations/${newDestination}`);
        if (response.status === 200) {
            setNewDestinations([...newDestinations, newDestination.trim()]);
            setNewDestination(""); // Clear input
        }
    } catch (error) {
        console.error("Invalid Destination ID:", error);
        alert("Failed to fetch destination. Please enter a valid ID.");
    }
};


const handleRemoveDestination = (index) => {
    const updatedDestinations = newDestinations.filter((_, i) => i !== index);
    setNewDestinations(updatedDestinations);
};

const handleEditList = (list) => {
    setListBeingEdited(list); 
    setNewListName(list.name); 
    setNewListDescription(list.description); 
    setNewDestinations(list.destinations || []);
    setManageListsPopupVisible(true);
};

const handleSaveEditedList = async () => {
    if (!listBeingEdited) return;

    const updatedList = {
        name: newListName.trim(),
        description: newListDescription.trim(),
        destinations: newDestinations, // Include the updated destinations
    };

    try {
        const token = localStorage.getItem("token");
        const response = await axios.put(`/api/lists/${listBeingEdited._id}`, updatedList, {
            headers: { Authorization: `Bearer ${token}` },
        });

        // Update the UI with the edited list
        setUserSpecificLists((prevLists) =>
            prevLists.map((list) =>
                list._id === listBeingEdited._id ? response.data : list
            )
        );

        alert("List updated successfully!");
        setManageListsPopupVisible(false); // Close the popup
        setListBeingEdited(null); // Clear edit state
    } catch (error) {
        console.error("Error saving list:", error);
        alert("Failed to save changes. Please try again.");
    }
};

  
const searchDestinations = async (query) => {
    if (!query) {
        setDestinationSuggestions([]);
        return;
    }

    try {
        const response = await axios.get('${process.env.REACT_APP_API_URL}/destinations', {
            params: { name: query }, // Replace 'name' with the query parameter key used in the backend
        });
        setDestinationSuggestions(response.data); // Update suggestions
    } catch (error) {
        console.error('Error fetching destinations:', error);
    }
};

// Function to search for destinations via API
const handleSearchDestination = async (e) => {
    const query = e.target.value.trim();
    setNewDestination(query);

    if (!query) {
        setShowSuggestions(false);
        setDestinationSuggestions([]);
        return;
    }

    try {
        const response = await axios.get('${process.env.REACT_APP_API_URL}/destinations', { params: { name: query } });
        const suggestions = response.data.filter((dest) => dest && dest.ID && dest.Destination); // Ensure valid suggestions

        setDestinationSuggestions(suggestions);
        setShowSuggestions(true);
    } catch (error) {
        console.error("Error fetching destinations:", error);
        setDestinationSuggestions([]);
        setShowSuggestions(false);
    }
};

const handleSelectDestination = (destination) => {
    setNewDestination(destination.Destination); // Set the selected destination in the input
    setDestinationSuggestions([]); // Clear suggestions
    setShowSuggestions(false); // Hide suggestion box
};

const handlePrivacyChange = () => {
    setPrivacy((prev) => (prev === 'private' ? 'public' : 'private'));
};


const handleCreateNewList = async () => {
    if (!newListName || !newListDescription) {
        alert("Please provide a list name and description.");
        return;
    }

    const payload = {
        name: newListName,
        description: newListDescription,
        destinations: newDestinations, // Already structured with name and details
        visibility: privacy, // 'public' or 'private'
    };

    console.log("Payload to be sent:", payload);

    try {
        const response = await axios.post('${process.env.REACT_APP_API_URL}/lists', payload, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        alert("List created successfully!");
        setUserSpecificLists((prev) => [...prev, response.data]);
        setNewListName('');
        setNewListDescription('');
        setNewDestinations([]);
    } catch (error) {
        console.error("Error creating list:", error);
        alert("Failed to create list.");
    }
};

  
  


const normalizeDestinationKeys = (destination) => {
    const normalized = {};
    Object.keys(destination).forEach((key) => {
        const cleanKey = key.trim().replace(/^\ufeff/, ""); // Remove invisible characters
        normalized[cleanKey] = destination[key];
    });
    return normalized;
};
const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
const [currentListId, setCurrentListId] = useState(null);


const handleSubmitReview = async () => {
    if (newReview.rating === 0 || !newReview.comment.trim()) {
        alert('Please provide a rating and a comment.');
        return;
    }

    try {
        const response = await axios.post(`/api/lists/${currentListId}/reviews`, {
            rating: newReview.rating,
            comment: newReview.comment.trim(),
        }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        // Update the reviews in the frontend
        setCurrentReviews(response.data.reviews);
        setNewReview({ rating: 0, comment: '' }); // Reset the form
        alert('Review added successfully!');
    } catch (err) {
        console.error('Error adding review:', err);
        alert('Failed to add review. Please try again.');
    }
};


// Apply normalization when fetching a destination by ID
const handleAddDestinationById = async () => {
    if (!newDestination.trim()) {
        alert("Please enter a destination ID.");
        return;
    }

    try {
        const response = await axios.get(`/api/destinations/${newDestination.trim()}`);
        const destination = normalizeDestinationKeys(response.data);

        if (!destination || !destination.Destination || !destination.ID) {
            throw new Error("Invalid destination structure.");
        }

        if (newDestinations.some((dest) => dest.ID === destination.ID)) {
            alert("This destination is already in the list.");
            return;
        }

        setNewDestinations((prev) => [
            ...prev,
            {
                name: destination.Destination, // Use the fetched name
                details: destination.ID,       // Use the ID as the details
            },
        ]);

        setNewDestination(""); // Clear the input field
    } catch (error) {
        console.error("Error adding destination by ID:", error);
        alert("Invalid Destination ID. Please try again.");
    }
};


const [destinationDetails, setDestinationDetails] = useState({}); // Store details by destination ID

const fetchDestinationDetails = async (id) => {
    try {
        // Check if the ID is valid and has not already been fetched
        if (!destinationDetails[id]) {
            const response = await axios.get(`/api/destinations/${id}`);
            const destination = response.data;

            // Update state with fetched details
            setDestinationDetails((prevDetails) => ({
                ...prevDetails,
                [id]: destination,
            }));
        }
    } catch (error) {
        console.error(`Error fetching destination details for ID: ${id}`, error);
    }
};

// Ensure details are fetched whenever `newDestinations` changes
useEffect(() => {
    newDestinations.forEach((destinationId) => {
        fetchDestinationDetails(destinationId);
    });
}, [newDestinations]);



      return (
        <div className="Home-container">
        {/* Title and About Section */}
        <header className="Home-header">
  <h1 className="Home-title">Destination Europe</h1>

  <p className="Home-about">
  Your ultimate guide to Europe’s top destinations. Search, plan, and customize your journey with ease using our curated platform.
  </p>

  <div className="Home-header-links">
    <a href="/login">Log Out</a>
  </div>
</header>

        <div className="Home-page">
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
            <>
            <ul className="lists-list">
                {currentLists.map((list, index) => (
                    <li key={`${list._id}-${list.type || 'generic'}`} className="list-item">
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
        handleShowReviews(list.name, list.reviews, list._id);
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
                            {list.destinations.map((destination, index) => {
    if (!destination || !destination.name) {
        console.error(`Invalid destination at index ${index}`, destination);
        return null; // Skip this item
    }

    
    return (
        <li
          key={destination._id || index}
          className="destination-item"
          onClick={() => handleDestinationSelection(destination)}
        >
            {destination.name}
        </li>
    );
})}

            </ul>
          </div>
        </li>
      ))}
    </ul>
             {/* Pagination Controls */}
             {listTotalPages >= 1 && (
                <div className="lists-pagination-controls">
<button 
    className="manage-lists-button" 
    onClick={handleOpenManageListsPopup}
>
    Manage My Lists
</button>


          <div className="lists-pagination-controls">
            <button
              className="lists-pagination-button"
              onClick={handlePreviousListPage}
              disabled={listPage === 1}
            >
              Previous
            </button>
            <button
              className="lists-pagination-button"
              onClick={handleNextListPage}
              disabled={listPage === listTotalPages}
            >
              Next
            </button>
          </div>
</div>

             )}
            </>
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
                {/* Add Review Section */}
                <div className="add-review-section">
    <h3 className="review-title">Add Your Review</h3>
    <div className="rating-container">
        {[...Array(5)].map((_, i) => (
            <span
                key={i}
                className={`star ${i < newReview.rating ? "filled" : ""}`}
                onClick={() => setNewReview({ ...newReview, rating: i + 1 })}
            >
                ★
            </span>
        ))}
    </div>
    <textarea
        className="review-comment"
        value={newReview.comment}
        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
    />
    <button className="submit-review-button" onClick={handleSubmitReview}>
        Submit Review
    </button>
</div>

    </Popup>
)}
{isManageListsPopupVisible && (
    <Popup
        isVisible={isManageListsPopupVisible}
        onClose={handleCloseManageListsPopup}
    >
        <h2 className="popup-title">Manage Your Lists</h2>

        {/* Existing Lists */}
        <div className="manage-lists-container">
            <h3 className="section-title">Your Existing Lists</h3>
            {userSpecificLists && userSpecificLists.length > 0 ? (
  <ul className="lists-list">
    {userSpecificLists.map((list) => (
      <li key={list._id} className="list-item">
        <div className="list-header">
          <span className="list-title">{list.name}</span>
          <div className="list-actions">
    <button className="edit-list-button custom-blue-button"
    onClick={() => handleEditList(list)}>Edit
    </button>
    <button className="save-button custom-blue-button"
     onClick={handleSaveEditedList}>Save</button>
    <button className="delete-list-button"
     onClick={() => handleDeleteList(list._id, list.name)}>Delete</button>
          </div>
        </div>
        <p className="list-description">{list.description || "No description provided"}</p>
        <ul className="destination-list">
          {list.destinations && list.destinations.length > 0 ? (
            list.destinations.map((destination) => (
              <li key={destination._id || destination.name} className="destination-item">
                {destination.name || "Unnamed Destination"}
              </li>
            ))
          ) : (
            <li className="destination-item">No destinations added</li>
          )}
        </ul>
      </li>
    ))}
  </ul>
) : (
  <p>No lists to display. Create one below!</p>
)}

        </div>

        {/* Create New List */}
        <div className="create-new-list-section">
    <div className="create-new-list-header">
        <h3 className="section-title">Create New List</h3>
        <div className="privacy-toggle">
            <span className="privacy-text">Public?</span>
            <input
                type="checkbox"
                checked={privacy === 'public'}
                onChange={handlePrivacyChange}
                className="checkbox"
            /> 
        </div>
    </div>
    

            <input
                type="text"
                placeholder="List Name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                className="input-field"
            />
            <textarea
                placeholder="List Description"
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
                className="textarea-field"
            />
                <div className="add-destination-section">
    <h4 className="section-title">Add Destinations</h4>
    <input
        type="text"
        placeholder="Enter Destination ID"
        value={newDestination}
        onChange={(e) => setNewDestination(e.target.value)}
        className="input-field"
    />
    {/* Add Destination Button */}
    <button
        onClick={handleAddDestinationById}
        className="add-destination-button"
    >
        Add Destination
    </button>
    <ul className="destination-list">
    {newDestinations.map((destination, index) => {
        console.log({
            name: newListName,
            description: newListDescription,
            destinations: newDestinations,
        });
        
        if (!destination || !destination.name) {
            console.error("Invalid destination:", destination);
            return (
                <li key={index} className="destination-item">
                    <span className="destination-name">Unknown Destination</span>
                </li>
            );
        }

        return (
            <li
                key={destination.details || index} // Use `destination.details` (ID) if available, fallback to `index`
                className="destination-item"
                onClick={() => handleDestinationSelection(destination)}
            >
                <span className="destination-name">
                    {destination.name} (ID: {destination.details})
                </span>
                <button
                    onClick={() => handleRemoveDestination(index)}
                    className="remove-destination-button"
                    title="Remove"
                >
                    ✖
                </button>
            </li>
        );
    })}
</ul>



                
            </div>
            <button onClick={handleCreateNewList} className="create-list-button">
                Create List
            </button>
        </div>
    </Popup>
)}



        </div>
        </div>
    );
    
}
export default Home;