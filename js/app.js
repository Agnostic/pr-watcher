var app = angular.module('app', []);

app.service('Github', [function() {
  var baseUrl = 'http://github.services.ooyala.net';
  var token = localStorage.getItem('accessToken');

  return {
  };
}]);

app.run(['$http', function($http) {
  var clientId = 'fcc57884b81d98d9bee3';
  var baseUrl = 'http://github.services.ooyala.net';
  var code;

  if (location.search.match(/code/)) {
    code = location.search.substr(1, location.search.length).split('=')[1];

    $http
      .post(baseUrl + '/login/oauth/access_token', {
        client_id: clientId,
        client_secret: '1a9367f8ab0ed7eec4db37d464c25c55a5f741c5',
        code: code
      }).then(function(response) {
        if (response.data.access_token) {
          localStorage.setItem('accessToken');
        } else {
          location.href = '/' + location.pathname;
        }
      });
  } else {
    location.href = baseUrl + '/login/oauth/authorize?client_id=' + clientId;
  }
  console.log('Run', location.search);
}]);
