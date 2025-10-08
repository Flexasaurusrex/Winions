# Winions - A RascalX Art Collection

A minimal, clean website featuring an interactive geometric wireframe animation of a hooded figure.

## Files

- `index.html` - Main HTML structure
- `styles.css` - All styling and layout
- `script.js` - Interactive canvas animation

## Setup

1. Create a new directory for your project
2. Copy all three files into the directory
3. Open `index.html` in a web browser

## File Structure

```
winions/
├── index.html
├── styles.css
└── script.js
```

## Features

- **Responsive Design** - Adapts to different screen sizes
- **Interactive Animation** - Click and drag to influence the particle movement
- **Minimalist Aesthetic** - Clean typography and geometric design
- **Physics-Based Motion** - Particles trace a hooded figure outline with smooth trails

## Customization

### Adjust Animation Speed
In `script.js`, modify the `speed` property in the Particle constructor:
```javascript
this.speed = 0.002 + Math.random() * 0.001; // Change these values
```

### Change Number of Particles
In `script.js`, modify:
```javascript
const numParticles = 8; // Change this number
```

### Modify Colors
In `styles.css`, update the gradient background or other color values:
```css
background: linear-gradient(to bottom, #f5f5f5 0%, #e8e8e8 100%);
```

In `script.js`, modify particle colors:
```javascript
ctx.strokeStyle = 'rgba(100, 100, 100, 0.4)'; // Trail color
ctx.fillStyle = '#333'; // Particle color
```

## Browser Support

Works in all modern browsers that support:
- HTML5 Canvas
- CSS3
- ES6 JavaScript

## License

Feel free to use and modify for your project.
