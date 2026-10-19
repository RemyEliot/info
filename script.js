(function () {
    var cv = document.getElementById("sky");
    var g = cv.getContext("2d");
    var S = [];
    var last = 0;

    function size() {
        cv.width = innerWidth;
        cv.height = innerHeight;
        S = [];

        var n = Math.floor(innerWidth * innerHeight / 6000);

        for (var i = 0; i < n; i++) {
            S.push({
                x: Math.random() * cv.width | 0,
                y: Math.random() * cv.height | 0,
                s: Math.random() < 0.2 ? 4 : 2,
                p: Math.random() * 6.28,
                v: 0.5 + Math.random() * 1.5
            });
        }
    }

    size();
    addEventListener("resize", size);

    function draw(t) {
        var dt = Math.min((t - last) / 1000, 0.1);
        last = t;

        g.clearRect(0, 0, cv.width, cv.height);

        S.forEach(function (o) {
            var sp = (20 + o.s * 8) * dt;
            o.x += sp;
            o.y += sp;

            if (o.x > cv.width) o.x = -4;
            if (o.y > cv.height) o.y = -4;

            var a = 0.25 + 0.75 * Math.abs(
                Math.sin(o.p + t / 1000 * o.v)
            );

            g.globalAlpha = a;
            g.fillStyle = o.s > 2 ? "#c9b8ff" : "#ffffff";
            g.fillRect(o.x, o.y, o.s, o.s);
        });

        g.globalAlpha = 1;
        requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
})();