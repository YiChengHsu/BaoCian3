const router = require('express').Router();
const { setBidRecord,
        getBidRecords,
        getUserBidRecords} = require('../controllers/bid_controller');

const { wrapAsync } = require('../../util/util') 

router.route('/bid/records')
    .get(wrapAsync(getBidRecords))
    .post(wrapAsync(setBidRecord))
;

module.exports = router;