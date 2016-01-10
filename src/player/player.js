var Player = (function(){
  this.health = 100;
  this.maxHealth = 100;
  this.healthTimer = new HealthTimer();
})();

function HealthTimer() {
  this.timer = game.time.create(false);
  this.loop = function(opts){
    opts = (typeof opts == 'object') ? opts : {};
    this.increment = opts.increment || 1000;
    this.action = opts.action || function(){};
    this.timer.loop(this.increment, this.action, this);
  }
}
