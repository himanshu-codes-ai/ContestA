# 🚀 CP-Insight: Professional Contest & Performance Analyzer

> A premium, data-driven coaching platform for competitive programmers.

**CP-Insight** is built with the MERN stack and replaces generic practice with **Deterministic Intelligence**. It analyzes real-time Codeforces data to build a mathematically sound growth roadmap, eliminating decision fatigue for competitive programmers.

---

## ✨ Core Features

* **📊 Deep Diagnostic Dashboard:** Instantly parses historical submissions to establish a baseline for Accept Rates, total contests, and rating deltas.
* **🎯 Targeted Recommendation Engine:** Identifies a user's **Top 5 Weakest Topics** and suggests exactly 10 problems within the "Growth Sweet Spot" (Current Rating +100 to +300).
* **📈 Two-Tier Upsolving:**
    * **Triage:** Isolates recent contest failures (WA/TLE) to clear technical debt.
    * **+1 Challenge:** Automatically assigns the next sequential problem from a user's hardest solve to stretch their rating ceiling.
* **📅 Stateless Daily Challenge:** Uses a deterministic mathematical hash (`Handle + UTC Date`) to serve a personalized problem without database overhead.
* **🔥 Activity Heatmap:** A sleek, dark-mode visualization of submission streaks and daily consistency.
* **⚔️ Head-to-Head Compare:** Compares users based on algorithmic efficiency (Execution Time and Memory Usage) and problem difficulty, rather than just generic ratings.

---

## 🛠️ Tech Stack

* **Frontend:** React.js, Tailwind CSS (Bento Grid UI).
* **Backend:** Node.js, Express.js.
* **External API:** Codeforces API.
* **Performance Management:** Custom Axios Request Queueing & Success-only Caching Middleware.

---

## 🏗️ Engineering Highlights

* **Global Request Queueing:** Bypasses strict Codeforces rate limits (`429 Too Many Requests`) using a global Axios interceptor that acts as a "traffic cop," spacing concurrent component requests by exactly **1500ms**.
* **Deterministic Hashing:** The Daily Challenge uses a stateless hash function to ensure consistency across refreshes without backend Cron jobs:
  ```text
  ProblemIndex = Hash(handle + date) % filteredProblems.length

