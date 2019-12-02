/******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	function webpackJsonpCallback(data) {
/******/ 		var chunkIds = data[0];
/******/ 		var moreModules = data[1];
/******/ 		var executeModules = data[2];
/******/
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, resolves = [];
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(Object.prototype.hasOwnProperty.call(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 				resolves.push(installedChunks[chunkId][0]);
/******/ 			}
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				modules[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(data);
/******/
/******/ 		while(resolves.length) {
/******/ 			resolves.shift()();
/******/ 		}
/******/
/******/ 		// add entry modules from loaded chunk to deferred list
/******/ 		deferredModules.push.apply(deferredModules, executeModules || []);
/******/
/******/ 		// run deferred modules when all chunks ready
/******/ 		return checkDeferredModules();
/******/ 	};
/******/ 	function checkDeferredModules() {
/******/ 		var result;
/******/ 		for(var i = 0; i < deferredModules.length; i++) {
/******/ 			var deferredModule = deferredModules[i];
/******/ 			var fulfilled = true;
/******/ 			for(var j = 1; j < deferredModule.length; j++) {
/******/ 				var depId = deferredModule[j];
/******/ 				if(installedChunks[depId] !== 0) fulfilled = false;
/******/ 			}
/******/ 			if(fulfilled) {
/******/ 				deferredModules.splice(i--, 1);
/******/ 				result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
/******/ 			}
/******/ 		}
/******/
/******/ 		return result;
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading chunks
/******/ 	// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 	// Promise = chunk loading, 0 = chunk loaded
/******/ 	var installedChunks = {
/******/ 		"app": 0
/******/ 	};
/******/
/******/ 	var deferredModules = [];
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
/******/ 	var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
/******/ 	jsonpArray.push = webpackJsonpCallback;
/******/ 	jsonpArray = jsonpArray.slice();
/******/ 	for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
/******/ 	var parentJsonpFunction = oldJsonpFunction;
/******/
/******/
/******/ 	// add entry module to deferred list
/******/ 	deferredModules.push(["./src/main.ts","vendors"]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/helpers.ts":
/*!************************!*\
  !*** ./src/helpers.ts ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.getGameWidth = (scene) => {
    return scene.game.scale.width;
};
exports.getGameHeight = (scene) => {
    return scene.game.scale.height;
};


/***/ }),

/***/ "./src/lib/game-objects.class.ts":
/*!***************************************!*\
  !*** ./src/lib/game-objects.class.ts ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Text extends Phaser.GameObjects.Text {
}
exports.Text = Text;


/***/ }),

/***/ "./src/lib/index.ts":
/*!**************************!*\
  !*** ./src/lib/index.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./scene.class */ "./src/lib/scene.class.ts"));
__export(__webpack_require__(/*! ./game-objects.class */ "./src/lib/game-objects.class.ts"));


/***/ }),

/***/ "./src/lib/scene.class.ts":
/*!********************************!*\
  !*** ./src/lib/scene.class.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Scene extends Phaser.Scene {
}
exports.Scene = Scene;


/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Phaser = __importStar(__webpack_require__(/*! phaser */ "./node_modules/phaser/src/phaser.js"));
const scenes_1 = __webpack_require__(/*! ./scenes */ "./src/scenes/index.ts");
const gameConfig = {
    title: 'Zombie Survival',
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'matter',
        matter: {
            debug: true,
        },
    },
    scene: [scenes_1.BootScene, scenes_1.ControlsScene, scenes_1.MainMenuScene, scenes_1.GameScene],
    parent: 'content',
    backgroundColor: '#000000',
};
exports.game = new Phaser.Game(gameConfig);


/***/ }),

/***/ "./src/menu-button.text.ts":
/*!*********************************!*\
  !*** ./src/menu-button.text.ts ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = __webpack_require__(/*! ./lib */ "./src/lib/index.ts");
const buttonRestStyle = {
    fill: '#FFFFFF',
};
const buttonHoverStyle = {
    fill: '#7CFC00',
};
const buttonActiveStyle = {
    fill: '#000000',
};
class MenuButton extends lib_1.Text {
    constructor(scene, x, y, text, onClick) {
        super(scene, x, y, text, buttonRestStyle);
        scene.add.existing(this);
        this.setInteractive({ useHandCursor: true })
            .on('pointerover', this.enterMenuButtonHoverState)
            .on('pointerout', this.enterMenuButtonRestState)
            .on('pointerdown', this.enterMenuButtonActiveState)
            .on('pointerup', this.enterMenuButtonHoverState);
        if (onClick) {
            this.on('pointerup', onClick);
        }
    }
    enterMenuButtonHoverState() {
        this.setStyle(buttonHoverStyle);
    }
    enterMenuButtonRestState() {
        this.setStyle(buttonRestStyle);
    }
    enterMenuButtonActiveState() {
        this.setStyle(buttonActiveStyle);
    }
}
exports.MenuButton = MenuButton;


/***/ }),

/***/ "./src/scenes/boot.scene.ts":
/*!**********************************!*\
  !*** ./src/scenes/boot.scene.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = __webpack_require__(/*! ../lib */ "./src/lib/index.ts");
