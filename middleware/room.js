var pg = require('pg');
var redis = require('redis-url').connect(process.env.REDISCLOUD_URL);
var skeletons = require('./skeleton.js');

module.exports = {
    show: function(req, res) {
        res.render('room', {
            title: res.locals.room.name,
            description: res.locals.room.description
        });
    },
    bySlug: function (req, res, next) {
        var skeleton1 = {x: 2, y: 2, name: 'the bone bandit', guild: 'miner', id: 1, worn: [{c:'boots'},{c:'leather'},{c:'pants'}], equipped: [{c:'buckler'},{c:'dagger'}]};
        var skeleton2 = {x: 3, y: 3, name: 'jesse james', guild: 'forester', id: 2, worn: [{c:'skirt'}], equipped: []};
        var skeleton3 = {x: 3, y: 3, name: 'the grateful dead', guild: 'engineer', id: 3, worn: [{c:'boots'},{c:'leather'}], equipped: [{c:'dagger'}]};
        var skeletons = [skeleton1, skeleton2, skeleton3];

        var testroom = {
            name: 'Test room',
            description: 'This is a test room where things are tested',
            rows: 8,
            columns: 8,
            skeletons: skeletons,
            elements:
                [
                    [{x:0, y:0, c:'sandstone wall e s', block: true},{x:1, y:0, c:'sandstone wall e w', block: true},{x:2, y:0, c:'sandstone wall e', block: true},{x:3, y:0, c:'black', el:[{c:'furniture door open', name:'to the smelters'}]},{x:4, y:0, c:'sandstone wall w', block: true},{x:5, y:0, c:'sandstone wall e w', block: true, el:[{c:'furniture torch'}]},{x:6, y:0, c:'sandstone wall e w', block: true},{x:7, y:0, c:'sandstone wall s w', block: true}],
                    [{x:0, y:1, c:'sandstone wall n s', block: true},{x:1, y:1, c:'sandstone f'},{x:2, y:1, c:'sandstone f'},{x:3, y:1, c:'sandstone f'},{x:4, y:1, c:'sandstone f'},{x:5, y:1, c:'sandstone f'},{x:6, y:1, c:'sandstone f'},{x:7, y:1, c:'sandstone wall n s', block: true}],
                    [{x:0, y:2, c:'sandstone wall n s', block: true},{x:1, y:2, c:'sandstone f'},{x:2, y:2, c:'sandstone f'},{x:3, y:2, c:'sandstone f'},{x:4, y:2, c:'sandstone f'},{x:5, y:2, c:'sandstone f'},{x:6, y:2, c:'sandstone f'},{x:7, y:2, c:'sandstone wall n s', block: true}],
                    [{x:0, y:3, c:'sandstone wall n s', block: true},{x:1, y:3, c:'sandstone f'},{x:2, y:3, c:'sandstone f'},{x:3, y:3, c:'sandstone f'},{x:4, y:3, c:'sandstone f'},{x:5, y:3, c:'sandstone f'},{x:6, y:3, c:'sandstone f'},{x:7, y:3, c:'sandstone wall n s', block: true}],
                    [{x:0, y:4, c:'sandstone wall n s broken', block: true},{x:1, y:4, c:'sandstone f'},{x:2, y:4, c:'sandstone f'},{c:'sandstone f'},{x:4, y:4, c:'sandstone f'},{x:5, y:4, c:'sandstone f'},{x:6, y:4, c:'sandstone f'},{x:7, y:4, c:'sandstone wall n s', block: true}],
                    [{x:0, y:5, c:'sandstone wall n s', block: true},{x:1, y:5, c:'sandstone f'},{x:2, y:5, c:'sandstone f'},{x:3, y:5, c:'sandstone f'},{x:4, y:5, c:'sandstone f'},{x:5, y:5, c:'sandstone f'},{x:6, y:5, c:'sandstone f'},{x:7, y:5, c:'sandstone wall n s', block: true}],
                    [{x:0, y:6, c:'sandstone wall n s', block: true},{x:1, y:6, c:'sandstone f'},{x:2, y:6, c:'sandstone f'},{x:3, y:6, c:'sandstone f'},{x:4, y:6, c:'sandstone f'},{x:5, y:6, c:'sandstone f'},{x:6, y:6, c:'sandstone f'},{x:7, y:6, c:'sandstone wall n s', block: true}],
                    [{x:0, y:7, c:'sandstone wall e n', block: true},{x:1, y:7, c:'sandstone wall e w', block: true},{x:2, y:7, c:'sandstone wall e w', block: true},{x:3, y:7, c:'sandstone wall e w', block: true},{x:4, y:7, c:'sandstone wall e w', block: true},{x:5, y:7, c:'sandstone wall e w', block: true},{x:6, y:7, c:'sandstone wall e w broken', block: true},{x:7, y:7, c:'sandstone wall n w', block: true}]
                ]
        };

        testroom.skeletons.forEach(function(skel) {
            skel.is_skeleton = true;
            testroom.elements.forEach(function(row){
                row.forEach(function(col){
                    if (col.x == skel.x && col.y == skel.y) {
                        if (!col.el) col.el = [];
                        col.el.push(skel);
                    }
                });
            });
        });



        redis.set('room_test', JSON.stringify(testroom));


        var roomkey = 'room_' + req.params.slug;
        redis.get(roomkey, function (err, value) {
            if (value) {
                res.locals.room = JSON.parse(value);
                next();
            } else {
                pg.connect(process.env.SKELETON_DATABASE_URL, function (err, client, done) {
                    client.query('SELECT r.* FROM rooms r WHERE r.slug = $1', [req.params.slug], function (err, result) {
                        done();
                        if (err) return console.error(err);

                        if (result.rows.length > 0) {
                            var room = result.rows[0];
                            res.locals.room = room;
                            redis.set(roomkey, JSON.stringify(room));
                            next();
                        } else {
                            res.status(404).render('notfound');
                        }
                    });
                });
            }
        });
    }
}