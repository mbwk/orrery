function Body(name, texture, radius, rot_speed, orb_speed, orb_radius, satellites) {
    var body = {};

    body._name = name;
    body._texture = texture;
    body._radius = radius;
    body._satellites = satellites;
    body._rotSpeed = rot_speed;
    body._orbSpeed = orb_speed;

    body.xPos = 0;
    body.yPos = 0;
    body.zPos = 0;

    body._lastXPos = -1;
    body._lastYPos = -1;
    body._lastZPos = -1;

    body.updatePos = function (elapsed) {
        body._lastXPos = body.xPos;
        body._lastYPos = body.yPos;
        body._lastZPos = body.zPos;


    };

    return body;
}

function SolarSystem() {
    var ss = {};

    ss.system = {};

    ss.system.bodies = [
        new Body("Sun", "sunmap.jpg", 10, 24, 0, 4, [
                new Body("Earth", "earthmap1k.jpg", 4, 24, 1, 4, [
                    new Body("Moon", "moon.gif", 24, 1, 4, null)
                ])
        ])
    ];

    ss.update = function(elapsed) {
    };

    return ss;
}
