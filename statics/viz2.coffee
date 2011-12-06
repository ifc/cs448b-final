Viz2 =
  init: ->
    @search = $('#js_search_box')
    @search.keyup (event) =>
      @loadData() if event.keyCode == 13
    @loadData()
    
  loadData: ->
    terms = $.trim(@search.val())
    terms = null if terms == ""
    @mainSparkline.clear() if @mainSparkline
    $('#js_related_nouns').empty()
    $('#js_related_adj').empty()
    DatabaseInterface.queryOverPeriod(terms, null, null, $.proxy(@drawGraph, this))
    DatabaseInterface.similarEntitiesOverPeriod(terms, null, null, $.proxy(@setRelatedNouns, this))
    DatabaseInterface.similarAdjectivesOverPeriod(terms, null, null, $.proxy(@setRelatedAdjectives, this))
  
  drawGraph: (code, results, duration) ->
    if @mainSparkline
      @mainSparkline.setData(results[0]) 
    else
      @mainSparkline = new SparklinePlot('#js_main_viz', results[0])
    
  setRelatedAdjectives: (code, results, duration) ->  
    @setListValues('#js_related_adj', results[0]['lemma_'], results[0]['count_'])
      
  setRelatedNouns: (code, results, duration) ->
    @setListValues('#js_related_nouns', results[0]['entity_'], results[0]['count_'])
    
  setListValues: (ul, values, counts) ->
    ul = $(ul)
    for value, i in values
      count = counts[i]
      ul.append $("<li><b>#{value}</b><span>(#{count})</span></li>")
      

window.Viz2 = Viz2
    
$ ->
  Viz2.init()
