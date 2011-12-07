
class SimilarityResult
  defaultOptions:
    startDate: null
    endDate: null
    onClick: () -> null
    graphWidth: 190
    graphHeight: 20
  
  constructor: (parent, @term, @count, @otherTerms, options = {}) ->
    @parent = $(parent)
    @otherTerms.push(term)
    @options = $.extend({}, @defaultOptions, options)
    @scaffold()
    @loadSparkline()
    @elm.click =>
      @options.onClick(this)
    
  scaffold: ->
    @elm = $('<li />').appendTo @parent
    textContainer = $("<div />").appendTo @elm
    textContainer.append $('<span/>', {class: 'header', text: @term})
    textContainer.append $('<span/>', {class: 'count', text: @count})
    id = "graph#{Math.random().toString().slice(2)}"
    @graphContainer = $('<div />', {class: 'minigraph', id: id}).appendTo @elm
      
  loadSparkline: ->
    DatabaseInterface.queryOverPeriod(@otherTerms, null, null, $.proxy(@drawGraph, this))
    
  drawGraph: (code, results, duration) ->
    @mainSparkline = new SparklinePlot(@graphContainer[0], results[0] ,
      height: @options.graphHeight
      width: @options.graphWidth
      drawTicks: false
      drawYLabels: false
    )
    
class ExtraTerm
  constructor: (@term, @onRemoveCallback) ->
    @draw()
    
  draw: ->
    @elm = $('<span />', {class: 'extra_term', text: @term}).appendTo $('#js_extra_terms')
    closeLink = $('<a />', {text: 'X'}).appendTo @elm
    closeLink.click (evt) =>
      evt.preventDefault()
      @elm.remove()
      @onRemoveCallback(this)

######################### Main Object for Viz2 #######################################

Viz2 =
  init: ->
    @terms = []
    @search = $('#js_search_box')
    @search.keyup (event) =>
      @loadData() if event.keyCode == 13
    @loadData()
    
  loadData: ->
    $('.js_roller').show()
    @term = $.trim(@search.val())
    @term = null if @term == ""
    #@terms.push(@term)
    @mainSparkline.clear() if @mainSparkline
    $('.js_attr_list').empty()
    DatabaseInterface.queryOverPeriod(@term, null, null, $.proxy(@drawGraph, this))
    DatabaseInterface.similarEntitiesOverPeriod(@term, null, null, $.proxy(@setRelatedNouns, this), 10)
    DatabaseInterface.similarAdjectivesOverPeriod(@term, null, null, $.proxy(@setRelatedAdjectives, this), 10)
  
  drawGraph: (code, results, duration) ->
    $('#js_sparkline_roller').hide()
    if @mainSparkline
      @mainSparkline.setData(results[0]) 
    else
      @mainSparkline = new SparklinePlot('#js_main_viz', results[0])
    
  setRelatedAdjectives: (code, results, duration) ->
    @setListValues('#js_related_adj', results[0]['lemma_'], results[0]['count_'])
      
  setRelatedNouns: (code, results, duration) ->
    @setListValues('#js_related_nouns', results[0]['entity_'], results[0]['count_'])
    
  addTerm: (term) ->
      new ExtraTerm term, =>
        @terms.remove(term)
        @loadData()
      @loadData()
  
  setTerm: (term) ->
    @search.val(term)
    @loadData()
    
  setListValues: (ul, values, counts) ->
    $('#js_related_roller').hide()
    currentUl = $(ul)
    for value, i in values
      count = counts[i]
      currentUl = $(ul + '2') if i > 4
      new SimilarityResult(currentUl, value, count, [],
        onClick: (result) =>
          @setTerm(result.term)
          #@addTerm(result.term)
      )
      

window.Viz2 = Viz2
    
$ ->
  Viz2.init()
