import { Component, OnInit } from '@angular/core';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { ModalController } from '@ionic/angular';
import { ModalPage } from '../modal/modal.page';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-play',
  templateUrl: './play.page.html',
  styleUrls: ['./play.page.scss'],
})
export class PlayPage implements OnInit {

  constructor(private screen_orientation: ScreenOrientation, public modal: ModalController, public storage: Storage) { }

  ngOnInit() {

  	this.setup();

  }
  	coveringWalls = [
  		{top: 0, left: 0, height: 0, width: 0},
  		{top: 0, left: 0, height: 0, width: 0},
  		{top: 0, left: 0, height: 0, width: 0},
  		{top: 0, left: 0, height: 0, width: 0}
  	]
	characterPosition = {
		top: 60,
		left: 70,
		direction: 3,
	};
	upgradePosition = {
		top: 0,
		left: 0,
	};
	playingFieldPosition = {
		top: 0,
		left: 0,
	};
	points = {
		top: 0,
		left: 0,
		width: 0,
		height: 0,
		value: 0,
	};
	characterSize = 15;
	playingWidth = 0;
	playingHeight = 0;
	highscore = 0;
	playing = false;
	noGoZone = [];
	totalWalls = 0;
	maxWalls = 100;
	walls = [];
	playingInterval = 100;
	enemies = [];
	gameOver = false;
	timer;
	enemyTimer;

	setup()
	{
		//console.log(this.screen_orientation.type);
	  	//supposedly screen_orientation has been locked on config.xml page

	  	//make playwidth divisable by character size;
	  	var remainderx = window.innerWidth % this.characterSize;
	  	var remaindery = window.innerHeight % this.characterSize;
	  	this.playingWidth = window.innerWidth - remainderx;
	  	this.playingHeight = window.innerHeight - remaindery;

	  	this.playingFieldPosition.top = remaindery / 2;
	  	this.playingFieldPosition.left = remainderx / 2;

	  	this.coveringWalls[0] = {top: 0, left: 0, height: (remaindery / 2), width: window.innerWidth};
	  	this.coveringWalls[1] = {top: 0, left: - 1, height: window.innerHeight, width: (remainderx / 2) + 1};
	  	this.coveringWalls[2] = {top: window.innerHeight - (remaindery / 2), left: 0, height: (remaindery / 2) + 1, width: window.innerWidth};
	  	this.coveringWalls[3] = {top: 0, left: window.innerWidth - (remainderx / 2), height: window.innerHeight, width: remainderx / 2};

	  	this.createPointsArea();
	  	this.createWalls();
	  	this.roundOffWalls();
	  	this.createUpgrade();
	  	this.createEnemy();
	  	this.moveInCharacter();
	  	this.getHighscore();

	  	window.setTimeout(() => {
	  		console.log("boom starting");
	  		this.startOrStop();
	  	}, 2000); 
	}

	getHighscore()
	{
		this.storage.get('highscore').then((val) => {
	      	if (val != null)
	      	{
	  		 	this.highscore = val.value;
	  		 	console.log("Not a new one. " + this.highscore);
	     	}
	      	else {
	      		this.highscore = this.points.value;
	      		this.storage.set('highscore', this.points);
	      	}
	  	});
	}

	getRandomFour(previousDirection)
	{
		var sucess = false;
		var solution;
		while (sucess == false)
		{
			sucess = true;
			solution =  Math.floor(Math.random() * 4);
			if(previousDirection == 1 && solution == 3)
			{
				sucess = false;
			}
			else if (previousDirection == 3 && solution == 1)
			{
				sucess = false;
			}
			else if (previousDirection == 4 && solution == 2)
			{
				sucess = false;
			}
			else if (previousDirection == 2 && solution == 4)
			{
				sucess = false;
			}
		}
		return solution
			
	}


