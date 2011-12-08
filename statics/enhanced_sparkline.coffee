class EnhancedSparkline extends SparklinePlot
  extraOptions:
    onDragend: -> null
    onRescale: -> null
    startDate: new Date(2000,0)
    endDate: new Date(2010, 11)
    
  constructor: (container, data, options = {}) ->
    super(container, data, options)
    $.extend(@options, @extraOptions, options)
    @container.css('position', 'relative')
    
  draw: ->
    super()
    unless @rangeSelector
      @selectorOffsetLeft = 0
      @selectorWidth = @options.width
      @rangeSelector = $('<div />', {class: 'range_selector'}).appendTo(@container)
      @rangeSelector.css({width: @options.width + 'px', height: (@options.height + 10) + 'px', position: 'absolute', left: 0, top: '-5px'})
      handleCss = 
        position: 'absolute'
        top: (@options.height / 2) + 5
        height: '10px'
        width: '6px'
      @leftHandle = $('<div />', {class: 'handle'}).appendTo(@rangeSelector).css($.extend({left: '-5px'}, handleCss))
      @rightHandle = $('<div />', {class: 'handle'}).appendTo(@rangeSelector).css($.extend({right: '-5px'}, handleCss))
      @leftHandle.mousedown (evt) => @startDrag(evt, @leftHandle)
      @rightHandle.mousedown (evt) => @startDrag(evt, @rightHandle)
          
      $('body').mouseup => 
        if @draggingHandle
          @draggingHandle = false
          @options.onDragend(@getDateRange)
      $('body').mousemove (evt) => 
        if @draggingHandle
          @updateDragging(evt.pageX)
          evt.preventDefault() 
  
  startDrag: (evt, handle) ->
    evt.preventDefault()
    @draggingHandle = handle
    @dragStartProperties = {offsetLeft: @selectorOffsetLeft, width: @selectorWidth}
    @dragStartPos = evt.pageX
  
  updateDragging: (x) ->
    offsetLeft = @dragStartProperties.offsetLeft
    offsetRight = @options.width - (@dragStartProperties.width + offsetLeft)
    maxWidth = if @draggingHandle == @leftHandle then @options.width - offsetRight else @options.width - offsetLeft
    delta = x - @dragStartPos
    delta = -1 * delta if @draggingHandle == @leftHandle
    
    newWidth = @dragStartProperties.width + delta
    newWidth = 10 if newWidth < 10
    newWidth = maxWidth if newWidth > maxWidth
    newOffset = if @draggingHandle == @leftHandle then @dragStartProperties.offsetLeft - delta else @dragStartProperties.offsetLeft
    newOffset = @options.width - 10 if newOffset > @options.width - 10
    newOffset = 0 if newOffset < 0
    @selectorOffsetLeft = newOffset
    @selectorWidth = newWidth
    @rangeSelector.css({left: newOffset + 'px', width: newWidth + 'px'})
    @options.onRescale(@getDateRange())
        
  getDateRange: ->
    startDateNumber = @dateToNumber(@options.startDate)
    maxSpan = @dateToNumber(@options.endDate) - startDateNumber
    spanPercent = @selectorWidth / @options.width
    spanStart = @selectorOffsetLeft / @options.width
    dateRangeSpanNumber = spanPercent * maxSpan
    dateRangeStartNumber = startDateNumber + spanStart * maxSpan
    dateRangeStart = @numberToDate(dateRangeStartNumber)
    dateRangeEnd = @numberToDate(dateRangeStartNumber + dateRangeSpanNumber)
    return {start: dateRangeStart, end: dateRangeEnd}
    
  dateToNumber: (dateObj) ->
    return dateObj.getFullYear() + dateObj.getMonth() / 12
  numberToDate: (number) ->
    month = Math.round((number % 1) * 12)
    year = Math.floor(number)
    return new Date(year, month)
  
window.EnhancedSparkline = EnhancedSparkline