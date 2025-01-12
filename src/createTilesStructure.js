"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var createTilesStructure = function () {
    var baseDir = path.join(process.cwd(), 'public', 'img', 'tiles');
    // Уровень 0
    fs.mkdirSync(path.join(baseDir, '0', '0'), { recursive: true });
    // Уровень 1
    for (var i = 0; i <= 1; i++) {
        fs.mkdirSync(path.join(baseDir, '1', i.toString()), { recursive: true });
    }
    // Уровень 2
    for (var i = 0; i <= 3; i++) {
        fs.mkdirSync(path.join(baseDir, '2', i.toString()), { recursive: true });
    }
    // Уровень 3
    for (var i = 0; i <= 6; i++) {
        fs.mkdirSync(path.join(baseDir, '3', i.toString()), { recursive: true });
    }
    // Уровень 4
    for (var i = 0; i <= 12; i++) {
        fs.mkdirSync(path.join(baseDir, '4', i.toString()), { recursive: true });
    }
    // Уровень 5
    for (var i = 0; i <= 25; i++) {
        fs.mkdirSync(path.join(baseDir, '5', i.toString()), { recursive: true });
    }
};
createTilesStructure();
