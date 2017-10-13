// unikalne przedzialy; znaki ustawione w kolejnosci malejacej wystepowania w statystykach
// dane na temat czestotliwosci liter i znakow interpunkcyjnych w jezyku angielskim: https://en.wikipedia.org/wiki/Letter_frequency + http://www.viviancook.uk/Punctuation/PunctFigs.htm
// generator liczb: http://www.losowe.pl/liczba
// JSON klucz - tablica homofonów wygenerowana przy pomocy funkcji https://jsfiddle.net/koldev/cW7W5/
// TODO: implementacja reszty znaków ASCII

// TABLICA Z GÓRY OKREŚLONA, PONIEWAŻ MUSI BYĆ TO NIEZMIENNY KLUCZ - ODBIORCA GO MA I DZIEKI TEMU MOZE ROSZYROWAĆ
// JAK PIERWSZY ELEMENT KAŻDEJ TABLICY ZNAK A NIE KOD ASCII - WZGLĘDY CZYTELNOŚCI
// TABLICA UŁOŻONA  WZGLEDEM CZESTOTLIWOŚCI WYSTEPOWANIA LITER/ZNAKÓW W J. ANGIELSKIM - WZGLĘDY SZYBKOŚCI
var znaki = [];

function czytajJson(event){
  var input = event.target;
  var reader = new FileReader();
  reader.onload = function(){
    try{
      znaki = JSON.parse(reader.result);
      var wypelnienieNowe = input.files[0].name;
      document.getElementById("wypelnienie").innerHTML = wypelnienieNowe;
      var html = "<button class='btn btn-primary dropdown-toggle' type='button' data-toggle='dropdown'>Wybierz tryb<span class='care'></span></button><ul class='dropdown-menu'><li><a href='#' style='margin: 5px;' onclick='zTekstuSzyfruj()'>Wpisz tekst do zaszyfrowania</a></li><li><a href='#' style='margin: 5px;' onclick='zTekstuDeszyfruj()'>Wpisz szyfr do rozwiązania</a></li><li><a href='#' style='margin: 5px;'  onclick='plikDoZaszyfrowania()'>Wyślij plik do zaszyfrowania</a></li><li><a href='#' style='margin: 5px;' onclick='plikDoRozwiazania()'>Wyślij plik do rozwiązania</a></li></ul>";
      document.getElementById("menuRozwijane").innerHTML = html;
    }
    catch(err){
      if(err.name=="SyntaxError"){
        document.getElementById("wypelnienie").innerHTML = "Zły format pliku!";
      }
    }
  };
  reader.readAsText(input.files[0]);
}

function czytajPlikDeszyfruj(event){
  var input = event.target;
  var readerDeszyfruj = new FileReader();
  readerDeszyfruj.onload = function(){
    try{
      var text = readerDeszyfruj.result;
      tekst = text.toString();
      console.log(tekst);
      var wypelnienieNowe = input.files[0].name;
      document.getElementById("wypelnienieTxt").innerHTML = wypelnienieNowe;
      deszyfrator(tekst);
    }
    catch(err){
      if(err.name=="SyntaxError"){
        document.getElementById("wypelnienieTxt").innerHTML = "Zły format pliku!";
      }
    }
  };
  readerDeszyfruj.readAsText(input.files[0]);
}

function czytajPlikSzyfruj(event){
  var input = event.target;
  var readerSzyfruj = new FileReader();
  readerSzyfruj.onload = function(){
    try{
      var text = readerSzyfruj.result;
      tekst = text.toString();
      var wypelnienieNowe = input.files[0].name;
      document.getElementById("wypelnienieTxt").innerHTML = wypelnienieNowe;
      szyfrator(tekst);
    }
    catch(err){
      if(err.name=="SyntaxError"){
        document.getElementById("wypelnienieTxt").innerHTML = "Zły format pliku!";
      }
    }
  };
  readerSzyfruj.readAsText(input.files[0]);
}

function zWpisuSzyfruj(){
  var tekst = document.getElementById("wpis").value.toString();
  szyfrator(tekst);
}

function zWpisuDeszyfruj(){
  var tekst = document.getElementById("wpis").value.toString();
  deszyfrator(tekst);
}

function piszPlik() {
  var a = document.getElementById("a");
  var tekst = [document.getElementById("wynik").innerHTML];
  var blob = new Blob(tekst, {type : 'text/plain'});
  var fileOfBlob = new File([blob], "SzyfrowanieWolniaka.txt");
  a.href = URL.createObjectURL(fileOfBlob);
  a.download = "SzyfrowanieWolniaka.txt";
  document.getElementById("a").innerHTML = "Kliknij tutaj, aby pobrać plik wynikowy";
}

