function isOnePointZero(n) {
    return typeof n == "string" && n.indexOf('.') != -1 && parseFloat(n) === 1;
}
function isPercentage(n) {
    return typeof n === "string" && n.indexOf('%') != -1;
}
function bound01(n, max) {
    if (isOnePointZero(n)) { n = "100%"; }

    var processPercent = isPercentage(n);
    n = Math.min(max, Math.max(0, parseFloat(n)));

    if (processPercent) {
        n = parseInt(n * max, 10) / 100;
    }

    if ((Math.abs(n - max) < 0.000001)) {
        return 1;
    }

    return (n % max) / parseFloat(max);
}
function pad2(c) {
    return c.length == 1 ? '0' + c : '' + c;
}
function hslToRgb(h, s, l) {
    var r, g, b;

    h = bound01(h, 360);
    s = bound01(s, 100);
    l = bound01(l, 100);

    function hue2rgb(p, q, t) {
        if(t < 0) t += 1;
        if(t > 1) t -= 1;
        if(t < 1/6) return p + (q - p) * 6 * t;
        if(t < 1/2) return q;
        if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    }

    if(s === 0) {
        r = g = b = l; // achromatic
    }
    else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return { r: r * 255, g: g * 255, b: b * 255 };
}
function rgbToHex(r, g, b, allow3Char) {

    var hex = [
        pad2(Math.round(r).toString(16)),
        pad2(Math.round(g).toString(16)),
        pad2(Math.round(b).toString(16))
    ];

    if (allow3Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1)) {
        return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
    }

    return hex.join("");
}

