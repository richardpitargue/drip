'use strict';

angular
    .module('app')
    .controller('DashboardController', DashboardController);

DashboardController.$inject = ['$scope', '$location', 'ngToast', 'User', 'FarmService', 'AuthService'];

function DashboardController($scope, $location, ngToast, User, FarmService, AuthService) {
    $scope.farms = [];
    $scope.hideFarmListView = false;
    $scope.hideFarmInfoView = true;
    $scope.createFarm = createFarm;
    $scope.viewFarm = viewFarm;
    $scope.back = back;
    $scope.signout = signout;

    FarmService.FIND_ALL_BY_USER(User._id)
    .then((result) => {
        $scope.farms = result.data;
    })
    .catch((error) => {
        // do something here lol
    });

    function createFarm() {function signout() {
        AuthService.SIGNOUT()
        .catch((error) => {
            ngToast.danger(error.data.message);
        });
    }
        $location.path('/create-farm');
    }

    function viewFarm(farm) {
        $scope.currentFarm = farm;
        $scope.hideFarmListView = true;
        $scope.hideFarmInfoView = false;
        $scope.data = [];
        $scope.loading = true;
        $scope.advisory = '';
        $scope.advisoryClass = '';
        $scope.addIrrigation = addIrrigation;
        $scope.showIrrigationAdvisory = false;
        $scope.irrigationAdvisoryMessage = '';

        const now = new Date();
        $('#updateDateField').datepicker();
        $('#updateDateField').datepicker('setDate', now);

        console.log($scope.currentFarm);

        FarmService.FIND_ALL_FARM_INFO($scope.currentFarm._id)
        .then((result) => {
            $scope.loading = false;
            let data = result.data;

            // sort data according to date
            data.sort((a, b) => {
                let dateA = new Date(a.date.year, a.date.month-1, a.date.day, 0, 0, 0, 0);
                let dateB = new Date(b.date.year, b.date.month-1, b.date.day, 0, 0, 0, 0);
                return dateA - dateB;
            });

            console.log(data);

            let latest = data[data.length-1];
            console.log(latest);

            // set advisory
            FarmService.FIND_CROP($scope.currentFarm.crop)
            .then((result) => {
                let mad = result.data.mad;
                // if(Math.abs(latest.waterDeficit) < result.data.mad) {
                //     $scope.advisoryClass = 'alert alert-danger';
                //     $scope.advisory = 'DANGER';
                // } else {
                //     $scope.advisoryClass = 'alert alert-success';
                //     $scope.advisory = 'LOOKING GOOD SON';
                // }
                if(latest.maturity >= 100) {
                    $scope.advisoryClass = 'alert alert-danger';
                    $scope.advisory = 'This farm has already reached maturity! Further monitoring has been disabled.';
                } else {
                    if(Math.abs(latest.waterDeficit) < mad) {
                        $scope.advisoryClass = 'alert alert-danger';
                        $scope.advisory = 'You should water this farm! It\'s soil moisture is currently ' + Math.abs((Math.abs(latest.waterDeficit)-mad).toFixed(2)) + ' mm below the management allowable depletion!';
                    } else {
                        $scope.advisoryClass = 'alert alert-success';
                        $scope.advisory  = 'This farm\'s soil moisture is currently ' + Math.abs((Math.abs(latest.waterDeficit)).toFixed(2)) + ' mm above the management allowable depletion. Keep it up!';
                        $scope.irrigationAdvisoryMessage = 'WARNING! Adding more irrigation to this farm can increase the risk of yield loss. Proceed only if you are sure of what you are doing.';
                        $scope.showIrrigationAdvisory = true;
                    }
                }

                // let categoriesArray = [];
                let madArray = [];
                let dataArray = [];
                // let rainfallArray = [];

                // let months = [
                //     'Jan',
                //     'Feb',
                //     'Mar',
                //     'Apr',
                //     'May',
                //     'Jun',
                //     'Jul',
                //     'Aug',
                //     'Sept',
                //     'Oct',
                //     'Nov',
                //     'Dec'
                // ];

                for(let i = 0; i < data.length; i++) {
                    // categoriesArray.push(months[data[i].date.month-1] + ' ' + data[i].date.day);
                    dataArray.push(-data[i].waterDeficit);
                    madArray.push(mad);
                    // rainfallArray.push(farm.data.rainfall[i].data);
                }

                let chart = Highcharts.chart('chartContainer', {
                    // {
                    //     name: 'Rainfall',
                    //     data: rainfallArray,
                    //     type: 'column',
                    //     tooltip: {
                    //         valueSuffix: 'mm'
                    //     }
                    // },
                    chart: {
                        zoomType: 'x'
                    },
                    title: {
                        text: 'Soil Moisture',
                        x: -20 //center
                    },
                    xAxis: {
                        type: 'datetime',
                        minTickInterval: 24 * 3600 * 1000
                    },
                    yAxis: {
                        title: {
                            text: 'Water, mm'
                        }
                    },
                    legend: {
                        layout: 'vertical',
                        align: 'right',
                        verticalAlign: 'middle',
                        borderWidth: 0
                    },
                    plotOptions: {
                        series: {
                            marker: {
                                enabled: false
                            }
                        }
                    },
                    plotOptions: {
                        area: {
                            fillColor: {
                                linearGradient: {
                                    x1: 0,
                                    y1: 0,
                                    x2: 0,
                                    y2: 1
                                },
                                stops: [
                                    [0, Highcharts.getOptions().colors[0]],
                                    [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                                ]
                            },
                            marker: {
                                radius: 2
                            },
                            lineWidth: 1,
                            states: {
                                hover: {
                                    lineWidth: 1
                                }
                            },
                            threshold: null
                        }
                    },
                    series: [{
                        name: 'Water',
                        type: 'area',
                        data: dataArray,
                        pointStart: Date.UTC(data[0].date.year, data[0].date.month-1, data[0].date.day, 0, 0, 0, 0),
                        pointInterval: 24 * 3600 * 1000, // one day
                        tooltip: {
                            valueSuffix: 'mm'
                        }
                    },{
                        name: 'Management Allowable Depletion',
                        data: madArray,
                        color: 'red',
                        pointStart: Date.UTC(data[0].date.year, data[0].date.month-1, data[0].date.day, 0, 0, 0, 0),
                        pointInterval: 24 * 3600 * 1000,
                        tooltip: {
                            valueSuffix: 'mm'
                        }
                    }]
                });
                // let date = new Date();
                // date.setDate(date.getDate() - 1);
                // chart.xAxis[0].setExtremes(
                //     Date.UTC(date.getFullYear(), date.getMonth() - 1, 0, 0, 0, 0, 0),
                //     Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
                // );
                // chart.showResetZoom();
            });
        })
        .catch((error) => {
            console.log(error);
        });
    }

    function back() {
        $scope.hideFarmListView = false;
        $scope.hideFarmInfoView = true;
    }

    function addIrrigation() {
        let date = $scope.updateDate.split('/');

        let month = parseInt(date[0])
        let day = parseInt(date[1])
        let year = parseInt(date[2])
        let amount = parseFloat($scope.amount);

        FarmService.ADD_IRRIGATION($scope.currentFarm._id, amount, day, month, year, $scope.currentFarm.crop)
        .then((result) => {
            $('#myModal').modal('toggle');
            viewFarm($scope.currentFarm)
        })
        .catch((error) => {
            // do something here?
        });
    }

    function signout() {
        AuthService.SIGNOUT()
        .then((result) => {
            $location.path('/');
        })
        .catch((error) => {
            ngToast.danger(error.data.message);
        });
    }
}
