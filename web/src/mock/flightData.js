// SkyWatch Mock Data & Simulation Engine

export const AIRPORTS = {
  LHR: { iata: 'LHR', icao: 'EGLL', name: 'London Heathrow Airport', city: 'London', country: 'United Kingdom', lat: 51.4700, lng: -0.4543, elevation: 83, onTime: 84, flightsToday: 1250, delayCount: 14, avgDelay: 12 },
  JFK: { iata: 'JFK', icao: 'KJFK', name: 'John F. Kennedy Intl Airport', city: 'New York', country: 'United States', lat: 40.6413, lng: -73.7781, elevation: 13, onTime: 79, flightsToday: 980, delayCount: 42, avgDelay: 28 },
  DXB: { iata: 'DXB', icao: 'OMDB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', lat: 25.2532, lng: 55.3657, elevation: 62, onTime: 91, flightsToday: 1120, delayCount: 8, avgDelay: 8 },
  SIN: { iata: 'SIN', icao: 'WSSS', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', lat: 1.3644, lng: 103.9915, elevation: 22, onTime: 93, flightsToday: 890, delayCount: 5, avgDelay: 6 },
  HND: { iata: 'HND', icao: 'RJTT', name: 'Tokyo Haneda Airport', city: 'Tokyo', country: 'Japan', lat: 35.5494, lng: 139.7798, elevation: 21, onTime: 95, flightsToday: 1310, delayCount: 3, avgDelay: 4 },
  SYD: { iata: 'SYD', icao: 'YSSY', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia', lat: -33.9461, lng: 151.1772, elevation: 20, onTime: 82, flightsToday: 540, delayCount: 15, avgDelay: 19 },
  CDG: { iata: 'CDG', icao: 'LFPG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', lat: 49.0097, lng: 2.5479, elevation: 392, onTime: 80, flightsToday: 950, delayCount: 22, avgDelay: 18 },
  FRA: { iata: 'FRA', icao: 'EDDF', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', lat: 50.0379, lng: 8.5622, elevation: 364, onTime: 78, flightsToday: 910, delayCount: 25, avgDelay: 20 },
  
  // -- Indian Airports across States --
  DEL: { iata: 'DEL', icao: 'VIDP', name: 'Indira Gandhi International Airport', city: 'Delhi', country: 'India', lat: 28.5665, lng: 77.1031, elevation: 777, onTime: 85, flightsToday: 1050, delayCount: 12, avgDelay: 11 },
  BOM: { iata: 'BOM', icao: 'VABB', name: 'Chhatrapati Shivaji Maharaj Intl Airport', city: 'Mumbai', country: 'India', lat: 19.0896, lng: 72.8656, elevation: 39, onTime: 83, flightsToday: 820, delayCount: 10, avgDelay: 9 },
  BLR: { iata: 'BLR', icao: 'VOBL', name: 'Kempegowda International Airport', city: 'Bengaluru', country: 'India', lat: 13.1986, lng: 77.7066, elevation: 3000, onTime: 90, flightsToday: 760, delayCount: 5, avgDelay: 6 },
  MAA: { iata: 'MAA', icao: 'VOMM', name: 'Chennai International Airport', city: 'Chennai', country: 'India', lat: 12.9941, lng: 80.1709, elevation: 52, onTime: 87, flightsToday: 590, delayCount: 8, avgDelay: 8 },
  CCU: { iata: 'CCU', icao: 'VECC', name: 'Netaji Subhash Chandra Bose Intl Airport', city: 'Kolkata', country: 'India', lat: 22.6547, lng: 88.4467, elevation: 16, onTime: 84, flightsToday: 420, delayCount: 12, avgDelay: 10 },
  HYD: { iata: 'HYD', icao: 'VOHS', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad', country: 'India', lat: 17.2403, lng: 78.4294, elevation: 2024, onTime: 89, flightsToday: 510, delayCount: 7, avgDelay: 7 },
  AMD: { iata: 'AMD', icao: 'VAAH', name: 'Sardar Vallabhbhai Patel Intl Airport', city: 'Ahmedabad', country: 'India', lat: 23.0772, lng: 72.6347, elevation: 189, onTime: 86, flightsToday: 310, delayCount: 9, avgDelay: 8 },
  PNQ: { iata: 'PNQ', icao: 'VAPO', name: 'Pune Airport', city: 'Pune', country: 'India', lat: 18.5822, lng: 73.9197, elevation: 1942, onTime: 82, flightsToday: 240, delayCount: 14, avgDelay: 11 },
  COK: { iata: 'COK', icao: 'VOCI', name: 'Cochin International Airport', city: 'Kochi', country: 'India', lat: 10.1520, lng: 76.4019, elevation: 30, onTime: 91, flightsToday: 290, delayCount: 6, avgDelay: 6 },
  GOI: { iata: 'GOI', icao: 'VOGO', name: 'Dabolim Airport', city: 'Goa', country: 'India', lat: 15.3808, lng: 73.8314, elevation: 150, onTime: 85, flightsToday: 180, delayCount: 7, avgDelay: 9 },
  GOX: { iata: 'GOX', icao: 'VOMY', name: 'Manohar International Airport Mopa', city: 'Goa', country: 'India', lat: 15.7289, lng: 73.8647, elevation: 550, onTime: 88, flightsToday: 120, delayCount: 4, avgDelay: 7 },
  JAI: { iata: 'JAI', icao: 'VIJP', name: 'Jaipur International Airport', city: 'Jaipur', country: 'India', lat: 26.8242, lng: 75.8122, elevation: 1263, onTime: 84, flightsToday: 190, delayCount: 8, avgDelay: 10 },
  LKO: { iata: 'LKO', icao: 'VILK', name: 'Chaudhary Charan Singh Intl Airport', city: 'Lucknow', country: 'India', lat: 26.7606, lng: 80.8893, elevation: 403, onTime: 83, flightsToday: 160, delayCount: 11, avgDelay: 12 },
  GAU: { iata: 'GAU', icao: 'VEGT', name: 'Lokpriya Gopinath Bordoloi Intl Airport', city: 'Guwahati', country: 'India', lat: 26.1061, lng: 91.5859, elevation: 162, onTime: 81, flightsToday: 150, delayCount: 12, avgDelay: 14 },
  TRV: { iata: 'TRV', icao: 'VOTV', name: 'Trivandrum International Airport', city: 'Trivandrum', country: 'India', lat: 8.4821, lng: 76.9200, elevation: 15, onTime: 89, flightsToday: 110, delayCount: 3, avgDelay: 5 },
  PAT: { iata: 'PAT', icao: 'VEPT', name: 'Jay Prakash Narayan Airport', city: 'Patna', country: 'India', lat: 25.5913, lng: 85.0882, elevation: 170, onTime: 78, flightsToday: 140, delayCount: 19, avgDelay: 17 },
  BBI: { iata: 'BBI', icao: 'VEBS', name: 'Biju Patnaik Airport', city: 'Bhubaneswar', country: 'India', lat: 20.2444, lng: 85.8178, elevation: 140, onTime: 87, flightsToday: 130, delayCount: 6, avgDelay: 8 },
  IDR: { iata: 'IDR', icao: 'VAID', name: 'Devi Ahilyabai Holkar Airport', city: 'Indore', country: 'India', lat: 22.7217, lng: 75.8011, elevation: 1850, onTime: 88, flightsToday: 150, delayCount: 5, avgDelay: 7 },
  IXC: { iata: 'IXC', icao: 'VICG', name: 'Shaheed Bhagat Singh Intl Airport', city: 'Chandigarh', country: 'India', lat: 30.6733, lng: 76.7885, elevation: 1012, onTime: 85, flightsToday: 110, delayCount: 7, avgDelay: 9 },
  ATQ: { iata: 'ATQ', icao: 'VIAR', name: 'Sri Guru Ram Dass Jee Intl Airport', city: 'Amritsar', country: 'India', lat: 31.7096, lng: 74.7965, elevation: 755, onTime: 83, flightsToday: 90, delayCount: 10, avgDelay: 11 },
  SXR: { iata: 'SXR', icao: 'VISR', name: 'Sheikh ul-Alam International Airport', city: 'Srinagar', country: 'India', lat: 33.9873, lng: 74.7744, elevation: 5445, onTime: 80, flightsToday: 120, delayCount: 15, avgDelay: 16 },
  IXR: { iata: 'IXR', icao: 'VERC', name: 'Birsa Munda Airport', city: 'Ranchi', country: 'India', lat: 23.3142, lng: 85.3218, elevation: 2120, onTime: 82, flightsToday: 100, delayCount: 9, avgDelay: 12 },
  RPR: { iata: 'RPR', icao: 'VARP', name: 'Swami Vivekananda Airport', city: 'Raipur', country: 'India', lat: 21.1804, lng: 81.7388, elevation: 1039, onTime: 86, flightsToday: 80, delayCount: 5, avgDelay: 8 },
  DED: { iata: 'DED', icao: 'VIDN', name: 'Jolly Grant Airport', city: 'Dehradun', country: 'India', lat: 30.1897, lng: 78.1803, elevation: 1830, onTime: 84, flightsToday: 70, delayCount: 6, avgDelay: 10 },
  VNS: { iata: 'VNS', icao: 'VEIB', name: 'Lal Bahadur Shastri Intl Airport', city: 'Varanasi', country: 'India', lat: 25.4497, lng: 82.8587, elevation: 266, onTime: 85, flightsToday: 130, delayCount: 8, avgDelay: 9 },
  NAG: { iata: 'NAG', icao: 'VANP', name: 'Dr. Babasaheb Ambedkar Intl Airport', city: 'Nagpur', country: 'India', lat: 21.0922, lng: 79.0472, elevation: 1033, onTime: 89, flightsToday: 110, delayCount: 4, avgDelay: 6 },
  VTZ: { iata: 'VTZ', icao: 'VEVZ', name: 'Visakhapatnam Airport', city: 'Visakhapatnam', country: 'India', lat: 17.7214, lng: 83.2245, elevation: 16, onTime: 86, flightsToday: 140, delayCount: 5, avgDelay: 8 },
  CJB: { iata: 'CJB', icao: 'VOCB', name: 'Coimbatore International Airport', city: 'Coimbatore', country: 'India', lat: 11.0300, lng: 77.0434, elevation: 1320, onTime: 88, flightsToday: 120, delayCount: 4, avgDelay: 7 },
  IXM: { iata: 'IXM', icao: 'VOMD', name: 'Madurai Airport', city: 'Madurai', country: 'India', lat: 9.8345, lng: 78.0934, elevation: 461, onTime: 85, flightsToday: 90, delayCount: 6, avgDelay: 9 },
  TRZ: { iata: 'TRZ', icao: 'VOTR', name: 'Tiruchirappalli Intl Airport', city: 'Tiruchirappalli', country: 'India', lat: 10.7654, lng: 78.7094, elevation: 288, onTime: 87, flightsToday: 80, delayCount: 5, avgDelay: 8 },
  IXE: { iata: 'IXE', icao: 'VOML', name: 'Mangaluru International Airport', city: 'Mangaluru', country: 'India', lat: 12.9613, lng: 74.8899, elevation: 337, onTime: 89, flightsToday: 70, delayCount: 4, avgDelay: 6 },
  CCJ: { iata: 'CCJ', icao: 'VOCL', name: 'Calicut International Airport', city: 'Calicut', country: 'India', lat: 11.1367, lng: 75.9554, elevation: 341, onTime: 86, flightsToday: 110, delayCount: 8, avgDelay: 9 },
  VGA: { iata: 'VGA', icao: 'VOBZ', name: 'Vijayawada Airport', city: 'Vijayawada', country: 'India', lat: 16.5303, lng: 80.7969, elevation: 82, onTime: 87, flightsToday: 60, delayCount: 3, avgDelay: 7 },
  TIR: { iata: 'TIR', icao: 'VOTP', name: 'Tirupati Airport', city: 'Tirupati', country: 'India', lat: 13.6325, lng: 79.5433, elevation: 340, onTime: 92, flightsToday: 50, delayCount: 2, avgDelay: 5 },
  IXB: { iata: 'IXB', icao: 'VEBD', name: 'Bagdogra Airport', city: 'Siliguri', country: 'India', lat: 26.6812, lng: 88.3286, elevation: 412, onTime: 81, flightsToday: 110, delayCount: 9, avgDelay: 11 },
  GAY: { iata: 'GAY', icao: 'VEGY', name: 'Gaya Airport', city: 'Gaya', country: 'India', lat: 24.7439, lng: 84.9515, elevation: 380, onTime: 88, flightsToday: 40, delayCount: 3, avgDelay: 6 },
  JDH: { iata: 'JDH', icao: 'VIJO', name: 'Jodhpur Airport', city: 'Jodhpur', country: 'India', lat: 26.2514, lng: 73.0486, elevation: 717, onTime: 87, flightsToday: 70, delayCount: 4, avgDelay: 8 },
  IXZ: { iata: 'IXZ', icao: 'VOPB', name: 'Veer Savarkar International Airport', city: 'Port Blair', country: 'India', lat: 11.6412, lng: 92.7297, elevation: 13, onTime: 86, flightsToday: 50, delayCount: 3, avgDelay: 9 },
  IMF: { iata: 'IMF', icao: 'VEIM', name: 'Imphal Airport', city: 'Imphal', country: 'India', lat: 24.7600, lng: 93.8967, elevation: 2542, onTime: 82, flightsToday: 60, delayCount: 5, avgDelay: 10 },
  AJL: { iata: 'AJL', icao: 'VELP', name: 'Lengpui Airport', city: 'Aizawl', country: 'India', lat: 23.8398, lng: 92.6198, elevation: 1380, onTime: 80, flightsToday: 30, delayCount: 4, avgDelay: 11 },
  DMU: { iata: 'DMU', icao: 'VEMR', name: 'Dimapur Airport', city: 'Dimapur', country: 'India', lat: 25.8837, lng: 93.7712, elevation: 487, onTime: 83, flightsToday: 30, delayCount: 3, avgDelay: 8 },
  SHL: { iata: 'SHL', icao: 'VEBI', name: 'Shillong Airport', city: 'Shillong', country: 'India', lat: 25.7025, lng: 91.9786, elevation: 2910, onTime: 85, flightsToday: 20, delayCount: 2, avgDelay: 9 },

  // -- More Indian Airports across States --
  BHO: { iata: 'BHO', icao: 'VABP', name: 'Raja Bhoj Airport', city: 'Bhopal', country: 'India', lat: 23.2875, lng: 77.3375, elevation: 1720, onTime: 88, flightsToday: 40, delayCount: 2, avgDelay: 5 },
  STV: { iata: 'STV', icao: 'VASU', name: 'Surat Airport', city: 'Surat', country: 'India', lat: 21.1141, lng: 72.7417, elevation: 16, onTime: 86, flightsToday: 50, delayCount: 3, avgDelay: 6 },
  BDQ: { iata: 'BDQ', icao: 'VABO', name: 'Vadodara Airport', city: 'Vadodara', country: 'India', lat: 22.3361, lng: 73.2194, elevation: 127, onTime: 89, flightsToday: 60, delayCount: 2, avgDelay: 5 },
  IXL: { iata: 'IXL', icao: 'VILH', name: 'Kushok Bakula Rimpochee Airport', city: 'Leh', country: 'India', lat: 34.1359, lng: 77.5464, elevation: 10682, onTime: 81, flightsToday: 20, delayCount: 4, avgDelay: 12 },
  IXJ: { iata: 'IXJ', icao: 'VIJU', name: 'Jammu Airport', city: 'Jammu', country: 'India', lat: 32.6897, lng: 74.8375, elevation: 1029, onTime: 83, flightsToday: 35, delayCount: 3, avgDelay: 7 },
  IXA: { iata: 'IXA', icao: 'VEAT', name: 'Maharaja Bir Bikram Airport', city: 'Agartala', country: 'India', lat: 23.8869, lng: 91.2403, elevation: 46, onTime: 87, flightsToday: 45, delayCount: 2, avgDelay: 6 },
  UDR: { iata: 'UDR', icao: 'VAUD', name: 'Maharana Pratap Airport', city: 'Udaipur', country: 'India', lat: 24.6178, lng: 73.8961, elevation: 1666, onTime: 85, flightsToday: 30, delayCount: 3, avgDelay: 8 },
  JRG: { iata: 'JRG', icao: 'VEJH', name: 'Veer Surendra Sai Airport', city: 'Jharsuguda', country: 'India', lat: 21.9133, lng: 84.0569, elevation: 750, onTime: 89, flightsToday: 15, delayCount: 1, avgDelay: 4 },
  CNN: { iata: 'CNN', icao: 'VOKN', name: 'Kannur International Airport', city: 'Kannur', country: 'India', lat: 11.9172, lng: 75.5414, elevation: 335, onTime: 88, flightsToday: 40, delayCount: 2, avgDelay: 6 },
  GOP: { iata: 'GOP', icao: 'VEGK', name: 'Gorakhpur Airport', city: 'Gorakhpur', country: 'India', lat: 26.7397, lng: 83.4494, elevation: 259, onTime: 82, flightsToday: 20, delayCount: 4, avgDelay: 10 },
  IXD: { iata: 'IXD', icao: 'VIAL', name: 'Prayagraj Airport', city: 'Prayagraj', country: 'India', lat: 25.4403, lng: 81.7339, elevation: 320, onTime: 86, flightsToday: 25, delayCount: 3, avgDelay: 7 },
  KNU: { iata: 'KNU', icao: 'VICX', name: 'Kanpur Airport', city: 'Kanpur', country: 'India', lat: 26.4028, lng: 80.4125, elevation: 410, onTime: 84, flightsToday: 15, delayCount: 2, avgDelay: 8 },
  RDP: { iata: 'RDP', icao: 'VEDG', name: 'Kazi Nazrul Islam Airport', city: 'Durgapur', country: 'India', lat: 23.6236, lng: 87.2425, elevation: 300, onTime: 85, flightsToday: 20, delayCount: 2, avgDelay: 6 },
  DBG: { iata: 'DBG', icao: 'VEBA', name: 'Darbhanga Airport', city: 'Darbhanga', country: 'India', lat: 26.1919, lng: 85.9189, elevation: 172, onTime: 79, flightsToday: 30, delayCount: 5, avgDelay: 12 },
  JLR: { iata: 'JLR', icao: 'VAJB', name: 'Jabalpur Airport', city: 'Jabalpur', country: 'India', lat: 23.1778, lng: 80.0519, elevation: 1624, onTime: 83, flightsToday: 15, delayCount: 3, avgDelay: 9 },
  GWL: { iata: 'GWL', icao: 'VIGR', name: 'Gwalior Airport', city: 'Gwalior', country: 'India', lat: 26.2933, lng: 78.2278, elevation: 617, onTime: 87, flightsToday: 15, delayCount: 1, avgDelay: 5 },
  IXU: { iata: 'IXU', icao: 'VAAU', name: 'Aurangabad Airport', city: 'Aurangabad', country: 'India', lat: 19.8631, lng: 75.3981, elevation: 1911, onTime: 84, flightsToday: 20, delayCount: 2, avgDelay: 8 },
  SAG: { iata: 'SAG', icao: 'VASD', name: 'Shirdi Airport', city: 'Shirdi', country: 'India', lat: 19.6917, lng: 74.3789, elevation: 1800, onTime: 89, flightsToday: 25, delayCount: 1, avgDelay: 4 },
  RJA: { iata: 'RJA', icao: 'VORY', name: 'Rajahmundry Airport', city: 'Rajahmundry', country: 'India', lat: 17.0089, lng: 81.8178, elevation: 151, onTime: 88, flightsToday: 20, delayCount: 2, avgDelay: 5 },
  MYQ: { iata: 'MYQ', icao: 'VOMY', name: 'Mysore Airport', city: 'Mysore', country: 'India', lat: 12.2289, lng: 76.6433, elevation: 2350, onTime: 90, flightsToday: 15, delayCount: 1, avgDelay: 4 },
  HBX: { iata: 'HBX', icao: 'VAHB', name: 'Hubli Airport', city: 'Hubli', country: 'India', lat: 15.3619, lng: 75.0847, elevation: 2170, onTime: 86, flightsToday: 25, delayCount: 2, avgDelay: 6 },
  IXG: { iata: 'IXG', icao: 'VABM', name: 'Belgaum Airport', city: 'Belgaum', country: 'India', lat: 15.8592, lng: 74.6181, elevation: 2487, onTime: 87, flightsToday: 20, delayCount: 2, avgDelay: 5 },
  TCR: { iata: 'TCR', icao: 'VOTK', name: 'Tuticorin Airport', city: 'Tuticorin', country: 'India', lat: 8.7233, lng: 78.0267, elevation: 13, onTime: 89, flightsToday: 10, delayCount: 1, avgDelay: 4 },
  SXV: { iata: 'SXV', icao: 'VOSM', name: 'Salem Airport', city: 'Salem', country: 'India', lat: 11.7803, lng: 78.0647, elevation: 974, onTime: 91, flightsToday: 10, delayCount: 1, avgDelay: 3 },
  PYG: { iata: 'PYG', icao: 'VEPY', name: 'Pakyong Airport', city: 'Pakyong', country: 'India', lat: 27.2306, lng: 88.5889, elevation: 4590, onTime: 78, flightsToday: 5, delayCount: 2, avgDelay: 15 },
  HGI: { iata: 'HGI', icao: 'VEHO', name: 'Donyi Polo Airport', city: 'Itanagar', country: 'India', lat: 26.9639, lng: 93.6394, elevation: 350, onTime: 85, flightsToday: 10, delayCount: 1, avgDelay: 6 },

  // -- Other Global Airports --
  LAX: { iata: 'LAX', icao: 'KLAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States', lat: 33.9416, lng: -118.4085, elevation: 128, onTime: 76, flightsToday: 1150, delayCount: 30, avgDelay: 24 },
  ORD: { iata: 'ORD', icao: 'KORD', name: "O'Hare International Airport", city: 'Chicago', country: 'United States', lat: 41.9742, lng: -87.9073, elevation: 672, onTime: 75, flightsToday: 1400, delayCount: 35, avgDelay: 26 },
  ATL: { iata: 'ATL', icao: 'KATL', name: 'Hartsfield-Jackson Atlanta Intl Airport', city: 'Atlanta', country: 'United States', lat: 33.6407, lng: -84.4277, elevation: 1026, onTime: 82, flightsToday: 1850, delayCount: 18, avgDelay: 14 },
  PEK: { iata: 'PEK', icao: 'ZBAA', name: 'Beijing Capital International Airport', city: 'Beijing', country: 'China', lat: 40.0801, lng: 116.5846, elevation: 115, onTime: 88, flightsToday: 1100, delayCount: 9, avgDelay: 7 },
  HKG: { iata: 'HKG', icao: 'VHHH', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong', lat: 22.3080, lng: 113.9185, elevation: 28, onTime: 89, flightsToday: 780, delayCount: 11, avgDelay: 10 },
  ICN: { iata: 'ICN', icao: 'RKSI', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea', lat: 37.4602, lng: 126.4407, elevation: 23, onTime: 92, flightsToday: 830, delayCount: 6, avgDelay: 7 },
  GRU: { iata: 'GRU', icao: 'SBGR', name: 'São Paulo/Guarulhos Intl Airport', city: 'São Paulo', country: 'Brazil', lat: -23.4356, lng: -46.4731, elevation: 2459, onTime: 81, flightsToday: 680, delayCount: 16, avgDelay: 15 },
  AMS: { iata: 'AMS', icao: 'EHAM', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', lat: 52.3105, lng: 4.7683, elevation: -11, onTime: 81, flightsToday: 1020, delayCount: 20, avgDelay: 16 },
  MAD: { iata: 'MAD', icao: 'LEMD', name: 'Adolfo Suárez Madrid–Barajas Airport', city: 'Madrid', country: 'Spain', lat: 40.4719, lng: -3.5640, elevation: 1998, onTime: 86, flightsToday: 760, delayCount: 12, avgDelay: 11 },
  FCO: { iata: 'FCO', icao: 'LIRF', name: 'Leonardo da Vinci–Fiumicino Airport', city: 'Rome', country: 'Italy', lat: 41.8003, lng: 12.2389, elevation: 15, onTime: 84, flightsToday: 690, delayCount: 13, avgDelay: 12 },
  IST: { iata: 'IST', icao: 'LTFM', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', lat: 41.2753, lng: 28.7519, elevation: 325, onTime: 87, flightsToday: 1180, delayCount: 15, avgDelay: 13 },
  DOH: { iata: 'DOH', icao: 'OTHH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar', lat: 25.2611, lng: 51.5651, elevation: 13, onTime: 90, flightsToday: 710, delayCount: 7, avgDelay: 8 },
  CAN: { iata: 'CAN', icao: 'ZGGG', name: 'Guangzhou Baiyun International Airport', city: 'Guangzhou', country: 'China', lat: 23.3924, lng: 113.2988, elevation: 50, onTime: 85, flightsToday: 920, delayCount: 12, avgDelay: 10 },
  PVG: { iata: 'PVG', icao: 'ZSPD', name: 'Shanghai Pudong International Airport', city: 'Shanghai', country: 'China', lat: 31.1443, lng: 121.8083, elevation: 13, onTime: 82, flightsToday: 950, delayCount: 14, avgDelay: 13 },
  SFO: { iata: 'SFO', icao: 'KSFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'United States', lat: 37.6213, lng: -122.3790, elevation: 13, onTime: 78, flightsToday: 820, delayCount: 22, avgDelay: 18 },
  DFW: { iata: 'DFW', icao: 'KDFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas-Fort Worth', country: 'United States', lat: 32.8998, lng: -97.0403, elevation: 607, onTime: 77, flightsToday: 1350, delayCount: 28, avgDelay: 21 },
  DEN: { iata: 'DEN', icao: 'KDEN', name: 'Denver International Airport', city: 'Denver', country: 'United States', lat: 39.8561, lng: -104.6737, elevation: 5431, onTime: 74, flightsToday: 1200, delayCount: 32, avgDelay: 25 },
  YVR: { iata: 'YVR', icao: 'CYVR', name: 'Vancouver International Airport', city: 'Vancouver', country: 'Canada', lat: 49.1967, lng: -123.1815, elevation: 14, onTime: 83, flightsToday: 480, delayCount: 10, avgDelay: 11 },
  YYZ: { iata: 'YYZ', icao: 'CYYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', country: 'Canada', lat: 43.6777, lng: -79.6248, elevation: 569, onTime: 76, flightsToday: 850, delayCount: 26, avgDelay: 22 },
  JNB: { iata: 'JNB', icao: 'FAOR', name: 'O.R. Tambo International Airport', city: 'Johannesburg', country: 'South Africa', lat: -26.1367, lng: 28.2411, elevation: 5558, onTime: 88, flightsToday: 380, delayCount: 5, avgDelay: 6 },
  CPT: { iata: 'CPT', icao: 'FACT', name: 'Cape Town International Airport', city: 'Cape Town', country: 'South Africa', lat: -33.9711, lng: 18.6021, elevation: 151, onTime: 89, flightsToday: 290, delayCount: 4, avgDelay: 5 },
  BNE: { iata: 'BNE', icao: 'YBBN', name: 'Brisbane Airport', city: 'Brisbane', country: 'Australia', lat: -27.3842, lng: 153.1175, elevation: 13, onTime: 85, flightsToday: 320, delayCount: 8, avgDelay: 9 },
  MEL: { iata: 'MEL', icao: 'YMML', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia', lat: -37.6690, lng: 144.8410, elevation: 434, onTime: 84, flightsToday: 450, delayCount: 10, avgDelay: 11 },
  AKL: { iata: 'AKL', icao: 'NZAA', name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand', lat: -37.0081, lng: 174.7917, elevation: 23, onTime: 86, flightsToday: 280, delayCount: 6, avgDelay: 8 },
  EZE: { iata: 'EZE', icao: 'SAEZ', name: 'Ministro Pistarini International Airport', city: 'Buenos Aires', country: 'Argentina', lat: -34.8222, lng: -58.5358, elevation: 67, onTime: 82, flightsToday: 210, delayCount: 9, avgDelay: 10 },
  MEX: { iata: 'MEX', icao: 'MMMX', name: 'Mexico City International Airport', city: 'Mexico City', country: 'Mexico', lat: 19.4363, lng: -99.0721, elevation: 7316, onTime: 79, flightsToday: 790, delayCount: 24, avgDelay: 19 }
};

// Helper: Calculate distance & intermediate points along a Great Circle path
export function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

export function getBearing(lat1, lon1, lat2, lon2) {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
  const brng = Math.atan2(y, x) * 180 / Math.PI;
  return (brng + 360) % 360;
}

export function interpolatePoints(lat1, lon1, lat2, lon2, fraction) {
  const d = getDistance(lat1, lon1, lat2, lon2) / 6371; // distance in radians
  if (d === 0) return { lat: lat1, lng: lon1 };
  
  const lat1Rad = lat1 * Math.PI / 180;
  const lon1Rad = lon1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;
  const lon2Rad = lon2 * Math.PI / 180;

  const a = Math.sin((1 - fraction) * d) / Math.sin(d);
  const b = Math.sin(fraction * d) / Math.sin(d);
  const x = a * Math.cos(lat1Rad) * Math.cos(lon1Rad) + b * Math.cos(lat2Rad) * Math.cos(lon2Rad);
  const y = a * Math.cos(lat1Rad) * Math.sin(lon1Rad) + b * Math.cos(lat2Rad) * Math.sin(lon2Rad);
  const z = a * Math.sin(lat1Rad) + b * Math.sin(lat2Rad);

  const latRad = Math.atan2(z, Math.sqrt(x * x + y * y));
  const lonRad = Math.atan2(y, x);

  return {
    lat: latRad * 180 / Math.PI,
    lng: lonRad * 180 / Math.PI
  };
}

// Generate flight plans (ghost paths vs actual path)
function generateFlightPlan(origin, dest) {
  const points = [];
  const steps = 30;
  for (let i = 0; i <= steps; i++) {
    const f = i / steps;
    const pt = interpolatePoints(origin.lat, origin.lng, dest.lat, dest.lng, f);
    
    // Add minor offsets to the flight plan so it's not a perfect straight line (airways follow corridors)
    if (i > 0 && i < steps) {
      const angle = (getBearing(origin.lat, origin.lng, dest.lat, dest.lng) + 90) * Math.PI / 180;
      const deviation = Math.sin((f * Math.PI)) * 0.8; // Max 0.8 deg offset
      pt.lat += Math.sin(angle) * deviation * 0.15;
      pt.lng += Math.cos(angle) * deviation * 0.15;
    }
    points.push(pt);
  }
  return points;
}

// Initial flight generation template
const FLIGHT_TEMPLATES = [
  { callsign: 'BAW173', airline: 'British Airways', type: 'Boeing 777-300ER', category: 'Commercial', reg: 'G-STBA', age: '4 years', msn: '43290', seatConfig: 'C14/W40/Y220', engine: 'GE90-115B', livery: 'Union Jack Landor', origin: 'LHR', dest: 'JFK', speed: 490, altitude: 38000, baseProgress: 0.12 },
  { callsign: 'UAE201', airline: 'Emirates', type: 'Airbus A380-800', category: 'Commercial', reg: 'A6-EEO', age: '7 years', msn: '168', seatConfig: 'F14/C76/Y399', engine: 'GP7200', livery: 'Standard Emirates Livery', origin: 'DXB', dest: 'JFK', speed: 510, altitude: 36000, baseProgress: 0.45 },
  { callsign: 'AAL2', airline: 'American Airlines', type: 'Boeing 777-200ER', category: 'Commercial', reg: 'N751AA', age: '14 years', msn: '29388', seatConfig: 'C37/W24/Y212', engine: 'RR Trent 892', livery: 'Silver Eagle Livery', origin: 'JFK', dest: 'LHR', speed: 485, altitude: 37000, baseProgress: 0.68 },
  { callsign: 'JAL6', airline: 'Japan Airlines', type: 'Boeing 787-9 Dreamliner', category: 'Commercial', reg: 'JA862J', age: '5 years', msn: '38128', seatConfig: 'C44/W35/Y116', engine: 'GEnx-1B', livery: 'Tsurumaru Livery', origin: 'HND', dest: 'JFK', speed: 495, altitude: 39000, baseProgress: 0.28 },
  { callsign: 'SIA322', airline: 'Singapore Airlines', type: 'Airbus A350-900', category: 'Commercial', reg: '9V-SMA', age: '3 years', msn: '042', seatConfig: 'C42/W24/Y187', engine: 'RR Trent XWB', livery: 'Changi Golden Ribbon', origin: 'SIN', dest: 'LHR', speed: 505, altitude: 38000, baseProgress: 0.72 },
  { callsign: 'FDX421', airline: 'FedEx Express', type: 'Boeing 777-FS2', category: 'Cargo', reg: 'N811FD', age: '8 years', msn: '37721', seatConfig: 'Cargo Deck only', engine: 'GE90-110B1', livery: 'FedEx Standard', origin: 'JFK', dest: 'DXB', speed: 480, altitude: 35000, baseProgress: 0.35 },
  { callsign: 'QTR81B', airline: 'Qatar Airways', type: 'Boeing 777-300ER', category: 'Commercial', reg: 'A7-BEB', age: '6 years', msn: '41432', seatConfig: 'C42/Y312', engine: 'GE90-115B', livery: 'Qatar Retro livery', origin: 'DXB', dest: 'LHR', speed: 498, altitude: 34000, baseProgress: 0.58 },
  { callsign: 'QFA64', airline: 'Qantas', type: 'Boeing 787-9 Dreamliner', category: 'Commercial', reg: 'VH-ZND', age: '6 years', msn: '63093', seatConfig: 'C42/W28/Y166', engine: 'GEnx-1B', livery: 'Yam Dreaming Livery', origin: 'SYD', dest: 'HND', speed: 512, altitude: 40000, baseProgress: 0.81 },
  { callsign: 'MIL88', airline: 'US Air Force', type: 'Lockheed C-5M Super Galaxy', category: 'Military', reg: '84-0060', age: '38 years', msn: '0060', seatConfig: 'Military Config', engine: 'GE TF39', livery: 'Tactical Grey', origin: 'JFK', dest: 'LHR', speed: 450, altitude: 31000, baseProgress: 0.52 },
  { callsign: 'N777PV', airline: 'Private Owner', type: 'Gulfstream G650ER', category: 'Private', reg: 'N777PV', age: '2 years', msn: '6192', seatConfig: 'Executive 14 Seats', engine: 'Rolls-Royce BR725', livery: 'Chrome & Charcoal Stripes', origin: 'LHR', dest: 'DXB', speed: 535, altitude: 43000, baseProgress: 0.22 },
  { callsign: 'HELI-MED1', airline: 'London Air Ambulance', type: 'Eurocopter EC135', category: 'Helicopter', reg: 'G-LNDN', age: '6 years', msn: '0981', seatConfig: 'Medical Config', engine: 'Pratt & Whitney PW206B', livery: 'Red Medical Cross', origin: 'LHR', dest: 'LHR', speed: 120, altitude: 1200, baseProgress: 0.85 },
  { callsign: 'BOX556', airline: 'AeroLogic', type: 'Boeing 777-F', category: 'Cargo', reg: 'D-AALB', age: '9 years', msn: '36001', seatConfig: 'Cargo Deck only', engine: 'GE90-110B1', livery: 'AeroLogic DHL Hybrid', origin: 'DXB', dest: 'SIN', speed: 490, altitude: 33000, baseProgress: 0.40 },
  { callsign: 'ANA9', airline: 'All Nippon Airways', type: 'Boeing 777-300ER', category: 'Commercial', reg: 'JA784A', age: '11 years', msn: '37949', seatConfig: 'F8/C68/Y112', engine: 'GE90-115B', livery: 'Star Wars BB-8', origin: 'HND', dest: 'LHR', speed: 502, altitude: 36500, baseProgress: 0.62 },
  { callsign: 'HELI-TOUR2', airline: 'FlyDubai Heli', type: 'Bell 412', category: 'Helicopter', reg: 'A6-TOU', age: '4 years', msn: '3310', seatConfig: 'Sightseeing 9 Seats', engine: 'PT6T-3B', livery: 'FlyDubai Cyan/White', origin: 'DXB', dest: 'DXB', speed: 110, altitude: 800, baseProgress: 0.15 },
  { callsign: 'SIA22', airline: 'Singapore Airlines', type: 'Airbus A350-900ULR', category: 'Commercial', reg: '9V-SGE', age: '4 years', msn: '220', seatConfig: 'C67/W94', engine: 'RR Trent XWB', livery: 'Standard SIA Livery', origin: 'SIN', dest: 'JFK', speed: 508, altitude: 41000, baseProgress: 0.50 }
];

export function generateFlights() {
  const list = [];
  
  FLIGHT_TEMPLATES.forEach((t, index) => {
    const origin = AIRPORTS[t.origin];
    const dest = AIRPORTS[t.dest];
    
    // Calculate initial position based on baseProgress
    const pos = interpolatePoints(origin.lat, origin.lng, dest.lat, dest.lng, t.baseProgress);
    const bearing = getBearing(pos.lat, pos.lng, dest.lat, dest.lng);
    
    // Generate actual flight trail (past positions)
    const trail = [];
    const trailLength = 30 + Math.floor(Math.random() * 20); // 30-50 pings
    for (let i = trailLength; i >= 1; i--) {
      const trailProg = t.baseProgress - (i * 0.005);
      if (trailProg > 0) {
        const trPos = interpolatePoints(origin.lat, origin.lng, dest.lat, dest.lng, trailProg);
        // Add tiny path jitter to show historical variance
        const offsetAngle = (bearing + 90) * Math.PI / 180;
        const jitter = Math.sin(trailProg * 25) * 0.04;
        trPos.lat += Math.sin(offsetAngle) * jitter;
        trPos.lng += Math.cos(offsetAngle) * jitter;
        trail.push(trPos);
      }
    }
    
    // Add current position to end of trail
    trail.push({ lat: pos.lat, lng: pos.lng });

    // Generate planned route (Route Ghost airway)
    const plannedAirway = generateFlightPlan(origin, dest);

    // Weather elements at flight level
    const temp = -45 - Math.floor(Math.random() * 15);
    const windSpeed = 35 + Math.floor(Math.random() * 45);
    const windDir = Math.floor(Math.random() * 360);

    list.push({
      id: `FL-${1000 + index}`,
      callsign: t.callsign,
      airline: t.airline,
      type: t.type,
      category: t.category,
      registration: t.reg,
      age: t.age,
      msn: t.msn,
      seatConfig: t.seatConfig,
      engine: t.engine,
      livery: t.livery,
      origin: t.origin,
      dest: t.dest,
      lat: pos.lat,
      lng: pos.lng,
      altitude: t.altitude,
      speed: t.speed,
      heading: bearing,
      track: bearing,
      verticalSpeed: Math.random() > 0.8 ? (Math.random() > 0.5 ? 800 : -1200) : 0,
      squawk: Math.floor(Math.random() * 8000).toString().padStart(4, '0'),
      mach: parseFloat((t.speed / 667).toFixed(2)),
      gpsAltitude: t.altitude + Math.floor((Math.random() * 200) - 100),
      windSpeed,
      windDir,
      temp,
      progress: t.baseProgress,
      trail,
      plannedAirway,
      squawkState: 'Normal', // Normal, 7700, 7600, 7500
      bookmarksCount: Math.floor(Math.random() * 15)
    });
  });

  return list;
}

// Tick update simulation: advances flight positions
export function updateSimulation(flights, squawkTrigger = null, customWeather = false) {
  return flights.map(f => {
    // If helicopter, fly in small orbits around its airport
    if (f.category === 'Helicopter') {
      const origin = AIRPORTS[f.origin];
      const time = Date.now() / 45000;
      const lat = origin.lat + Math.sin(time) * 0.08;
      const lng = origin.lng + Math.cos(time) * 0.08;
      
      const newTrail = [...f.trail, { lat, lng }].slice(-60);
      const heading = (f.heading + 4) % 360;

      return {
        ...f,
        lat,
        lng,
        heading,
        track: heading,
        trail: newTrail,
        verticalSpeed: Math.sin(time * 3) * 150
      };
    }

    const origin = AIRPORTS[f.origin];
    const dest = AIRPORTS[f.dest];
    
    // Advance progress
    let newProg = f.progress + 0.0006;
    if (newProg >= 1) {
      newProg = 0.01; // Wrap around to simulate continuous flow
    }
    
    // Calculate new position with a slight organic noise drift
    const nextPos = interpolatePoints(origin.lat, origin.lng, dest.lat, dest.lng, newProg);
    const rawBearing = getBearing(nextPos.lat, nextPos.lng, dest.lat, dest.lng);
    
    // Add micro jitter to make route look realistic
    const pathOffsetAngle = (rawBearing + 90) * Math.PI / 180;
    const pathJitter = Math.sin(newProg * 25) * 0.04;
    nextPos.lat += Math.sin(pathOffsetAngle) * pathJitter;
    nextPos.lng += Math.cos(pathOffsetAngle) * pathJitter;

    // Shift trail
    const newTrail = [...f.trail, { lat: nextPos.lat, lng: nextPos.lng }].slice(-60);
    
    // Adjust speed and altitude slightly
    const vsRange = Math.random() > 0.95 ? (Math.random() > 0.5 ? 400 : -600) : f.verticalSpeed;
    let newAlt = f.altitude + (vsRange * 0.1);
    if (newAlt > 43000) { newAlt = 43000; }
    if (newAlt < 10000 && f.progress < 0.9) { newAlt = 28000; }

    const speedDrift = Math.floor((Math.random() * 4) - 2);
    const newSpeed = Math.min(560, Math.max(220, f.speed + speedDrift));
    
    // Weather turbulence speeds
    const finalSpeed = customWeather ? Math.max(180, newSpeed - 30) : newSpeed;

    // Apply Squawk code triggers
    let squawk = f.squawk;
    let squawkState = f.squawkState;
    if (squawkTrigger && squawkTrigger.flightId === f.id) {
      squawk = squawkTrigger.code;
      squawkState = squawkTrigger.code;
    }

    return {
      ...f,
      lat: nextPos.lat,
      lng: nextPos.lng,
      progress: newProg,
      trail: newTrail,
      heading: rawBearing,
      track: rawBearing,
      altitude: Math.round(newAlt),
      speed: finalSpeed,
      verticalSpeed: vsRange,
      mach: parseFloat((finalSpeed / 667).toFixed(2)),
      gpsAltitude: Math.round(newAlt + (Math.random() * 60 - 30)),
      squawk,
      squawkState
    };
  });
}

// Generate METAR text mock decoder
export function getMETAR(airportCode) {
  const hour = new Date().getUTCHours().toString().padStart(2, '0');
  const windDir = Math.floor(Math.random() * 36) * 10;
  const windSpd = 5 + Math.floor(Math.random() * 20);
  const temp = 10 + Math.floor(Math.random() * 22);
  const press = 990 + Math.floor(Math.random() * 30);
  
  return `${airportCode} 25${hour}00Z ${windDir.toString().padStart(3, '0')}${windSpd}KT 9999 FEW025 BKN080 ${temp}/${temp - 4} Q${press} NOSIG`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Live OpenSky Network API — authenticated via Vite proxy (bypasses CORS)
// Credentials from credentials.json are injected server-side in vite.config.js
// The proxy maps /api/opensky/* → https://opensky-network.org/* with Basic Auth
// ─────────────────────────────────────────────────────────────────────────────

// Map common airline ICAO designator prefixes to full names
const AIRLINE_NAMES = {
  BAW: 'British Airways', SHT: 'British Airways', UAE: 'Emirates',
  AAL: 'American Airlines', DAL: 'Delta Air Lines', UAL: 'United Airlines',
  DLH: 'Lufthansa', QTR: 'Qatar Airways', SIA: 'Singapore Airlines',
  KLM: 'KLM Royal Dutch', AFR: 'Air France', JAL: 'Japan Airlines',
  ANA: 'All Nippon Airways', QFA: 'Qantas', FDX: 'FedEx Express',
  UPS: 'UPS Airlines', RYR: 'Ryanair', EZY: 'EasyJet',
  SWR: 'Swiss International', AIC: 'Air India', ETD: 'Etihad Airways',
  VIR: 'Virgin Atlantic', FDB: 'FlyDubai', TOM: 'TUI Airways',
  THY: 'Turkish Airlines', CCA: 'Air China', CES: 'China Eastern',
  CSN: 'China Southern', MAS: 'Malaysia Airlines', PAL: 'Philippine Airlines',
  THA: 'Thai Airways', GFA: 'Gulf Air', PIA: 'Pakistan International',
  SVA: 'Saudi Arabian Airlines', MSR: 'Egyptair', ETH: 'Ethiopian Airlines',
  KAC: 'Kuwait Airways', OMA: 'Oman Air', GEC: 'Lufthansa Cargo',
  CLX: 'Cargolux', FIN: 'Finnair', BEL: 'Brussels Airlines',
  TAP: 'TAP Air Portugal', AZA: 'ITA Airways', IBE: 'Iberia',
  VLG: 'Vueling', NAX: 'Norwegian Air', WZZ: 'Wizz Air',
  BAV: 'Air Baltic', AEE: 'Aegean Airlines', AMX: 'Aeromexico',
  AVA: 'Avianca', LAM: 'LATAM Airlines', GLO: 'Gol Airlines',
  ASA: 'Alaska Airlines', SWA: 'Southwest Airlines', FFT: 'Frontier Airlines',
  JBU: 'JetBlue Airways', HAL: 'Hawaiian Airlines', SKW: 'SkyWest Airlines',
};

const AIRCRAFT_TYPES = [
  'Boeing 777-300ER', 'Airbus A320neo', 'Boeing 737-800',
  'Airbus A350-900', 'Boeing 787-9 Dreamliner', 'Airbus A380-800',
  'Airbus A220-300', 'Bombardier CRJ-900', 'Embraer E195-E2',
  'Boeing 737 MAX 9', 'Airbus A321XLR', 'Boeing 767-300ER',
];

const SEAT_CONFIGS = [
  'C16/Y150', 'F8/C42/Y220', 'C30/Y180', 'C42/Y210', 'F14/C76/Y399',
  'Y186', 'C12/Y150', 'C8/Y132',
];

const ENGINE_TYPES = [
  'GE90-115B', 'CFM LEAP-1A', 'CFM56-7B', 'RR Trent XWB',
  'GEnx-1B', 'GP7200', 'PW1100G', 'CFM LEAP-1B',
];

const LIVERIES = [
  'Standard livery', 'Retro livery', 'Star Alliance livery',
  'Special edition livery', 'Oneworld livery', 'SkyTeam livery',
];

/**
 * Converts an OpenSky state vector array into a rich flight object.
 * OpenSky state vector indices:
 *  0: icao24, 1: callsign, 2: origin_country, 3: time_position,
 *  4: last_contact, 5: longitude, 6: latitude, 7: baro_altitude,
 *  8: on_ground, 9: velocity, 10: true_track, 11: vertical_rate,
 *  12: sensors, 13: geo_altitude, 14: squawk, 15: spi, 16: position_source
 */
function parseStateVector(state, index, hubCode) {
  const icao24      = state[0] || `xx${index}`;
  const callsign    = (state[1] || '').trim();
  const originCountry = state[2] || 'Unknown';
  const lng         = state[5];
  const lat         = state[6];
  const baroAltM    = state[7];       // meters
  const onGround    = state[8];
  const velocityMs  = state[9];       // m/s
  const trueTrack   = state[10] || 0; // degrees
  const vertRateMs  = state[11] || 0; // m/s
  const geoAltM     = state[13];
  const squawk      = state[14] || '1200';

  // Skip ground traffic and aircraft without position
  if (onGround || lat == null || lng == null) return null;

  // Unit conversions
  const altitudeFt      = baroAltM  ? Math.round(baroAltM  * 3.28084)  : 28000;
  const gpsAltFt        = geoAltM   ? Math.round(geoAltM   * 3.28084)  : altitudeFt;
  const speedKt         = velocityMs ? Math.round(velocityMs * 1.94384) : 0;
  const vertSpeedFpm    = vertRateMs  ? Math.round(vertRateMs  * 196.85) : 0;

  // Stable deterministic "seed" from ICAO24 for consistent derived fields
  let seed = 0;
  for (let i = 0; i < icao24.length; i++) seed += icao24.charCodeAt(i);
  seed = seed || index + 1;

  // Airline / type enrichment
  const prefix   = callsign.substring(0, 3).toUpperCase();
  const airline  = AIRLINE_NAMES[prefix] || `${originCountry} Operator`;
  const type     = AIRCRAFT_TYPES[seed % AIRCRAFT_TYPES.length];
  const engine   = ENGINE_TYPES[seed % ENGINE_TYPES.length];
  const seatConfig = SEAT_CONFIGS[seed % SEAT_CONFIGS.length];
  const livery   = LIVERIES[seed % LIVERIES.length];

  // Category heuristic
  let category = 'Commercial';
  if (speedKt < 150 && altitudeFt < 4000) category = 'Helicopter';
  else if (['MIL','IAM','USAF','RFR'].includes(prefix)) category = 'Military';
  else if (speedKt < 250 && altitudeFt < 15000) category = 'Private';

  // Route estimation from heading + hub position
  const hubAirport = AIRPORTS[hubCode] || AIRPORTS['LHR'];
  const bearingFromHub = getBearing(hubAirport.lat, hubAirport.lng, lat, lng);
  const headingDiff = Math.abs(trueTrack - bearingFromHub);
  const isDeparting = headingDiff < 90 || headingDiff > 270;

  const allHubCodes = Object.keys(AIRPORTS);
  let origin, dest;
  if (isDeparting) {
    origin = hubCode;
    dest = allHubCodes[(seed + 3) % allHubCodes.length];
  } else {
    dest = hubCode;
    origin = allHubCodes[(seed + 7) % allHubCodes.length];
  }
  if (origin === dest) dest = allHubCodes[(seed + 5) % allHubCodes.length];

  // Trailpoints (estimated back-track from current position & heading)
  const trail = [];
  const headingRad = (trueTrack * Math.PI) / 180;
  for (let i = 15; i >= 0; i--) {
    const d = i * speedKt * 0.00009;
    trail.push({
      lat: lat - Math.cos(headingRad) * d,
      lng: lng - Math.sin(headingRad) * d,
    });
  }

  // Squawk alert
  const SQUAWK_ALERTS = { '7700': '7700', '7600': '7600', '7500': '7500' };
  const squawkState = SQUAWK_ALERTS[squawk] || 'Normal';

  return {
    id:           `LIVE-${icao24}`,
    icao24,
    callsign:     callsign || `L${icao24.toUpperCase().slice(0, 5)}`,
    airline,
    type,
    category,
    registration: `${originCountry.substring(0, 2).toUpperCase()}-${icao24.toUpperCase().substring(0, 4)}`,
    age:          `${(seed % 10) + 2} years`,
    msn:          `${seed * 17 + 100}`,
    seatConfig,
    engine,
    livery,
    origin,
    dest,
    lat,
    lng,
    altitude:     altitudeFt,
    speed:        speedKt,
    heading:      trueTrack,
    track:        trueTrack,
    verticalSpeed: vertSpeedFpm,
    squawk,
    squawkState,
    mach:         parseFloat((speedKt / 667).toFixed(2)),
    gpsAltitude:  gpsAltFt,
    windSpeed:    (seed % 45) + 10,
    windDir:      (seed * 7) % 360,
    temp:         -55 + (seed % 20),
    progress:     isDeparting ? 0.1 + (seed % 30) / 100 : 0.6 + (seed % 30) / 100,
    trail,
    plannedAirway: [
      AIRPORTS[origin]  || { lat, lng },
      { lat: ((AIRPORTS[origin] || {lat}).lat + (AIRPORTS[dest] || {lat}).lat) / 2,
        lng: ((AIRPORTS[origin] || {lng}).lng + (AIRPORTS[dest] || {lng}).lng) / 2 },
      AIRPORTS[dest]    || { lat, lng },
    ],
    bookmarksCount: seed % 8,
    isLive: true,
  };
}

/**
 * Fetch live flights from the OpenSky Network authenticated API.
 *
 * Authentication is handled transparently by the Vite dev proxy defined in
 * vite.config.js — the browser only ever calls the local /api/opensky path.
 * The proxy injects "Authorization: Basic <base64(clientId:clientSecret)>"
 * before forwarding the request to https://opensky-network.org, so there is
 * no CORS issue and credentials are never exposed in the browser.
 *
 * @param {string} hubCode - The selected hub airport code (e.g. 'LHR')
 * @param {object|null} bbox - Optional {lamin,lomin,lamax,lomax} bounding box.
 *   Pass null for a truly global query (returns ~5 000-9 000 aircraft worldwide).
 * @returns {Promise<Array>} Parsed live flight objects ready for the map.
 */

// ICAO type designators for rotorcraft (FR24 supplies the real type code per
// aircraft — this replaces a speed/altitude heuristic that tagged almost any
// slow, low-altitude aircraft as a Helicopter, which in practice meant nearly
// every aircraft taxiing or parked at an airport, regardless of actual type).
const HELICOPTER_TYPE_CODES = new Set([
  'EC20', 'EC25', 'EC30', 'EC35', 'EC45', 'EC55', 'EC65', 'EC75', 'EC30',
  'AS50', 'AS55', 'AS65', 'AS32', 'AS92', 'AS35',
  'A109', 'A119', 'A129', 'A139', 'A169', 'A189', 'A609',
  'B06', 'B47', 'B105', 'B212', 'B222', 'B230', 'B407', 'B412', 'B429', 'B430',
  'H1', 'H25', 'H47', 'H53', 'H58', 'H60', 'H64', 'H125', 'H130', 'H145', 'H155', 'H160', 'H175',
  'R22', 'R44', 'R66', 'S76', 'S92', 'S61', 'S70',
  'W3SO', 'GAZL', 'LAMA', 'ALO2', 'ALO3', 'NH90', 'CH47', 'MD52', 'MD60', 'MD90H',
  'EH10', 'AW09', 'AW119', 'AW129', 'AW139', 'AW169', 'AW189', 'AW609',
]);

// Cargo-only ICAO callsign/airline prefixes — same source data otherwise
// looks identical to a passenger flight (FR24 doesn't flag cargo directly).
const CARGO_AIRLINE_PREFIXES = new Set([
  'FDX', 'UPS', 'GEC', 'CLX', 'GTI', 'CKS', 'ABX', 'ATN', 'CAO', 'CES', 'BOX', 'QAR',
]);

function classifyFlightCategory({ typeCode, prefix, flightNumber }) {
  if (typeCode && HELICOPTER_TYPE_CODES.has(typeCode.toUpperCase())) return 'Helicopter';
  if (['MIL', 'IAM', 'USAF', 'RFR', 'NAVY', 'NVY'].includes(prefix)) return 'Military';
  if (CARGO_AIRLINE_PREFIXES.has(prefix)) return 'Cargo';
  // No commercial flight number assigned almost always means private/biz aviation.
  if (!flightNumber) return 'Private';
  return 'Commercial';
}

export async function fetchLiveOpenSkyFlights(hubCode = 'LHR', bbox = null) {
  const defaultBboxes = {
    LHR: { lamin: 45.0, lomin: -12.0, lamax: 62.0, lomax: 20.0 },  // Western Europe
    JFK: { lamin: 24.0, lomin: -90.0, lamax: 52.0, lomax: -60.0 }, // Eastern North America
    DXB: { lamin: 15.0, lomin: 45.0,  lamax: 40.0, lomax: 75.0  }, // Middle East
  };

  const region = bbox || defaultBboxes[hubCode] || defaultBboxes.LHR;

  // Format bounds parameter for FlightRadar24: y2,y1,x1,x2
  const params = new URLSearchParams({
    bounds: `${region.lamax},${region.lamin},${region.lomin},${region.lomax}`,
    faa: '1',
    satellite: '1',
    mlat: '1',
    flarm: '1',
    adsb: '1',
    gnd: '1',
    air: '1',
    vehicles: '0',
    estimated: '1',
  });

  // On Android WebView (file:// protocol), fetch() API doesn't work for intercepted
  // requests. Use XMLHttpRequest instead, which the WebViewClient can intercept.
  const apiBase = '';
  const url = `/api/opensky?${params.toString()}`;

  // FlightRadar24 responds quickly — use a standard 10s timeout
  const timeoutMs = 10000;

  try {
    const data = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const timeoutId = setTimeout(() => {
        xhr.abort();
        reject(new Error('Request timeout'));
      }, timeoutMs);

      xhr.open('GET', url);
      xhr.setRequestHeader('Accept', 'application/json');
      
      xhr.onload = () => {
        clearTimeout(timeoutId);
        if (xhr.status === 429) {
          console.warn('FlightRadar24 rate limit hit — will retry next cycle');
          resolve([]);
        } else if (xhr.status === 200 || xhr.status === 0) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch (e) {
            reject(new Error('Failed to parse response'));
          }
        } else {
          reject(new Error(`FlightRadar24 API error: ${xhr.status} ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error('Network error'));
      };

      xhr.onabort = () => {
        clearTimeout(timeoutId);
        reject(new Error('Request aborted'));
      };

      xhr.send();
    });

    if (!data) return [];

    console.log(`[SkyWatch] FlightRadar24 live data received`);

    const flightsList = Object.entries(data)
      .filter(([key, val]) => Array.isArray(val))
      .map(([key, val], index) => {
        const [
          icao24, lat, lng, track, alt, speed, squawk, radar, 
          type, reg, time, origin, dest, flight, gnd, vspeed, callsign, special, operator
        ] = val;

        // Stable deterministic "seed" from ICAO24 for consistent derived fields
        let seed = 0;
        const icaoStr = icao24 || '';
        for (let i = 0; i < icaoStr.length; i++) seed += icaoStr.charCodeAt(i);
        seed = seed || index + 1;

        const prefix = (callsign || flight || '').substring(0, 3).toUpperCase();
        const airline = AIRLINE_NAMES[prefix] || `${operator || 'Private'} Operator`;
        const typeName = type || AIRCRAFT_TYPES[seed % AIRCRAFT_TYPES.length];
        const engine = ENGINE_TYPES[seed % ENGINE_TYPES.length];
        const seatConfig = SEAT_CONFIGS[seed % SEAT_CONFIGS.length];
        const livery = LIVERIES[seed % LIVERIES.length];

        const altFt = alt || 0;
        const speedKt = speed || 0;

        const category = classifyFlightCategory({ typeCode: type, prefix, flightNumber: flight });

        // Trailpoints (estimated back-track from current position & heading)
        const trail = [];
        const headingRad = ((track || 0) * Math.PI) / 180;
        for (let i = 15; i >= 0; i--) {
          const d = i * speedKt * 0.00009;
          trail.push({
            lat: lat - Math.cos(headingRad) * d,
            lng: lng - Math.sin(headingRad) * d,
          });
        }

        const SQUAWK_ALERTS = { '7700': '7700', '7600': '7600', '7500': '7500' };
        const squawkState = SQUAWK_ALERTS[squawk] || 'Normal';

        return {
          id: `LIVE-${icao24 || key}`,
          icao24: icao24 || '',
          callsign: callsign || flight || `LGT${(seed % 900) + 100}`,
          airline,
          type: typeName,
          category,
          registration: reg || `N-FR${seed % 10000}`,
          age: `${(seed % 10) + 2} years`,
          msn: `${seed * 17 + 100}`,
          seatConfig,
          engine,
          livery,
          origin: origin || 'LHR',
          dest: dest || 'JFK',
          lat,
          lng,
          altitude: altFt,
          speed: speedKt,
          heading: track || 0,
          track: track || 0,
          verticalSpeed: vspeed || 0,
          squawk: squawk || '7000',
          squawkState,
          mach: parseFloat((speedKt / 667).toFixed(2)),
          gpsAltitude: altFt,
          windSpeed: (seed % 45) + 10,
          windDir: (seed * 7) % 360,
          temp: -55 + (seed % 20),
          progress: 0.5,
          trail,
          plannedAirway: [
            AIRPORTS[origin || 'LHR'] || { lat, lng },
            AIRPORTS[dest || 'JFK'] || { lat, lng }
          ],
          bookmarksCount: seed % 8,
          isLive: true
        };
      })
      .slice(0, 150);

    return flightsList;

  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      console.warn('[SkyWatch] Live flights request timed out');
    } else {
      console.error('[SkyWatch] Live flights fetch error:', err.message || err);
    }
    return [];
  }
}

// In-memory cache so re-selecting the same aircraft (or it reappearing after
// a refetch) doesn't re-hit the photo API every time.
const aircraftPhotoCache = new Map(); // icao24 -> { src, link, photographer } | null

/**
 * Look up a real photo of a specific aircraft by its ICAO24 hex address via
 * Planespotters' public photo API (proxied — see /api/aircraft-photo in
 * vite.config.js, api/aircraft-photo.js, and the Android WebViewClient).
 * Returns null if no photo is available (e.g. mock/simulated flights with no
 * real icao24, or an aircraft Planespotters has no photo of).
 */
export async function fetchAircraftPhoto(icao24) {
  if (!icao24) return null;
  const hex = icao24.toLowerCase();
  if (aircraftPhotoCache.has(hex)) return aircraftPhotoCache.get(hex);

  try {
    const apiBase = '';
    const url = `/api/aircraft-photo?hex=${encodeURIComponent(hex)}`;
    
    // Use XMLHttpRequest for Android WebView compatibility
    const data = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.setRequestHeader('Accept', 'application/json');
      
      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 0) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (e) {
            reject(e);
          }
        } else {
          reject(new Error(`HTTP ${xhr.status}`));
        }
      };
      
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send();
    });

    const photo = data?.photos?.[0];
    const result = photo
      ? {
          src: photo.thumbnail_large?.src || photo.thumbnail?.src,
          link: photo.link,
          photographer: photo.photographer,
        }
      : null;
    aircraftPhotoCache.set(hex, result);
    return result;
  } catch (err) {
    console.warn('[SkyWatch] Aircraft photo fetch failed:', err.message || err);
    aircraftPhotoCache.set(hex, null);
    return null;
  }
}
