function main() {
    ss = new SolarSystem();
    rdr = new Renderer();

    var then = Date.now();

    var tick = function () {
        var now = Date.now();
        var elapsed = now - then;

        // ss.update(elapsed);
        rdr.moveCamera(elapsed);
        rdr.render(ss.system.bodies, elapsed);

        then = now;
        requestAnimationFrame(tick());
    };

    requestAnimationFrame(tick);
}