const sceneConfig = {
    active: false,
    visible: false,
    key: 'Boot',
};
class BootScene extends lib_1.Scene {
    constructor() {
        super(sceneConfig);
        this.getGameWidth = () => {
            return this.game.scale.width;
        };
        this.getGameHeight = () => {
            return this.game.scale.height;
        };
    }
    preload() {
        const halfWidth = this.getGameWidth() * 0.5;
        const halfHeight = this.getGameHeight() * 0.5;
        const progressBarHeight = 100;
        const progressBarWidth = 400;
        const progressBarContainer = this.add.rectangle(halfWidth, halfHeight, progressBarWidth, progressBarHeight, 0x000000);
        const progressBar = this.add.rectangle(halfWidth + 20 - progressBarContainer.width * 0.5, halfHeight, 10, progressBarHeight - 20, 0x888888);
        const loadingText = this.add.text(halfWidth - 75, halfHeight - 100, 'Loading...')
            .setFontSize(24);
        const percentText = this.add.text(halfWidth - 25, halfHeight, '0%').setFontSize(24);
        const assetText = this.add.text(halfWidth - 25, halfHeight + 100, '').setFontSize(24);
        this.load.on('progress', (value) => {
            progressBar.width = (progressBarWidth - 30) * value;
            const percent = value * 100;
            percentText.setText(`${percent}%`);
        });
        this.load.on('fileprogress', (file) => {
            assetText.setText(file.key);
        });
        this.load.on('complete', () => {
            loadingText.destroy();
            percentText.destroy();
            assetText.destroy();
            progressBar.destroy();
            progressBarContainer.destroy();
            this.scene.start('MainMenu');
        });
        this.loadAssets();
    }
    loadAssets() {
        this.load.image('ground', 'assets/backgrounds/hills-layer-5.png');
        this.load.image('zombie', 'assets/enemies/zombie.png');
    }
}
exports.BootScene = BootScene;


/***/ }),

/***/ "./src/scenes/controls.scene.ts":
/*!**************************************!*\
  !*** ./src/scenes/controls.scene.ts ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = __webpack_require__(/*! ../helpers */ "./src/helpers.ts");
const scene_class_1 = __webpack_require__(/*! ../lib/scene.class */ "./src/lib/scene.class.ts");
const sceneConfig = {
    active: false,
    visible: false,
    key: 'Controls',
};
class ControlsScene extends scene_class_1.Scene {
    constructor() {
        super(sceneConfig);
        this.speed = 200;
    }
    create() {
        this.image = this.matter.add.sprite(helpers_1.getGameWidth(this) / 2, helpers_1.getGameHeight(this) / 2, 'block');
        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.add.tileSprite(0, window.innerHeight, window.innerWidth, 256, 'ground').setOrigin(0, 1);
        this.matter.world.setBounds(0, 0, 800, 600, 32, true, true, false, true);
        const path = `0 ${window.innerHeight - 10} ${window.innerWidth} ${window.innerHeight - 10} ${window.innerWidth} ${window.innerHeight} 0 ${window.innerHeight}`;
        const verts = this.matter.verts.fromPath(path);
        this.matter.add.fromVertices(408, 492, verts, { ignoreGravity: true }, true, 0.01, 10);
        const zombie = this.matter.add
            .image(Phaser.Math.Between(32, 768), -200, 'zombie', Phaser.Math.Between(0, 5));
        zombie.setBounce(0.96);
    }
    update() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        if ((_c = (_b = (_a = this) === null || _a === void 0 ? void 0 : _a.cursorKeys) === null || _b === void 0 ? void 0 : _b.left) === null || _c === void 0 ? void 0 : _c.isDown) {
            this.image.setVelocityX(-10);
        }
        else if ((_f = (_e = (_d = this) === null || _d === void 0 ? void 0 : _d.cursorKeys) === null || _e === void 0 ? void 0 : _e.right) === null || _f === void 0 ? void 0 : _f.isDown) {
            this.image.setVelocityX(10);
        }
        else {
            this.image.setVelocityX(0);
        }
        if ((_j = (_h = (_g = this) === null || _g === void 0 ? void 0 : _g.cursorKeys) === null || _h === void 0 ? void 0 : _h.up) === null || _j === void 0 ? void 0 : _j.isDown) {
            this.image.setVelocityY(-10);
        }
        else if ((_m = (_l = (_k = this) === null || _k === void 0 ? void 0 : _k.cursorKeys) === null || _l === void 0 ? void 0 : _l.down) === null || _m === void 0 ? void 0 : _m.isDown) {
            this.image.setVelocityY(10);
        }
        else {
            this.image.setVelocityY(0);
        }
    }
}
exports.ControlsScene = ControlsScene;


/***/ }),

/***/ "./src/scenes/game.scene.ts":
/*!**********************************!*\
  !*** ./src/scenes/game.scene.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = __webpack_require__(/*! ../lib */ "./src/lib/index.ts");
const sceneConfig = {
    active: false,
    visible: false,
    key: 'Game',
};
class GameScene extends lib_1.Scene {
    constructor() {
        super(sceneConfig);
    }
    create() {
        this.add.tileSprite(0, window.innerHeight, window.innerWidth, 256, 'ground').setOrigin(0, 1);
        this.matter.world.setBounds(0, 0, 800, 600, 32, true, true, false, true);
        const path = `0 ${window.innerHeight - 10} ${window.innerWidth} ${window.innerHeight - 10} ${window.innerWidth} ${window.innerHeight} 0 ${window.innerHeight}`;
        const verts = this.matter.verts.fromPath(path);
        this.matter.add.fromVertices(408, 492, verts, { ignoreGravity: true }, true, 0.01, 10);
        const zombie = this.matter.add
            .image(Phaser.Math.Between(32, 768), -200, 'zombie', Phaser.Math.Between(0, 5));
        zombie.setBounce(0.96);
    }
    update() {
    }
}
exports.GameScene = GameScene;


/***/ }),

/***/ "./src/scenes/index.ts":
/*!*****************************!*\
  !*** ./src/scenes/index.ts ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var main_menu_scene_1 = __webpack_require__(/*! ./main-menu.scene */ "./src/scenes/main-menu.scene.ts");
exports.MainMenuScene = main_menu_scene_1.MainMenuScene;
var boot_scene_1 = __webpack_require__(/*! ./boot.scene */ "./src/scenes/boot.scene.ts");
exports.BootScene = boot_scene_1.BootScene;
var game_scene_1 = __webpack_require__(/*! ./game.scene */ "./src/scenes/game.scene.ts");
exports.GameScene = game_scene_1.GameScene;
var controls_scene_1 = __webpack_require__(/*! ./controls.scene */ "./src/scenes/controls.scene.ts");
exports.ControlsScene = controls_scene_1.ControlsScene;