	theresAWallThere(x, y)
	{
		for (var i = this.walls.length - 1; i >= 0; i--) {
			if (this.walls[i].top == y && this.walls[i].left == x)
				return true;
		}
		return false;
	}

	createAWall(topx, leftx, previousDirection, additionalWall)
	{
		if ((topx >= 0 && topx < this.playingHeight) && (leftx >= this.characterSize && leftx < this.playingWidth))
		{
			if (this.theresAWallThere(topx, leftx) == false)
			{
				if (this.totalWalls < this.maxWalls)
				{
					if (!this.inNoGoZone(topx, leftx))
					{
						var wall = {
							top: topx,
							left: leftx,
							borderRadius: {
								borderTopLeftRadius: 0, 
								borderTopRightRadius: 0,
								borderBottomLeftRadius: 0,
								borderBottomRightRadius: 0
							},
							classes: {
								one: false,
								two: false,
								three: false,
								four: false
							},
							wallId: "wall"+ this.totalWalls,
						}
						this.walls.push(wall);
						this.totalWalls++;


						if (additionalWall)
						{
							//The higher the list of possible numbers, the more likely the if statement will be called.
							var random = Math.floor(Math.random() * 30);
							if (random != 0)
							{
								//then lets add another wall!
								var continueOnPath = Math.floor(Math.random() * 3);
								var random2 = 0;
								if (continueOnPath != 0 && previousDirection != 0)
								{
									random2 = previousDirection;
								}
								else{
									random2 = this.getRandomFour(previousDirection)
								}

								if (random2 == 1){
									this.createAWall(topx - this.characterSize, leftx, 1, true);
								}
								else if (random2 == 2){
									this.createAWall(topx, leftx + this.characterSize, 2, true);
								}
								else if (random2 == 3){
									this.createAWall(topx + this.characterSize, leftx, 3, true);
								}
								else if (random2 == 4){
									this.createAWall(topx, leftx - this.characterSize, 4, true);
								}
							}
						} 
					}
				}
			}
		}
	}
	inNoGoZone(top, left)
	{
		var self = this;
		var inRange = false;
		for (var i = 0; i < this.noGoZone.length; i++)
		{
			var zone = this.noGoZone[i];
			var farthestRightBlock = zone.left + zone.width;
			var farthestDownBlock = zone.top + zone.height;
			if((top >= zone.top && top < farthestDownBlock) && (left >= zone.left && left < farthestRightBlock))
			{
				inRange = true;
				return inRange;
			}

		};
		return inRange;
	}
	createWalls() {
		var leftx = this.characterSize; //start at first spot, don't put anything in 1st position;
		var topy = 0;

		while (leftx < this.playingWidth)
		{
			if (topy < this.playingHeight)
			{
				if (this.inNoGoZone(topy, leftx) != true)
				{

					var random = Math.floor(Math.random() * 150);
					if (random == 15)
					{
						this.createAWall(topy, leftx, 0, true);
						if (this.totalWalls == this.maxWalls)
						{
							break;
						}
					}
				}
				topy = topy + this.characterSize;
			}
			else {
				leftx = leftx + this.characterSize;
				topy = 0;
			}
		}
	}


