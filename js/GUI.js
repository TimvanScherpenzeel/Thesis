var gui = function () {

    var KsSpringAmount = (/(iPad|iPhone|iPod)/g.test(navigator.userAgent)) ? 5000.0 : 15000.0; // Spring amount over 10K is problamatic on iOS devices
    var KdSpringAmount = (/(iPad|iPhone|iPod)/g.test(navigator.userAgent)) ? 13 : 1; // Compensate for the reduced spring amount on iOS devices
    var DampingAmount = (/(iPad|iPhone|iPod)/g.test(navigator.userAgent)) ? 0.59 : 0.52; // Compensate the reduced spring amount on iOS devices

    var controls = {
        gui: null,

        "Time Step": 0.003,
        "Ks Struct": KsSpringAmount,
        "Ks Shear": KsSpringAmount,
        "Ks Bend": KsSpringAmount,
        "Kd String": KdSpringAmount,
        "Kd Shear": KdSpringAmount,
        "Kd Bend": KdSpringAmount,
        "Wireframe": false,

        "Wind": true,
        "Wind Force X": 0.13,
        "Wind Force Y": 0.11,
        "Wind Force Z": 0.15,
        "Pin 1": true,
        "Pin 2": true,
        "Damping": DampingAmount,
        "Sim Speed": 5,
    };

    this.getTimeStep = function () {
        return controls['Time Step'];
    };

    this.getKsString = function () {
        return controls['Ks Struct'];
    };

    this.getKsShear = function () {
        return controls['Ks Shear'];
    };
    
    this.getKsBend = function () {
        return controls['Ks Bend'];
    };

    this.getKdString = function () {
        return controls['Kd String'];
    };
    
    this.getKdShear = function () {
        return controls['Kd Shear'];
    };
    
    this.getKdBend = function () {
        return controls['Kd Bend'];
    };

    this.getDamping = function () {
        return controls['Damping'];
    };

    this.getWireframe = function () {
        return controls['Wireframe'];
    };
    
    this.getWindForceX = function () {
        if (controls['Wind']) return controls['Wind Force X'];
        return 0.0;
    };

    this.getWindForceY = function () {
        if (controls['Wind']) return controls['Wind Force Y'];
        return 0.0;
    };

    this.getWindForceZ = function () {
        if (controls['Wind']) return controls['Wind Force Z'];
        return 0.0;
    };

    this.getPinRelease = function () {

    };

    this.getPin1 = function () {
        if (controls['Pin 1'])
            return 1.0;
        return -1.0;
    };

    this.getPin2 = function () {
        if (controls['Pin 2'])
            return 1.0;
        return -1.0;
    };

    this.getSimulationSpeed = function () {
        return controls['Sim Speed'];
    };

    this.init = function () {
        controls.gui = new dat.GUI();

        var simulationSettings = controls.gui.addFolder('Simulation settings');
        simulationSettings.add(controls, "Ks Struct");
        simulationSettings.add(controls, "Ks Shear");
        simulationSettings.add(controls, "Ks Bend");
        simulationSettings.add(controls, "Kd String");
        simulationSettings.add(controls, "Kd Shear");
        simulationSettings.add(controls, "Kd Bend");
        simulationSettings.add(controls, "Damping");
        simulationSettings.add(controls, "Wireframe");
       
        var interactionFolder = controls.gui.addFolder('Interactions');
        interactionFolder.add(controls, "Wind");
        interactionFolder.add(controls, "Wind Force X");
        interactionFolder.add(controls, "Wind Force Y");
        interactionFolder.add(controls, "Wind Force Z");
        interactionFolder.add(controls, "Pin 1");
        interactionFolder.add(controls, "Pin 2");
        interactionFolder.add(controls, "Sim Speed").step(1);

        simulationSettings.open();
        interactionFolder.open();
    };
}
