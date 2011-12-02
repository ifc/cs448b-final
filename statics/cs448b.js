var data = [3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 7];
var w = 840;
var h = 540;

// Get a line function with 'interpolation' interpolation ('linear', 'cardinal', 'step-before', etc.)
function getLine(interpolation, tension, xfn, yfn) {
  return d3.svg.line()
    .x(function(d,i) { return xfn(i); })
    .y(function(d) { return -1 * yfn(d); })
    .interpolate(interpolation)
    .tension(tension);
}

// Draw a graphs labels given its x function, y function, maxX value, and max Y value
function drawGraphAxis(xfn, yfn, maxX, maxY) {
  // Draw the X axis
  g.append("svg:line")
      .attr("x1", xfn(0))
      .attr("y1", -1 * yfn(0))
      .attr("x2", xfn(maxX))
      .attr("y2", -1 * yfn(0))

  // Draw the Y axis
  g.append("svg:line")
      .attr("x1", xfn(0))
      .attr("y1", -1 * yfn(0))
      .attr("x2", xfn(0))
      .attr("y2", -1 * yfn(maxY))
}

function drawGraphLabels(xfn, yfn, yOffset) {
  // Draw the x labels
  g.selectAll(".xLabel")
      .data(xfn.ticks(5))
      .enter().append("svg:text")
      .attr("class", "xLabel")
      .text(String)
      .attr("x", function(d) { return xfn(d) })
      .attr("y", -1*yOffset)
      .attr("text-anchor", "middle")

  // Draw the y labels
  g.selectAll(".yLabel")
      .data(yfn.ticks(4))
      .enter().append("svg:text")
      .attr("class", "yLabel")
      .text(String)
      .attr("y", function(d) { return -1 * yfn(d) })
      .attr("text-anchor", "right")
      .attr("dy", 4)
}

function drawGraphTicks(xfn, yfn) {
  // Draw the x ticks 
  g.selectAll(".xTicks")
      .data(xfn.ticks(5))
      .enter().append("svg:line")
      .attr("class", "xTicks")
      .attr("x1", function(d) { return xfn(d); })
      .attr("y1", -1 * yfn(0))
      .attr("x2", function(d) { return xfn(d); })
      .attr("y2", -1 * yfn(-0.2));
  
  // Draw the y ticks
  g.selectAll(".yTicks")
      .data(yfn.ticks(4))
      .enter().append("svg:line")
      .attr("class", "yTicks")
      .attr("y1", function(d) { return -1 * yfn(d); })
      .attr("x1", xfn(-0.2))
      .attr("y2", function(d) { return -1 * yfn(d); })
      .attr("x2", xfn(0));
}

// Get the html for a word item in the current word list
function getWordListItem(text) {
  var ret = 
    "<li> <span class='word-list-item'>" + text + 
    "</span><a class='icon-button delete-ci' href='#'><span class='ui-icon ui-icon-closethick' alt='delete'></span></a></li>";
  return ret;
}

// Add a new list item to the word list. 
function addWordToCurrentList(searchText) {
  $('#current-words').append(getWordListItem(searchText));

  // TODO UI STUFF.

  // Scroll to the bottom
  $('#current-words').animate({scrollTop: $('#current-words')[0].scrollHeight});
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

// Init the svg canvas
var vis = d3.select("#chart")
  .append("svg:svg")
  .attr("width", w)
  .attr("height", h);

var g = vis.append("svg:g").attr("transform", "translate(0, " + h + ")");

//function draftGraph(data, interpolation, tension, xOffset, yOffset, width, height, margin, drawLabels) {
function drawGraph(data, xOffset, yOffset, width, height, jsonOptions) {
  var interpolation = 'interpolation' in jsonOptions ? jsonOptions['interpolation'] : 'linear';
  var tension = 'tension' in jsonOptions ? jsonOptions['tension'] : 1;
  var drawLabels = 'drawLabels' in jsonOptions ? jsonOptions['drawLabels'] : false;
  var drawTicks = 'drawTicks' in jsonOptions ? jsonOptions['drawTicks'] : false;
  var margin = 'margin' in jsonOptions ? jsonOptions['margin'] : 0;
  var pathClass = 'pathClass' in jsonOptions ? jsonOptions['pathClass'] : 'big';
  
  var y = d3.scale.linear().domain([0, d3.max(data)]).range([0 + margin + yOffset, height - margin + yOffset]);
  var x = d3.scale.linear().domain([0, data.length]).range([0 + margin + xOffset, width - margin + xOffset]);

  // Get the function to draw the line
  var lineFn = getLine(interpolation, tension, x, y);

  // Draw the line
  g.append("svg:path")
    .attr("d", lineFn(data))
    .attr("class", pathClass)

  // Draw the X axis
  drawGraphAxis(x, y, data.length, d3.max(data));
  
  // Draw the Y axis if necessary
  if (drawLabels)
    drawGraphLabels(x, y, yOffset);
  
  if (drawTicks)
    drawGraphTicks(x, y);
}

function initSidebar() {
  // Bind a click to the 'delete current word item' button
  $('.delete-ci').live("click", function() {
    // TODO UI STUFF
    $(this).closest("li").remove();
    return false;
  });
  
  $("#search-box").keyup(function(event){
    if(event.keyCode == 13){
      var searchText = $.trim( $('#search-box').val() );
            
      if (searchText.length > 0) {
        // Check to see if it was already entered.
        var shouldAppend = true;
        $('#current-words li').each( function() {
          if ($(this).find("span.word-list-item").text().toLowerCase() == searchText.toLowerCase())
            shouldAppend = false;
        });
        
        if (shouldAppend)
          addWordToCurrentList(searchText);

        // Clear the search box
        $('#search-box').val('');
      }
    }
  });
}

initSidebar();

var sparkLineJson = {
  'interpolation': 'linear',
  'drawLabels'   : false,
  'drawTicks'    : false,
  'margin'       : 0,
  'pathClass'    : 'sparkline'
};
drawGraph(data, 100, 400, 125, 75, sparkLineJson);
drawGraph(data, 500, 100, 155, 125, sparkLineJson);


var bigJson = {
  'interpolation': 'cardinal',
  'tension'      : 0.75,
  'drawLabels'   : true,
  'drawTicks'    : true,
  'margin'       : 30
};
drawGraph(data, 0, 0, w, h, bigJson);