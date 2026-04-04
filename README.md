🚀 CP-Insight: Professional Contest & Performance AnalyzerCP-Insight is a premium, data-driven coaching platform for competitive programmers. Built with the MERN stack, it replaces generic practice with Deterministic Intelligence—analyzing real-time Codeforces data to build a mathematically sound growth roadmap.✨ Core Features📊 Deep Diagnostic Dashboard: Instantly parses historical submissions to establish a baseline for Accept Rates, total contests, and rating deltas.🎯 Targeted Recommendation Engine: Identifies a user's Top 5 Weakest Topics and suggests 10 problems within the "Growth Sweet Spot" (Current Rating +100 to +300).📈 Two-Tier Upsolving:Triage: Isolates recent contest failures (WA/TLE) to clear technical debt.+1 Challenge: Automatically assigns the next sequential problem from a user's hardest solve to stretch their rating ceiling.📅 Stateless Daily Challenge: Uses a deterministic mathematical hash (Handle + UTC Date) to serve a personalized problem without database overhead.🔥 Activity Heatmap: A sleek, dark-mode visualization of submission streaks and daily consistency.⚔️ Head-to-Head Compare: Compares users based on the difficulty of problems solved rather than just generic ratings.🛠️ Tech StackFrontend: React.js, Tailwind CSS (Bento Grid Design).Backend: Node.js, Express.js.API: Codeforces API Integration.Performance: Custom Axios Request Queueing & Success-only Caching Middleware.🏗️ Engineering Highlights1. Global Request QueueingTo bypass strict Codeforces rate limits (429 Too Many Requests), we implemented a global Axios interceptor. It acts as a "traffic cop," ensuring all concurrent component requests are spaced by exactly 1500ms.2. Deterministic HashingThe Daily Challenge utilizes a stateless hash function to ensure consistency across refreshes without backend Cron jobs:$$\text{ProblemIndex} = \text{Hash}(\text{handle} + \text{date}) \pmod{\text{filteredProblems.length}}$$🚀 Installation & SetupClone the Repository:Bashgit clone https://github.com/himanshu-codes-ai/cp-insight.git
cd cp-insight
Install Dependencies:Bash# Install for Backend
cd server && npm install

# Install for Frontend
cd ../client && npm install
Run the Application:Bash# From the root directory, start the Backend (Port 5000)
cd server && npm run dev

# In a new terminal, start the Frontend (Port 3000)
cd client && npm start
💡 Why CP-Insight?Competitive programming often suffers from Decision Fatigue. CP-Insight removes the guesswork of "what to solve next," providing a structured, data-backed path to mastery.
