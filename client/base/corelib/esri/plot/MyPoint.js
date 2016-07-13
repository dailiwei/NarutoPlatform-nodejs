/**
 * Created by dailiwei on 14/12/30.
 */
define([
    "dojo/_base/declare",
    "dojo/_base/lang"
], function (
    declare,lang
) {
    return declare([], {
        x:0,
        y:0,
        constructor: function(_x,_y) {
            this.x = _x;
            this.y = _y;
        }
    });
});