	roundOffWalls()
	{
		var self = this;
		var size = this.characterSize;
		this.walls.forEach(function(wall)
		{
			var radius = size/ 2;

			var wallLeft = !self.theresAWallThere(wall.left - size, wall.top);
			var wallTop = !self.theresAWallThere(wall.left, wall.top - size);
			var wallRight = !self.theresAWallThere(wall.left + size, wall.top);
			var wallDown = !self.theresAWallThere(wall.left, wall.top + size);

			if (wallLeft && wallTop)
			{
				wall.borderRadius.borderTopLeftRadius = radius;
				wall.classes.one = true;
			}
			if (wallTop && wallRight)
			{
				wall.borderRadius.borderTopRightRadius = radius;
				wall.classes.two = true;
			}
			if (wallRight && wallDown)
			{
				wall.borderRadius.borderBottomRightRadius = radius;
				wall.classes.three = true;
			}
			if (wallDown && wallLeft)
			{
				wall.borderRadius.borderBottomLeftRadius = radius;
				wall.classes.four = true;
			}
		});
	}
	createPointsArea()
	{
		var numberOfSpaces = this.playingWidth/this.characterSize;
		var even = (numberOfSpaces % 2 == 0 ? true : false);
		var numberOfWalls = 0;

		if (even)
		{
			var firstSpot = (numberOfSpaces/2) - 3;
			firstSpot = firstSpot * this.characterSize;
			numberOfWalls = 6;
		}
		else 
		{
			var firstSpot = Math.floor(numberOfSpaces/2) - 3;
			firstSpot = firstSpot * this.characterSize;
			numberOfWalls = 7;
		}
		this.points.height = this.characterSize * 2;
		this.points.width = this.characterSize * (numberOfWalls - 2);
		this.points.top = this.playingHeight - (this.characterSize * 2);
		this.points.left = firstSpot + this.characterSize; 

		var i;
		for (i = 0; i < numberOfWalls; i++)
		{
			this.createAWall(this.playingHeight - (this.characterSize * 3), firstSpot + (this.characterSize * i), 0, false);
		}
		this.createAWall(this.playingHeight - (this.characterSize), firstSpot, 0, false);
		this.createAWall(this.playingHeight - (this.characterSize * 2), firstSpot, 0, false);
		this.createAWall(this.playingHeight - (this.characterSize), firstSpot + (this.characterSize * (i - 1)), 0, false);
		this.createAWall(this.playingHeight - (this.characterSize * 2), firstSpot + (this.characterSize * (i - 1)), 0, false);

		this.totalWalls += numberOfWalls + 4;

		var zone = {
			top: this.points.top,
			left: this.points.left,
			width: this.points.width,
			height: this.points.height,
		}
		this.noGoZone.push(zone);
	}

	moveInCharacter()
	{
		var randomX = Math.floor(Math.random() * (this.playingWidth / 4 - this.characterSize)); 
		var randomY = Math.floor(Math.random() * (this.playingHeight / 4 - this.characterSize));

		randomX = Math.ceil(randomX / this.characterSize) * this.characterSize;
		randomY = Math.ceil(randomY / this.characterSize) * this.characterSize;
		if (!this.theresAWallThere(randomX, randomY))
		{
			this.characterPosition.top = randomY;
			this.characterPosition.left = randomX;
		}
		else {
			this.moveInCharacter();
		}
	}

	createUpgrade()
	{
		//we need to edit these random functions so that the upgrade is always on a mulitple of 10. Currently it can go anywhere. 
		var randomX = Math.floor(Math.random() * (this.playingWidth - this.characterSize)); 
		var randomY = Math.floor(Math.random() * (this.playingHeight - this.characterSize));

		randomX = Math.ceil(randomX / this.characterSize) * this.characterSize;
		randomY = Math.ceil(randomY / this.characterSize) * this.characterSize;
		if (!this.theresAWallThere(randomX, randomY) && !this.inNoGoZone(randomY, randomX))
		{
			this.upgradePosition.top = randomY;
			this.upgradePosition.left = randomX;
			/* if (randomX == 350)
			{
				document.getElementById("playingField").className = "playingField-black"
				this.walls.forEach(function(theWall)
				{
					document.getElementById(theWall.wallId).className = "wall-white";
				});
				//easterTimer = window.setTimeout(resetEaster, 30000);
			} */
		}
		else {
			this.createUpgrade();
		}
	}