function statystykaJawny(tekst){
  var litery = [];
  var czyJest = Boolean(false);
  var doSpacji = 0;
  for(var i = 0; i < tekst.length; i++){
    doSpacji = tekst.charCodeAt(i);
    czyJest = false;
    for(var  z = 0; z < litery.length; z++){
      if((litery[z][0]==tekst[i]) || ((doSpacji==32) && litery[z][0] == "spacja")){
        litery[z][1]++;
        czyJest = true;
      }
    }
    if(czyJest==false){
          if(doSpacji==32){
            litery.push(["spacja",1]);
            czyJest = true;
          }
          else{
            litery.push([tekst[i],1]);
            czyJest =  true;
          }
        }
    }
  var html = "";
  html = "<br>Statystyka dla każdej litery/znaku:<br>";
    for(var o = 0; o<litery.length; o++){
        html = html + "<b>" + litery[o][0] + "</b> - " + Math.round((litery[o][1]/tekst.length)*100)/100 + "<br>";
    }
  html += "<br><br>";
  return html;
}

function statystykaZaszyfrowany(tekst){
  var litery = [];
  var czyJest = Boolean(false);
  var doSpacji = 0;
  for(var i = 0; i < tekst.length; i++){
    czyJest = false;
    for(var  z = 0; z < litery.length; z++){
      if(litery[z][0]==tekst[i]){
        litery[z][1]++;
        czyJest = true;
      }
    }
    if(czyJest==false){
            litery.push([tekst[i],1]);
            czyJest =  true;
        }
    }
  var html = "";
  html = "<br>Statystyka dla każdej litery/znaku:<br>";
    for(var o = 0; o<litery.length; o++){
        html = html + "<b>" + litery[o][0] + "</b> - " + Math.round((litery[o][1]/tekst.length)*100)/100 + "<br>";
    }
  html += "<br><br>";
  return html;
}

function szyfrator(tekstJawnySurowy){
  var tekstZaszyfrowany = "";
  var tekstJawny = tekstJawnySurowy.toLowerCase();
  var czyZnalezione = Boolean(true);
    for(var i=0; i<tekstJawny.length; i++){
      czyZnalezione = false;
      for(var o = 0; o<znaki.length; o++){
        if(tekstJawny[i]==znaki[o][0]){
          tekstZaszyfrowany += znaki[o][Math.ceil(Math.random()*(znaki[o].length-1))].toString() + " ";
          czyZnalezione = true;
        }
      }
      if(czyZnalezione==false){
      tekstZaszyfrowany += " [nieobsługiwany znak] ";
      }
    }

  document.getElementById("output").innerHTML = statystykaJawny(tekstJawny);
  var html = "Zaszyfrowany tekst:<br><b><div id='wynik'class='well well-lg'>"+ tekstZaszyfrowany +"</div></b><br><button type='button' class='btn btn-default' style='cursor:pointer' onclick='piszPlik()'>Generuj plik wynikowy</button><br><br><a href='' id='a'></a>";
  document.getElementById("output").innerHTML += html;
}

function deszyfrator(tekstZaszyfrowany){
  var znakiPodzielone = tekstZaszyfrowany.split(" ");
  console.log(znakiPodzielone);
  var tekstJawny = "";
  var czyZnalezione = Boolean(true);
  for(var  i = 0; i<znakiPodzielone.length; i++){
    czyZnalezione  = false;
    for(var o = 0; o<znaki.length; o++){
      for(z = 1; z<znaki[o].length; z++){
        if(znaki[o][z]==znakiPodzielone[i]){
          tekstJawny += znaki[o][0];
          czyZnalezione = true;
        }
      }
    }
    if(czyZnalezione==false){
      tekstJawny += "[nieobsługiwany znak]";
    }
  }

  document.getElementById("output").innerHTML = statystykaZaszyfrowany(znakiPodzielone);
  var html = "Rozwiązanie szyfru:<br><b><div id='wynik'class='well well-lg'>"+ tekstJawny +"</div></b><br><button type='button' class='btn btn-default' style='cursor:pointer' onclick='piszPlik()'>Generuj plik wynikowy</button><br><br><a href='' id='a'></a>";
  document.getElementById("output").innerHTML += html;
}
