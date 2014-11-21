function Body(
        name, texture, radius,
        rot_speed, orb_speed,
        orb_radius, start_point,
        satellites) {
    var body = {};
    var SCALE = 10;

    body._name = name;
    body._texture = texture;
    body._radius = radius / SCALE;
    body._satellites = satellites;
    body._rotSpeed = rot_speed; // SCALE;
    body._orbSpeed = orb_speed; // SCALE;
    body._orbRadius = orb_radius / SCALE;
    body._start = start_point;

    return body;
}

function SolarSystem() {
    var ss = {};

    ss.system = {};

    ss.system.bodies = [
        new Body("Sun", "sunmap.jpg", 6, 20, 0, 0, 0, [
                //      name        texture         rad   rsp  osp  orad   start
            new Body("Mercury", "mercurymap.jpg",   1.5,    1,  12, 20,     40,
                null),
            new Body("Venus",   "venusmap.jpg",     2,     -40,  10, 30,     10,
                null),
            new Body("Earth",   "earthmap1k.jpg",   2,      300, 8, 40,     60,
                [new Body("Moon", "moon.gif", 0.3, 1, 60, 5, 10, null)]),
            new Body("Mars",    "marsmap1k.jpg",    1.2,    1,  6, 60,      90,
                null),
            new Body("Jupiter", "jupitermap.jpg",   4,      3,  7, 90,      0,
                null),
            new Body("Saturn", "saturnmap.jpg",     3.5,    4,  8, 100,     120,
                null),
            new Body("Uranus", "uranusmap.jpg",     2.8,    8,  9, 110,     160,
                null),
            new Body("Neptune", "neptunemap.jpg",   2.8,    8, 10, 120,     220,
                null)
        ])
    ];

    return ss;
}

