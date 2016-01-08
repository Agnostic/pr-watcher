var app = angular.module('app', []);

app.service('Github', [function() {
  var baseUrl = 'http://github.services.ooyala.net/api/v3/';
  var token = localStorage.getItem('accessToken') || '';

  return {
    getRepos: function() {
      return $http.get(baseUrl + 'orgs/frontend?access_token=' + token);
    }
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
          localStorage.setItem('accessToken', response.data.access_token);
        }
        location.href = '/pages/frontend/pr-manager/';
      });
  } else {
    if (!localStorage.getItem('accessToken')) {
      location.href = baseUrl + '/login/oauth/authorize?client_id=' + clientId;
    } else {
      console.log('accessToken', localStorage.getItem('accessToken'));
      // TODO
      // Validate access token
    }
  }
}]);

app.controller('reposController', ['$scope', 'Github', function($scope, Github) {
  $scope.repos = [];

  Github.getRepos().then(function(response) {
    $scope.repos = response.data;
    console.log($scope.repos);
  });

}]);
