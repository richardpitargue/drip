import Location from '../models/location';

// insert initial data of locations if the collection is empty
Location.findOne({}, (error, result) => {
    if(!result) {
        const locations = [
            {
                name: 'Los Baños, Laguna',
                latLng: [14.166667, 121.216667],
                stationId: 'uplbsaraivc1'
            },
            {
                name: 'Cabagan, Isabela',
                latLng: [17.43, 121.77],
                stationId: 'uplbsaraivc2'
            },
            {
                name: 'Echague, Isabela',
                latLng: [16.7, 121.65],
                stationId: 'uplbsaraivc3'
            },
            {
                name: 'Muñoz, Nueva Ecija',
                latLng: [15.716667, 120.9],
                stationId: 'uplbsaraivc4'
            },
            {
                name: 'Tiaong, Quezon',
                latLng: [13.95, 121.316667],
                stationId: 'uplbsaraivc5'
            },
            {
                name: 'Lambunao, Iloilo',
                latLng: [11.05, 122.48],
                stationId: 'uplbsaraivc6'
            },
            {
                name: 'Barili, Cebu',
                latLng: [10.12, 123.52],
                stationId: 'uplbsaraivc7'
            },
            {
                name: 'Guinobatan, Albay',
                latLng: [13.18, 123.6],
                stationId: 'uplbsaraivc8'
            },
            {
                name: 'Aborlan, Palawan',
                latLng: [9.433333, 118.55],
                stationId: 'uplbsaraivc9'
            },
            {
                name: 'Victoria, Oriental Mindoro',
                latLng: [13.366667, 121.2],
                stationId: 'uplbsaraivc10'
            },
            {
                name: 'Santa Cruz, Occidental Mindoro',
                latLng: [13.116667, 120.85],
                stationId: 'uplbsaraivc11'
            },
            {
                name: 'Zamboanga City',
                latLng: [6.92, 122.08],
                stationId: 'uplbsaraivc12'
            },
            {
                name: 'Matanao, Davao del Sur',
                latLng: [6.75, 125.233333],
                stationId: 'uplbsaraivc13'
            },
            {
                name: 'Malita, Davao Occidental',
                latLng: [6.4, 125.6],
                stationId: 'uplbsaraivc14'
            },
            {
                name: 'Maramag, Bukidnon',
                latLng: [7.77, 125],
                stationId: 'uplbsaraivc15'
            },
            {
                name: 'Claveria, Misamis Oriental',
                latLng: [8.616667, 124.883333],
                stationId: 'uplbsaraivc16'
            },
            {
                name: 'Kabacan, Cotabato',
                latLng: [7.12, 124.82],
                stationId: 'uplbsaraivc17'
            },
            {
                name: 'La Carlota, Negros Occidental',
                latLng: [10.416667, 122.916667],
                stationId: 'uplbsaraivc19'
            }
        ]
        Location.create(locations);
    }
});

exports.findAll = (req, res) => {
    Location.find({}, (error, result) => {
        if(error) {
            return res.status(500).send(error);
        }

        if(result.length === 0) {
            return res.status(404).send({
                'message': 'No data found.'
            })
        }

        return res.send(result);
    });
}

exports.findOneByName = (req, res) => {
    let name = req.params.name;

    if(typeof name === 'undefined') {
        return res.status(400).send({
            'message': 'Please provide a location name.'
        });
    }

    Location.findOne({name}, (error, result) => {
        if(error) {
            return res.status(500).send(error);
        }

        if(!result) {
            return res.status(404).send({
                'message': 'No data found.'
            })
        }

        return res.send(result);
    });
}
