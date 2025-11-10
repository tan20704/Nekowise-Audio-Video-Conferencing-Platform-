/**
 * Calculate grid layout based on participant count (Google Meet style)
 * @param {number} participantCount - Total number of participants
 * @returns {string} Tailwind CSS grid classes
 */
export function getGridLayout(participantCount) {
  if (participantCount === 1) {
    return "grid-cols-1 max-w-4xl"; // Single participant - large centered
  } else if (participantCount === 2) {
    return "grid-cols-1 md:grid-cols-2 max-w-6xl"; // 2 participants - side by side
  } else if (participantCount <= 4) {
    return "grid-cols-1 md:grid-cols-2 max-w-6xl"; // 3-4 participants - 2x2 grid
  } else if (participantCount <= 6) {
    return "grid-cols-2 md:grid-cols-3 max-w-7xl"; // 5-6 participants - 2x3 grid
  } else if (participantCount <= 9) {
    return "grid-cols-2 md:grid-cols-3 lg:grid-cols-3 max-w-7xl"; // 7-9 participants - 3x3 grid
  } else {
    return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-7xl"; // 10+ participants - 4 columns
  }
}