/***/ }),

/***/ "./src/scenes/main-menu.scene.ts":
/*!***************************************!*\
  !*** ./src/scenes/main-menu.scene.ts ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = __webpack_require__(/*! ../lib */ "./src/lib/index.ts");
const menu_button_text_1 = __webpack_require__(/*! ../menu-button.text */ "./src/menu-button.text.ts");
const sceneConfig = {
    active: false,
    visible: false,
    key: 'MainMenu',
};
class MainMenuScene extends lib_1.Scene {
    constructor() {
        super(sceneConfig);
    }
    create() {
        this.add.text(100, 50, 'Sample', { fill: '#FFFFFF' }).setFontSize(24);
        new menu_button_text_1.MenuButton(this, 100, 150, 'Start Game', () => {
            this.scene.start('Game');
        });
        new menu_button_text_1.MenuButton(this, 100, 200, 'Controls Module', () => {
            this.scene.start('Controls');
        });
    }
}
exports.MainMenuScene = MainMenuScene;


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2hlbHBlcnMudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2xpYi9nYW1lLW9iamVjdHMuY2xhc3MudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2xpYi9pbmRleC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvbGliL3NjZW5lLmNsYXNzLnRzIiwid2VicGFjazovLy8uL3NyYy9tYWluLnRzIiwid2VicGFjazovLy8uL3NyYy9tZW51LWJ1dHRvbi50ZXh0LnRzIiwid2VicGFjazovLy8uL3NyYy9zY2VuZXMvYm9vdC5zY2VuZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvc2NlbmVzL2NvbnRyb2xzLnNjZW5lLnRzIiwid2VicGFjazovLy8uL3NyYy9zY2VuZXMvZ2FtZS5zY2VuZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvc2NlbmVzL2luZGV4LnRzIiwid2VicGFjazovLy8uL3NyYy9zY2VuZXMvbWFpbi1tZW51LnNjZW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7UUFBQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLFFBQVEsb0JBQW9CO1FBQzVCO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EsaUJBQWlCLDRCQUE0QjtRQUM3QztRQUNBO1FBQ0Esa0JBQWtCLDJCQUEyQjtRQUM3QztRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O1FBRUE7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7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O1FBQ0gsSUFBSSw2QkFBVSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLGlCQUFpQixFQUFFLEdBQUcsRUFBRTtZQUNyRCxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMvQixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQWRELHNDQWNDIiwiZmlsZSI6ImFwcC5idW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBpbnN0YWxsIGEgSlNPTlAgY2FsbGJhY2sgZm9yIGNodW5rIGxvYWRpbmdcbiBcdGZ1bmN0aW9uIHdlYnBhY2tKc29ucENhbGxiYWNrKGRhdGEpIHtcbiBcdFx0dmFyIGNodW5rSWRzID0gZGF0YVswXTtcbiBcdFx0dmFyIG1vcmVNb2R1bGVzID0gZGF0YVsxXTtcbiBcdFx0dmFyIGV4ZWN1dGVNb2R1bGVzID0gZGF0YVsyXTtcblxuIFx0XHQvLyBhZGQgXCJtb3JlTW9kdWxlc1wiIHRvIHRoZSBtb2R1bGVzIG9iamVjdCxcbiBcdFx0Ly8gdGhlbiBmbGFnIGFsbCBcImNodW5rSWRzXCIgYXMgbG9hZGVkIGFuZCBmaXJlIGNhbGxiYWNrXG4gXHRcdHZhciBtb2R1bGVJZCwgY2h1bmtJZCwgaSA9IDAsIHJlc29sdmVzID0gW107XG4gXHRcdGZvcig7aSA8IGNodW5rSWRzLmxlbmd0aDsgaSsrKSB7XG4gXHRcdFx0Y2h1bmtJZCA9IGNodW5rSWRzW2ldO1xuIFx0XHRcdGlmKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChpbnN0YWxsZWRDaHVua3MsIGNodW5rSWQpICYmIGluc3RhbGxlZENodW5rc1tjaHVua0lkXSkge1xuIFx0XHRcdFx0cmVzb2x2ZXMucHVzaChpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF1bMF0pO1xuIFx0XHRcdH1cbiBcdFx0XHRpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0gPSAwO1xuIFx0XHR9XG4gXHRcdGZvcihtb2R1bGVJZCBpbiBtb3JlTW9kdWxlcykge1xuIFx0XHRcdGlmKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChtb3JlTW9kdWxlcywgbW9kdWxlSWQpKSB7XG4gXHRcdFx0XHRtb2R1bGVzW21vZHVsZUlkXSA9IG1vcmVNb2R1bGVzW21vZHVsZUlkXTtcbiBcdFx0XHR9XG4gXHRcdH1cbiBcdFx0aWYocGFyZW50SnNvbnBGdW5jdGlvbikgcGFyZW50SnNvbnBGdW5jdGlvbihkYXRhKTtcblxuIFx0XHR3aGlsZShyZXNvbHZlcy5sZW5ndGgpIHtcbiBcdFx0XHRyZXNvbHZlcy5zaGlmdCgpKCk7XG4gXHRcdH1cblxuIFx0XHQvLyBhZGQgZW50cnkgbW9kdWxlcyBmcm9tIGxvYWRlZCBjaHVuayB0byBkZWZlcnJlZCBsaXN0XG4gXHRcdGRlZmVycmVkTW9kdWxlcy5wdXNoLmFwcGx5KGRlZmVycmVkTW9kdWxlcywgZXhlY3V0ZU1vZHVsZXMgfHwgW10pO1xuXG4gXHRcdC8vIHJ1biBkZWZlcnJlZCBtb2R1bGVzIHdoZW4gYWxsIGNodW5rcyByZWFkeVxuIFx0XHRyZXR1cm4gY2hlY2tEZWZlcnJlZE1vZHVsZXMoKTtcbiBcdH07XG4gXHRmdW5jdGlvbiBjaGVja0RlZmVycmVkTW9kdWxlcygpIHtcbiBcdFx0dmFyIHJlc3VsdDtcbiBcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGRlZmVycmVkTW9kdWxlcy5sZW5ndGg7IGkrKykge1xuIFx0XHRcdHZhciBkZWZlcnJlZE1vZHVsZSA9IGRlZmVycmVkTW9kdWxlc1tpXTtcbiBcdFx0XHR2YXIgZnVsZmlsbGVkID0gdHJ1ZTtcbiBcdFx0XHRmb3IodmFyIGogPSAxOyBqIDwgZGVmZXJyZWRNb2R1bGUubGVuZ3RoOyBqKyspIHtcbiBcdFx0XHRcdHZhciBkZXBJZCA9IGRlZmVycmVkTW9kdWxlW2pdO1xuIFx0XHRcdFx0aWYoaW5zdGFsbGVkQ2h1bmtzW2RlcElkXSAhPT0gMCkgZnVsZmlsbGVkID0gZmFsc2U7XG4gXHRcdFx0fVxuIFx0XHRcdGlmKGZ1bGZpbGxlZCkge1xuIFx0XHRcdFx0ZGVmZXJyZWRNb2R1bGVzLnNwbGljZShpLS0sIDEpO1xuIFx0XHRcdFx0cmVzdWx0ID0gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBkZWZlcnJlZE1vZHVsZVswXSk7XG4gXHRcdFx0fVxuIFx0XHR9XG5cbiBcdFx0cmV0dXJuIHJlc3VsdDtcbiBcdH1cblxuIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gb2JqZWN0IHRvIHN0b3JlIGxvYWRlZCBhbmQgbG9hZGluZyBjaHVua3NcbiBcdC8vIHVuZGVmaW5lZCA9IGNodW5rIG5vdCBsb2FkZWQsIG51bGwgPSBjaHVuayBwcmVsb2FkZWQvcHJlZmV0Y2hlZFxuIFx0Ly8gUHJvbWlzZSA9IGNodW5rIGxvYWRpbmcsIDAgPSBjaHVuayBsb2FkZWRcbiBcdHZhciBpbnN0YWxsZWRDaHVua3MgPSB7XG4gXHRcdFwiYXBwXCI6IDBcbiBcdH07XG5cbiBcdHZhciBkZWZlcnJlZE1vZHVsZXMgPSBbXTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0dmFyIGpzb25wQXJyYXkgPSB3aW5kb3dbXCJ3ZWJwYWNrSnNvbnBcIl0gPSB3aW5kb3dbXCJ3ZWJwYWNrSnNvbnBcIl0gfHwgW107XG4gXHR2YXIgb2xkSnNvbnBGdW5jdGlvbiA9IGpzb25wQXJyYXkucHVzaC5iaW5kKGpzb25wQXJyYXkpO1xuIFx0anNvbnBBcnJheS5wdXNoID0gd2VicGFja0pzb25wQ2FsbGJhY2s7XG4gXHRqc29ucEFycmF5ID0ganNvbnBBcnJheS5zbGljZSgpO1xuIFx0Zm9yKHZhciBpID0gMDsgaSA8IGpzb25wQXJyYXkubGVuZ3RoOyBpKyspIHdlYnBhY2tKc29ucENhbGxiYWNrKGpzb25wQXJyYXlbaV0pO1xuIFx0dmFyIHBhcmVudEpzb25wRnVuY3Rpb24gPSBvbGRKc29ucEZ1bmN0aW9uO1xuXG5cbiBcdC8vIGFkZCBlbnRyeSBtb2R1bGUgdG8gZGVmZXJyZWQgbGlzdFxuIFx0ZGVmZXJyZWRNb2R1bGVzLnB1c2goW1wiLi9zcmMvbWFpbi50c1wiLFwidmVuZG9yc1wiXSk7XG4gXHQvLyBydW4gZGVmZXJyZWQgbW9kdWxlcyB3aGVuIHJlYWR5XG4gXHRyZXR1cm4gY2hlY2tEZWZlcnJlZE1vZHVsZXMoKTtcbiIsImltcG9ydCB7IFNjZW5lIH0gZnJvbSAnLi9saWIvc2NlbmUuY2xhc3MnO1xuXG5leHBvcnQgY29uc3QgZ2V0R2FtZVdpZHRoID0gKHNjZW5lOiBTY2VuZSkgPT4ge1xuICByZXR1cm4gc2NlbmUuZ2FtZS5zY2FsZS53aWR0aDtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRHYW1lSGVpZ2h0ID0gKHNjZW5lOiBTY2VuZSkgPT4ge1xuICByZXR1cm4gc2NlbmUuZ2FtZS5zY2FsZS5oZWlnaHQ7XG59O1xuIiwiZXhwb3J0IGNsYXNzIFRleHQgZXh0ZW5kcyBQaGFzZXIuR2FtZU9iamVjdHMuVGV4dCB7fVxuIiwiZXhwb3J0ICogZnJvbSAnLi9pbnB1dC5pbnRlcmZhY2UnO1xuZXhwb3J0ICogZnJvbSAnLi9zY2VuZXMuaW50ZXJmYWNlJztcbmV4cG9ydCAqIGZyb20gJy4vZ2FtZS1vYmplY3RzLmludGVyZmFjZSc7XG5leHBvcnQgKiBmcm9tICcuL3BoeXNpY3MuaW50ZWZhY2UnO1xuZXhwb3J0ICogZnJvbSAnLi9zY2VuZS5jbGFzcyc7XG5leHBvcnQgKiBmcm9tICcuL2dhbWUtb2JqZWN0cy5jbGFzcyc7XG4iLCJleHBvcnQgY2xhc3MgU2NlbmUgZXh0ZW5kcyBQaGFzZXIuU2NlbmUge31cbiIsImltcG9ydCAqIGFzIFBoYXNlciBmcm9tICdwaGFzZXInO1xuaW1wb3J0IHsgQm9vdFNjZW5lLCBDb250cm9sc1NjZW5lLCBHYW1lU2NlbmUsIE1haW5NZW51U2NlbmUgfSBmcm9tICcuL3NjZW5lcyc7XG5cbmNvbnN0IGdhbWVDb25maWc6IFBoYXNlci5UeXBlcy5Db3JlLkdhbWVDb25maWcgPSB7XG4gIHRpdGxlOiAnWm9tYmllIFN1cnZpdmFsJyxcblxuICB0eXBlOiBQaGFzZXIuQVVUTyxcblxuICB3aWR0aDogd2luZG93LmlubmVyV2lkdGgsXG4gIGhlaWdodDogd2luZG93LmlubmVySGVpZ2h0LFxuXG4gIHBoeXNpY3M6IHtcbiAgICBkZWZhdWx0OiAnbWF0dGVyJyxcbiAgICBtYXR0ZXI6IHtcbiAgICAgIGRlYnVnOiB0cnVlLFxuICAgIH0sXG4gIH0sXG5cbiAgc2NlbmU6IFtCb290U2NlbmUsIENvbnRyb2xzU2NlbmUsIE1haW5NZW51U2NlbmUsIEdhbWVTY2VuZV0sXG5cbiAgcGFyZW50OiAnY29udGVudCcsXG4gIGJhY2tncm91bmRDb2xvcjogJyMwMDAwMDAnLFxufTtcblxuZXhwb3J0IGNvbnN0IGdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoZ2FtZUNvbmZpZyk7XG4iLCJpbXBvcnQgeyBJVGV4dFN0eWxlLCBTY2VuZSwgVGV4dCB9IGZyb20gJy4vbGliJztcblxuY29uc3QgYnV0dG9uUmVzdFN0eWxlID0ge1xuICBmaWxsOiAnI0ZGRkZGRicsXG59O1xuXG5jb25zdCBidXR0b25Ib3ZlclN0eWxlID0ge1xuICBmaWxsOiAnIzdDRkMwMCcsXG59O1xuXG5jb25zdCBidXR0b25BY3RpdmVTdHlsZSA9IHtcbiAgZmlsbDogJyMwMDAwMDAnLFxufTtcblxuZXhwb3J0IGNsYXNzIE1lbnVCdXR0b24gZXh0ZW5kcyBUZXh0IHtcbiAgY29uc3RydWN0b3Ioc2NlbmU6IFNjZW5lLCB4OiBudW1iZXIsIHk6IG51bWJlciwgdGV4dDogc3RyaW5nLCBvbkNsaWNrPzogKCkgPT4gdm9pZCkge1xuICAgIHN1cGVyKHNjZW5lLCB4LCB5LCB0ZXh0LCBidXR0b25SZXN0U3R5bGUgYXMgSVRleHRTdHlsZSk7XG4gICAgc2NlbmUuYWRkLmV4aXN0aW5nKHRoaXMpO1xuXG4gICAgdGhpcy5zZXRJbnRlcmFjdGl2ZSh7IHVzZUhhbmRDdXJzb3I6IHRydWUgfSlcbiAgICAgIC5vbigncG9pbnRlcm92ZXInLCB0aGlzLmVudGVyTWVudUJ1dHRvbkhvdmVyU3RhdGUpXG4gICAgICAub24oJ3BvaW50ZXJvdXQnLCB0aGlzLmVudGVyTWVudUJ1dHRvblJlc3RTdGF0ZSlcbiAgICAgIC5vbigncG9pbnRlcmRvd24nLCB0aGlzLmVudGVyTWVudUJ1dHRvbkFjdGl2ZVN0YXRlKVxuICAgICAgLm9uKCdwb2ludGVydXAnLCB0aGlzLmVudGVyTWVudUJ1dHRvbkhvdmVyU3RhdGUpO1xuXG4gICAgaWYgKG9uQ2xpY2spIHtcbiAgICAgIHRoaXMub24oJ3BvaW50ZXJ1cCcsIG9uQ2xpY2spO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZW50ZXJNZW51QnV0dG9uSG92ZXJTdGF0ZSgpIHtcbiAgICB0aGlzLnNldFN0eWxlKGJ1dHRvbkhvdmVyU3R5bGUpO1xuICB9XG5cbiAgcHJpdmF0ZSBlbnRlck1lbnVCdXR0b25SZXN0U3RhdGUoKSB7XG4gICAgdGhpcy5zZXRTdHlsZShidXR0b25SZXN0U3R5bGUpO1xuICB9XG5cbiAgcHJpdmF0ZSBlbnRlck1lbnVCdXR0b25BY3RpdmVTdGF0ZSgpIHtcbiAgICB0aGlzLnNldFN0eWxlKGJ1dHRvbkFjdGl2ZVN0eWxlKTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgSVNldHRpbmdzQ29uZmlnLCBTY2VuZSB9IGZyb20gJy4uL2xpYic7XG5cbmNvbnN0IHNjZW5lQ29uZmlnOiBJU2V0dGluZ3NDb25maWcgPSB7XG4gIGFjdGl2ZTogZmFsc2UsXG4gIHZpc2libGU6IGZhbHNlLFxuICBrZXk6ICdCb290Jyxcbn07XG5cbi8qKlxuICogVGhlIGluaXRpYWwgc2NlbmUgdGhhdCBsb2FkcyBhbGwgbmVjZXNzYXJ5IGFzc2V0cyB0byB0aGUgZ2FtZSBhbmQgZGlzcGxheXMgYSBsb2FkaW5nIGJhci5cbiAqL1xuZXhwb3J0IGNsYXNzIEJvb3RTY2VuZSBleHRlbmRzIFNjZW5lIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoc2NlbmVDb25maWcpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRHYW1lV2lkdGggPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuZ2FtZS5zY2FsZS53aWR0aDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0R2FtZUhlaWdodCA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5nYW1lLnNjYWxlLmhlaWdodDtcbiAgfVxuXG4gIHByZWxvYWQoKSB7XG4gICAgY29uc3QgaGFsZldpZHRoID0gdGhpcy5nZXRHYW1lV2lkdGgoKSAqIDAuNTtcbiAgICBjb25zdCBoYWxmSGVpZ2h0ID0gdGhpcy5nZXRHYW1lSGVpZ2h0KCkgKiAwLjU7XG5cbiAgICBjb25zdCBwcm9ncmVzc0JhckhlaWdodCA9IDEwMDtcbiAgICBjb25zdCBwcm9ncmVzc0JhcldpZHRoID0gNDAwO1xuXG4gICAgY29uc3QgcHJvZ3Jlc3NCYXJDb250YWluZXIgPSB0aGlzLmFkZC5yZWN0YW5nbGUoXG4gICAgICBoYWxmV2lkdGgsXG4gICAgICBoYWxmSGVpZ2h0LFxuICAgICAgcHJvZ3Jlc3NCYXJXaWR0aCxcbiAgICAgIHByb2dyZXNzQmFySGVpZ2h0LFxuICAgICAgMHgwMDAwMDAsXG4gICAgKTtcbiAgICBjb25zdCBwcm9ncmVzc0JhciA9IHRoaXMuYWRkLnJlY3RhbmdsZShcbiAgICAgIGhhbGZXaWR0aCArIDIwIC0gcHJvZ3Jlc3NCYXJDb250YWluZXIud2lkdGggKiAwLjUsXG4gICAgICBoYWxmSGVpZ2h0LFxuICAgICAgMTAsXG4gICAgICBwcm9ncmVzc0JhckhlaWdodCAtIDIwLCAweDg4ODg4OCxcbiAgICApO1xuXG4gICAgY29uc3QgbG9hZGluZ1RleHQgPSB0aGlzLmFkZC50ZXh0KGhhbGZXaWR0aCAtIDc1LCBoYWxmSGVpZ2h0IC0gMTAwLCAnTG9hZGluZy4uLicpXG4gICAgICAuc2V0Rm9udFNpemUoMjQpO1xuICAgIGNvbnN0IHBlcmNlbnRUZXh0ID0gdGhpcy5hZGQudGV4dChoYWxmV2lkdGggLSAyNSwgaGFsZkhlaWdodCwgJzAlJykuc2V0Rm9udFNpemUoMjQpO1xuICAgIGNvbnN0IGFzc2V0VGV4dCA9IHRoaXMuYWRkLnRleHQoaGFsZldpZHRoIC0gMjUsIGhhbGZIZWlnaHQgKyAxMDAsICcnKS5zZXRGb250U2l6ZSgyNCk7XG5cbiAgICB0aGlzLmxvYWQub24oJ3Byb2dyZXNzJywgKHZhbHVlOiBhbnkpID0+IHtcbiAgICAgIHByb2dyZXNzQmFyLndpZHRoID0gKHByb2dyZXNzQmFyV2lkdGggLSAzMCkgKiB2YWx1ZTtcblxuICAgICAgY29uc3QgcGVyY2VudCA9IHZhbHVlICogMTAwO1xuICAgICAgcGVyY2VudFRleHQuc2V0VGV4dChgJHtwZXJjZW50fSVgKTtcbiAgICB9KTtcblxuICAgIHRoaXMubG9hZC5vbignZmlsZXByb2dyZXNzJywgKGZpbGU6IGFueSkgPT4ge1xuICAgICAgYXNzZXRUZXh0LnNldFRleHQoZmlsZS5rZXkpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5sb2FkLm9uKCdjb21wbGV0ZScsICgpID0+IHtcbiAgICAgIGxvYWRpbmdUZXh0LmRlc3Ryb3koKTtcbiAgICAgIHBlcmNlbnRUZXh0LmRlc3Ryb3koKTtcbiAgICAgIGFzc2V0VGV4dC5kZXN0cm95KCk7XG4gICAgICBwcm9ncmVzc0Jhci5kZXN0cm95KCk7XG4gICAgICBwcm9ncmVzc0JhckNvbnRhaW5lci5kZXN0cm95KCk7XG5cbiAgICAgIHRoaXMuc2NlbmUuc3RhcnQoJ01haW5NZW51Jyk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmxvYWRBc3NldHMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGwgYXNzZXRzIHRoYXQgbmVlZCB0byBiZSBsb2FkZWQgYnkgdGhlIGdhbWUgKHNwcml0ZXMsIGltYWdlcywgYW5pbWF0aW9ucywgdGlsZXMsIG11c2ljLCBldGMpXG4gICAqIHNob3VsZCBiZSBhZGRlZCB0byB0aGlzIG1ldGhvZC4gT25jZSBsb2FkZWQgaW4sIHRoZSBsb2FkZXIgd2lsbCBrZWVwIHRyYWNrIG9mIHRoZW0sIGluZGVwZWRlbnRcbiAgICogb2Ygd2hpY2ggc2NlbmUgaXMgY3VycmVudGx5IGFjdGl2ZSwgc28gdGhleSBjYW4gYmUgYWNjZXNzZWQgYW55d2hlcmUuXG4gICAqL1xuICBwcml2YXRlIGxvYWRBc3NldHMoKSB7XG4gICAgLy8gTG9hZCBzYW1wbGUgYXNzZXRzXG4gICAgLy8gUmVwbGFjZSB3aXRoIHJlYWwgYXNzZXRzXG4gICAgdGhpcy5sb2FkLmltYWdlKCdncm91bmQnLCAnYXNzZXRzL2JhY2tncm91bmRzL2hpbGxzLWxheWVyLTUucG5nJyk7XG4gICAgdGhpcy5sb2FkLmltYWdlKCd6b21iaWUnLCAnYXNzZXRzL2VuZW1pZXMvem9tYmllLnBuZycpO1xuICB9XG59XG4iLCJpbXBvcnQgeyBnZXRHYW1lSGVpZ2h0LCBnZXRHYW1lV2lkdGggfSBmcm9tICcuLi9oZWxwZXJzJztcbmltcG9ydCB7IFNjZW5lIH0gZnJvbSAnLi4vbGliL3NjZW5lLmNsYXNzJztcblxuY29uc3Qgc2NlbmVDb25maWc6IFBoYXNlci5UeXBlcy5TY2VuZXMuU2V0dGluZ3NDb25maWcgPSB7XG4gIGFjdGl2ZTogZmFsc2UsXG4gIHZpc2libGU6IGZhbHNlLFxuICBrZXk6ICdDb250cm9scycsXG59O1xuXG5leHBvcnQgY2xhc3MgQ29udHJvbHNTY2VuZSBleHRlbmRzIFNjZW5lIHtcbiAgcHVibGljIHNwZWVkOiBudW1iZXIgPSAyMDA7XG4gIHByaXZhdGUgY3Vyc29yS2V5czogUGhhc2VyLlR5cGVzLklucHV0LktleWJvYXJkLkN1cnNvcktleXM7XG4gIHByaXZhdGUgaW1hZ2U6IFBoYXNlci5QaHlzaWNzLk1hdHRlci5TcHJpdGU7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoc2NlbmVDb25maWcpO1xuICB9XG5cbiAgY3JlYXRlKCkge1xuICAgIHRoaXMuaW1hZ2UgPSB0aGlzLm1hdHRlci5hZGQuc3ByaXRlKGdldEdhbWVXaWR0aCh0aGlzKSAvIDIsIGdldEdhbWVIZWlnaHQodGhpcykgLyAyLCAnYmxvY2snKTtcbiAgICB0aGlzLmN1cnNvcktleXMgPSB0aGlzLmlucHV0LmtleWJvYXJkLmNyZWF0ZUN1cnNvcktleXMoKTtcbiAgICB0aGlzLmFkZC50aWxlU3ByaXRlKDAsIHdpbmRvdy5pbm5lckhlaWdodCwgd2luZG93LmlubmVyV2lkdGgsIDI1NiwgJ2dyb3VuZCcpLnNldE9yaWdpbigwLCAxKTtcbiAgICB0aGlzLm1hdHRlci53b3JsZC5zZXRCb3VuZHMoMCwgMCwgODAwLCA2MDAsIDMyLCB0cnVlLCB0cnVlLCBmYWxzZSwgdHJ1ZSk7XG4gICAgY29uc3QgcGF0aCA9IGAwICR7d2luZG93LmlubmVySGVpZ2h0IC0gMTB9ICR7d2luZG93LmlubmVyV2lkdGh9ICR7d2luZG93LmlubmVySGVpZ2h0IC0gMTB9ICR7d2luZG93LmlubmVyV2lkdGh9ICR7d2luZG93LmlubmVySGVpZ2h0fSAwICR7d2luZG93LmlubmVySGVpZ2h0fWA7XG4gICAgY29uc3QgdmVydHMgPSAodGhpcy5tYXR0ZXIgYXMgYW55KS52ZXJ0cy5mcm9tUGF0aChwYXRoKTtcblxuICAgIHRoaXMubWF0dGVyLmFkZC5mcm9tVmVydGljZXMoNDA4LCA0OTIsIHZlcnRzLCB7IGlnbm9yZUdyYXZpdHk6IHRydWUgfSwgdHJ1ZSwgMC4wMSwgMTApO1xuXG4gICAgY29uc3Qgem9tYmllID0gdGhpcy5tYXR0ZXIuYWRkXG4gICAgICAuaW1hZ2UoUGhhc2VyLk1hdGguQmV0d2VlbigzMiwgNzY4KSwgLTIwMCwgJ3pvbWJpZScsIFBoYXNlci5NYXRoLkJldHdlZW4oMCwgNSkpO1xuXG4gICAgLy8gem9tYmllLnNldENpcmNsZSgpO1xuICAgIHpvbWJpZS5zZXRCb3VuY2UoMC45Nik7XG4gIH1cblxuICB1cGRhdGUoKSB7XG5cbiAgICBpZiAodGhpcz8uY3Vyc29yS2V5cz8ubGVmdD8uaXNEb3duKSB7XG4gICAgICB0aGlzLmltYWdlLnNldFZlbG9jaXR5WCgtMTApO1xuICAgIH0gZWxzZSBpZiAodGhpcz8uY3Vyc29yS2V5cz8ucmlnaHQ/LmlzRG93bikge1xuICAgICAgdGhpcy5pbWFnZS5zZXRWZWxvY2l0eVgoMTApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmltYWdlLnNldFZlbG9jaXR5WCgwKTtcbiAgICB9XG4gICAgaWYgKHRoaXM/LmN1cnNvcktleXM/LnVwPy5pc0Rvd24pIHtcbiAgICAgIHRoaXMuaW1hZ2Uuc2V0VmVsb2NpdHlZKC0xMCk7XG4gICAgfSBlbHNlIGlmICh0aGlzPy5jdXJzb3JLZXlzPy5kb3duPy5pc0Rvd24pIHtcbiAgICAgIHRoaXMuaW1hZ2Uuc2V0VmVsb2NpdHlZKDEwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5pbWFnZS5zZXRWZWxvY2l0eVkoMCk7XG4gICAgfVxuICB9XG59XG4iLCJcbmltcG9ydCB7XG4gIC8vIElCb2R5LFxuICAvLyBJQ3Vyc29yS2V5cyxcbiAgLy8gSVJlY3RhbmdsZSxcbiAgSVNldHRpbmdzQ29uZmlnLFxuICBTY2VuZSxcbn0gZnJvbSAnLi4vbGliJztcblxuY29uc3Qgc2NlbmVDb25maWc6IElTZXR0aW5nc0NvbmZpZyA9IHtcbiAgYWN0aXZlOiBmYWxzZSxcbiAgdmlzaWJsZTogZmFsc2UsXG4gIGtleTogJ0dhbWUnLFxufTtcblxuZXhwb3J0IGNsYXNzIEdhbWVTY2VuZSBleHRlbmRzIFNjZW5lIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihzY2VuZUNvbmZpZyk7XG4gIH1cblxuICBjcmVhdGUoKSB7XG4gICAgdGhpcy5hZGQudGlsZVNwcml0ZSgwLCB3aW5kb3cuaW5uZXJIZWlnaHQsIHdpbmRvdy5pbm5lcldpZHRoLCAyNTYsICdncm91bmQnKS5zZXRPcmlnaW4oMCwgMSk7XG4gICAgdGhpcy5tYXR0ZXIud29ybGQuc2V0Qm91bmRzKDAsIDAsIDgwMCwgNjAwLCAzMiwgdHJ1ZSwgdHJ1ZSwgZmFsc2UsIHRydWUpO1xuICAgIGNvbnN0IHBhdGggPSBgMCAke3dpbmRvdy5pbm5lckhlaWdodCAtIDEwfSAke3dpbmRvdy5pbm5lcldpZHRofSAke3dpbmRvdy5pbm5lckhlaWdodCAtIDEwfSAke3dpbmRvdy5pbm5lcldpZHRofSAke3dpbmRvdy5pbm5lckhlaWdodH0gMCAke3dpbmRvdy5pbm5lckhlaWdodH1gO1xuICAgIGNvbnN0IHZlcnRzID0gKHRoaXMubWF0dGVyIGFzIGFueSkudmVydHMuZnJvbVBhdGgocGF0aCk7XG5cbiAgICB0aGlzLm1hdHRlci5hZGQuZnJvbVZlcnRpY2VzKDQwOCwgNDkyLCB2ZXJ0cywgeyBpZ25vcmVHcmF2aXR5OiB0cnVlIH0sIHRydWUsIDAuMDEsIDEwKTtcblxuICAgIGNvbnN0IHpvbWJpZSA9IHRoaXMubWF0dGVyLmFkZFxuICAgICAgLmltYWdlKFBoYXNlci5NYXRoLkJldHdlZW4oMzIsIDc2OCksIC0yMDAsICd6b21iaWUnLCBQaGFzZXIuTWF0aC5CZXR3ZWVuKDAsIDUpKTtcblxuICAgIC8vIHpvbWJpZS5zZXRDaXJjbGUoKTtcbiAgICB6b21iaWUuc2V0Qm91bmNlKDAuOTYpO1xuICB9XG5cbiAgdXBkYXRlKCkge1xuICAgLy8gZ2FtZSB1cGRhdGUgbG9vcFxuICB9XG59XG4iLCJleHBvcnQgeyBNYWluTWVudVNjZW5lIH0gZnJvbSAnLi9tYWluLW1lbnUuc2NlbmUnO1xuZXhwb3J0IHsgQm9vdFNjZW5lIH0gZnJvbSAnLi9ib290LnNjZW5lJztcbmV4cG9ydCB7IEdhbWVTY2VuZSB9IGZyb20gJy4vZ2FtZS5zY2VuZSc7XG5leHBvcnQgeyBDb250cm9sc1NjZW5lIH0gZnJvbSAnLi9jb250cm9scy5zY2VuZSc7XG4iLCJpbXBvcnQgeyBJU2V0dGluZ3NDb25maWcsIFNjZW5lIH0gZnJvbSAnLi4vbGliJztcbmltcG9ydCB7IE1lbnVCdXR0b24gfSBmcm9tICcuLi9tZW51LWJ1dHRvbi50ZXh0JztcblxuY29uc3Qgc2NlbmVDb25maWc6IElTZXR0aW5nc0NvbmZpZyA9IHtcbiAgYWN0aXZlOiBmYWxzZSxcbiAgdmlzaWJsZTogZmFsc2UsXG4gIGtleTogJ01haW5NZW51Jyxcbn07XG5cbi8qKlxuICogVGhlIGluaXRpYWwgc2NlbmUgdGhhdCBzdGFydHMsIHNob3dzIHRoZSBzcGxhc2ggc2NyZWVucywgYW5kIGxvYWRzIHRoZSBuZWNlc3NhcnkgYXNzZXRzLlxuICovXG5leHBvcnQgY2xhc3MgTWFpbk1lbnVTY2VuZSBleHRlbmRzIFNjZW5lIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoc2NlbmVDb25maWcpO1xuICB9XG5cbiAgY3JlYXRlKCkge1xuICAgIHRoaXMuYWRkLnRleHQoMTAwLCA1MCwgJ1NhbXBsZScsIHsgZmlsbDogJyNGRkZGRkYnIH0pLnNldEZvbnRTaXplKDI0KTtcbiAgICBuZXcgTWVudUJ1dHRvbih0aGlzLCAxMDAsIDE1MCwgJ1N0YXJ0IEdhbWUnLCAoKSA9PiB7XG4gICAgICB0aGlzLnNjZW5lLnN0YXJ0KCdHYW1lJyk7XG4gICAgfSk7XG4gICAgbmV3IE1lbnVCdXR0b24odGhpcywgMTAwLCAyMDAsICdDb250cm9scyBNb2R1bGUnLCAoKSA9PiB7XG4gICAgICB0aGlzLnNjZW5lLnN0YXJ0KCdDb250cm9scycpO1xuICAgIH0pO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9