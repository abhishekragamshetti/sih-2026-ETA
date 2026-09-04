# sih-2026-ETA
SIH Dynamic Forecast of Expected Time of Arrival (ETA) for Coaching Trains
# SIH 26028 — Dynamic Forecast of Expected Time of Arrival (ETA) for Coaching Trains

> **Problem Statement ID:** 26028  
> **Ministry / Organization:** Ministry of Railways  
> **Category:** Software  
> **Domain:** Transportation & Logistics  
> **Sprint Deadline:** September 8, 2026  

---

## 📌 Project Overview

This repository contains the dynamic train tracking and ETA prediction system developed for **Smart India Hackathon 2026**. The system addresses real-time schedule disruptions across the Indian Railways network using a **Weighted Rule-Based Dynamic ETA Engine**. 

Rather than relying on static schedules, our core engine recalculates expected arrival times at every simulated checkpoint by factoring in section historical delays, live congestion, and weather penalties.

---

## ⚙️ Core Logic: Weighted Dynamic ETA Engine

Our initial Phase 1 release uses a transparent, defensible, and explainable rule-based mathematical model:

$$\text{Predicted ETA} = \text{Scheduled Time} + \text{Current Delay} + (\text{Section Hist. Avg Delay} \times w_1) + (\text{Congestion Factor} \times w_2) + \text{Weather Penalty} - \text{Recovery Buffer}$$

> **Development Roadmap Note:**  
> **Phase 1 (Built):** Weighted dynamic rule engine calculating live check-point updates.  
> **Phase 2 (Future Scope):** Machine learning refinement pipeline using scikit-learn/XGBoost built on top of this structured data schema[cite: 1].

---

## 👥 Team Roster & Roles

| Role | Responsibility & Focus Area |
| :--- | :--- |
| **Team Lead / Pitch Owner** | Narrative, scope control, system architecture, and presentation[cite: 1] |
| **Database Designer** | DBMS schema (Trains, Stations, Sections, HistoricalDelays, LiveStatus)[cite: 1] |
| **Backend Developer** | Express/Flask REST API, database queries, and ETA algorithm implementation[cite: 1] |
| **Frontend Lead (React)** | Dashboard UI, train/route selection screen, and live tracking UI[cite: 1] |
| **Frontend Support / Tester** | UI styling, component support, end-to-end bug testing, and flow validation[cite: 1] |
| **Documentation & PPT Lead** | Pitch presentation, system diagrams, feasibility analysis, and demo recording[cite: 1] |

---

## 📅 4-Day Sprint Execution Plan (Sep 4 – Sep 8)