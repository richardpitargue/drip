'use strict';

import accountController from '../controllers/accountController';
import locationController from '../controllers/locationController';
import farmController from '../controllers/farmController';
import cropController from '../controllers/cropController';

module.exports = (router) => {
    router.route('/account/login')
        .post(accountController.login);

    router.route('/account/register')
        .post(accountController.register);

    router.route('/account/logout')
        .get(accountController.logout);

    router.route('/account/status')
        .get(accountController.status);

    router.route('/location/:name')
        .get(locationController.findOneByName);

    router.route('/location')
        .get(locationController.findAll);

    router.route('/publicFarms')
        .get(farmController.findAllPublic);

    router.route('/farm/:userId')
        .get(farmController.findAllByUser);

    router.route('/farm/:farmId/latest')
        .get(farmController.findLatestFarmInfo);

    router.route('/farm/info/:farmId')
        .get(farmController.findAllFarmInfoByFarmId)
        .post(farmController.addIrrigation);

    router.route('/farm/info')
        .post(farmController.createFarmInfo);

    router.route('/farm')
        .get(farmController.findAll)
        .post(farmController.create);

    router.route('/crop/:cropId')
        .get(cropController.findById);

    router.route('/crop')
        .get(cropController.findAll)
        .post(cropController.create);

    return router;
}
