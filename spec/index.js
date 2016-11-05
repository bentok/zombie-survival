'use strict';
var assert = require('assert');

require('babel-core/register')({
  ignore: /node_modules/
});

let Player = require('../src/player/player').Player;
global.game = {
    world:{
        height:100
    }
};

// poly/mock HealthTimer
class HealthTimer {
    constructor() {
        console.log('setup a new HealthTimer');
    }
}

// poly/mock Move
class Move {
    constructor() {
        console.log('setup a new Move');
    }

    register() {}
    runLeft() {}
    runRight() {}
    idleLeft() {}
    idleRight() {}
}

global.HealthTimer = HealthTimer;
global.Move = Move;

describe('Player', function() {

    const player = new Player();
    it ('should have a game object', function () {
        assert.equal(player.game.world.height, 100);
    });

    it ('should have a health value of 100', function () {
        assert.equal(player.health, 100);
    });

    // it ('should deduct health when subtractHealth is called', function () {
    //     let val = 10;
    //     player.subtractHealth(val);
    //     assert.equal(player.health, 100 - val);
    // });

    it ('should double the health with doubleHealth is called', function () {
        player.doubleHealth();
        assert.equal(player.health, 200);
    });

    // it ('should add health when addHealth is called', function () {
    //     let val = 10;
    //     player.addHealth(val);
    //     console.log('current health', player.health)
    //     assert.equal(player.health, 100 + val);
    // });

});