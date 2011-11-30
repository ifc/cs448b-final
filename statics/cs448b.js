var data = [3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 7];
var w = 950;
var h = 500;
var margin = 40;
var xOffset = 20;

var y = d3.scale.linear().domain([0, d3.max(data)]).range([0 + margin, h - margin]);
var x = d3.scale.linear().domain([0, data.length]).range([0 + margin + xOffset, w - margin + xOffset]);

var vis = d3.select("#chart")
  .append("svg:svg")
  .attr("width", w)
  .attr("height", h);

var g = vis.append("svg:g").attr("transform", "translate(0, " + h + ")");

var line = d3.svg.line()
    .x(function(d,i) { return x(i); })
    .y(function(d) { return -1 * y(d); });

// Get a line function with 'interpolation' interpolation ('linear', 'cardinal', 'step-before', etc.)
function getLine(interpolation) {
  return d3.svg.line()
    .x(function(d,i) { return x(i); })
    .y(function(d) { return -1 * y(d); })
    .interpolate(interpolation)
    .tension(.75);
}

var liner = getLine("cardinal");
//var liner = getLine("linear");

// Draw the line
g.append("svg:path").attr("d", liner(data))

// Draw the X axis
g.append("svg:line")
    .attr("x1", x(0))
    .attr("y1", -1 * y(0))
    .attr("x2", x(w))
    .attr("y2", -1 * y(0))

// Draw the Y axis
g.append("svg:line")
    .attr("x1", x(0))
    .attr("y1", -1 * y(0))
    .attr("x2", x(0))
    .attr("y2", -1 * y(d3.max(data)))

g.selectAll(".xLabel")
    .data(x.ticks(5))
    .enter().append("svg:text")
    .attr("class", "xLabel")
    .text(String)
    .attr("x", function(d) { return x(d) })
    .attr("y", 0)
    .attr("text-anchor", "middle")

g.selectAll(".yLabel")
    .data(y.ticks(4))
    .enter().append("svg:text")
    .attr("class", "yLabel")
    .text(String)
    .attr("x", xOffset)
    .attr("y", function(d) { return -1 * y(d) })
    .attr("text-anchor", "right")
    .attr("dy", 4)

g.selectAll(".xTicks")
    .data(x.ticks(5))
    .enter().append("svg:line")
    .attr("class", "xTicks")
    .attr("x1", function(d) { return x(d); })
    .attr("y1", -1 * y(0))
    .attr("x2", function(d) { return x(d); })
    .attr("y2", -1 * y(-0.3));

g.selectAll(".yTicks")
    .data(y.ticks(4))
    .enter().append("svg:line")
    .attr("class", "yTicks")
    .attr("y1", function(d) { return -1 * y(d); })
    .attr("x1", x(-0.3))
    .attr("y2", function(d) { return -1 * y(d); })
    .attr("x2", x(0));