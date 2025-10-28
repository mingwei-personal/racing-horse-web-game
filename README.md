# Racing Horse Web Game 🐎

A fun and interactive web-based horse racing game where players can create their own race with customizable horses!

## Features

- **Customizable Races**: Select 1-8 horses for your race
- **Personalized Horses**: Name each horse with custom tags
- **Random Racing**: Horses move with random step sizes for unpredictable outcomes
- **Real-time Animation**: Watch horses race across the track with smooth animations
- **Winner Celebration**: Special animations and results display for the winner
- **Responsive Design**: Works on desktop and mobile devices

## How to Play

1. **Select Number of Horses**: Choose between 1-8 horses for your race
2. **Name Your Horses**: Give each horse a unique name (or use default names)
3. **Start the Race**: Click "Start Race!" and watch the horses compete
4. **See Results**: View the winner and final standings
5. **Play Again**: Click "Play Again" to start a new race

## Game Rules

- Each horse moves forward with random step sizes during the race
- The first horse to reach the finish line wins
- All horses are displayed with different emojis for easy identification
- Race results show final standings with medals for top 3 positions

## Technical Details

- **HTML5**: Semantic structure and accessibility
- **CSS3**: Modern styling with gradients, animations, and responsive design
- **Vanilla JavaScript**: Clean object-oriented code with event handling
- **No Dependencies**: Runs entirely in the browser with no external libraries

## Running the Game

### Option 1: Direct File Opening

Simply open `index.html` in your web browser.

### Option 2: Local Server (Recommended)

```bash
# Navigate to the project directory
cd racing-horse-web-game

# Start a local server (Python 3)
python3 -m http.server 8000

# Or using Node.js
npx serve .

# Open http://localhost:8000 in your browser
```

## File Structure

```
racing-horse-web-game/
├── index.html          # Main HTML structure
├── styles.css          # All styling and animations
├── script.js           # Game logic and interactions
└── README.md           # This documentation
```

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## License

This project is open source and available under the MIT License.
