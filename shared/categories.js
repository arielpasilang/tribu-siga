// Plain CommonJS module so it can be `require()`d from Node (Netlify
// Functions, scripts/) and imported (default-export interop) from the
// Vite-based Studio and the webpack-based Gatsby app.
const CATEGORIES = [
  `Major Climb`,
  `Milestone`,
  `Overnight`,
  `Training`,
  `Day Hike`,
]

module.exports = { CATEGORIES }
