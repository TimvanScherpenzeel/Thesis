# Bachelor Thesis
Mass spring cloth simulation in WebGL using semi-implicit Euler and ping-pong FBO's.

[Live demo](https://timvanscherpenzeel.github.io/Thesis/)

A PDF of my research report will be added in the near future.

Known supported devices:
- iPad Pro (2016)
- iPad Mini 2 (2013)
- iPhone 5S (2013)
- Macbook Pro Retina (2015)
- Lenovo W530

Known unsupported devices:
- Samsung Galaxy S7 Edge (2016)

To do:
- Add touch / mouse interaction and raycasting to add interaction with the cloth
- Implement support for area raycasting
- Add cloth tearing, rigid body support and object- and self collision and possible add a fix for z-fighting and clipping issues.
- Add interaction with lights and other objects in the scene
- Add shadow casting and receiving
- Add support for partially transparent textures (PNG’s).
- Create particle location specific mass and wind dynamics
- Use higher order methods of numerical integration (Verlet, Runge-Kutta 4th order) to increase the precision
- Make the pin geometry move when repinned or removed
- Construct a custom phong shader using Shaderchunks available in Three.js
- Identify the specific reason why the Samsung Galaxy S7 Edge is not supported and implement a fix. The goal is to support all modern mobile devices and modern browsers.
- Identify and document issues regarding the camera controls on touch devices in combination with cloth interaction

In the `documentation` folder one can find an overview of compatibility tests and a log of redundant calls from the WebGL inspector addon.

&nbsp;

![1.jpg](/screenshots/1.jpg?raw=true)
*Macbook Pro Retina (2015)*

&nbsp;

![2.jpg](/screenshots/2.jpg?raw=true)
*Macbook Pro Retina (2015)*

&nbsp;

![3.jpg](/screenshots/3.jpg?raw=true)
*Macbook Pro Retina (2015)*

&nbsp;

![4.jpg](/screenshots/4.jpg?raw=true)
*iPad Mini 2 (2013)*

&nbsp;

![5.jpg](/screenshots/5.jpg?raw=true)
*iPad Mini 2 (2013)*

&nbsp;

![6.jpg](/screenshots/6.jpg?raw=true)
*iPad Mini 2 (2013)*

&nbsp;