import React from 'react';

const distanceOptions = [
  { value: 'all', label: 'Any distance' },
  { value: '1', label: 'Within 1 mile' },
  { value: '3', label: 'Within 3 miles' },
  { value: '5', label: 'Within 5 miles' },
  { value: '10', label: 'Within 10 miles' },
  { value: '25', label: 'Within 25 miles' },
  { value: '50', label: 'Within 50 miles' }
];

const DistanceFilter = ({ selectedDistance, onDistanceChange, locationStatus }) => {
  const isLocationReady = locationStatus === 'ready';
  // Convert geolocation state into concise helper text for the dropdown.
  const statusText = {
    checking: 'Checking your location...',
    ready: 'Using your current location.',
    unavailable: 'Location unavailable. Distance filtering is paused.',
    unsupported: 'Your browser does not support location filtering.'
  }[locationStatus];

  return (
    <section className="sidebar-section distance-filter-section">
      <h4 className="filter-title">Distance Filter</h4>
      <label className="distance-select-label" htmlFor="distance-filter">
        Show locations near me
      </label>
      <select
        id="distance-filter"
        className="distance-select"
        value={selectedDistance}
        onChange={(event) => onDistanceChange(event.target.value)}
        disabled={!isLocationReady}
      >
        {distanceOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <p className={`distance-status ${isLocationReady ? 'ready' : ''}`}>
        {statusText}
      </p>
      {selectedDistance !== 'all' && (
        <button className="clear-btn" onClick={() => onDistanceChange('all')}>
          Clear distance filter
        </button>
      )}
    </section>
  );
};

export default DistanceFilter;
