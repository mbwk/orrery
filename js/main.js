function main() {
    ss = new SolarSystem();
    rdr = new Renderer();

    // rdr.prepareSphere(ss.system.bodies[0]._satellites[0]);
    rdr.prepareSystem(ss.system.bodies, rdr.spheres);

    var then = Date.now();

    var tick = function () {
        window.requestAnimationFrame(function () {
            tick();
        });
        var now = Date.now();
        var elapsed = now - then;

        rdr.render(elapsed);

        then = now;
    };

    window.requestAnimationFrame(tick);
}

