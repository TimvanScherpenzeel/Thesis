# Bachelor Thesis
Mass spring cloth simulation in WebGL using semi-implicit Euler and ping-pong FBO's.

## Live demo

[Live demo](https://timvanscherpenzeel.github.io/Thesis/)

&nbsp;

![0.jpg](/screenshots/1.jpg?raw=true)
*Macbook Pro Retina (2015)*

&nbsp;

## Known supported devices:
- iPad Pro (2016)
- iPad Mini 2 (2013)
- iPhone 5S (2013)
- Macbook Pro Retina (2015)
- Lenovo W530

## Known unsupported devices:
- Samsung Galaxy S7 Edge (2016)

## To do:
- Add touch / mouse interaction and raycasting to add interaction with the cloth
- Implement support for area raycasting
- Add cloth tearing, rigid body support and object- and self collision
- Fix possible z-fighting and clipping issues
- Add interaction with lights and other objects in the scene
- Add shadow casting and receiving
- Add support for partially transparent textures (PNG’s).
- Create particle location specific mass and wind dynamics
- Use higher order methods of numerical integration (Verlet, Runge-Kutta 4th order)
- Make the pin geometry move when repinned or removed
- Construct a custom phong shader using Shaderchunks available in Three.js
- Identify and document issues regarding the camera controls on touch devices