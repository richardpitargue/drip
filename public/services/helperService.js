'use strict';

angular
    .module('app')
    .factory('HelperService', HelperService);

HelperService.$inject = ['$http', '$q'];

function HelperService($http, $q) {
    const services = {
        GET_LOCATIONS: getLocations,
        GET_CROPS: getCrops,
        GET_CROP_BY_NAME: getCropByName
    }

    return services;

    function getLocations() {
        let deferred = $q.defer();

        $http.get('/api/location')
        .then((locations) => {
            deferred.resolve(locations);
        })
        .catch((error) => {
            deferred.reject(error);
        });

         return deferred.promise;
    }

    function getCrops() {
        let deferred = $q.defer();

        $http.get('/api/crop')
        .then((crops) => {
            deferred.resolve(crops);
        })
        .catch((error) => {
            deferred.reject(error);
        });

         return deferred.promise;
    }

    function getCropByName(name) {
        let deferred = $q.defer();

        $http.get('/api/crop/' + name)
        .then((crop) => {
            deferred.resolve(crop);
        })
        .catch((error) => {
            deferred.reject(error);
        });

         return deferred.promise;
    }
}
