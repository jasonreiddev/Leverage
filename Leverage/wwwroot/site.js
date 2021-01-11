var width = 0, height = 0;
var line;
var svg;
var path;
var line;
var circle;
var points = [];
var pathLength;
var base;
var newSection;
var currentSection = 'left';
var lastSection = 'lastSectionDefault';
var expirationDate = new Date.setFullYear(expiration_date.getFullYear() + 1).toUTCString();

function writeCookie(name, value) {
    document.cookie = name + "=" + value + "; path=/; expires=" + expirationDate;
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function deleteCookies() {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Wed, 15 Jan 2000 00:00:00 GMT";
    }
}

function drawSVG(p, dotNetObject, addPower) {
    // line to center
    line.attr("x1", p[0]).attr("y1", p[1]).attr("x2", base.cx.baseVal.value).attr("y2", base.cy.baseVal.value - 10);
    // circle
    circle.attr("cx", p[0]).attr("cy", p[1]);

    if (p[0] == points[points.length - 1][0]) {
        newSection = 'left';
    } else if (p[0] == points[0][0]) {
        newSection = 'right';
    } else {
        newSection = 'mid';
    }

    if (currentSection != newSection) {
        //if passing from one side to the other through mid
        if (lastSection != newSection & currentSection == 'mid' & addPower) {
            dotNetObject.invokeMethodAsync('InvokeSVGLeverLocation', 'test');
        }
        lastSection = currentSection;
        currentSection = newSection
    }
}

function closestPoint(pathNode, point) {
    var pathLength = pathNode.getTotalLength(),
        precision = 8,
        best,
        bestLength,
        bestDistance = Infinity;

    // linear scan for coarse approximation
    for (var scan, scanLength = 0, scanDistance; scanLength <= pathLength; scanLength += precision) {
        if ((scanDistance = distance2(scan = pathNode.getPointAtLength(scanLength))) < bestDistance) {
            best = scan, bestLength = scanLength, bestDistance = scanDistance;
        }
    }

    // binary search for precise estimate
    precision /= 2;
    while (precision > 0.5) {
        var before,
            after,
            beforeLength,
            afterLength,
            beforeDistance,
            afterDistance;
        if ((beforeLength = bestLength - precision) >= 0 && (beforeDistance = distance2(before = pathNode.getPointAtLength(beforeLength))) < bestDistance) {
            best = before, bestLength = beforeLength, bestDistance = beforeDistance;
        } else if ((afterLength = bestLength + precision) <= pathLength && (afterDistance = distance2(after = pathNode.getPointAtLength(afterLength))) < bestDistance) {
            best = after, bestLength = afterLength, bestDistance = afterDistance;
        } else {
            precision /= 2;
        }
    }

    best = [best.x, best.y];
    best.distance = Math.sqrt(bestDistance);
    return best;

    function distance2(p) {
        var dx = p.x - point[0],
            dy = p.y - point[1];
        return dx * dx + dy * dy;
    }
}

function DragAlongSVGInitalise(dotNetObject) {
    path = document.getElementById('path')
    pathLength = Math.floor(path.getTotalLength());

    while (pathLength > 0) {
        pt = path.getPointAtLength(pathLength);
        pt.x = Math.round(pt.x);
        pt.y = Math.round(pt.y);

        points.push([pt.x, pt.y]);
        pathLength--;
    }

    width = 960, height = 500;
    line = d3.svg.line().interpolate("cardinal");
    svg = d3.select("#leverSVG").append("svg").attr("width", width).attr("height", height);
    path = svg.append("path").datum(points).attr("d", line);
    line = svg.append("line");
    circle = svg.append("circle").attr("cx", -10).attr("cy", -10).attr("r", 10);

    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .on("mousemove", mousemoved);

    base = document.getElementById('base');

    function mousemoved() {
        var m = d3.mouse(this),
            p = closestPoint(path.node(), m);
        drawSVG(p, dotNetObject, true);
    }

    //start on left
    var p = closestPoint(path.node(), [0, 999]);
    drawSVG(p, null, false);
}

function autoClicker(dotNetObject) {
    //var p1 = closestPoint(path.node(), [0, 999]);
    //drawSVG(p1, null, false);//false incase svg error
    var frame = 0;
        const list = [1, 2, 3, 4, 3, 2, 1]
        const task = async () => {
            for (const item of list) {
                await new Promise(r => setTimeout(r, 100));
                if (list[frame] == 1) {
                    var p1 = closestPoint(path.node(), [0, 999]);
                    drawSVG(p1, null, false);
                    if (frame != 0) {
                        dotNetObject.invokeMethodAsync('InvokeSVGLeverLocation', 'test');

                    }
                    frame++;
                } else if (list[frame] == 2) {
                    var p2 = closestPoint(path.node(), [0, 0]);
                    drawSVG(p2, null, false);
                    frame++;
                    
                } else if (list[frame] == 3) {
                    var p3 = closestPoint(path.node(), [999, 999]);
                    drawSVG(p3, null, false);
                    frame++;
                } else {
                    var p4 = closestPoint(path.node(), [999, 000]);
                    drawSVG(p4, null, false);
                    dotNetObject.invokeMethodAsync('InvokeSVGLeverLocation', 'test');
                    frame++;
                }
            }
        }
        task();
}