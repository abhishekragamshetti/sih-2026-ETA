Railway ETA Database Module
Database implementation for the Smart India Hackathon 2026 project:

PS 26028 — Dynamic Forecast of Expected Time of Arrival (ETA) for Coaching Trains

Overview
This database module stores and processes train, station, railway section, historical delay, and live train status data required by the ETA prediction system.

The database combines historical and real-time operational information to provide features for dynamic ETA prediction.

Database Schema
The system contains five core tables:

1. Train
Stores train master information including:

Train number
Train name
Train type
Source station
Destination station
2. Station
Stores railway station information including:

Station code
Station name
Latitude
Longitude
Railway zone
3. Section
Represents railway sections between stations and stores:

From station
To station
Distance
Scheduled travel time
4. HistoricDelays
Stores historical sectional delay information for trains.

This data is used to calculate historical average delays for ETA prediction.

5. LiveStatus
Stores live operational information including:

Current station
Next station
Current section
Current delay
Current speed
GPS coordinates
Status timestamp
ETA Data Flow
Live Train Status + Section Data + Historical Delays

↓

ETA Feature Extraction

↓

ETA Prediction Model / Backend

↓

Predicted Arrival Time

SQL Features
The database supports queries for:

Latest live train status
Average historical section delay
ETA feature extraction
Speed-based travel time
Baseline ETA prediction
Latest-status-based ETA calculation
Baseline ETA
For prototype testing:

Speed Based Travel Time:

(Distance / Current Speed) × 60

Baseline Predicted Travel Time:

Speed Based Travel Time + Average Historical Delay

This baseline calculation demonstrates how live and historical information can be combined. The final ETA prediction layer can incorporate machine learning and additional operational features.

Performance
Indexes are included for efficient:

Live train status retrieval
Historical delay lookup
Railway section lookup
Files
schema.sql — Database tables, relationships and indexes
sample_data.sql — Sample data for testing
eta_queries.sql — ETA-related SQL queries
eer_diagram.png — EER diagram of the database
README.md — Database documentation
Technology
MySQL
MySQL Workbench
SQL
Project
Smart India Hackathon 2026
Problem Statement ID: 26028
Problem: Dynamic Forecast of Expected Time of Arrival (ETA) for Coaching Trains


Current Implementation Status

The database has been populated with sample data for testing the ETA prediction workflow.

Current data includes:

- 10 train records operating across the selected railway corridor
- 4 railway stations: Secunderabad, Kazipet, Warangal, and Vijayawada
- 3 railway sections connecting the stations
- Live status records for all 10 trains
- Current train speed and delay information
- Current station, next station, and section information
- GPS coordinates for simulated live train positions
- Historical section-wise delay records
- SQL queries combining live status, section information, and historical delays for ETA prediction

The database provides structured input features such as current delay, current speed, section distance, scheduled section travel time, and average historical delay to the backend/ETA prediction model.

Note: Live status and historical delay records currently use simulated data for development and demonstration purposes.
