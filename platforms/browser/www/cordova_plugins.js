cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/mx.ferreyra.callnumber/www/CallNumber.js",
        "id": "mx.ferreyra.callnumber.CallNumber",
        "pluginId": "mx.ferreyra.callnumber",
        "clobbers": [
            "call"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-whitelist": "1.2.2",
    "mx.ferreyra.callnumber": "0.0.2"
}
// BOTTOM OF METADATA
});