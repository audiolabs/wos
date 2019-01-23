const electron = window.require('electron');
const remote = electron.remote; 
const ipcRenderer = electron.ipcRenderer;
const fs = window.require('fs');

var session = Date.now();

console.log('session: ' + session);

var host = 'localhost';

if (remote.process.env['HOST'])
	host = remote.process.env['HOST'];

$(document).ready(function() {

	$('#status').text("Starting audio stream ...")

	http_stream();

	fs.readFile("responses.txt", 'utf8', function(err, data) {
		if (err) {
			alert("unable to read responses.txt");
		}
		var responses = data.split("\n");
		for (var i in responses) {
			var response = responses[i];
			$('#sel_response').append('<option value="' + response + '">' +
				response + '</option>');
		}
	});

	fs.readFile("media.txt", 'utf8', function(err, data) {
		if (err) {
			alert("unable to read media.txt");
		}
		var media = data.split("\n");
		for (var i in media) {
			var m = media[i];
			$('#sel_media').append('<option value="' + m + '">' + m + '</option>');
		}
	});

	$('#btn_speak').click(function() {

		q = $('#txt_text').val()
		$('#txt_text').val('');

		if (q.charAt(0) == '/') {
			$('#status').text("Status: Playing, press stop to stop ...")
			$('#results').html('');
			http_media_play(q);
		} else {
			$('#status').text("Status: Speaking, please wait ...")
			$('#results').html('');
			http_speak(q);
		}

	});

	$('#btn_stop').click(function() {
		http_media_stop();
	});

	$('#sel_response').click(function() {
		$('#txt_text').val($('#sel_response').val());
	});

	$('#sel_media').click(function() {
		$('#txt_text').val($('#sel_media').val());
	});

   $(document).keypress(function(e) {
      if (e.which == 13) {
         $('#btn_speak').click();
      }
   });
   
});

function http_speak(text) {

	var lang = $('#sel_lang').val()

	var filename = "sessions/" + session + ".json";

	var utterance = {
		text: text,
		ts: Date.now(),
		lang: lang,
		type: 'tts'
	};

	fs.appendFile(filename, JSON.stringify(utterance) + "\n", function(err) {
		if (err) alert("unable to write to file");
	});

	$.ajax({
		type: 'POST',
		url: 'http://' + host + ':9500/api/v1/speak',
		data: JSON.stringify({ 'text': text, 'lang': lang }),
		dataType: 'json',
		contentType: 'application/json',
		success: function(data, textStatus, jqXHR) {
			$('#status').text("Status: Ready.")
		}
	});
};

function http_media_play(text) {

	var lang = $('#sel_lang').val()

	var filename = "sessions/" + session + ".json";

	var utterance = {
		text: text,
		ts: Date.now(),
		type: 'media_play',
		lang: lang
	};

	fs.appendFile(filename, JSON.stringify(utterance) + "\n", function(err) {
		if (err) alert("unable to write to file");
	});

	$.ajax({
		type: 'POST',
		url: 'http://' + host + ':9500/api/v1/media/play',
		data: JSON.stringify({ 'file': text, 'lang': lang }),
		dataType: 'json',
		contentType: 'application/json',
		success: function(data, textStatus, jqXHR) {
			$('#status').text("Status: Ready.")
		}
	});
};

function http_media_stop() {

	var lang = $('#sel_lang').val()

	var filename = "sessions/" + session + ".json";

	var utterance = {
		text: '',
		ts: Date.now(),
		type: 'media_stop',
		lang: lang
	};

	fs.appendFile(filename, JSON.stringify(utterance) + "\n", function(err) {
		if (err) alert("unable to write to file");
	});

	$.ajax({
		type: 'POST',
		url: 'http://' + host + ':9500/api/v1/media/stop',
		data: JSON.stringify({}),
		dataType: 'json',
		contentType: 'application/json',
		success: function(data, textStatus, jqXHR) {
			$('#status').text("Status: Ready.")
		}
	});
};

function http_stream() {
	$.ajax({
		type: 'POST',
		url: 'http://' + host + ':9500/api/v1/stream',
		data: JSON.stringify({}),
		dataType: 'json',
		contentType: 'application/json',
		success: function(data, textStatus, jqXHR) {
			var my_ip = data['ip'];
			ipcRenderer.send('stream', my_ip, session);
			ipcRenderer.send('play', my_ip, session);
			$('#status').text("Status: Ready.");
		}
	});
};
