bingoApp = angular.module('bingo', []).
config(function($routeProvider) {
  $routeProvider.
    when('/', {templateUrl:'edit.html'}).
    when('/play', {templateUrl:'play.html'}).
    otherwise({redirectTo:'/'});
});

var saveBingo = function(){}, loadBingo = function(){};
if (window.localStorage && JSON && typeof JSON.stringify === 'function') {
  saveBingo = function saveBingo() {
    window.localStorage.setItem('bingo',JSON.stringify(BINGO));
    return true;
  };
  loadBingo = function loadBingo() {
    try {
      return JSON.parse(window.localStorage.getItem('bingo'));
    } catch(e) {
      return null;
    }
  };
}
var BINGO = loadBingo() || {
  title: "Melissa Bingo",
  words: "Pink,Cotton Candy,Choes,Seattle,Cappuccino,Bordeaux,Scrapbooking,Popcorn Balls,Peeps,Troy,Jacob,Megan,Where's Nathan,Peppermint Ice Cream,Nerds,Nordy's Anniversary,April 11th,Black Friday,Days of Our Lives,Boots,Titanic (the movie),Greece (the movie),Pedicure,V8,Peet's,Musicals,Mexican Food,Cooking,12/22/72,Cinderella,Kitties,Butter,Waffles,The Judds",
  freespace: 'Jesus',
  freeSpacePlacement: 'center',
  height: 5,
  width: 5,
  cards: 10
};

// Generate Bingo Cards
function generate() {
    // Clear any previous results
  $("#results").html("");

  // Check to make suer enough options are provided to fill the bingo card spaces
  var words = BINGO.words.split(","),
      spaces = words.length,
      freespace = (BINGO.freespace||'').trim(),
      height = parseInt(BINGO.height,10),
      width = parseInt(BINGO.width,10),
      cardsToGen = parseInt(BINGO.cards,10);

  if (freespace !== '') spaces++;
  if ( spaces < height*width ) {
    throw new Error("You do not have enough possible board options for the size of the board you selected!");
  }

  // Try to make nice printable pages -- we can fit about 10 pieces across and 6 down
  var colsFilled = 0;
  var rowsFilled = 1;

  // Loop over number of cards requested
  for ( var i=0; i<cardsToGen; i++ ) {

    colsFilled++;
    if ( colsFilled*$("#width").val() > 10 ) {
      rowsFilled++;
      if ( rowsFilled*$("#height").val() > 6 ) {
        $("#results").append('<div class="break"></div>');
        rowsFilled=1;
      } else {
        $("#results").append('<div class="clear"></div>');
      }
      colsFilled=1;
    }

    // Create bingo card
    var $card = new BingoCard(
      BINGO.title,
      width,
      height,
      (freespace === '' ? false : 'true'),
      freespace,
      'false',
      BINGO.words,
      (i%2 === 0) ? 'even' : 'odd'
    );
  }
  // Jump to results
  //location.href='#results';
}

function formatFreespace(str) {
  return '<strong>'+str+'<div class="freespace">Free Space</div></strong>';
}

