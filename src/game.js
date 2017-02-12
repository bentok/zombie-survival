import { Zone1 } from './states/zone1/zone1';
import { applyMiddleware, createStore } from 'redux';
import createLogger from 'redux-logger';


function gameReducer (state = {}, action) {
  switch (action.type) {
    case 'ZONE':
      return Object.assign({}, state, {
        zone: action.zone
      });
    default: 
      return state;
  }
}

const store = createStore(
    gameReducer,
    applyMiddleware(createLogger())
  );

store.dispatch({
  type: 'ZONE',
  zone: 1
});

const zone1 = new Zone1();

class Game extends Phaser.Game {

  constructor () {
    super(window.innerWidth, window.innerHeight, Phaser.AUTO, '', null);
    this.state.add('Zone1', zone1, false);
    this.state.start('Zone1');
  }
  
}

const game = new Game();
