var app = angular.module('app', []);

app.service('Github', ['$http', function($http) {
  var baseUrl = 'http://github.services.ooyala.net/api/v3/';
  var token = localStorage.getItem('accessToken') || '';

  return {
    getRepos: function(org) {
      return $http.get(baseUrl + 'orgs/' + org + '/repos?access_token=' + token);
    },
    getPRs: function(repo, org) {
      return $http.get(baseUrl + 'repos/' + org + '/' + repo + '/pulls?state=open&access_token=' + token);
    },
    getComments: function(commentsUrl) {
      return $http.get(commentsUrl + '?&access_token=' + token);
    },
    getUser: function() {
      return $http.get(baseUrl + 'user?access_token=' + token);
    }
  };
}]);

app.run(['$http', function($http) {
  var clientId = 'd3d7cbd7dce23dd9de98';
  var clientSecret = '808ec362dbf485cb5ccd3bb34652d2e080e98217';
  var baseUrl = 'http://agnostic.github.io/pr-watcher/';
  var githubUrl = 'https://github.com';
  var code;

  if (location.search.match(/code/)) {
    code = location.search.substr(1, location.search.length).split('=')[1];

    $http
      .post(githubUrl + '/login/oauth/access_token', {
        client_id: clientId,
        client_secret: clientSecret,
        code: code
      }).then(function(response) {
        if (response.data.access_token) {
          localStorage.setItem('accessToken', response.data.access_token);
        }
        location.href = '/';
      });
  } else {
    if (!localStorage.getItem('accessToken')) {
      location.href = githubUrl + '/login/oauth/authorize?client_id=' + clientId;
    } else {
      // TODO
      // Validate access token
    }
  }
}]);

app.filter('PrsBy', function() {
  return function(items, user, filter) {
    var filtered = [];
    angular.forEach(items, function(item) {
      if (!filter) {
        filtered.push(item);
      } else {
        var reviewer = _.find(item.reviewers, function(reviewer) {
          return reviewer.name === ('@' + user.login);
        });
        if (reviewer || item.user.login === user.login) {
          filtered.push(item);
        }
      }
    });
    return filtered;
  };
});

app.controller('reposController', ['$scope', 'Github', '$http', '$timeout', function($scope, Github, $http, $timeout) {
  $scope.user = {};
  $scope.filterBy = localStorage.getItem('filterBy') || '';

  var orgs = localStorage.getItem('orgs');
  if (orgs) {
    orgs = JSON.parse(orgs);
  } else {
    orgs = ['frontend', 'optimization'];
    localStorage.setItem('orgs', JSON.stringify(orgs));
  }

  $scope.$watch('filterBy', function(val) {
    localStorage.setItem('filterBy', val);
  });

  $scope.reviewed = function(reviewers) {
    var me = _.find(reviewers, function(reviewer) {
      return reviewer.name === ('@' + $scope.user.login);
    });
    return me && me.reviewed;
  };

  $scope.mentioned = function(body) {
    var user = '@' + $scope.user.login;
    return body.match(user);
  };

  $scope.hideRepo = function(id) {
    return !$('#repo_' + id).find('tr').length;
  };

  // $scope.showOrg = function(id) {
  //   return $('#org_' + id).find('.repository:visible').length;
  // };

  $scope.getData = function() {
    $scope.orgs = [];

    _.forEach(orgs, function(org) {
      var _org = {
        name: org,
        repos: []
      };

      $scope.orgs.push(_org);

      Github.getRepos(org).then(function(response) {
        var repos = response.data;

        repos.forEach(function(repo) {
          Github.getPRs(repo.name, org).then(function(response) {
            repo.prs = response.data || [];

            repo.prs.forEach(function(pr, index, array) {
              array[index].reviewers = [];

              Github.getComments(pr.comments_url).then(function(response) {
                var comments = response.data;

                var reviewers = pr.body.match(/@\w+/g);
                if (reviewers) {
                  reviewers.forEach(function(reviewer) {
                    array[index].reviewers.push({
                      name: reviewer,
                      reviewed: _.find(comments, function(comment) {
                        return comment.body.match(/LGTM/gi) && comment.user.login === reviewer.replace(/^@/, '');
                      })
                    });
                  });
                }
              });
            });
            _org.repos.push(repo);
          });
        });
      });
    });
  };

  if (localStorage.getItem('accessToken')) {
    $scope.getData();
    Github.getUser().then(function(response) {
      $scope.user = response.data;
    });
  }

  $scope.reload = function() {
    $timeout(function() {
      $scope.getData();
      $scope.reload();
    }, 1000 * 60 * 5);
  };
  $scope.reload();
}]);
