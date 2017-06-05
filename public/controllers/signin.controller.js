'use strict';

angular
    .module('app')
    .controller('SignInController', LoginController);

LoginController.$inject = ['$scope', '$location', 'ngToast', 'AuthService'];

function LoginController($scope, $location, ngToast, AuthService) {
    $scope.signin = signin;
    $scope.signout = signout;
    $scope.status = status;

    const urlParams = $location.search();
    const error = urlParams.error;

    $scope.email = urlParams.email || '';
    $scope.hideErrorMessage = urlParams.message ? false : true;
    $scope.message = urlParams.message || '';

    $('#emailField').focus();

    if(error === 'IncorrectPasswordError') {
        $('#passwordField').focus();
    }

    function signin() {
        let email = $scope.email;
        let password = $scope.password;

        AuthService.SIGNIN(email, password)
        .then((res) => {
            ngToast.create('Succesfully signed in.');
            $location.url($location.path());
            $location.path('/dashboard');
        }, (error) => {
            $scope.message = error.data.err.message;

            $scope.password = '';
            if(error.data.err.name === 'IncorrectPasswordError') {
                $('#passwordField').focus();
            } else {
                $scope.email = '';
                $('#emailField').focus();
            }

            $scope.hideErrorMessage = false;
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
}
