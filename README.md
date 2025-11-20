# Interactive 3D Earth Viewer

A modern web application built with React, TypeScript, and Babylon.js that displays an interactive 3D Earth model loaded from OBJ/MTL files.

## Features

- 🌍 Interactive 3D Earth model viewer
- 🖱️ Mouse controls for rotation and zoom
- 🎨 Modern UI with smooth animations
- ⚡ Built with Vite for fast development and optimized builds
- 📦 TypeScript for type safety
- 🎮 Babylon.js 7.x for 3D rendering (using modern, non-deprecated APIs)

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)

## Installation

1. Clone or navigate to the project directory:
```bash
cd SupplyChain2
```

2. Install dependencies:
```bash
npm install
```

## Development

To run the project in development mode with hot-module replacement:

```bash
npm run dev
```

The application will start on `http://localhost:5173/` (or another port if 5173 is busy).

### Development Controls

- **Left Mouse Button + Drag**: Rotate the Earth
- **Mouse Wheel**: Zoom in/out
- **Right Mouse Button + Drag**: Pan the camera

## Building for Production

To create an optimized production build:

```bash
npm run build
```

The built files will be in the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
SupplyChain2/
├── public/
│   └── models/
│       ├── earth.obj          # 3D Earth model (replace with your own)
│       └── earth.mtl          # Material definition for the Earth model
├── src/
│   ├── components/
│   │   └── EarthViewer.tsx    # Main 3D viewer component
│   ├── App.tsx                # Main application component
│   ├── App.css                # Application styles
│   ├── index.css              # Global styles
│   └── main.tsx               # Application entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Customizing the Earth Model

The project includes a placeholder Earth model. To use your own 3D model:

1. Replace `public/models/earth.obj` with your OBJ file
2. Replace `public/models/earth.mtl` with your MTL file (if applicable)
3. Ensure your model files are properly formatted
4. The component will automatically center and scale the model to fit the view

### Supported Model Formats

- **OBJ**: Wavefront 3D object files
- **MTL**: Material template library files (optional, for textures and materials)

## Technologies Used

- **React 18**: UI framework
- **TypeScript**: Type-safe JavaScript
- **Vite**: Next-generation frontend tooling
- **Babylon.js 7.x**: Powerful 3D rendering engine
  - `@babylonjs/core`: Core engine functionality
  - `@babylonjs/loaders`: OBJ/MTL file loaders

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Browser Support

This application works best on modern browsers with WebGL 2.0 support:
- Chrome 56+
- Firefox 51+
- Safari 15+
- Edge 79+

## Troubleshooting

### Model Not Loading

- Ensure your OBJ/MTL files are in `public/models/`
- Check browser console for error messages
- Verify file paths are correct in `App.tsx`

### Performance Issues

- Reduce model polygon count if it's too high
- Ensure your GPU drivers are up to date
- Close other GPU-intensive applications

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to submit issues and enhancement requests!

