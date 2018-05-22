/*******************************************
 local config file
********************************************/

// create node
var config = {}

config.healthTTL = "300000";
config.unregTTL = "600000";
config.registryKey = "ecc01cda-689a-4237-9590-9be7d45bd5ad"; // from https://www.uuidgenerator.net/version4

// publish node
module.exports = config;
