(function() {
  var Viz2;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Viz2 = {
    init: function() {
      this.search = $('#js_search_box');
      this.search.keyup(__bind(function(event) {
        if (event.keyCode === 13) {
          return this.loadData();
        }
      }, this));
      return this.loadData();
    },
    loadData: function() {
      var terms;
      terms = $.trim(this.search.val());
      if (terms === "") {
        terms = null;
      }
      if (this.mainSparkline) {
        this.mainSparkline.clear();
      }
      $('#js_related_nouns').empty();
      $('#js_related_adj').empty();
      DatabaseInterface.queryOverPeriod(terms, null, null, $.proxy(this.drawGraph, this));
      DatabaseInterface.similarEntitiesOverPeriod(terms, null, null, $.proxy(this.setRelatedNouns, this));
      return DatabaseInterface.similarAdjectivesOverPeriod(terms, null, null, $.proxy(this.setRelatedAdjectives, this));
    },
    drawGraph: function(code, results, duration) {
      if (this.mainSparkline) {
        return this.mainSparkline.setData(results[0]);
      } else {
        return this.mainSparkline = new SparklinePlot('#js_main_viz', results[0]);
      }
    },
    setRelatedAdjectives: function(code, results, duration) {
      return this.setListValues('#js_related_adj', results[0]['lemma_'], results[0]['count_']);
    },
    setRelatedNouns: function(code, results, duration) {
      return this.setListValues('#js_related_nouns', results[0]['entity_'], results[0]['count_']);
    },
    setListValues: function(ul, values, counts) {
      var count, i, value, _len, _results;
      ul = $(ul);
      _results = [];
      for (i = 0, _len = values.length; i < _len; i++) {
        value = values[i];
        count = counts[i];
        _results.push(ul.append($("<li><b>" + value + "</b><span>(" + count + ")</span></li>")));
      }
      return _results;
    }
  };
  window.Viz2 = Viz2;
  $(function() {
    return Viz2.init();
  });
}).call(this);
