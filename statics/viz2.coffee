class Viz2
  constructor: () ->
    @mainSparkline = new SparklinePlot('#js_main_viz', 0, 0, 958, 100)
    
$() ->
  new Vis2()
