var globalCountData = {}; // This is one of the keys to this file. It is a dictionary from sidebar
                          // word to a dictionary to path, data, and color.
var data = [2,3,1,5,6,7,8,9,1,3,7,4]; // This isnt really used. Just for a few props.
var w = 840;
var h = 540;

var colors = [ '#e41a1c',
  '#377eb8',
  '#4daf4a',
  '#984ea3',
  '#ff7f00',
  '#33ff33',
  '#a65628',
  '#f781bf',
  '#999999'
]
var maxNumWords = colors.length;
var activeWordNumber = 0;
var currentView = 'frequency'; // This should be an enum...

function clearCanvas() {
  g.selectAll("line").remove();
  g.selectAll("text").remove();
  g.selectAll("path").remove();
}

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
function getWordListItem(text, color) {
  var ret = 
    "<li> <span class='word-list-item' style='background:" + color + ";'>" + text + 
    "</span><a class='icon-button delete-ci' href='#'><span class='ui-icon ui-icon-closethick' alt='delete'></span></a></li>";
  return ret;
}

function getRandomData(length){
  var ret = [], i;
  for (i = 0; i < length; i++)
    ret.push(Math.floor(Math.random()*11));
  
  return ret;
}

function getAvailableColor() {
  var usedColors = [];
    
  for (var key in globalCountData)
    usedColors.push(globalCountData[key]['color']);
  
  for (var key in colors){
    var index = (key+activeWordNumber)%maxNumWords;
    if ( $.inArray(colors[index], usedColors) == -1 )
      return colors[index];
  }
    
  // If all used up, return a random one?
  return Math.floor(Math.random()*(colors.length));
}

// Add a new list item to the word list. 
function addWordToCurrentList(searchText) {
  // TODO UI STUFF.
  var dataJson = {}; // This would be nice if this could be an object.
  var color = getAvailableColor();
        
  dataJson['data'] = getRandomData(12); // TODO: this will have to be change
  dataJson['color'] = color;
  globalCountData[searchText] = dataJson;
  updateVisualization();
  
  $('#current-words').append(getWordListItem(searchText, color));
  activeWordNumber = activeWordNumber + 1;
  
  // Scroll to the bottom
  $('#current-words').animate({scrollTop: $('#current-words')[0].scrollHeight});
}

function updateVisualization() {
  clearCanvas();
  
  if (currentView == 'frequency')
    drawGlobalCountData();
  else
    drawRelatedData();
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
  var color = 'color' in jsonOptions ? jsonOptions['color'] : 'blue';
  var strokeWidth = 'strokeWidth' in jsonOptions ? jsonOptions['strokeWidth'] : 2;

  var xmax = d3.max(data);
  var ymax = data.length;
  
  var y = d3.scale.linear().domain([0, xmax]).range([0 + margin + yOffset, height - margin + yOffset]);
  var x = d3.scale.linear().domain([0, ymax]).range([0 + margin + xOffset, width - margin + xOffset]);

  // Get the function to draw the line
  var lineFn = getLine(interpolation, tension, x, y);

  var path = g.append("svg:path")
    .attr("d", lineFn(data))
    .attr("style", "stroke:"+color+";stroke-width:"+strokeWidth+"px;");

  // Draw the X axis
  drawGraphAxis(x, y, ymax, xmax);
  
  // Draw the Y axis if necessary
  if (drawLabels)
    drawGraphLabels(x, y, yOffset);
  
  if (drawTicks)
    drawGraphTicks(x, y);
    
  return path;
}

