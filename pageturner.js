var api_endpoint = "http://www.thomashart.me:4730/";
var sentence_list = [];
var sentence_index = 0;
var playing = false;
var stories;

$(document).ready(function() {
  pageturner_init();
});

function pageturner_init() {
  bindings();
  bindings_page();
  spanify_text_to_read();
  get_story_list();
}

function bindings() {
  
  // Nav
  $('.random-story-link').click(render_random_story);
  $('.all-stories-link').click(render_story_list);
  
  // Ajax links
  $('.ajax-link').click(ajax_link);
  
  // Player controls
  $('#btn_fast_backward').click(pageturner_fast_backward);
  $('#btn_backward').click(pageturner_backward);
  $('#btn_play').click(pageturner_play);
  $('#btn_pause').click(pageturner_pause);
  $('#btn_forward').click(pageturner_forward);
  
}

function bindings_page() {
  
  // Home Page Buttons
  $('#random_story').click(render_random_story);
  $('#story_list').click(render_story_list);
  
  // Story List Links
  $('.story-link').click(function() {
    var story_id = new Number($(this).attr('data-story-id'));
    render_story(story_id);
  });
  
}

function pageturner_fast_backward(e) {
  console.log('BUTTON fast backward');
  sentence_index = 0;
  stop_playing();
  $('#btn_pause').hide();
  $('#btn_play').show();
  prevent_default(e);
}
function pageturner_backward(e) {
  console.log('BUTTON backward');

  if(sentence_index > 0) {
    if(sentence_index > 1 && window.speechSynthesis.speaking) {
      sentence_index -= 2;
      window.speechSynthesis.cancel();
    }
    else {
      sentence_index -= 1;
    }
  }
  prevent_default(e);
}
function pageturner_play(e) {
  console.log('BUTTON play');
  $('#btn_pause').show();
  $('#btn_play').hide();
  play_sentence();
  prevent_default(e);
}
function pageturner_pause(e) {
  console.log('BUTTON pause');
  sentence_index -= 1;
  $('#btn_pause').hide();
  $('#btn_play').show();
  stop_playing();
  prevent_default(e);
}
function pageturner_forward(e) {
  console.log('BUTTON forward');
  if(window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
  prevent_default(e);
}

function spanify_text_to_read() {
  var text_div = $('#text_to_read');
  var body_text = text_div.html();
  if(typeof body_text !== 'undefined') {
    body_text = body_text.replace(/<p>/g, '<p><span>');
    body_text = body_text.replace(/<\/p>/g, '</span></p>');
    body_text = body_text.replace(/\./g, '</span>.<span>');
    body_text = body_text.replace(/,/g, '</span>,<span>');
    body_text = body_text.replace(/\!/g, '</span>!<span>');
    body_text = body_text.replace(/\?/g, '</span>?<span>');
    body_text = body_text.replace(/:/g, '</span>:<span>');
    body_text = body_text.replace(/<i>/g, '');
    body_text = body_text.replace(/<\/i>/g, '');
    body_text = body_text.replace(/<span>\s*<\/span>/g, ' ');
    text_div.html(body_text);
    sentence_list = $('#text_to_read span');
  }
}

function play_sentence() {
  playing = true;
  clear_highlighting();

  if(sentence_index < sentence_list.length) {
    var sentence = sentence_list.eq(sentence_index);
    sentence.css('background-color', 'yellow');
    var speech_text = sentence.text();
    if(speech_text != '') {
      var utterance = new SpeechSynthesisUtterance(speech_text);
      utterance.onend = function() {
        if(playing && !window.speechSynthesis.speaking) {
          play_sentence();
        }
      };
      window.speechSynthesis.speak(utterance);
      sentence_index += 1;
      setTimeout(function () {
        play_sentence_when_ready();
      }, 50);
    }
    else {
      sentence_index += 1;
      play_sentence();
    }
  }
  else {
    pageturner_fast_backward();
  }
}

function stop_playing() {
  $('#btn_pause').hide();
  $('#btn_play').show();
  playing = false;
  window.speechSynthesis.cancel();
  clear_highlighting();
}

function play_sentence_when_ready() {
  if(playing) {
    if (window.speechSynthesis.speaking) {
      setTimeout(function () {
        play_sentence_when_ready();
      }, 50);
    }
    else {
      play_sentence();
    }
  }
}

function clear_highlighting() {
  if(sentence_list.length > 0) {
    sentence_list.each(function() {
      $(this).css('background-color', '');
    });  
  }
}

function prevent_default(e) {
  if(typeof e !== 'undefined') {
    e.preventDefault();
  }
}

function ajax_link(e) {
  var url = $(this).attr('href');
  close_navbar();
  $.get(url, render_content);
  e.preventDefault();
}

function render_content(content) {
  clear_progress();
  close_navbar();
  $('#site_content').html(content);
  spanify_text_to_read();
  bindings_page();
}

function clear_progress() {
  stop_playing();
  sentence_list = [];
  sentence_index = 0;
}

function get_story_list() {
  $.getJSON('./stories/story_list.json', function(data) {
    stories = data.stories;
    console.log(stories);
  });
}

function render_story_list(e) {
  var stories_html = '<div id="text_to_read">';
  var idx = 0;
  stories.forEach(function(story) {
    stories_html += '<p>' + story.title + ' - <a href="#" class="story-link" data-story-id="' + idx + '">Read Story</a></p>';
    idx++;
  });
  stories_html += '</div>';
  render_content(stories_html);
  e.preventDefault();
}

function render_story(idx) {
  var story = stories[idx];
  var story_html = '<div id="text_to_read">';
  story_html += '<p><strong>' + story.title + '</strong></p>';
  story_html += '<p><em>By ' + story.author + '</em></p>';
  story_html += story.body + '</div>';
  story_html += '<div><p><a href="#" id="random_story" class="btn btn-lg btn-success">Another Random Story</a></p><p><a href="#" id="story_list" class="btn btn-lg btn-primary">See All Stories</a></p></div>';
  render_content(story_html);
}

function render_random_story(e) {
  var story_idx = Math.floor(Math.random() * stories.length);
  render_story(story_idx);
  e.preventDefault();
}

function close_navbar() {
  if(!$('.navbar-toggle').hasClass('collapsed')) {
    $('.navbar-toggle').click();
  }
}
