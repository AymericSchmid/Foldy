# Foldy - Protein Viewer

A lightweight and interactive 3D visualizer for protein structures — built with WebGL

Explore protein backbones, spline interpolations, and smooth-tube meshes using modern rendering techniques. Designed for both scientific exploration and artistic expression.

## 🚀 Features

- 📦 Loads `.pdb` files (only C-alpha atoms for now)
- 🌀 Smooth backbone splines via Catmull-Rom interpolation
- 🧵 Tube mesh generation with Rotation Minimizing Frames (RMF)
- 🔍 Interactive camera control (trackball)
- 🌈 Toggle spheres, vectors, caps, and tubes
- 🎨 WebGL rendering with REGL

## 📸 Screenshot

![image](https://github.com/user-attachments/assets/03be11dd-3598-444d-b77d-47aaa328b535)

## 🛠️ Setup

```bash
npm install
npm run dev
```

## 📁 Project Structure
```
src/
├── controls/       # UI & trackball control
├── draw/           # WebGL rendering commands
├── loaders/        # OBJ and PDB loaders
├── mesh/           # Spline & tube mesh generation
├── shaders/        # GLSL shaders
└── utils/          # Math & geometry helpers
```

## ❤️ Credits

Inspired by Mol*

Built using REGL
