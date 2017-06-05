'use strict';

angular
    .module('app')
    .factory('FarmService', FarmService);

FarmService.$inject = ['$http', '$q'];

function FarmService($http, $q) {
    const services = {
        FIND_ALL_BY_USER: findAllByUser,
        FIND_ALL: findAll,
        CREATE_FARM: createFarm,
        FIND_ALL_FARM_INFO: findAllFarmInfo,
        FIND_LATEST_FARM_INFO: findLatestFarmInfo,
        FIND_CROP: findCrop,
        ADD_IRRIGATION: addIrrigation,
        FIND_ALL_PUBLIC: findAllPublic
    }

    return services;

    function findAllByUser(userId) {
        let deferred = $q.defer();

        $http.get('/api/farm/' + userId)
        .then((farms) => {
            deferred.resolve(farms);
        })
        .catch((error) => {
            deferred.reject(error);
        });

        return deferred.promise;
    }

    function findAll() {
        let deferred = $q.defer();

        $http.get('/api/farm')
        .then((farms) => {
            deferred.resolve(farms);
        })
        .catch((error) => {
            deferred.reject(error);
        });

        return deferred.promise;
    }

    function createFarm(userId, name, publicFarm, locationId, crop, variety, day, month, year) {
        let deferred = $q.defer();
        
        $http.post('/api/farm', {
            userId,
            name,
            publicFarm,
            locationId,
            crop,
            variety,
            day,
            month,
            year
        })
        .then((farm) => {
            deferred.resolve(farm);
        })
        .catch((error) => {
            deferred.reject(error);
        });

        return deferred.promise;
    }

    function findAllFarmInfo(farmId) {
        let deferred = $q.defer();

        $http.get('/api/farm/info/' + farmId)
        .then((farminfos) => {
            deferred.resolve(farminfos);
        })
        .catch((error) => {
            deferred.reject(error);
        });

        return deferred.promise;
    }

    function findLatestFarmInfo(farmId) {
        let deferred = $q.defer();

        $http.get('/api/farm/' + farmId + '/latest')
        .then((farminfo) => {
            deferred.resolve(farminfo);
        })
        .catch((error) => {
            deferred.reject(error);
        });

        return deferred.promise;
    }

    function findCrop(cropId) {
        let deferred = $q.defer();

        $http.get('/api/crop/' + cropId)
        .then((crop) => {
            deferred.resolve(crop);
        })
        .catch((error) => {
            deferred.reject(error);
        });

        return deferred.promise;
    }

    function addIrrigation(farmId, irrigation, day, month, year, cropId) {
        let deferred = $q.defer();

        $http.post('/api/farm/info/' + farmId, {
            irrigation,
            day,
            month,
            year,
            cropId
        })
        .then((result) => {
            deferred.resolve(result);
        })
        .catch((error) => {
            deferred.reject(error);
        });

        return deferred.promise;
    }

    function findAllPublic() {
        let deferred = $q.defer();

        $http.get('/api/publicFarms')
        .then((farms) => {
            deferred.resolve(farms);
        })
        .catch((error) => {
            deferred.reject(error);
        });

        return deferred.promise;
    }
}
