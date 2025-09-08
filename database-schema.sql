-- Bus Time Listing Website Database Schema
-- Run these commands in your Supabase SQL editor

-- Create routes table
CREATE TABLE routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bus_stations table for storing station information
CREATE TABLE bus_stations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  station_name TEXT NOT NULL UNIQUE,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create buses table (updated for trip-based system)
-- Bus category: local, limited_stop, ksrtc
CREATE TYPE bus_category AS ENUM ('local', 'limited_stop', 'ksrtc');

CREATE TABLE buses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
  bus_name TEXT NOT NULL,
  bus_number TEXT,
  operator_name TEXT,
  contact TEXT,
  category bus_category DEFAULT 'local' NOT NULL,
  total_duration INTERVAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trip_timings table for detailed station-wise timings
CREATE TABLE trip_timings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bus_id UUID REFERENCES buses(id) ON DELETE CASCADE,
  station_id UUID REFERENCES bus_stations(id) ON DELETE CASCADE,
  arrival_time TIME,
  departure_time TIME,
  stop_duration INTERVAL DEFAULT '0 minutes',
  sequence_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_routes_from_to ON routes(from_location, to_location);
CREATE INDEX idx_buses_route_id ON buses(route_id);
CREATE INDEX idx_bus_stations_name ON bus_stations(station_name);
CREATE INDEX idx_trip_timings_bus_id ON trip_timings(bus_id);
CREATE INDEX idx_trip_timings_sequence ON trip_timings(bus_id, sequence_order);

-- Enable Row Level Security (RLS)
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_timings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on routes" ON routes
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on buses" ON buses
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on bus_stations" ON bus_stations
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on trip_timings" ON trip_timings
  FOR SELECT USING (true);

-- Create policies for public insert access (for adding bus timings)
CREATE POLICY "Allow public insert on routes" ON routes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert on buses" ON buses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert on bus_stations" ON bus_stations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert on trip_timings" ON trip_timings
  FOR INSERT WITH CHECK (true);

-- Users (linked to Firebase UID)
CREATE TABLE IF NOT EXISTS app_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT,
  display_name TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on app_users" ON app_users
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert on app_users" ON app_users
  FOR INSERT WITH CHECK (true);

-- Insert some sample data
INSERT INTO routes (from_location, to_location) VALUES
  ('Kannur', 'Malappuram'),
  ('Kozhikode', 'Kannur'),
  ('Kozhikode', 'Malappuram'),
  ('Kochi', 'Thiruvananthapuram'),
  ('Kochi', 'Kozhikode'),
  ('Thrissur', 'Kochi'),
  ('Palakkad', 'Kozhikode');

-- Insert bus stations
INSERT INTO bus_stations (station_name, location) VALUES
  ('Kannur Bus Station', 'Kannur'),
  ('Kozhikode Bus Station', 'Kozhikode'),
  ('Manjeri Bus Station', 'Manjeri'),
  ('Malappuram Bus Station', 'Malappuram'),
  ('Koyilandy Bus Station', 'Koyilandy'),
  ('Vadakara Bus Station', 'Vadakara'),
  ('Thalassery Bus Station', 'Thalassery'),
  ('Tirur Bus Station', 'Tirur'),
  ('Tanur Bus Station', 'Tanur'),
  ('Kochi Bus Station', 'Kochi'),
  ('Thiruvananthapuram Bus Station', 'Thiruvananthapuram'),
  ('Kollam Bus Station', 'Kollam'),
  ('Kottarakkara Bus Station', 'Kottarakkara'),
  ('Thrissur Bus Station', 'Thrissur'),
  ('Palakkad Bus Station', 'Palakkad');

