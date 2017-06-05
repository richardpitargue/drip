'use strict';

angular
    .module('app')
    .controller('PublicController', PublicController);

PublicController.$inject = ['$scope', '$location', 'ngToast','FarmService', 'AuthService'];

function PublicController($scope, $location, ngToast, FarmService, AuthService) {
    $scope.farms = [];
    $scope.hideFarmListView = false;
    $scope.hideFarmInfoView = true;
    $scope.viewFarm = viewFarm;
    $scope.back = back;
    $scope.status = status;
    $scope.signin = signin;
    $scope.signout = signout;

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

    FarmService.FIND_ALL_PUBLIC()
    .then((result) => {
        $scope.farms = result.data;
    })
    .catch((error) => {
        console.log(error);
        // do something here lol
    });

    function createFarm() {
        $location.path('/create-farm');
    }

    function viewFarm(farm) {
        $scope.currentFarm = farm;
        $scope.hideFarmListView = true;
        $scope.hideFarmInfoView = false;
        $scope.data = [];
        $scope.loading = true;

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
                        text: 'Water Deficit',
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
}