	checkIfTouchedUpgrade()
	{
		if (this.characterPosition.top == this.upgradePosition.top && this.characterPosition.left == this.upgradePosition.left)
		{
			//then we got em.
			this.points.value++;
			this.createUpgrade();
			this.createEnemy();
		}
	}
	checkIfGameOver()
	{
		var self = this;
		this.enemies.forEach(function(enemy){
			if (self.characterPosition.top == enemy.top && self.characterPosition.left == enemy.left)
			{
				//Big time game over.
				self.startOrStop();
				self.gameOver = true;

				var newHighscore = false;
				if (self.points.value > self.highscore)
			  	{
			  		self.storage.set('highscore', self.points);
			  		console.log("New Highscore set.")
			  		newHighscore = true;
			  	}

				window.setTimeout(() => {
					self.presentModal(newHighscore);
				}, 1000);
				return;
			}
		});
	}

	createEnemy()
	{	
		var enemyLeft = this.playingWidth - this.characterSize;
		var enemyTop = this.playingHeight - this.characterSize;


		if (this.characterPosition.top > this.playingHeight/2 && this.characterPosition.left > this.playingWidth/2)
		{
			enemyTop = 0;
			enemyLeft = 0;
		}

		var Enemy = {
			top: enemyTop,
			left: enemyLeft,
			direction: 1
		}
		this.enemies.push(Enemy);
	}

	adjustEnemiesDirection()
	{
		var self = this;
		this.enemies.forEach(function(enemy)
		{

			var verticalDirection;
			if (self.characterPosition.top < enemy.top)
			{
				verticalDirection = 1;
			}
			else if (self.characterPosition.top > enemy.top)
			{
				verticalDirection = 3;
			}

			var horizontalDirection;
			if (self.characterPosition.left < enemy.left)
			{
				horizontalDirection = 4;
			}
			else if (self.characterPosition.left > enemy.left)
			{
				horizontalDirection = 2;
			}

			if (typeof horizontalDirection === 'undefined')
			{
				enemy.direction = verticalDirection;
				return;
			}
			else if (typeof verticalDirection === 'undefined') 
			{
				enemy.direction = horizontalDirection;
				return;
			}

			var canMoveVertical = self.canMove(enemy.top, enemy.left, verticalDirection, true);
			var canMoveHorizontal = self.canMove(enemy.top, enemy.left, horizontalDirection, true);

			if (canMoveHorizontal && canMoveVertical)
			{	
				var verticalDistance, horizontalDistance;

				horizontalDistance = self.characterPosition.left - enemy.left;
				horizontalDistance = (horizontalDistance > 0 ? horizontalDistance : horizontalDistance * -1);

				verticalDistance = self.characterPosition.top - enemy.top;
				verticalDistance = (verticalDistance > 0 ? verticalDistance : verticalDistance * -1);

				if (verticalDistance > horizontalDistance)
				{
					enemy.direction = verticalDirection
				}
				else if (verticalDistance < horizontalDistance) {
					enemy.direction = horizontalDirection;
				}
			}
			else if (canMoveHorizontal)
			{
				enemy.direction = horizontalDirection;
			}
			else if (canMoveVertical)
			{
				enemy.direction = verticalDirection;
			}
			//console.log("directions: H " + horizontalDirection + " V " + verticalDirection + " Distances: H " + horizontalDistance + " V " + verticalDistance);
		});
	}

	actuallyMove(character)
	{

		if (character.direction == 1)
		{
			character.top = character.top - this.characterSize;
		}
		else if (character.direction == 2)
		{
			character.left = character.left + this.characterSize;
		}
		else if (character.direction == 3)
		{
			character.top = character.top + this.characterSize;
		}
		else if (character.direction == 4)
		{
			character.left = character.left - this.characterSize;
		}
	}

	move()
	{
		//move dude,
		if (this.canMove(this.characterPosition.top, this.characterPosition.left, this.characterPosition.direction, false))
		{
			this.actuallyMove(this.characterPosition);
		}
	}
	moveEnemy()
	{
		//enemies ability to move is determined in adjust direction.
		var self = this;
		this.enemies.forEach(function(enemy){
			if (self.canMove(enemy.top, enemy.left, enemy.direction, true))
			{
				self.actuallyMove(enemy);
			}
		});
	}

