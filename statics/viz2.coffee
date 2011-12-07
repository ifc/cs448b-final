
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
    @term = $.trim(@search.val())
    @term = null if @term == ""
    @terms.push(@term)
    @mainSparkline.clear() if @mainSparkline
    $('#js_related_nouns').empty()
    $('#js_related_adj').empty()
    DatabaseInterface.queryOverPeriod(@terms, null, null, $.proxy(@drawGraph, this))
    DatabaseInterface.similarEntitiesOverPeriod(@terms, null, null, $.proxy(@setRelatedNouns, this), 5)
    DatabaseInterface.similarAdjectivesOverPeriod(@terms, null, null, $.proxy(@setRelatedAdjectives, this), 5)
  
  drawGraph: (code, results, duration) ->
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
    ul = $(ul)
    for value, i in values
      count = counts[i]
      new SimilarityResult(ul, value, count, [],
        onClick: (result) =>
          @setTerm(result.term)
          #@addTerm(result.term)
      )
      

window.Viz2 = Viz2
    
$ ->
  Viz2.init()
