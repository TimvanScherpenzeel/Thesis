var GUI = function (mobile) {

    if(mobile){
        var KsSpringAmount = 5000; // Spring amount over 10K is problamatic on iOS devices
        var KdSpringAmount = 8; // Compensate for the reduced spring amount on iOS devices
        var DampingAmount = 0.52; // Compensate the reduced spring amount on iOS devices
    } else {
        var KsSpringAmount = 15000; // Spring amount over 10K is problamatic on iOS devices
        var KdSpringAmount = 1; // Compensate for the reduced spring amount on iOS devices
        var DampingAmount = 0.59; // Compensate the reduced spring amount on iOS devices
    }

    var controls = {
        GUI: null,

        "Time Step": 0.003,
        "Ks Struct": KsSpringAmount,
        "Ks Shear": KsSpringAmount,
        "Ks Bend": KsSpringAmount,
        "Kd Struct": KdSpringAmount,
        "Kd Shear": KdSpringAmount,
        "Kd Bend": KdSpringAmount,
        "Damping": DampingAmount,
        "Mass": 0.65, // average weight of a Hermes scarf
        "Wireframe": false,

        "Wind": true,
        "Wind Force X": 0.13,
        "Wind Force Y": 0.11,
        "Wind Force Z": 0.15,
        "Pin 1": true,
        "Pin 2": true,
        "Sim Speed": 5,
    };

    this.getTimeStep = function () {
        return controls['Time Step'];
    };

    this.getKsStruct = function () {
        return controls['Ks Struct'];
    };

    this.getKsShear = function () {
        return controls['Ks Shear'];
    };
    
    this.getKsBend = function () {
        return controls['Ks Bend'];
    };

    this.getKdStruct = function () {
        return controls['Kd Struct'];
    };
    
    this.getKdShear = function () {
        return controls['Kd Shear'];
    };
    
    this.getKdBend = function () {
        return controls['Kd Bend'];
    };

    this.getMass = function () {
        return controls['Mass'];
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
        controls.GUI = new dat.GUI();

        var simulationSettings = controls.GUI.addFolder('Simulation settings');
        simulationSettings.add(controls, "Time Step");
        simulationSettings.add(controls, "Ks Struct");
        simulationSettings.add(controls, "Ks Shear");
        simulationSettings.add(controls, "Ks Bend");
        simulationSettings.add(controls, "Kd Struct");
        simulationSettings.add(controls, "Kd Shear");
        simulationSettings.add(controls, "Kd Bend");
        simulationSettings.add(controls, "Damping");
        simulationSettings.add(controls, "Mass");
        simulationSettings.add(controls, "Wireframe");
       
        var interactionFolder = controls.GUI.addFolder('Interactions');
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