function BingoCard(title,width,height,freespace,freespaceValue,freespaceRandom,list, cardCSS) {
  var possibleSpaces = list.split(",");
  
  // Two options for including random Free Space:
  // Option 1: We don't have enough. Include in random placement.
  // Option 2:- We have enough. Overwrite other option.
  var enoughSpaces = true;
  if ( possibleSpaces.length < width*height )
    enoughSpaces = false;

  // Option 1
  if ( freespace=="true" && freespaceRandom=="true" && !enoughSpaces )
    possibleSpaces.push(formatFreespace(freespaceValue));
  
  // Create a random selection of the possible values
  var spaces = [];

  // This works for squares with odd dimensions,, e.g. 3x3 or 5x5, but not for even squares or rectangles
  // var centerSquare = Math.floor(width*height/2);
  // We'll say center is the center row of the center column
  var centerSquare = Math.floor(height/2)*width + Math.floor(width/2);

  for ( var i=0; i<=width*height; i++ ) {
    if ( i==centerSquare && freespace=="true" && freespaceRandom=="false" ) 
      spaces.push(formatFreespace(freespaceValue));
    else
      spaces.push(possibleSpaces.splice(Math.floor(Math.random()*possibleSpaces.length),1)[0]);
  }

  // Option 2
  if ( freespace=="true" && freespaceRandom=="true" && enoughSpaces )
    spaces[Math.floor(Math.random()*spaces.length)] = formatFreespace(freespaceValue);

  // Output
  var output = '<table class="card '+cardCSS+'"><thead><tr><th colspan="'+width+'">'+title+'</th></tr></thead>';
  output += '<tbody>';
  for ( var i=0; i<height; i++ ) {
    output += '<tr>';
    for ( var j=0; j<width; j++ ) 
      output += '<td>'+ spaces.shift() +'</td>';
    output += '</tr>';
  }
  output += "</tbody></table>";
  $("#results").append(output);
  //return($(output));

}

// randomizes a js array; credit http://stackoverflow.com/questions/2450954/how-to-randomize-a-javascript-array
function fisherYates ( myArray ) {
  var i = myArray.length, j, temp;
  if ( i === 0 ) return false;
  while ( --i ) {
     j = Math.floor( Math.random() * ( i + 1 ) );
     temp = myArray[i];
     myArray[i] = myArray[j]; 
     myArray[j] = temp;
   }
}

function BingoAppCtrl($scope, $location, $timeout) {
  $scope.menuButtons = ['Save', 'Play'];
  $scope.doMenuButton = function(button) {
    $scope.flashNotice = null;
    switch(button) {
      case 'Play':
        $scope.menuButtons = ['Edit'];
        $location.path('/play'); break;
      case 'Save':
        if (saveBingo()===true) {
          $scope.showFlashNotice('saved!');
        } else {
          $scope.showFlashNotice('NOT SAVED, works best in Chrome or Firefox');
        }
        // fall through
      default:
        $scope.menuButtons = ['Save', 'Play'];
        $location.path('/'); break;
    }
  };

  $scope.showFlashNotice = function(msg) {
    $scope.flashNotice = (typeof msg === 'string') ? msg : null;
    if ($scope.flashNotice === null) { return; }
    $timeout($scope.showFlashNotice,5000);
  };

  $scope.broadcastKeyPress = function(e) {
    $scope.$broadcast('keypress', e);
  };

}

function BingoEditCtrl($scope) {
  $scope.db = BINGO;

  $scope.$watchCollection('db',function(){
    try {
      generate();
      $scope.errorMessage = null;
    } catch(e) {
      $scope.errorMessage = e.message;
    }
  });

}

function BingoPlayCtrl($scope,$timeout) {
  var words = BINGO.words.split(',');

  // start the shuffler
  (function($scope){
    function shuffleAvailable() {
      if ($scope && $scope.game) fisherYates($scope.game.available);
      $timeout(shuffleAvailable,50);
    }
    shuffleAvailable();
  }($scope));
  $scope.resetGame = function() {
    fisherYates(words); // random seed for each game!
    $scope.game = {
      picked: [],
      available: words.slice(0),
      buttonMode: 'Pick a Word (or hit spc)'
    };
  };

  $scope.wordPreview = function() {
    if (!$scope.game) return;
    return($scope.game.available[0]);
  };

  $scope.pickWord = function() {
    var word = $scope.game.available.shift();
    if ($scope.game.available.length === 0) {
      $scope.game.buttonMode = 'Reset!';
      if (!word) return($scope.resetGame());
    }
    if (!word) return;
    $scope.game.picked.splice(0,0,word);
  };

  $scope.$on('keypress',function(scope,e){
    if (e.keyCode === 32) $scope.pickWord();
  });

  $scope.resetGame();

}



