var colorIdx = 0;
var quoteContainerOuterEl, quoteContainerEl, quoteTextEl, authorEl, loadingEl;

(function start() {

  quoteContainerOuterEl = document.querySelector('.quote-outer');
  quoteContainerEl = document.querySelector('.quote-container');
  quoteTextEl = document.querySelector('.quote-text');
  authorEl = document.querySelector('.author');
  loadingEl = document.querySelector('.loading');

  // load new quote by default
  loadQuote();

  // add handlers for share and new quote
  document.querySelector('.share').addEventListener('click', shareQuote);
  document.querySelector('.new-quote').addEventListener('click', loadQuote);
  quoteContainerOuterEl.addEventListener('transitionend', updateTransitionEnd);
})();

function loadQuote() {
  quoteContainerEl.style.opacity = 0;

  // show a loading indicator if the api is taking a while to come back.  (might need to spin up)
  var loadingTimeout = setTimeout(function showLoader() {
    loadingEl.style.display = "block";
  }, 400);

  //setTimeout(function doFetch() {  // tests loading indicator for slow api calls
  fetch('https://seinfeld-quotes.herokuapp.com/random')
      .then(function(response) {
        return response.json();
      })
      .catch(function error(error) {
        console.error('Error:', error);
      })
      .then(function(json) {
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
      });
  //}, 5000);
}

function updateQuote(json) {
  console.log('Updating quote html');

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
  }, 0);

  var increment = Math.floor(Math.random() * 8) + 1;
  colorIdx = (colorIdx + increment) % 10;
  document.documentElement.style.setProperty('--main-color', 'var(--color' + colorIdx + ')');
}

function updateTransitionEnd(e) {
  if(e.propertyName === 'height') {
    quoteContainerOuterEl.style.height = '';  // back to auto to fix resizes
  }
}

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
