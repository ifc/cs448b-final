(function() {
  var ExtraTerm, SimilarityResult, Viz2;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  SimilarityResult = (function() {
    SimilarityResult.prototype.defaultOptions = {
      startDate: null,
      endDate: null,
      onClick: function() {
        return null;
      },
      graphWidth: 190,
      graphHeight: 20
    };
    function SimilarityResult(parent, term, count, otherTerms, options) {
      this.term = term;
      this.count = count;
      this.otherTerms = otherTerms;
      if (options == null) {
        options = {};
      }
      this.parent = $(parent);
      this.otherTerms.push(term);
      this.options = $.extend({}, this.defaultOptions, options);
      this.scaffold();
      this.loadSparkline();
      this.elm.click(__bind(function() {
        return this.options.onClick(this);
      }, this));
    }
    SimilarityResult.prototype.scaffold = function() {
      var id, textContainer;
      this.elm = $('<li />').appendTo(this.parent);
      textContainer = $("<div />").appendTo(this.elm);
      textContainer.append($('<span/>', {
        "class": 'header',
        text: this.term
      }));
      textContainer.append($('<span/>', {
        "class": 'count',
        text: this.count
      }));
      id = "graph" + (Math.random().toString().slice(2));
      return this.graphContainer = $('<div />', {
        "class": 'minigraph',
        id: id
      }).appendTo(this.elm);
    };
    SimilarityResult.prototype.loadSparkline = function() {
      return DatabaseInterface.queryOverPeriod(this.otherTerms, null, null, $.proxy(this.drawGraph, this));
    };
    SimilarityResult.prototype.drawGraph = function(code, results, duration) {
      return this.mainSparkline = new SparklinePlot(this.graphContainer[0], results[0], {
        height: this.options.graphHeight,
        width: this.options.graphWidth,
        drawTicks: false,
        drawYLabels: false
      });
    };
    return SimilarityResult;
  })();
  ExtraTerm = (function() {
    function ExtraTerm(term, onRemoveCallback) {
      this.term = term;
      this.onRemoveCallback = onRemoveCallback;
      this.draw();
    }
    ExtraTerm.prototype.draw = function() {
      var closeLink;
      this.elm = $('<span />', {
        "class": 'extra_term',
        text: this.term
      }).appendTo($('#js_extra_terms'));
      closeLink = $('<a />', {
        text: 'X'
      }).appendTo(this.elm);
      return closeLink.click(__bind(function(evt) {
        evt.preventDefault();
        this.elm.remove();
        return this.onRemoveCallback(this);
      }, this));
    };
    return ExtraTerm;
  })();
  Viz2 = {
    init: function() {
      this.terms = [];
      this.search = $('#js_search_box');
      this.search.keyup(__bind(function(event) {
        if (event.keyCode === 13) {
          return this.loadData();
        }
      }, this));
      return this.loadData();
    },
    loadData: function() {
      $('.js_roller').show();
      this.term = $.trim(this.search.val());
      if (this.term === "") {
        this.term = null;
      }
      if (this.mainSparkline) {
        this.mainSparkline.clear();
      }
      $('.js_attr_list').empty();
      DatabaseInterface.queryOverPeriod(this.term, null, null, $.proxy(this.drawGraph, this));
      DatabaseInterface.similarEntitiesOverPeriod(this.term, null, null, $.proxy(this.setRelatedNouns, this), 10);
      return DatabaseInterface.similarAdjectivesOverPeriod(this.term, null, null, $.proxy(this.setRelatedAdjectives, this), 10);
    },
    drawGraph: function(code, results, duration) {
      $('#js_sparkline_roller').hide();
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
    addTerm: function(term) {
      new ExtraTerm(term, __bind(function() {
        this.terms.remove(term);
        return this.loadData();
      }, this));
      return this.loadData();
    },
    setTerm: function(term) {
      this.search.val(term);
      return this.loadData();
    },
    setListValues: function(ul, values, counts) {
      var count, currentUl, i, value, _len, _results;
      $('#js_related_roller').hide();
      currentUl = $(ul);
      _results = [];
      for (i = 0, _len = values.length; i < _len; i++) {
        value = values[i];
        count = counts[i];
        if (i > 4) {
          currentUl = $(ul + '2');
        }
        _results.push(new SimilarityResult(currentUl, value, count, [], {
          onClick: __bind(function(result) {
            return this.setTerm(result.term);
          }, this)
        }));
      }
      return _results;
    }
  };
  window.Viz2 = Viz2;
  $(function() {
    return Viz2.init();
  });
}).call(this);
