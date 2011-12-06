(function() {
  var SparklinePlot;
  SparklinePlot = (function() {
    function SparklinePlot(container, data, xOffset, yOffset, width, height, options) {
      this.container = container;
      this.data = data;
      this.xOffset = xOffset;
      this.yOffset = yOffset;
      this.width = width;
      this.height = height;
      if (options == null) {
        options = {};
      }
      this.viz = d3.select(this.container).append("svg:svg").attr("width", this.width).attr("height", this.height);
      this.g = this.vis.append("svg:g").attr("transform", "translate(0, " + this.height + ")");
      this.options = $.extend({}, this.defaultOptions, options);
      this.setData(this.data);
    }
    SparklinePlot.prototype.defaultOptions = {
      interpolation: 'linear',
      tension: 1,
      drawLabels: false,
      drawTicks: false,
      margin: 0,
      color: 'blue',
      strokeWidth: 2
    };
    SparklinePlot.prototype.setData = function(data) {
      var xScaleBounds, yScaleBounds;
      this.data = data;
      this.xmax = d3.max(this.data);
      this.ymax = data.length;
      yScaleBounds = [0 + this.options.margin + this.options.yOffset, this.options.height - this.options.margin + this.options.yOffset];
      xScaleBounds = [0 + this.options.margin + this.options.xOffset, this.options.width - this.options.margin + this.options.xOffset];
      this.yScale = d3.scale.linear().domain([0, this.xmax]).range(yScaleBounds);
      this.xScale = d3.scale.linear().domain([0, this.ymax]).range(xScaleBounds);
      return this.draw();
    };
    SparklinePlot.prototype.draw = function() {
      var lineFn, path;
      lineFn = this.getLine(this.options.interpolation, this.options.tension, this.xScale, this.yScale);
      path = this.g.append("svg:path").attr("d", lineFn(this.data)).attr("style", "stroke: " + color + "; stroke-width: " + strokeWidth + "px;");
      this.drawGraphAxis(this.xScale, this.yScale, this.ymax, this.xmax);
      if (this.options.drawLabels) {
        this.drawGraphLabels(this.xScale, this.yScale, this.options.yOffset);
      }
      if (this.options.drawTicks) {
        this.drawGraphTicks(this.xScale, this.yScale);
      }
      return path;
    };
    SparklinePlot.prototype.getList = function(interpolation, tension, xfn, yfn) {
      return d3.svg.line().x(function(d, i) {
        return xfn(i);
      }).y(function(d) {
        return -1 * yfn(d);
      }).interpolate(interpolation).tension(tension);
    };
    SparklinePlot.prototype.clearCanvas = function() {
      this.g.selectAll("line").remove();
      this.g.selectAll("text").remove();
      return this.g.selectAll("path").remove();
    };
    SparklinePlot.prototype.drawGraphTicks = function(xfn, yfn) {
      this.g.selectAll(".xTicks").data(xfn.ticks(5)).enter().append("svg:line").attr("class", "xTicks").attr("x1", function(d) {
        return xfn(d);
      }).attr("y1", -1 * yfn(0)).attr("x2", function(d) {
        return xfn(d);
      }).attr("y2", -1 * yfn(-0.2));
      return this.g.selectAll(".yTicks").data(yfn.ticks(4)).enter().append("svg:line").attr("class", "yTicks").attr("y1", function(d) {
        return -1 * yfn(d);
      }).attr("x1", xfn(-0.2)).attr("y2", function(d) {
        return -1 * yfn(d);
      }).attr("x2", xfn(0));
    };
    SparklinePlot.prototype.drawGraphLabels = function(xfn, yfn, yOffset) {
      this.g.selectAll(".xLabel").data(xfn.ticks(5)).enter().append("svg:text").attr("class", "xLabel").text(String).attr("x", function(d) {
        return xfn(d);
      }).attr("y", -1 * yOffset).attr("text-anchor", "middle");
      return this.g.selectAll(".yLabel").data(yfn.ticks(4)).enter().append("svg:text").attr("class", "yLabel").text(String).attr("y", function(d) {
        return -1 * yfn(d);
      }).attr("text-anchor", "right").attr("dy", 4);
    };
    SparklinePlot.prototype.drawGraphAxis = function(xfn, yfn, maxX, maxY) {
      this.g.append("svg:line").attr("x1", xfn(0)).attr("y1", -1 * yfn(0)).attr("x2", xfn(maxX)).attr("y2", -1 * yfn(0));
      return this.g.append("svg:line").attr("x1", xfn(0)).attr("y1", -1 * yfn(0)).attr("x2", xfn(0)).attr("y2", -1 * yfn(maxY));
    };
    return SparklinePlot;
  })();
  window.SparklinePlot = SparklinePlot;
}).call(this);