function drawGlobalCountData() {
    var emptyData = false;
    var xmax = -1;
    var ymax = -1;
    var margin = 30;
    var xOffset = 0;
    var yOffset = 0;
    var height = h;
    var width = w;
    
    for (var key in globalCountData) {
      xmax = Math.max( xmax, d3.max( globalCountData[key]['data'] ));
      ymax = Math.max( ymax, globalCountData[key]['data'].length);
    }

    if (xmax == -1 && ymax == -1) {
      xmax = 10; 
      ymax = 10;
      emptyData = true;
    }

    var y = d3.scale.linear().domain([0, xmax]).range([0 + margin + yOffset, height - margin + yOffset]);
    var x = d3.scale.linear().domain([0, ymax]).range([0 + margin + xOffset, width - margin + xOffset]);

    // Get the function to draw the line
    var lineFn = getLine("cardinal", .85, x, y);

    for (var key in globalCountData) {
      var dr = globalCountData[key]['data'];
      var path = g.append("svg:path")
          .attr("d", lineFn(dr))
          .attr("style", "stroke:"+globalCountData[key]['color']+";stroke-width:2px;");

      if ('path' in globalCountData[key])     // if an old path exists, remove it
        globalCountData[key]['path'].remove();

      globalCountData[key]['path'] = path;   // draw the new one
    }

    drawGraphAxis(x, y, ymax, xmax);

    // Draw the axis and ticks
    g.selectAll(".xTicks").remove();
    g.selectAll(".yTicks").remove();
    drawGraphTicks(x, y);
    
    // Draw the Y labels if necessary
    if (!emptyData) {
      g.selectAll(".xLabel").remove();
      g.selectAll(".yLabel").remove();
      drawGraphLabels(x, y, yOffset);
    }
}

function drawRelatedData() {
  // TODO DRAW WITH ACTUAL DATA!
  
  for (var i = 0; i < 16; i++) {
    var xOffset = 25 + (i%4) * 200;
    var yOffset = 25 + Math.floor(i/4) * 135;
    var data = getRandomData(12); // TODO
    var path = drawGraph(data, xOffset, yOffset, 135, 80, sparkLineJson);
    
    g.append("svg:text")
        .text("BARBAR") // REPLACE BARBAR with word text
        .attr("class", "barbar")
        .attr("y", yOffset-h)
        .attr("x", xOffset)
  }
}

function initRadioSwitch() {
  $('#radio-wrap').buttonset();
  $('#radio-freq').click(function() {
    
    // STUPID jquery ui seems to not be working... lets do this manually
    $(this).parent().find("label").each(function() {
      if ( $(this).attr("for") == "radio-freq" ) {
        $(this).addClass("ui-state-active");
      } else if ( $(this).attr("for") == "radio-related" ) {
        $(this).removeClass("ui-state-active");
      }
    });
    
    currentView = 'frequency';
    updateVisualization();
    
    return false;
  });
  $('#radio-related').click(function() {
    
    // STUPID jquery ui seems to not be working... lets do this manually
    $(this).parent().find("label").each(function() {
      if ( $(this).attr("for") == "radio-related" ) {
        $(this).addClass("ui-state-active");
      } else if ( $(this).attr("for") == "radio-freq" ) {
        $(this).removeClass("ui-state-active");
      }
    });
    
    currentView = 'related';
    updateVisualization();
    
    return false;
  });
}

function initSidebar() {
  // Bind a click to the 'delete current word item' button
  $('.delete-ci').live("click", function() {
    // TODO UI STUFF

    // Check to see if we have a path object for this word.
    var text = $(this).closest("li").find("span.word-list-item").text();
    if (text in globalCountData) {
      globalCountData[text]['path'].remove();
      delete globalCountData[text];
    }
    updateVisualization();
        
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
        
        if ($('#current-words').find("li").length >= maxNumWords )
          alert("Sorry you have too many active words :(");
        else if (shouldAppend)
          addWordToCurrentList(searchText);

        // Clear the search box
        $('#search-box').val('');
      }
    }
  });
  
  initRadioSwitch();
}
initSidebar();

var sparkLineJson = {
  'interpolation': 'linear',
  'drawLabels'   : false,
  'drawTicks'    : false,
  'margin'       : 0,
  'color'        : 'red',
  'strokeWidth'  : 1
};
//drawGraph(data, 100, 400, 125, 75, sparkLineJson);
//drawGraph(data, 500, 100, 155, 125, sparkLineJson);

var bigJson = {
  'interpolation': 'cardinal',
  'tension'      : 0.75,
  'drawLabels'   : true,
  'drawTicks'    : true,
  'margin'       : 30
};
//drawGraph(data, 0, 0, w, h, bigJson);

updateVisualization(); // Just draw axis for now.