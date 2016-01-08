var app = angular.module('app', []);

app.run(['$http', function($http) {
  var code;

  if (location.search.match(/code/)) {
    code = location.search.substr(1, location.search.length).split('=')[1];
  } else {
    location.href = 'http://github.services.ooyala.net/login/oauth/authorize?client_id=fcc57884b81d98d9bee3';
  }
  console.log('Run', location.search);
}]);