	canMove(top, left, direction, enemy)
	{
		var nextTop = top;
		var nextLeft = left;
		if (direction == 1)
			nextTop = nextTop - this.characterSize;
		else if (direction == 2)
			nextLeft = nextLeft + this.characterSize;
		else if (direction == 3)
			nextTop = nextTop + this.characterSize;
		else
			nextLeft = nextLeft - this.characterSize;

		//we have determined the next position, lets check if it is valid.
		if ((nextTop >= 0 && nextTop < this.playingHeight) && (nextLeft >= 0 && nextLeft < this.playingWidth))
		{
			//it is successfully in the board, and good to go.
			if (this.theresAWallThere(nextLeft, nextTop))
			{
				return false;
			}
			else
			{
				if (enemy)
				{
					for (var i = this.enemies.length - 1; i >= 0; i--) {
						if (this.enemies[i].top == nextTop && this.enemies[i].left == nextLeft)
						{
							return false;
							break;
						}
					}
				}
				return true;
			}
		}
		else
		{
			return false;
		}
	}

	reset()
	{
		this.characterPosition = {
			top: 60,
			left: 70,
			direction: 3,
		};
		this.upgradePosition = {
			top: 0,
			left: 0,
		};
		this.playingFieldPosition = {
			top: 0,
			left: 0,
		};
		this.points = {
			top: 0,
			left: 0,
			width: 0,
			height: 0,
			value: 0,
		};
		this.playing = false;
		this.totalWalls = 0;
		this.walls = [];
		this.enemies = [];
		this.gameOver = false;
		this.timer;
		this.enemyTimer;

		this.ngOnInit();
	}

	startOrStop()
	{
		console.log(this.playing + " " + this.gameOver);
		if (this.playing == false && this.gameOver == false) // restart
		{
			console.log("Starting up!");
			this.timer = window.setInterval(() => {
				this.checkIfGameOver();
				if (this.gameOver == false)
				{
					this.move();
					this.checkIfTouchedUpgrade();
				}
			}, this.playingInterval);

			var enemyPlayingInterval = (this.playingInterval * 1.4);

			this.enemyTimer = window.setInterval(() => {
				this.checkIfGameOver();
				if (this.gameOver == false)
				{
					this.adjustEnemiesDirection();
					this.moveEnemy();
				}
			}, enemyPlayingInterval);
		}
		else if (this.playing == true && this.gameOver == false)  //pause the game. 
		{
			clearInterval(this.timer);
			clearInterval(this.enemyTimer);
		}

		this.playing = !this.playing;

		if (this.gameOver == true)
		{
			this.reset();
		}
	}

	handleTaps(event)
	{
		if(event.tapCount == 2 && this.gameOver == false) //double tap
		{
			this.startOrStop();
		}
	}

	swiped(event)
	{

		if (this.playing)
		{
			if (event.direction == 2) //left
			{
				this.characterPosition.direction = 4;
			}
			else if (event.direction == 4) //right
			{
				this.characterPosition.direction = 2;
			}
			else if (event.direction == 8) // up
			{
				this.characterPosition.direction = 1;
			}
			else if (event.direction == 16) // down
			{
				this.characterPosition.direction = 3;
			}
		}
	}

	async presentModal(newHighscore) {
		var localHighscore = this.highscore;
		if (newHighscore)
		{
			localHighscore = this.points.value;
		}

    	const myModal = await this.modal.create({
      		component: ModalPage,
      		componentProps: { points: this.points.value, highscore: localHighscore, newHighscore: newHighscore },
      		cssClass: "small-modal"
	    });

	    myModal.onDidDismiss()
	      .then((data) => {
	        const theData = data['data'];
	        this.startOrStop();
	    });
	    return await myModal.present();
  	}


}
