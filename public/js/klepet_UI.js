function divElementEnostavniTekst(sporocilo) {
<<<<<<< HEAD
  var dodajanjeImgElementov = false; 
  dodajanjeImgElementov |= sporocilo.indexOf('<img') > -1;
  if(dodajanjeImgElementov){
    var formati = new RegExp('(jpg|png|gif)(\'|") /&gt;','gi');
    sporocilo = sporocilo.replace(/\</g,'&lt;');
    sporocilo = sporocilo.replace(/\>/g,'&gt;');
    sporocilo = sporocilo.replace(/&lt;img/g,'<img');
    sporocilo = sporocilo.replace(formati,function(ext){return ext.substr(0,4) + ' />';});
    return $('<div style="font-weight: bold"></div>').html(sporocilo);
=======
  var dodajanjeYouTubePovezav = false;
  
  dodajanjeYouTubePovezav |= sporocilo.indexOf('<img') > -1;
  dodajanjeYouTubePovezav |= sporocilo.indexOf( '<iframe src=\'https://www.youtube.com/embed/') > -1;
  
  if (dodajanjeYouTubePovezav) {
  var formatYouTubeLinka = new RegExp( '&lt;iframe src=\'https://www.youtube.com/embed/','g');
  
  sporocilo = sporocilo.replace(/\</g,'&lt;');
  sporocilo = sporocilo.replace(/\>/g,'&gt;');
  sporocilo = sporocilo.replace(/&lt;img/g,'<img');
  sporocilo = sporocilo.replace('png\' /&gt;','png\' />');
  sporocilo = sporocilo.replace(formatYouTubeLinka,'<iframe src=\'https://www.youtube.com/embed/');
  sporocilo = sporocilo.replace(/&gt;&lt;\/iframe&gt;/g, '></iframe>');
  return $('<div style="font-weight: bold"></div>').html(sporocilo);
>>>>>>> youtube
  } else {
    return $('<div style="font-weight: bold;"></div>').text(sporocilo);
  }
}

function divElementHtmlTekst(sporocilo) {
  return $('<div></div>').html('<i>' + sporocilo + '</i>');
}

function procesirajVnosUporabnika(klepetApp, socket) {
  var sporocilo = $('#poslji-sporocilo').val();
<<<<<<< HEAD
  sporocilo = dodajSlike(sporocilo);
=======
  sporocilo = dodajYouTube(sporocilo);
>>>>>>> youtube
  sporocilo = dodajSmeske(sporocilo);
  var sistemskoSporocilo;

  if (sporocilo.charAt(0) == '/') {
    sistemskoSporocilo = klepetApp.procesirajUkaz(sporocilo);
    if (sistemskoSporocilo) {
      $('#sporocila').append(divElementHtmlTekst(sistemskoSporocilo));
    }
  } else {
    sporocilo = filtirirajVulgarneBesede(sporocilo);
    klepetApp.posljiSporocilo(trenutniKanal, sporocilo);
    $('#sporocila').append(divElementEnostavniTekst(sporocilo));
    $('#sporocila').scrollTop($('#sporocila').prop('scrollHeight'));
  }

  $('#poslji-sporocilo').val('');
}

var socket = io.connect();
var trenutniVzdevek = "", trenutniKanal = "";

var vulgarneBesede = [];
$.get('/swearWords.txt', function(podatki) {
  vulgarneBesede = podatki.split('\r\n');
});

function filtirirajVulgarneBesede(vhod) {
  for (var i in vulgarneBesede) {
    vhod = vhod.replace(new RegExp('\\b' + vulgarneBesede[i] + '\\b', 'gi'), function() {
      var zamenjava = "";
      for (var j=0; j < vulgarneBesede[i].length; j++)
        zamenjava = zamenjava + "*";
      return zamenjava;
    });
  }
  return vhod;
}

$(document).ready(function() {
  var klepetApp = new Klepet(socket);

  socket.on('vzdevekSpremembaOdgovor', function(rezultat) {
    var sporocilo;
    if (rezultat.uspesno) {
      trenutniVzdevek = rezultat.vzdevek;
      $('#kanal').text(trenutniVzdevek + " @ " + trenutniKanal);
      sporocilo = 'Prijavljen si kot ' + rezultat.vzdevek + '.';
    } else {
      sporocilo = rezultat.sporocilo;
    }
    $('#sporocila').append(divElementHtmlTekst(sporocilo));
  });

  socket.on('pridruzitevOdgovor', function(rezultat) {
    trenutniKanal = rezultat.kanal;
    $('#kanal').text(trenutniVzdevek + " @ " + trenutniKanal);
    $('#sporocila').append(divElementHtmlTekst('Sprememba kanala.'));
  });

  socket.on('sporocilo', function (sporocilo) {
    var novElement = divElementEnostavniTekst(sporocilo.besedilo);
    $('#sporocila').append(novElement);
  });
  
  socket.on('kanali', function(kanali) {
    $('#seznam-kanalov').empty();

    for(var kanal in kanali) {
      kanal = kanal.substring(1, kanal.length);
      if (kanal != '') {
        $('#seznam-kanalov').append(divElementEnostavniTekst(kanal));
      }
    }

    $('#seznam-kanalov div').click(function() {
      klepetApp.procesirajUkaz('/pridruzitev ' + $(this).text());
      $('#poslji-sporocilo').focus();
    });
  });

  socket.on('uporabniki', function(uporabniki) {
    $('#seznam-uporabnikov').empty();
    for (var i=0; i < uporabniki.length; i++) {
      $('#seznam-uporabnikov').append(divElementEnostavniTekst(uporabniki[i]));
    }
  });

  setInterval(function() {
    socket.emit('kanali');
    socket.emit('uporabniki', {kanal: trenutniKanal});
  }, 1000);

  socket.on('dregljaj', function() {
    $('#vsebina').jrumble();
    $('#vsebina').trigger('startRumble');
    setTimeout(function(){
      $('#vsebina').trigger('stopRumble');
    } ,1500);
  });

  $('#poslji-sporocilo').focus();

  $('#poslji-obrazec').submit(function() {
    procesirajVnosUporabnika(klepetApp, socket);
    return false;
  });
  
  
});

function dodajSmeske(vhodnoBesedilo) {
  var preslikovalnaTabela = {
    ";)": "wink.png",
    ":)": "smiley.png",
    "(y)": "like.png",
    ":*": "kiss.png",
    ":(": "sad.png"
  }
  for (var smesko in preslikovalnaTabela) {
    vhodnoBesedilo = vhodnoBesedilo.replace(smesko,
      "<img src='http://sandbox.lavbic.net/teaching/OIS/gradivo/" +
      preslikovalnaTabela[smesko] + "' />");
  }
  return vhodnoBesedilo;
}

<<<<<<< HEAD
function dodajSlike(input) {
  var seznamLinkov = [];
  var formati = new RegExp('\\bhttps?://[a-z%\\-_0-9/:\\.]*\\.(jpg|png|gif)\\b','gi');
  var pripada = null;
  var zasebno = input.startsWith("/zasebno");
  
  if(zasebno){
    input = input.substr(0, input.lastIndexOf('"'));
  }
  while((pripada = formati.exec(input)) !== null){
    seznamLinkov.push(pripada[0]);
  }
  for(var i=0;i<seznamLinkov.length;i++){
    input += '<img width=\'200\' style=\'margin-left:20px;display:block\' src=\'' + seznamLinkov[i] +'\' />';
  }
  if(zasebno){
    input += '"';
  }
  
  return (input);
}
=======
function dodajYouTube( input ){
  var seznamLinkov = [];
  var formatYouTubeLinka = new RegExp('\\bhttps://www.youtube.com/watch\\?v=[a-z\\-_0-9]*\\b', 'gi');
  var pripada = null;
  var zasebno = vhod.startsWith("/zasebno");
         
  if ( zasebno )
    vhod = input.substr( 0, input.lastIndexOf( '"' ) );
  while ((pripada = formatYouTubeLinka.exec(input)) !== null){
    seznamLinkov.push(pripada[0]);
  }
  for (var i=0;i<seznamLinkov.length;i++){
    var video_link = seznamLinkov[ i ].substr( seznamLinkov[ i ].lastIndexOf( '=' ) + 1, 11);
    input += ' <iframe src=\'https://www.youtube.com/embed/' + video_link
            + '\' width=\'200\' height=\'150\' style=\'margin-left:20px;'
            +' display:block\' allowfullscreen></iframe> ';
  }
  if (zasebno){
    input += '"';
  } 
  
  return (input);
 }
>>>>>>> youtube