function paintLogo(canvas, hue, height) {
	var rgb_color = hslToRgb((hue+47)%360, 100, 52);
	var hex_color = rgbToHex(rgb_color.r, rgb_color.g, rgb_color.b, false);

	var scale = height / 209.950;
	var width = 704.627 * scale;

	$(canvas).css({"height": Math.round(height) + "px", "width": Math.round(width) + "px"});

	if (!canvas.getContext) return;
	var c = canvas.getContext('2d');

	c.save();

	if (window.devicePixelRatio == 2) {
		canvas.setAttribute('width', Math.round(height*2));
		canvas.setAttribute('height', Math.round(height*2));
		c.scale(2, 2);
	}
	
	c.clearRect(0, 0, canvas.width, canvas.height);

	c.strokeStyle = "black";
	c.globalAlpha = "1.0";
	c.lineWidth = "1";
	c.lineCap = "butt";
	c.lineJoin = "round";
	c.miterLimit = "1";
	// c.setTransform(1, 0.0, 0.0, -1, 0, 200);
	// c.translate(0, height/2);
	c.scale(scale, scale);
	// c.translate(0, -height/2);

	c.fillStyle = "#404040";
	c.beginPath();
	c.moveTo(376.340, 207.010);
	c.lineTo(336.950, 207.010);
	c.lineTo(336.950, 121.930);
	c.lineTo(271.220, 121.930);
	c.lineTo(271.220, 207.010);
	c.lineTo(231.700, 207.010);
	c.lineTo(231.700, 2.940);
	c.lineTo(271.220, 2.940);
	c.lineTo(271.220, 91.100);
	c.lineTo(336.950, 91.100);
	c.lineTo(336.950, 2.940);
	c.lineTo(376.340, 2.940);
	c.lineTo(376.340, 207.010);
	c.closePath();
	c.moveTo(500.920, 162.860);
	c.lineTo(449.900, 162.860);
	c.lineTo(438.410, 207.010);
	c.lineTo(397.200, 207.010);
	c.lineTo(455.090, 2.940);
	c.lineTo(496.010, 2.940);
	c.lineTo(553.900, 207.010);
	c.lineTo(512.550, 207.010);
	c.lineTo(500.920, 162.860);
	c.closePath();
	c.moveTo(458.030, 131.750);
	c.lineTo(492.790, 131.750);
	c.lineTo(475.830, 66.990);
	c.lineTo(474.990, 66.990);
	c.lineTo(458.030, 131.750);
	c.closePath();
	c.moveTo(704.050, 143.660);
	c.lineTo(704.330, 144.500);
	c.bezierCurveTo(704.700, 166.360, 699.120, 182.740, 687.580, 193.620);
	c.bezierCurveTo(676.040, 204.510, 659.570, 209.950, 638.170, 209.950);
	c.bezierCurveTo(616.220, 209.950, 598.790, 203.480, 585.890, 190.540);
	c.bezierCurveTo(573.000, 177.600, 566.550, 159.220, 566.550, 135.390);
	c.lineTo(566.550, 74.840);
	c.bezierCurveTo(566.550, 51.110, 572.790, 32.700, 585.260, 19.620);
	c.bezierCurveTo(597.740, 6.540, 614.580, 0.000, 635.790, 0.000);
	c.bezierCurveTo(658.120, 0.000, 675.270, 5.420, 687.230, 16.260);
	c.bezierCurveTo(699.190, 27.100, 704.980, 43.490, 704.610, 65.450);
	c.lineTo(704.330, 66.290);
	c.lineTo(665.920, 66.290);
	c.bezierCurveTo(665.920, 53.210, 663.610, 44.050, 658.990, 38.820);
	c.bezierCurveTo(654.360, 33.590, 646.630, 30.970, 635.790, 30.970);
	c.bezierCurveTo(625.890, 30.970, 618.460, 34.550, 613.510, 41.700);
	c.bezierCurveTo(608.550, 48.840, 606.080, 59.800, 606.080, 74.560);
	c.lineTo(606.080, 135.390);
	c.bezierCurveTo(606.080, 150.250, 608.740, 161.250, 614.070, 168.400);
	c.bezierCurveTo(619.390, 175.540, 627.430, 179.120, 638.170, 179.120);
	c.bezierCurveTo(647.980, 179.120, 655.040, 176.530, 659.340, 171.340);
	c.bezierCurveTo(663.630, 166.150, 665.780, 156.930, 665.780, 143.660);
	c.lineTo(704.050, 143.660);
	c.closePath();
	c.fill();

	c.fillStyle = hex_color || "#ffca08";
	c.beginPath();
	c.moveTo(14.156, 1.563);
	c.bezierCurveTo(6.326, 1.563, 0.000, 7.920, 0.000, 15.750);
	c.lineTo(0.000, 191.406);
	c.bezierCurveTo(0.000, 199.236, 6.326, 205.563, 14.156, 205.563);
	c.lineTo(138.531, 205.563);
	c.lineTo(138.531, 146.656);
	c.lineTo(138.531, 139.688);
	c.bezierCurveTo(135.746, 143.668, 132.189, 147.672, 127.813, 151.656);
	c.bezierCurveTo(118.524, 159.746, 107.909, 163.781, 95.969, 163.781);
	c.bezierCurveTo(81.506, 163.781, 69.686, 157.815, 60.531, 145.875);
	c.bezierCurveTo(52.174, 134.862, 48.000, 121.864, 48.000, 106.875);
	c.bezierCurveTo(48.000, 103.025, 48.336, 99.159, 49.000, 95.313);
	c.bezierCurveTo(51.652, 78.728, 58.738, 65.340, 70.281, 55.125);
	c.bezierCurveTo(81.161, 45.707, 94.159, 41.448, 109.281, 42.375);
	c.bezierCurveTo(119.897, 42.509, 132.977, 43.463, 148.500, 45.188);
	c.lineTo(148.500, 205.563);
	c.lineTo(189.844, 205.563);
	c.bezierCurveTo(197.674, 205.563, 204.000, 199.236, 204.000, 191.406);
	c.lineTo(204.000, 15.750);
	c.bezierCurveTo(204.000, 7.920, 197.674, 1.563, 189.844, 1.563);
	c.lineTo(14.156, 1.563);
	c.closePath();
	c.moveTo(104.938, 51.875);
	c.bezierCurveTo(94.248, 51.766, 84.551, 55.506, 75.844, 63.094);
	c.bezierCurveTo(70.272, 68.001, 65.901, 74.751, 62.719, 83.375);
	c.bezierCurveTo(59.929, 91.202, 58.531, 99.156, 58.531, 107.250);
	c.bezierCurveTo(58.531, 117.336, 60.659, 126.048, 64.906, 133.344);
	c.bezierCurveTo(72.866, 147.009, 83.034, 153.844, 95.375, 153.844);
	c.bezierCurveTo(104.926, 153.844, 114.001, 150.063, 122.625, 142.500);
	c.bezierCurveTo(133.103, 133.212, 138.398, 120.801, 138.531, 105.281);
	c.bezierCurveTo(138.531, 105.281, 138.531, 88.225, 138.531, 54.125);
	c.bezierCurveTo(121.417, 52.668, 110.940, 51.938, 107.094, 51.938);
	c.bezierCurveTo(106.372, 51.896, 105.650, 51.882, 104.938, 51.875);
	c.closePath();
	c.fill();

	c.restore();
}
