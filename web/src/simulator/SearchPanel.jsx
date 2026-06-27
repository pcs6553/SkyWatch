import React, { useState, useEffect } from 'react';
import { Search, History, Plane, Shield, User, Landmark, Building, MapPin, X, ArrowRight, Sliders, ChevronDown, Check } from 'lucide-react';
import { AIRPORTS } from '../mock/flightData';

export default function SearchPanel({ flights, onSelectFlight, onSelectAirport, recentSearches, setRecentSearches, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // all, flights, airports, airlines
  
  // Advanced filters
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(['Commercial', 'Cargo', 'Private', 'Military', 'Helicopter']);
  const [minAlt, setMinAlt] = useState(0);
  const [maxAlt, setMaxAlt] = useState(45000);
  const [minSpeed, setMinSpeed] = useState(0);
  const [maxSpeed, setMaxSpeed] = useState(600);
  
  // Route search state
  const [showRouteSearch, setShowRouteSearch] = useState(false);
  const [selectedOrigin, setSelectedOrigin] = useState('');
  const [selectedDest, setSelectedDest] = useState('');
  const [routeResults, setRouteResults] = useState([]);
  
  // Search Execution
  useEffect(() => {
    if (!query.trim() && !showFilters) {
      setResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase().trim();
    
    // Filter flights
    const filteredFlights = flights.filter(f => {
      // 1. Text Query match
      let matchesText = true;
      if (lowerQuery) {
        matchesText = 
          f.callsign.toLowerCase().includes(lowerQuery) ||
          f.airline.toLowerCase().includes(lowerQuery) ||
          f.registration.toLowerCase().includes(lowerQuery) ||
          f.type.toLowerCase().includes(lowerQuery) ||
          f.origin.toLowerCase().includes(lowerQuery) ||
          f.dest.toLowerCase().includes(lowerQuery) ||
          `${f.origin} to ${f.dest}`.toLowerCase().includes(lowerQuery) ||
          `${f.origin}->${f.dest}`.toLowerCase().includes(lowerQuery) ||
          `${f.origin} ${f.dest}`.toLowerCase().includes(lowerQuery);
      }

      // 2. Category match
      const matchesCategory = selectedCategories.includes(f.category);

      // 3. Altitude match
      const matchesAlt = f.altitude >= minAlt && f.altitude <= maxAlt;

      // 4. Speed match
      const matchesSpeed = f.speed >= minSpeed && f.speed <= maxSpeed;

      return matchesText && matchesCategory && matchesAlt && matchesSpeed;
    });

    // Filter airports (only if tabs align)
    let filteredAirports = [];
    if (activeTab === 'all' || activeTab === 'airports') {
      filteredAirports = Object.values(AIRPORTS).filter(a => {
        if (!lowerQuery) return false;
        return (
          a.iata.toLowerCase().includes(lowerQuery) ||
          a.icao.toLowerCase().includes(lowerQuery) ||
          a.name.toLowerCase().includes(lowerQuery) ||
          a.city.toLowerCase().includes(lowerQuery) ||
          a.country.toLowerCase().includes(lowerQuery)
        );
      });
    }

    // Combine results
    const combined = [
      ...filteredAirports.map(a => ({ type: 'airport', data: a })),
      ...filteredFlights.map(f => ({ type: 'flight', data: f }))
    ];

    setResults(combined);
  }, [query, flights, selectedCategories, minAlt, maxAlt, minSpeed, maxSpeed, activeTab, showFilters]);

  // Route search handler
  const handleRouteSearch = () => {
    if (!selectedOrigin && !selectedDest) return;
    
    const routeFlights = flights.filter(f => {
      const matchOrigin = selectedOrigin ? f.origin === selectedOrigin : true;
      const matchDest = selectedDest ? f.dest === selectedDest : true;
      return matchOrigin && matchDest;
    });
    
    setRouteResults(routeFlights);
  };

  // Get sorted airports list for dropdowns
  const sortedAirports = Object.values(AIRPORTS).sort((a, b) => 
    a.iata.localeCompare(b.iata)
  );

  // Handle clicking a search result
  const handleSelectResult = (result) => {
    // Add to history
    let itemLabel = '';
    if (result.type === 'flight') {
      itemLabel = result.data.callsign;
      onSelectFlight(result.data);
    } else {
      itemLabel = result.data.iata;
      onSelectAirport(result.data);
    }

    // Keep unique search history of 10 items
    const updatedHistory = [itemLabel, ...recentSearches.filter(s => s !== itemLabel)].slice(0, 10);
    setRecentSearches(updatedHistory);
    onClose();
  };

  const toggleCategory = (cat) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter(c => c !== cat));
      }
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  // Get icon for categories
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Military': return <Shield size={14} style={{ color: 'var(--red)' }} />;
      case 'Private': return <User size={14} style={{ color: 'var(--green)' }} />;
      case 'Cargo': return <Landmark size={14} style={{ color: 'var(--amber)' }} />;
      default: return <Plane size={14} style={{ color: 'var(--blue)' }} />;
    }
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'var(--bg-dark)', zIndex: 1900, display: 'flex', flexDirection: 'column' }}>
      
      {/* Search Input bar */}
      <div style={{ padding: '16px', display: 'flex', gap: '10px', alignItems: 'center', borderBottom: '1px solid var(--border-cyan)', background: 'var(--panel-bg)' }}>
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            placeholder="Search flights, routes, airports..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(8, 14, 28, 0.6)',
              border: '1px solid var(--border-cyan)',
              borderRadius: '8px',
              padding: '10px 12px 10px 38px',
              color: '#fff',
              fontSize: '14px',
              outline: 'none',
              fontFamily: 'var(--font-sans)'
            }}
            autoFocus
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        {/* Toggle Filters Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            background: showFilters ? 'rgba(0, 212, 255, 0.15)' : 'rgba(8, 14, 28, 0.6)',
            border: `1px solid ${showFilters ? 'var(--cyan)' : 'var(--border-cyan)'}`,
            color: showFilters ? 'var(--cyan)' : 'var(--text-primary)',
            padding: '10px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Sliders size={18} />
        </button>

        <button 
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '14px', padding: '4px' }}
        >
          Cancel
        </button>
      </div>

      {/* Advanced Filter drawer */}
      {showFilters && (
        <div style={{ background: 'rgba(8, 14, 28, 0.95)', borderBottom: '1px solid var(--border-cyan)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '350px', overflowY: 'auto' }}>
          
          {/* Categories */}
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Category Filter</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['Commercial', 'Cargo', 'Private', 'Military', 'Helicopter'].map(cat => {
                const selected = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    style={{
                      background: selected ? 'rgba(0, 212, 255, 0.15)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${selected ? 'var(--cyan)' : 'rgba(255,255,255,0.08)'}`,
                      color: selected ? 'var(--cyan)' : 'var(--text-primary)',
                      fontSize: '11px',
                      padding: '5px 10px',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {selected && <Check size={10} />}
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Altitude Slider */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
              <span>ALTITUDE RANGE</span>
              <span className="data-font" style={{ color: 'var(--cyan)' }}>{minAlt.toLocaleString()} - {maxAlt.toLocaleString()} FT</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="45000" 
              step="1000"
              value={maxAlt}
              onChange={(e) => setMaxAlt(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--cyan)' }}
            />
          </div>

          {/* Speed Slider */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
              <span>SPEED RANGE</span>
              <span className="data-font" style={{ color: 'var(--cyan)' }}>{minSpeed} - {maxSpeed} KTS</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="600" 
              step="20"
              value={maxSpeed}
              onChange={(e) => setMaxSpeed(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--cyan)' }}
            />
          </div>
        </div>
      )}

      {/* Route Search Section */}
      <div style={{ background: 'rgba(8, 14, 28, 0.95)', borderBottom: '1px solid var(--border-cyan)', padding: '16px' }}>
        <button
          onClick={() => setShowRouteSearch(!showRouteSearch)}
          style={{
            width: '100%',
            background: 'rgba(0, 212, 255, 0.08)',
            border: '1px solid var(--border-cyan)',
            color: 'var(--cyan)',
            padding: '12px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
            fontWeight: 600
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={16} />
            <span>Search Flights by Route</span>
          </div>
          <ChevronDown size={16} style={{ transform: showRouteSearch ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        {showRouteSearch && (
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Origin Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Origin Airport
              </label>
              <select
                value={selectedOrigin}
                onChange={(e) => setSelectedOrigin(e.target.value)}
                style={{
                  background: 'rgba(8, 14, 28, 0.6)',
                  border: '1px solid var(--border-cyan)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)'
                }}
              >
                <option value="">Any Airport</option>
                {sortedAirports.map(airport => (
                  <option key={airport.iata} value={airport.iata} style={{ background: 'rgba(8, 14, 28, 0.95)' }}>
                    {airport.iata} - {airport.city}, {airport.country}
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Destination Airport
              </label>
              <select
                value={selectedDest}
                onChange={(e) => setSelectedDest(e.target.value)}
                style={{
                  background: 'rgba(8, 14, 28, 0.6)',
                  border: '1px solid var(--border-cyan)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)'
                }}
              >
                <option value="">Any Airport</option>
                {sortedAirports.map(airport => (
                  <option key={airport.iata} value={airport.iata} style={{ background: 'rgba(8, 14, 28, 0.95)' }}>
                    {airport.iata} - {airport.city}, {airport.country}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Routes Button */}
            <button
              onClick={handleRouteSearch}
              disabled={!selectedOrigin && !selectedDest}
              style={{
                background: (!selectedOrigin && !selectedDest) ? 'rgba(255,255,255,0.04)' : 'var(--cyan)',
                border: 'none',
                color: (!selectedOrigin && !selectedDest) ? 'var(--text-muted)' : '#000',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: (!selectedOrigin && !selectedDest) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <ArrowRight size={16} />
              Show Routes
            </button>

            {/* Route Results */}
            {routeResults.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                  Found {routeResults.length} Flight{routeResults.length !== 1 ? 's' : ''}
                  {selectedOrigin && selectedDest && (
                    <span> on route <span className="data-font" style={{ color: 'var(--cyan)' }}>{selectedOrigin}</span> → <span className="data-font" style={{ color: 'var(--cyan)' }}>{selectedDest}</span></span>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                  {routeResults.map((flight, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        onSelectFlight(flight);
                        onClose();
                      }}
                      className="glass-card"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '10px' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {getCategoryIcon(flight.category)}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="data-font" style={{ color: 'var(--amber)' }}>{flight.callsign}</span>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {flight.airline} • {flight.type}
                          </div>
                        </div>
                      </div>
                      <div className="data-font" style={{ fontSize: '10px', textAlign: 'right', color: 'var(--text-muted)' }}>
                        <div>{flight.altitude.toLocaleString()} FT</div>
                        <div>{flight.speed} KTS</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {routeResults.length === 0 && (selectedOrigin || selectedDest) && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>
                No flights found on this route
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(0, 212, 255, 0.08)', background: 'var(--bg-dark)' }}>
        {['all', 'flights', 'airports'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '12px 0',
              background: 'none',
              border: 'none',
              color: activeTab === tab ? 'var(--cyan)' : 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              borderBottom: activeTab === tab ? '2px solid var(--cyan)' : 'none',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Results */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        
        {/* Recent Searches */}
        {!query && results.length === 0 && (
          <div>
            {recentSearches.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                  <History size={12} />
                  <span>Recent Searches</span>
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {recentSearches.map((term, idx) => (
                    <button
                      key={`${term}-${idx}`}
                      onClick={() => setQuery(term)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: 'var(--text-primary)',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick shortcuts info card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Search shortcuts</div>
              <div className="glass-card" style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-muted)' }}>
                <div>• Type an airport code (e.g. <b style={{ color: 'var(--cyan)' }}>LHR</b> or <b style={{ color: 'var(--cyan)' }}>JFK</b>)</div>
                <div>• Type a flight callsign (e.g. <b style={{ color: 'var(--cyan)' }}>BAW173</b> or <b style={{ color: 'var(--cyan)' }}>UAE201</b>)</div>
                <div>• Type route endpoints (e.g. <b style={{ color: 'var(--cyan)' }}>JFK LHR</b>)</div>
                <div>• Filter by aircraft model (e.g. <b style={{ color: 'var(--cyan)' }}>A380</b> or <b style={{ color: 'var(--cyan)' }}>Dreamliner</b>)</div>
              </div>
            </div>
          </div>
        )}

        {/* Results List */}
        {results.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {results.map((r, idx) => (
              <div 
                key={idx}
                onClick={() => handleSelectResult(r)}
                className="glass-card"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Left Icon */}
                  <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: r.type === 'airport' ? 'rgba(0, 212, 255, 0.1)' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyOrigin: 'center', justifyContent: 'center' }}>
                    {r.type === 'airport' ? <Building size={16} style={{ color: 'var(--cyan)' }} /> : getCategoryIcon(r.data.category)}
                  </div>
                  
                  {/* Text details */}
                  <div>
                    {r.type === 'airport' ? (
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                          <span className="data-font" style={{ color: 'var(--cyan)' }}>{r.data.iata}</span> - {r.data.city}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {r.data.name}, {r.data.country}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="data-font" style={{ color: 'var(--amber)' }}>{r.data.callsign}</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'normal' }}>({r.data.type})</span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className="data-font" style={{ fontWeight: 'bold', color: 'var(--cyan)' }}>{r.data.origin}</span>
                          <ArrowRight size={10} style={{ color: 'var(--text-muted)' }} />
                          <span className="data-font" style={{ fontWeight: 'bold', color: 'var(--cyan)' }}>{r.data.dest}</span>
                          <span style={{ color: 'var(--text-muted)' }}>• {r.data.airline}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right specs */}
                {r.type === 'flight' && (
                  <div className="data-font" style={{ fontSize: '10px', textAlign: 'right', color: 'var(--text-muted)' }}>
                    <div>{r.data.altitude.toLocaleString()} FT</div>
                    <div>{r.data.speed} KTS</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          query && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px', fontSize: '13px' }}>
              No flights or airports match your criteria.
            </div>
          )
        )}
      </div>
    </div>
  );
}
