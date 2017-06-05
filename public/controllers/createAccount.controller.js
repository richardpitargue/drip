'use strict';

angular
    .module('app')
    .controller('SignUpController', SignUpController);

SignUpController.$inject = ['$scope', '$location', 'ngToast', 'AuthService'];

function SignUpController($scope, $location, ngToast, AuthService) {
    $scope.register = register;

    const urlParams = $location.search();
    const error = urlParams.error;

    $scope.email = urlParams.email || '';
    $scope.hideErrorMessage = urlParams.message ? false : true;
    $scope.message = urlParams.message || '';

    $('#emailField').focus();

    if(error === 'IncorrectPasswordError') {
        $('#passwordField').focus();
    }

    function register() {
        let email = $scope.email;
        let password = $scope.password;

        AuthService.REGISTER(email, password)
        .then((user) => {
            ngToast.create('Succesfully registered.');
            $location.path('/dashboard');
        })
        .catch((error) => {
            ngToast.danger(error.data.err.message);
        });
    }
}
