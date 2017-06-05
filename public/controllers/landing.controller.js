'use strict';

angular
    .module('app')
    .controller('LandingController', LandingController);

LandingController.$inject = ['$scope', '$location', 'ngToast', 'AuthService'];

function LandingController($scope, $location, ngToast, AuthService) {
    $scope.signin = signin;
    $scope.signout = signout;
    $scope.register = register;
    $scope.status = status;
    $scope.signup = signup;
    $scope.publicFarms = publicFarms;

    function publicFarms() {
        $location.path('/public');
    }

    function signin() {
        let email = $scope.email;
        let password = $scope.password;

        AuthService.SIGNIN(email, password)
        .then((res) => {
            ngToast.create('Succesfully logged in.');
            $location.path('/dashboard');
        })
        .catch((error) => {
            if(error.data.err.name === 'IncorrectUsernameError') {
                $location.path('/signin').search({
                    'error': error.data.err.name,
                    'message': error.data.err.message
                });
            } else {
                $location.path('/signin').search({
                    'error': error.data.err.name,
                    email,
                    'message': error.data.err.message
                });
            }
        });
    }

    function signout() {
        AuthService.SIGNOUT()
        .catch((error) => {
            ngToast.danger(error.data.message);
        });
    }

    function status() {
        return AuthService.STATUS.loggedIn;
    }

    function register() {
        let email = $scope.email;
        let password = $scope.password;

        AuthService.REGISTER(email, password)
        .catch((error) => {
            ngToast.danger(error.data.err.message);
        });
    }

    function signup() {
        $location.path('/signup');
    }
}
