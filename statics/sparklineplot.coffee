class SparklinePlot
  constructor: (@container, @data, @xOffset, @yOffset, @width, @height, options = {}) ->
    @viz = d3.select(@container)
        .append("svg:svg")
        .attr("width", @width)
        .attr("height", @height)
    @g = @vis.append("svg:g").attr("transform", "translate(0, #{@height})")
    @options = $.extend({}, @defaultOptions, options)
    @setData(@data)

  defaultOptions:
    interpolation: 'linear'
    tension: 1
    drawLabels: false
    drawTicks: false
    margin: 0
    color: 'blue'
    strokeWidth: 2 

  setData: (@data) ->
    @xmax = d3.max(@data)
    @ymax = data.length
    yScaleBounds = [0 + @options.margin + @options.yOffset, @options.height - @options.margin + @options.yOffset]
    xScaleBounds = [0 + @options.margin + @options.xOffset, @options.width - @options.margin + @options.xOffset]
    @yScale = d3.scale.linear().domain([0, @xmax]).range(yScaleBounds)
    @xScale = d3.scale.linear().domain([0, @ymax]).range(xScaleBounds)
    @draw()
    
  draw: () ->
    lineFn = @getLine(@options.interpolation, @options.tension, @xScale, @yScale)
    path = @g.append("svg:path")
        .attr("d", lineFn(@data))
        .attr("style", "stroke: #{color}; stroke-width: #{strokeWidth}px;");

    #Draw the X axis
    @drawGraphAxis(@xScale, @yScale, @ymax, @xmax)
    
    #Draw the Y axis if necessary
    @drawGraphLabels(@xScale, @yScale, @options.yOffset) if @options.drawLabels    
    @drawGraphTicks(@xScale, @yScale) if @options.drawTicks
    return path
    
  getList: (interpolation, tension, xfn, yfn) ->
    d3.svg.line()
      .x((d,i) -> xfn(i))
      .y((d) -> -1 * yfn(d))
      .interpolate(interpolation)
      .tension(tension)
  
  clearCanvas: () ->
    @g.selectAll("line").remove()
    @g.selectAll("text").remove()
    @g.selectAll("path").remove()
    
  drawGraphTicks: (xfn, yfn) ->
    @g.selectAll(".xTicks")
        .data(xfn.ticks(5))
        .enter().append("svg:line")
        .attr("class", "xTicks")
        .attr("x1", (d) -> xfn(d))
        .attr("y1", -1 * yfn(0))
        .attr("x2", (d) -> xfn(d))
        .attr("y2", -1 * yfn(-0.2))
    
    @g.selectAll(".yTicks")
        .data(yfn.ticks(4))
        .enter().append("svg:line")
        .attr("class", "yTicks")
        .attr("y1", (d) -> -1 * yfn(d))
        .attr("x1", xfn(-0.2))
        .attr("y2", (d) -> -1 * yfn(d))
        .attr("x2", xfn(0))
        
  drawGraphLabels: (xfn, yfn, yOffset) ->
    @g.selectAll(".xLabel")
        .data(xfn.ticks(5))
        .enter().append("svg:text")
        .attr("class", "xLabel")
        .text(String)
        .attr("x", (d) -> xfn(d))
        .attr("y", -1*yOffset)
        .attr("text-anchor", "middle")
  
    @g.selectAll(".yLabel")
        .data(yfn.ticks(4))
        .enter().append("svg:text")
        .attr("class", "yLabel")
        .text(String)
        .attr("y", (d) -> -1 * yfn(d))
        .attr("text-anchor", "right")
        .attr("dy", 4)
  
  drawGraphAxis: (xfn, yfn, maxX, maxY) ->
    #Draw the X axis
    @g.append("svg:line")
        .attr("x1", xfn(0))
        .attr("y1", -1 * yfn(0))
        .attr("x2", xfn(maxX))
        .attr("y2", -1 * yfn(0))
  
    #Draw the Y axis
    @g.append("svg:line")
        .attr("x1", xfn(0))
        .attr("y1", -1 * yfn(0))
        .attr("x2", xfn(0))
        .attr("y2", -1 * yfn(maxY))
        
window.SparklinePlot = SparklinePlot