-- Insert sample buses with detailed trip timings
-- Example: Kannur to Malappuram trip
INSERT INTO buses (route_id, bus_name, bus_number, operator_name, contact, total_duration) VALUES
  ((SELECT id FROM routes WHERE from_location = 'Kannur' AND to_location = 'Malappuram' LIMIT 1), 'KSRTC Express', 'KL-13-1234', 'KSRTC', '+91 9876543210', '3 hours'),
  ((SELECT id FROM routes WHERE from_location = 'Kozhikode' AND to_location = 'Kannur' LIMIT 1), 'Private Bus', 'KL-11-5678', 'Private Operator', '+91 9876543211', '2 hours 30 minutes'),
  ((SELECT id FROM routes WHERE from_location = 'Kozhikode' AND to_location = 'Malappuram' LIMIT 1), 'Local Bus', 'KL-11-9012', 'Local Transport', '+91 9876543212', '1 hour 45 minutes');

-- Insert detailed trip timings for Kannur to Malappuram
INSERT INTO trip_timings (bus_id, station_id, arrival_time, departure_time, stop_duration, sequence_order) VALUES
  -- Kannur to Malappuram trip (10 PM departure)
  ((SELECT id FROM buses WHERE bus_name = 'KSRTC Express' AND route_id = (SELECT id FROM routes WHERE from_location = 'Kannur' AND to_location = 'Malappuram')), 
   (SELECT id FROM bus_stations WHERE station_name = 'Kannur Bus Station'), 
   NULL, '22:00', '0 minutes', 1),
  
  ((SELECT id FROM buses WHERE bus_name = 'KSRTC Express' AND route_id = (SELECT id FROM routes WHERE from_location = 'Kannur' AND to_location = 'Malappuram')), 
   (SELECT id FROM bus_stations WHERE station_name = 'Kozhikode Bus Station'), 
   '23:00', '23:05', '5 minutes', 2),
  
  ((SELECT id FROM buses WHERE bus_name = 'KSRTC Express' AND route_id = (SELECT id FROM routes WHERE from_location = 'Kannur' AND to_location = 'Malappuram')), 
   (SELECT id FROM bus_stations WHERE station_name = 'Manjeri Bus Station'), 
   '00:00', '00:05', '5 minutes', 3),
  
  ((SELECT id FROM buses WHERE bus_name = 'KSRTC Express' AND route_id = (SELECT id FROM routes WHERE from_location = 'Kannur' AND to_location = 'Malappuram')), 
   (SELECT id FROM bus_stations WHERE station_name = 'Malappuram Bus Station'), 
   '01:00', NULL, '0 minutes', 4);

-- Insert trip timings for Kozhikode to Kannur
INSERT INTO trip_timings (bus_id, station_id, arrival_time, departure_time, stop_duration, sequence_order) VALUES
  ((SELECT id FROM buses WHERE bus_name = 'Private Bus' AND route_id = (SELECT id FROM routes WHERE from_location = 'Kozhikode' AND to_location = 'Kannur')), 
   (SELECT id FROM bus_stations WHERE station_name = 'Kozhikode Bus Station'), 
   NULL, '08:30', '0 minutes', 1),
  
  ((SELECT id FROM buses WHERE bus_name = 'Private Bus' AND route_id = (SELECT id FROM routes WHERE from_location = 'Kozhikode' AND to_location = 'Kannur')), 
   (SELECT id FROM bus_stations WHERE station_name = 'Koyilandy Bus Station'), 
   '09:15', '09:20', '5 minutes', 2),
  
  ((SELECT id FROM buses WHERE bus_name = 'Private Bus' AND route_id = (SELECT id FROM routes WHERE from_location = 'Kozhikode' AND to_location = 'Kannur')), 
   (SELECT id FROM bus_stations WHERE station_name = 'Vadakara Bus Station'), 
   '10:00', '10:05', '5 minutes', 3),
  
  ((SELECT id FROM buses WHERE bus_name = 'Private Bus' AND route_id = (SELECT id FROM routes WHERE from_location = 'Kozhikode' AND to_location = 'Kannur')), 
   (SELECT id FROM bus_stations WHERE station_name = 'Kannur Bus Station'), 
   '11:00', NULL, '0 minutes', 4);
