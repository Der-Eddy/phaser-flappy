windows.onload = function() {
	var game = new Phaser.Game(320, 480, Phaser.AUTO, "", { preload: preload, create: create, update: update});
	var bird;
	var birdGravity = 800;
	var birdSpeed = 125;
	var birdFlapPower = 250;
	var pipeInterval = 2000;
	var pipeHole = 120;
	var pipeGroup;
	var score = 0;
	var scoreText;
	var topScore;

	function preload(){
		game.load.image("bird", "bird.png");
		game.load.image("pipe", "pipe.png");
	}

	function create(){
		pipeGroup = game.add.group();
		topScore = localStorage.getItem("topFlappyScore")==null?0:localStorage.getItem("topFlappyScore");
		scoreText = game.add.text(10, 10, "-", { font: "bold 16px Arial"});
		updateScore();
		game.stage.backgroundColor = "#87CEEB";
		game.stage.disableVisibilityChange = true;
		game.physics.startSystem(Phaser.Physics.ARCADE);
		bird = game.add.sprite(80, 240, "bird");
		bird.anchor.set(0.5);
		game.physics.arcade.enable(bird);
		bird.body.gravity.y = birdGravity;
		game.input.onDown.add(flap, this);
		game.time.events.loop(pipeInterval, addPipe);
		addPipe();
	}

	function update(){
		game.physics.arcade.collide(bird, pipeGroup, die);
		if (bird.y > game.height){
			die();
		}
	}

	game.state.add("Play", play);
	game.state.start("Play");

	function updateScore(){
		scoreText.text = "Score: " + score + "\nBest Score: " + topScore;
	}

	function flap(){
		bird.body.velocity.y = birdFlapPower;
	}

	function addPipe(){
		var pipeHolePosition = game.rnd.between(50, 430-pipeHole);
		var upperPipe = new Pipe(game, 320, pipeHolePosition-480, -birdSpeed);
		game.add.existing(upperPipe);
		pipeGroup.add(upperPipe);
		var lowerPipe = new Pipe(game, 320, pipeHolePosition+pipeHole, -birdSpeed);
		game.add.existing(lowerPipe);
		pipeGroup.add(lowerPipe);
	}

	function die(){
		localStorage.setItem("topFlappyScore", Math.max(score, topScore));
		game.state.start("Play");
	}

	Pipe = function(game, x, y, speed){
		Phaser.Sprite.call(this, game, x, y, "pipe");
		game.physics,enable(this, Phaser.Physics.ARCADE);
		this.body.velocity.x = speed;
		this.giveScore = true;
	}

	Pipe.prototype = Object.create(Phaser.Sprite.prototype);
	Pipe.prototype.constructor = Pipe;

	Pipe.prototype.update = function(){
		if (this.x+this.width < bird.x && this.giveScore){
			score += 0.5;
			updateScore();
			this.giveScore = false;
		}
		if (this.x < -this.width){
			this.destroy();
		}
	}
}