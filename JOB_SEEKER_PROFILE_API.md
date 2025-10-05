# Job Seeker Profile API

This document explains how to use the Job Seeker Profile API to manage languages and social networks for job seekers.

## Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [Languages](#languages)
  - [Social Networks](#social-networks)
- [Response Format](#response-format)
- [Frontend Implementation Examples](#frontend-implementation-examples)

## Overview

The Job Seeker Profile API provides endpoints for job seekers to manage their languages and social networks. All endpoints require authentication and are restricted to job seekers only.

## Authentication

All API endpoints require a valid JWT token to be included in the request headers:

```http
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Languages

#### Get Job Seeker Languages
- **Method**: `GET`
- **URL**: `/api/jobseekers/languages`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Description**: Retrieves all languages associated with the authenticated job seeker.
- **Response**:
  ```json
  {
    "languages": [
      {
        "language_id": "uuid",
        "added_at": "2023-01-01T00:00:00Z",
        "language": {
          "name": "English",
          "code": "en",
          "direction": "ltr"
        }
      }
    ]
  }
  ```

#### Add Language to Job Seeker
- **Method**: `POST`
- **URL**: `/api/jobseekers/languages`
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "language_id": "uuid"
  }
  ```
- **Description**: Adds a language to the authenticated job seeker's profile.
- **Response** (201 Created):
  ```json
  {
    "language": {
      "language_id": "uuid",
      "job_seeker_id": "uuid",
      "added_at": "2023-01-01T00:00:00Z"
    }
  }
  ```
- **Errors**:
  - 400: `language_id` is required
  - 404: Language not found
  - 409: Language already added

#### Remove Language from Job Seeker
- **Method**: `DELETE`
- **URL**: `/api/jobseekers/languages/{languageId}`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Description**: Removes a language from the authenticated job seeker's profile.
- **Response**: 200 OK with success message

### Social Networks

#### Get Job Seeker Social Networks
- **Method**: `GET`
- **URL**: `/api/jobseekers/social-networks`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Description**: Retrieves all social networks associated with the authenticated job seeker.
- **Response**:
  ```json
  {
    "social_networks": [
      {
        "social_network_id": "uuid",
        "username": "example_username",
        "profile_url": "https://example.com/profile",
        "added_at": "2023-01-01T00:00:00Z",
        "social_network": {
          "name": "LinkedIn",
          "code": "linkedin",
          "base_url": "https://linkedin.com/in/",
          "icon_url": "/icons/linkedin.png"
        }
      }
    ]
  }
  ```

#### Add Social Network to Job Seeker
- **Method**: `POST`
- **URL**: `/api/jobseekers/social-networks`
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "social_network_id": "uuid",
    "username": "optional_username",
    "profile_url": "optional_profile_url"
  }
  ```
- **Description**: Adds a social network to the authenticated job seeker's profile.
- **Response** (201 Created):
  ```json
  {
    "social_network": {
      "social_network_id": "uuid",
      "job_seeker_id": "uuid",
      "username": "example_username",
      "profile_url": "https://example.com/profile",
      "added_at": "2023-01-01T00:00:00Z"
    }
  }
  ```
- **Errors**:
  - 400: `social_network_id` is required
  - 404: Social network not found
  - 409: Social network already added

#### Update Job Seeker Social Network
- **Method**: `PUT`
- **URL**: `/api/jobseekers/social-networks/{socialNetworkId}`
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body** (at least one field required):
  ```json
  {
    "username": "new_username",
    "profile_url": "https://example.com/new-profile"
  }
  ```
- **Description**: Updates the username or profile URL for a social network in the authenticated job seeker's profile.
- **Response**: 200 OK with updated social network data
- **Errors**:
  - 400: At least one field (username or profile_url) is required
  - 404: Social network not found

#### Remove Social Network from Job Seeker
- **Method**: `DELETE`
- **URL**: `/api/jobseekers/social-networks/{socialNetworkId}`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Description**: Removes a social network from the authenticated job seeker's profile.
- **Response**: 200 OK with success message

## Response Format

All API responses follow a consistent format:

- Successful responses return the requested data or a success message
- Error responses return a JSON object with an `error` field containing an error message
- HTTP status codes follow standard conventions:
  - 200: Success
  - 201: Created
  - 400: Bad request
  - 401: Unauthorized
  - 403: Forbidden
  - 404: Not found
  - 409: Conflict
  - 500: Internal server error

## Frontend Implementation Examples

Here are some examples of how to use these APIs in a frontend application:

### Getting Job Seeker Languages

```javascript
// Using fetch API
const getLanguages = async () => {
  try {
    const response = await fetch('/api/jobseekers/languages', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.languages;
  } catch (error) {
    console.error('Error fetching languages:', error);
    throw error;
  }
};
```

### Adding a Language

```javascript
// Using async/await
const addLanguage = async (languageId) => {
  try {
    const response = await fetch('/api/jobseekers/languages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ language_id: languageId })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.language;
  } catch (error) {
    console.error('Error adding language:', error);
    throw error;
  }
};
```

### Adding a Social Network

```javascript
// Using async/await
const addSocialNetwork = async (socialNetworkId, username, profileUrl) => {
  try {
    const response = await fetch('/api/jobseekers/social-networks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        social_network_id: socialNetworkId,
        username: username,
        profile_url: profileUrl
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.social_network;
  } catch (error) {
    console.error('Error adding social network:', error);
    throw error;
  }
};
```

### Updating a Social Network

```javascript
// Using async/await
const updateSocialNetwork = async (socialNetworkId, updates) => {
  try {
    const response = await fetch(`/api/jobseekers/social-networks/${socialNetworkId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.social_network;
  } catch (error) {
    console.error('Error updating social network:', error);
    throw error;
  }
};
```

### Removing a Language

```javascript
// Using async/await
const removeLanguage = async (languageId) => {
  try {
    const response = await fetch(`/api/jobseekers/languages/${languageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error removing language:', error);
    throw error;
  }
};
```

### React Component Example

```jsx
import React, { useState, useEffect } from 'react';

const LanguageManager = () => {
  const [languages, setLanguages] = useState([]);
  const [availableLanguages, setAvailableLanguages] = useState([]);

  useEffect(() => {
    // Fetch existing languages for the job seeker
    const fetchLanguages = async () => {
      try {
        const data = await getLanguages(); // Using the function defined above
        setLanguages(data);
      } catch (error) {
        console.error('Failed to load languages:', error);
      }
    };

    // Fetch all available languages to choose from
    const fetchAvailableLanguages = async () => {
      // Assuming you have an endpoint to fetch all languages
      try {
        // const data = await getAllLanguages();
        // setAvailableLanguages(data);
      } catch (error) {
        console.error('Failed to load available languages:', error);
      }
    };

    fetchLanguages();
    fetchAvailableLanguages();
  }, []);

  const handleAddLanguage = async (languageId) => {
    try {
      const newLanguage = await addLanguage(languageId);
      setLanguages([...languages, newLanguage]);
    } catch (error) {
      console.error('Failed to add language:', error);
    }
  };

  const handleRemoveLanguage = async (languageId) => {
    try {
      await removeLanguage(languageId);
      setLanguages(languages.filter(lang => lang.language_id !== languageId));
    } catch (error) {
      console.error('Failed to remove language:', error);
    }
  };

  return (
    <div>
      <h2>My Languages</h2>
      <div>
        {languages.map(lang => (
          <div key={lang.language_id}>
            <span>{lang.language.name}</span>
            <button onClick={() => handleRemoveLanguage(lang.language_id)}>
              Remove
            </button>
          </div>
        ))}
      </div>
      <div>
        {/* Dropdown or list to select from available languages */}
      </div>
    </div>
  );
};

export default LanguageManager;
```

This API allows job seekers to fully manage their languages and social networks on their profiles, providing flexibility for showcasing their multilingual abilities and professional social presence.