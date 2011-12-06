#class Viz2
#  constructor: ->
#    @mainSparkline = new SparklinePlot('#js_main_viz', 0, 0, 958, 100)

#window.Vis2 = Vis2
    
$ ->
  data = [1,2,3,4,3,5,4,3,6,4,5,6,5,4,7,5,7,5,4,7,5,6,7,6,6,5,4,6,4,5,6,5,4,6,5,6,5,4,6,4,5,6,5]
  @mainSparkLine = new SparklinePlot('#js_main_viz',data)
