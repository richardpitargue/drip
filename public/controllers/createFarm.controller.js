'use strict';

angular
    .module('app')
    .controller('CreateFarmController', CreateFarmController);

CreateFarmController.$inject = ['$scope', '$location', 'User', 'HelperService', 'FarmService'];

function CreateFarmController($scope, $location, User, HelperService, FarmService) {
    $scope.crops = [];
    $scope.locations = [];
    $scope.createFarm = createFarm;
    $scope.clickFarm = clickFarm;

    let marker;

    const northEast = L.latLng(21.924058, 115.342984);
    const southWest = L.latLng(4.566972, 128.614468);
    const bounds = L.latLngBounds(southWest, northEast);

    const now = new Date();
    $('#plantingDateField').datepicker();
    $('#plantingDateField').datepicker('setDate', now);
    $scope.plantingDate = now.toLocaleDateString();

    const map = L.map('waiss-explore-map', {
        maxBounds: bounds,
        center: [14.154604, 121.247505],
        zoom: 8,
        minZoom: 7
    });

    L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
        maxZoom: 20,
        subdomains:['mt0','mt1','mt2','mt3']
    }).addTo(map);

    HelperService.GET_LOCATIONS()
    .then((result) => {
        $scope.locations = result.data;
        $scope.location = $scope.locations[0];
    });

    HelperService.GET_CROPS()
    .then((result) => {
        let crops = result.data;

        for(let i = 0; i < crops.length; i++) {
            $scope.crops[i] = crops[i];
            $scope.crops[i].name = crops[i].name.charAt(0).toUpperCase() + crops[i].name.slice(1);
        }

        $scope.crop = $scope.crops[0];
        $scope.variety = $scope.crops[0].variety[0];
    });

    $scope.$watchCollection('location', () => {
        if(marker) {
            map.removeLayer(marker);
        }

        if($scope.location) {
            marker = new L.marker($scope.location.latLng, {
                title: $scope.location.name
            });
            marker.addTo(map);
            map.panTo($scope.location.latLng, {
                animate: true,
                duration: 0.75
            });
        }
    });

    function createFarm() {
        let date = $scope.plantingDate.split('/');

        let publicFarm = $('#public-checkbox')[0].checked;

        console.log(publicFarm);

        let month = parseInt(date[0])
        let day = parseInt(date[1])
        let year = parseInt(date[2])
        FarmService.CREATE_FARM(
            User._id,
            $scope.name,
            publicFarm,
            $scope.location._id,
            $scope.crop,
            $scope.variety,
            day,
            month,
            year
        )
        .then((farm) => {
            $location.path('/dashboard');
        });
    }

    function clickFarm($event) {
        $event.preventDefault();
    }
}
