var api_endpoint = "http://www.thomashart.me:4730/";
var sentence_list;
var voice_list;
var sentence_index = 0;
var playing = false;

$(document).ready(function() {
  pageturner_init();
  bind_player_controls();
  spanify_text_to_read();
});

function pageturner_init() {
  // Get voice array
  voice_list = window.speechSynthesis.getVoices();
}

function bind_player_controls() {
  $('#btn_fast_backward').click(pageturner_fast_backward);
  $('#btn_backward').click(pageturner_backward);
  $('#btn_play').click(pageturner_play);
  $('#btn_pause').click(pageturner_pause);
  $('#btn_forward').click(pageturner_forward);
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

function play_sentence() {
  playing = true;
  clear_highlighting();

  if(sentence_index < sentence_list.length) {
    var sentence = sentence_list.eq(sentence_index);
    sentence.css('background-color', 'yellow');
    var speech_text = sentence.html();
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
  playing = false;
  window.speechSynthesis.cancel();
  clear_highlighting();
}

function play_sentence_when_ready() {
  if(playing) {
    if (window.speechSynthesis.speaking) {
      setTimeout(function () {
        play_sentence_when_ready()
      }, 50);
    }
    else {
      play_sentence();
    }
  }
}

function clear_highlighting() {
  sentence_list.each(function() {
    $(this).css('background-color', '');
  });
}

function prevent_default(e) {
  if(typeof e !== 'undefined') {
    e.preventDefault();
  }
}