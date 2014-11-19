/**
 * Representation of an orbit
 *  period - time to orbit
 *  velocity - (average) speed of orbit
 *  apoapsis - largest distance from orbited body
 *  periapsis - smallest distance
 */
function Orbit(period, velocity, apoapsis, periapsis) {
    var orbit = {};

    orbit._period = period;
    orbit._velocity = velocity;
    orbit._apoapsis = apoapsis;
    orbit._periapsis = periapsis;

    return orbit;
}

/**
 * Representation of a solar/planetary body
 * http://nssdc.gsfc.nasa.gov/planetary/factsheet/planet_table_ratio.html
 *
 *
 */
function Body(name, texture, radius, rotation_speed, axial_tilt, orbit, has_rings, satellites) {
    var bd = {};

    bd._name = name;
    bd._texture = texture;
    bd._radius = 1.0 * radius;
    bd._rotationSpeed = 1.0 * rotation_speed;
    bd._satellites = satellites;
    bd._orbit = orbit;


    return bd;
}

function SolarSystem() {
    var ss = {};

    ss.system = {};

    ss.system.sun = new Body("Sun", "sunmap.jpg", 12.0, 24.0, 0.0,
            null, // as far as this orrery is concerned, the sun does not orbit anything
            false,
            [
                new Body("Earth", "earthmap1k.jpg", 1.0, 1.0, 1.0, new Orbit(), false,
                    [
                        new Body("Moon", "moon.gif", 0.2724, 1.03, 0.285, new Orbit(), false, null)
                    ])
            ]);

    return ss;
}
