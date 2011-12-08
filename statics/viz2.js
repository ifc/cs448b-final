(function() {
  var DateFormatter, ExtraTerm, SimilarityResult, Viz2;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  SimilarityResult = (function() {
    SimilarityResult.prototype.defaultOptions = {
      startDate: null,
      endDate: null,
      onDragend: function() {
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
      DatabaseInterface.queryOverPeriod(this.term, null, null, $.proxy(this.drawGraph, this));
      return this.loadRelatedData();
    },
    loadRelatedData: function() {
      $('.js_attr_list').empty();
      this.timeSpan = this.mainSparkline ? this.mainSparkline.getDateRange() : {};
      DatabaseInterface.similarEntitiesOverPeriod(this.term, this.timeSpan.start, this.timeSpan.end, $.proxy(this.setRelatedNouns, this), 10);
      return DatabaseInterface.similarAdjectivesOverPeriod(this.term, this.timeSpan.start, this.timeSpan.end, $.proxy(this.setRelatedAdjectives, this), 10);
    },
    drawGraph: function(code, results, duration) {
      $('#js_sparkline_roller').hide();
      if (this.mainSparkline) {
        return this.mainSparkline.setData(results[0]);
      } else {
        return this.mainSparkline = new EnhancedSparkline('#js_main_viz', results[0], {
          onRescale: __bind(function(dateSpan) {
            $('#js_date_start').html(DateFormatter.format(dateSpan.start));
            return $('#js_date_end').html(DateFormatter.format(dateSpan.end));
          }, this),
          onDragend: __bind(function(dateSpan) {
            return this.loadRelatedData();
          }, this)
        });
      }
    },
    setRelatedAdjectives: function(code, results, duration) {
      $('#js_related_adj_roller').hide();
      return this.setListValues('#js_related_adj', results[0]['lemma_'], results[0]['count_']);
    },
    setRelatedNouns: function(code, results, duration) {
      $('#js_related_nouns_roller').hide();
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
  DateFormatter = {
    months: {
      0: 'January',
      1: 'February',
      2: 'March',
      3: 'April',
      4: 'May',
      5: 'June',
      6: 'July',
      7: 'August',
      8: 'September',
      9: 'October',
      10: 'November',
      11: 'December'
    },
    format: function(date) {
      var month;
      month = this.months[date.getMonth()];
      return month + ' ' + date.getFullYear();
    }
  };
  window.Viz2 = Viz2;
  $(function() {
    return Viz2.init();
  });
}).call(this);
