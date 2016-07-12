var Promise = require("bluebird"), _db;
exports.find = function (n, e, r, t) {
    return _db = t || db, r || (r = {}), _db.collectionAsync(n).then(function (n) {
        return n.findAsync(e, r).then(function (n) {
            return Promise.promisify(n.toArray, n)().then(function (n) {
                return n.forEach(function (n) {
                    n.id = n.id || n._id.id
                }), Promise.resolve(n)
            })
        })
    })
}, exports.insert = function (n, e, r) {
    return _db = r || db, _db.collectionAsync(n).then(function (n) {
        return n.insertAsync(e, {w: 1}).then(function (n) {
            return n.forEach(function (n) {
                n.id = n.id || n._id.id
            }), Promise.resolve(n)
        })
    })
}, exports.update = function (n, e, r, t) {
    return _db = t || db, _db.collectionAsync(n).then(function (n) {
        return n.updateAsync(e, r, {w: 1}).then(function (n) {
            return n[0]
        })
    })
}, exports.remove = function (n, e, r) {
    return _db = r || db, _db.collectionAsync(n).then(function (n) {
        return n.removeAsync(e, {w: 1})
    })
};