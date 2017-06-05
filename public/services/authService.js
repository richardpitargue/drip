'use strict';

angular
    .module('app')
    .factory('AuthService', AuthService);

AuthService.$inject = ['$http', '$q'];

function AuthService($http, $q) {
    const status = {
        loggedIn: false,
        email: ''
    };

    const authService = {
        STATUS: status,
        SIGNIN: signin,
        SIGNOUT: signout,
        REGISTER: register,
        RESTORE_SESSION: restoreSession,
        GET_USER: getUser
    };

    return authService;

    function signin(email, password) {
        let deferred = $q.defer();

        $http.post('/api/account/login', {
            email,
            password
        })
        .then((user) => {
            status.loggedIn = true;
            status.email = user.data.email;
            deferred.resolve(user);
        })
        .catch((error) => {
            status.loggedIn = false;
            status.email = '';
            deferred.reject(error);
        });

        return deferred.promise;
    }

    function signout() {
        let deferred = $q.defer();

        $http.get('/api/account/logout')
        .then((user) => {
            status.loggedIn = false;
            status.email = '';
            deferred.resolve(user);
        })
        .catch((error) => {
            status.loggedIn = false;
            status.email = '';
            deferred.reject(error);
        });

         return deferred.promise;
    }

    function register(email, password) {
        let deferred = $q.defer();

        $http.post('/api/account/register', {
            'email': email,
            'password': password
        })
        .then((user) => {
            status.loggedIn = true;
            status.email = user.data.email;
            deferred.resolve(user);
        })
        .catch((error) => {
            status.loggedIn = false;
            status.email = '';
            deferred.reject(error);
        });

        return deferred.promise;
    }

    function restoreSession() {
        $http.get('/api/account/status')
        .then((res) => {
            if(res.data) {
                status.loggedIn = true;
                status.email = res.data.email;
            }
        });
    }

    function getUser() {
        let deferred = $q.defer();

        $http.get('/api/account/status')
        .then((res) => {
            if(res.data) {
                deferred.resolve(res.data);
            } else {
                deferred.reject();
            }
        });

        return deferred.promise;
    }
}
