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
      this.sparkline = new HighlightableSparkline(this.graphContainer[0], results[0], {
        height: this.options.graphHeight,
        width: this.options.graphWidth,
        drawTicks: false,
        drawYLabels: false
      });
      if (this.hlSpan) {
        return this.sparkline.highlight(this.hlSpan);
      }
    };
    SimilarityResult.prototype.highlight = function(hlSpan) {
      this.hlSpan = hlSpan;
      if (this.sparkline) {
        return this.sparkline.highlight(this.hlSpan);
      }
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
      this.loadData();
      $('#js_filter_entities').change(__bind(function() {
        if (this.mainSparkline) {
          return this.loadRelatedData();
        }
      }, this));
      return $('#js_filter_newspapers').change(__bind(function() {
        return this.loadData();
      }, this));
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
      DatabaseInterface.query({
        terms: this.term,
        callback: $.proxy(this.drawGraph, this),
        pubid: this.getPubid()
      });
      return this.loadRelatedData();
    },
    loadRelatedData: function() {
      $('.js_attr_list').empty();
      $('#js_related_nouns_roller').show();
      this.loadTimeSpan();
      return DatabaseInterface.similarEntities({
        terms: this.term,
        startDate: this.timeSpan.start,
        endDate: this.timeSpan.end,
        callback: $.proxy(this.setRelatedNouns, this),
        maxResults: 15,
        pubid: this.getPubid(),
        type: this.getEntityType()
      });
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
    loadTimeSpan: function() {
      return this.timeSpan = this.mainSparkline ? this.mainSparkline.getDateRange() : {};
    },
    getEntityType: function() {
      this.filteringEntity = $('input[name=js_filter_entities]:checked').val();
      if (this.filteringEntity === 'all') {
        return null;
      } else {
        return this.filteringEntity;
      }
    },
    getPubid: function() {
      this.pubid = $('input[name=js_filter_newspapers]:checked').val();
      if (this.pubid === 'all') {
        return null;
      } else {
        return this.pubid;
      }
    },
    setRelatedNouns: function(code, results, duration) {
      $('#js_related_nouns_roller').hide();
      $('.js_nouns_list').empty();
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
      var count, currentUl, i, sparkline, value, _len, _results;
      currentUl = $(ul);
      _results = [];
      for (i = 0, _len = values.length; i < _len; i++) {
        value = values[i];
        count = counts[i];
        if (i > 4) {
          currentUl = $(ul + '2');
        }
        if (i > 9) {
          currentUl = $(ul + '3');
        }
        sparkline = new SimilarityResult(currentUl, value, count, [], {
          onClick: __bind(function(result) {
            return this.setTerm(result.term);
          }, this)
        });
        _results.push(sparkline.highlight(this.timeSpan));
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
