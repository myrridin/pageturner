var api_endpoint = "http://www.thomashart.me:4730/";
var sentence_list;
var voiceArr;

$(document).ready(function() {

  // Bindings
  $('#load_book').click(load_book);
  $('#button_play').click(play_book);

  // Get voice array
  voiceArr = speechSynthesis.getVoices();

});

function load_book(e) {
  var book_id = parseInt($('#book_id').val());
  if(is_int(book_id)) {
    console.log("LOAD BOOK " + book_id);
    $.get(api_endpoint + 'books/' + book_id, function(data) {

      console.log(data);

      var body = data.body;

      // Split the body text on punctuation and line breaks
      body = body.replace(/<p>/g, '<p><span>');
      body = body.replace(/<\/p>/g, '</span></p>');
      body = body.replace(/\./g, '</span>.<span>');
      body = body.replace(/,/g, '</span>,<span>');
      body = body.replace(/\!/g, '</span>!<span>');
      body = body.replace(/\?/g, '</span>?<span>');
      body = body.replace(/:/g, '</span>:<span>');
      body = body.replace(/<i>/g, '');
      body = body.replace(/<\/i>/g, '');

      console.log(body);
      $('#text_to_read').html(body);
    });
  }
  e.preventDefault();
}

function play_book(e) {
  console.log("PLAY BOOK");
  sentence_list = $('#text_to_read span');
  play_sentence(0);
  e.preventDefault();
}

function play_sentence(sentence_index) {
  sentence_list.each(function() {
    $(this).css('background-color', '');
  });
  if(sentence_index < sentence_list.length) {
    var sentence = sentence_list.eq(sentence_index);
    sentence.css('background-color', 'yellow');
    var speech_text = sentence.html();
    var utterance = new SpeechSynthesisUtterance(speech_text);
    utterance.voice = voiceArr[10];
    window.speechSynthesis.speak(utterance);
    setTimeout(function() { play_sentence_when_ready(sentence_index + 1) }, 50);
  }
}

function play_sentence_when_ready(sentence_index) {
  if(window.speechSynthesis.speaking) {
    setTimeout(function() { play_sentence_when_ready(sentence_index) }, 50);
  }
  else {
    play_sentence(sentence_index);
  }
}

function is_int(val) {
  return typeof val == "number" && isFinite(val) && val % 1 === 0;
}