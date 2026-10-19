
# 🎙️ web-sound-system-pad — Live Sound System & Studio Sampler

web-sound-system-pad is an ultra-low latency web-based soundboard, live sampler, and mixing console designed specifically for stage gigs, DJs, worship directors, and content creators. It features a high-contrast console layout optimized for dim studio and live club environments.

## 🚀 Key Features

* **🎛️ Low-Latency Web Audio Engine:** Sub-5ms performance response times featuring per-pad voice routing, 4 distinct trigger modes (One-Shot, Gate, Toggle-Loop, Retrigger), and hardware choke groups.
* **⚙️ Consolidated Utility Header:** A single top-right Settings drawer that houses the Automated LUFS Gain Stager, Master BPM clock, Session Recorder, MIDI mapping configurations, and the Community Portal.
* **📂 Structured Audio Categorization:** Reorganized matrix sorting groups filtering audio states instantly through: `All`, `Drops`, `FX`, `Loops`, `Drums`, `Bass`, `Melodic`, `TikTok Songs`, `Trending`, `Comedic`, and `Worship`.
* **🌌 Stage Ready Design:** Grayish-black background configuration minimizing screen-glare on stage, with a hardware-accelerated minimalist introductory splash routine.
* **🎹 External Hardware MIDI Mapping:** Fully programmable Web MIDI API implementation featuring "MIDI Learn" binding to seamlessly match physical launchpads and slider controllers.
* **📴 100% Offline PWA Capabilities:** Service worker infrastructure caching custom audio sets natively via IndexedDB for rock-solid performance with zero venue internet connectivity.

## 🛠️ Tech Stack

* **Framework:** React + TypeScript (TSX)
* **Styling:** Tailwind CSS (Responsive breakpoints + hardware-accelerated animations)
* **Audio Layer:** Native Web Audio API + MediaRecorder
* **Deployment:** Vercel (Optimized edge networking)

## 📦 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the live performance server:
   ```bash
   npm run dev
   ```


<div align="center">

<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

  <h1>Built with AI Studio</h2>

  <p>The fastest path from prompt to production with Gemini.</p>

  <a href="https://aistudio.google.com/apps">Start building</a>

</div>
