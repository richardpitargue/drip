'use strict';

angular
    .module('app', ['ngRoute', 'ngToast', 'ngAnimate'])
    .config(config)
    .run(run);

config.$inject = ['$routeProvider', '$locationProvider', 'ngToastProvider'];

function config($routeProvider, $locationProvider, ngToastProvider) {
    const SIGNIN_REQUIRED = ['$q', 'AuthService', ($q, AuthService) => {
        let deferred = $q.defer();

        AuthService.GET_USER()
        .then((user) => {
            deferred.resolve(user);
        })
        .catch(() => {
            deferred.reject('AUTH_REQUIRED');
        })

        return deferred.promise;
    }];
    const ANONYMOUS_REQUIRED = ['$q', 'AuthService', ($q, AuthService) => {
        let deferred = $q.defer();

        AuthService.GET_USER()
        .then((user) => {
            deferred.reject({
                user,
                message: 'ALREADY_SIGNED_IN'
            });
        })
        .catch(() => {
            deferred.resolve();
        })

        return deferred.promise;
    }]

    $routeProvider
        .when('/', {
            controller: 'LandingController',
            templateUrl: 'templates/landing.html'
        })
        .when('/dashboard', {
            controller: 'DashboardController',
            templateUrl: 'templates/dashboard.html',
            resolve: {
                'User': SIGNIN_REQUIRED
            }
        })
        .when('/signin', {
            controller: 'SignInController',
            templateUrl: 'templates/signin.html',
            resolve: {
                'User': ANONYMOUS_REQUIRED
            }
        })
        .when('/signup', {
            controller: 'SignUpController',
            templateUrl: 'templates/createAccount.html',
            resolve: {
                'User': ANONYMOUS_REQUIRED
            }
        })
        .when('/create-farm', {
            controller: 'CreateFarmController',
            templateUrl: 'templates/createFarm.html',
            resolve: {
                'User': SIGNIN_REQUIRED
            }
        })
        .when('/public', {
            controller: 'PublicController',
            templateUrl: 'templates/public.html',
        })
        .otherwise({
            templateUrl: 'templates/notfound.html'
        });

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false,
        rewriteLinks: false
    });

    ngToastProvider.configure({
        animation: 'slide',
        timeout: 3500
    });
}

run.$inject = ['$rootScope', '$location', 'ngToast', 'AuthService'];

function run($rootScope, $location, ngToast, AuthService) {
    AuthService.RESTORE_SESSION();

    $rootScope.$on('$routeChangeError', (event, next, prev, error) => {
        if(error === 'AUTH_REQUIRED') {
            $location.path('/signin').search({
                'message': 'Please sign in to continue.'
            });
        } else if(error.message === 'ALREADY_SIGNED_IN') {
            $location.path('/dashboard');
            ngToast.create('Welcome back, ' + error.user.firstName + '!');
        }
    });
}
