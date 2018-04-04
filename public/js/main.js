
function _debounce(fn, time) {
  var ctx = this, timer = null;
  var innerFn = function(args) { fn.apply(ctx, args) };

  var debouncedFn = function() {
    var args = arguments;
    if(timer) { clearTimeout(timer); }
    timer = setTimeout(function() { innerFn(args) }, time);
  };

  // all callers to skip the delay
  debouncedFn.callImmediately = function() {
    clearTimeout(timer);
    innerFn(arguments);
  };

  return debouncedFn;
}

function _throttle(fn, time) {
  var ctx = this, timer = null, throttling = false;
  var throttledFn = function() {
    if(!throttling) {
      fn.apply(ctx, arguments);
      throttling = true;
    }

    if(timer) { clearTimeout(timer); }
    timer = setTimeout(function() { throttling = false; }, time);
  };

  // allow callers to clear the throttling
  throttledFn.clearThrottle = function() {
    throttling = false;
  };

  return throttledFn;
}


(function start() {
  var colorIdx = 0;

  var quoteContainerOuterEl = document.querySelector('.quote-outer');
  var quoteContainerEl = document.querySelector('.quote-container');
  var quoteTextEl = document.querySelector('.quote-text');
  var authorEl = document.querySelector('.author');
  var loadingEl = document.querySelector('.loading');

  var loadQuoteThrottled = _throttle(loadQuote, 500);

  // load new quote by default
  loadQuoteThrottled();

  // add handlers for share and new quote
  document.querySelector('.share').addEventListener('click', shareQuote);
  document.querySelector('.new-quote').addEventListener('click', loadQuoteThrottled);
  quoteContainerOuterEl.addEventListener('transitionend', updateTransitionEnd);

  function loadQuote() {
    quoteContainerEl.style.opacity = 0;

    // show a loading indicator if the api is taking a while to come back.  (might need to spin up)
    var loadingTimeout = setTimeout(function showLoader() {
      loadingEl.style.display = "block";
    }, 400);

    fetch('https://seinfeld-quotes.herokuapp.com/random')
        .then(function(response) {
          return response.json();
        })
        .catch(function error(error) {
          console.error('Error:', error);
        })
        .then(function(json) {
          // slow it down to allow some transition magic
          setTimeout(function doUpdate() {
            clearTimeout(loadingTimeout);
            loadingEl.style.display = "none";
            quoteContainerEl.style.opacity = 1;

            if(json) {
              updateQuote(json);
            }
            else {
              quoteTextEl.textContent = "Sorry there was a problem loading :-(";
              authorEl.textContent = "Your browser"
            }
            }, 700);
        });
  }

  function updateQuote(json) {
    // adjust the font size based on text length
    quoteTextEl.classList.remove('smaller-quote-text', 'smallest-quote-text');

    if(json.quote.length > 200) {
      quoteTextEl.classList.add('smallest-quote-text');
    }
    else if(json.quote.length > 100) {
      quoteTextEl.classList.add('smaller-quote-text');
    }

    // update the text, with measurements to allow a height transition
    var oldQuoteOuterHeight = getComputedStyle(quoteContainerOuterEl).height;

    quoteTextEl.textContent = json.quote;
    authorEl.textContent = json.author;
    authorEl.title = 'Season ' + json.season + ' Episode ' + json.episode;

    quoteContainerOuterEl.style.height = '';  // auto to calc height
    var newQuoteOuterHeight = getComputedStyle(quoteContainerOuterEl).height;
    quoteContainerOuterEl.style.height = oldQuoteOuterHeight;


    // allow a redraw before resizing
    setTimeout(function resize() {
      quoteContainerOuterEl.style.height = newQuoteOuterHeight;
      setQContainerToAuto(); // in case transitionend events don't work
    }, 0);

    var increment = Math.floor(Math.random() * 8) + 1;
    colorIdx = (colorIdx + increment) % 10;
    document.documentElement.style.setProperty('--main-color', 'var(--color' + colorIdx + ')');
  }

  function updateTransitionEnd(e) {
    setQContainerToAuto();
  }

  // put back to auto to fix window resizes
  var setQContainerToAuto = _debounce(function resetHeight() {
    quoteContainerOuterEl.style.height = '';
  }, 500);


  function shareQuote() {
    // twitter share url format
    // var url = 'https://twitter.com/share
    //   ?url=someurl
    //   &via=person
    //   &related=text
    //   &hashtags=tags
    //   &text=some%20share%20text';

    var quoteText = quoteTextEl.textContent + '\n-' + authorEl.textContent + '\n';
    var url = 'https://twitter.com/share?hashtags=quotes&related=&url=&text=' + encodeURI(quoteText);
    var win = window.open(url, '_blank');
    win.focus();
  }
})();
