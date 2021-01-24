// NPuzzleSolver
// by Ngulefac Theophilus
// repository: https://github.com/Ngulefac/Puzzle-game

function NPuzzleSolver(toSolve) {
	this.grid = [];
	this.fixed = [];
	this.numbers = [];
	this.solution = [];
	this.originalGrid = toSolve;
}

NPuzzleSolver.prototype.setupSolver = function() {
	this.numbers = [];
	this.fixed = [];
	this.grid = [];
	for(var i = 0; i < this.originalGrid.length; i++) {
		this.fixed[i] = [];
		this.grid[i] = [];
		for(var j = 0; j < this.originalGrid.length; j++) {
			var num = this.originalGrid[i][j];
			this.grid[i][j] = num;
			this.fixed[i][j] = false;
			this.numbers[num] = { x : j, y : i };
		}
	}
}

NPuzzleSolver.prototype.solve = function() {
	this.setupSolver();
	try {
		this.solveGrid(this.grid.length);
	} catch (err) {
		console.log(err.message);
		return null;
	}
	return this.solution;
}

NPuzzleSolver.prototype.solveGrid = function(size) {
	if(size > 2) {
		// pattern solve nxn squares greater than 2x2
		this.solveRow(size); // solve the upper row first
		this.solveColumn(size); // solve the left column next
		this.solveGrid(size - 1); // now we can solve the sub (n-1)x(n-1) puzzle
	} 
else if(size == 2) {
		this.solveRow(size); // solve the row like normal
		// rotate last two numbers if they arent in place
		if(this.grid[this.grid.length - 1][this.grid.length - size] === "") {
			this.swapE({ x : this.grid.length - 1, y : this.grid.length - 1});
		}
	} // smaller than 2 is solved by definition
}

NPuzzleSolver.prototype.solveRow = function(size) {
	var rowNumber = this.grid.length - size;
	// using row number here because this is also our starting column
	for(var i = rowNumber; i < this.grid.length - 2; i++) {
		var number = rowNumber * this.grid.length + (i + 1); // calculate the number that is suppose to be at this position
		this.moveNumberTowards(number, { x : i, y : rowNumber});
		this.fixed[rowNumber][i] = true;
	}
	var secondToLast = rowNumber * this.grid.length + this.grid.length - 1;
	var last = secondToLast + 1;
	// position second to last number
	this.moveNumberTowards(secondToLast, { x : this.grid.length - 1, y : rowNumber });
	// position last number
	this.moveNumberTowards(last, { x : this.grid.length - 1, y : rowNumber + 1 });
	// double check to make sure they are in the right position
	if(this.numbers[secondToLast].x != this.grid.length - 1 || this.numbers[secondToLast].y != rowNumber ||
		this.numbers[last].x != this.grid.length - 1 || this.numbers[last].y != rowNumber + 1) {
			// the ordering has messed up
			this.moveNumberTowards(secondToLast, {x : this.grid.length - 1, y : rowNumber });
			this.moveNumberTowards(last, { x : this.grid.length - 2, y : rowNumber });
			this.moveEmptyTo({ x : this.grid.length - 2, y : rowNumber + 1 });
			// the numbers will be right next to each other
			var pos = { x : this.grid.length - 1, y : rowNumber + 1}; // square below last one in row
			var moveList = ["ul", "u", "", "l", "dl", "d", "", "l", "ul", "u", "", "l", "ul", "u", "", "d"];
			this.applyRelativeMoveList(pos, moveList);
			// now we reversed them, the puzzle is solveable!
		}
NPuzzleSolver.prototype.solveColumn = function(size) {
	var colNumber = this.grid.length - size;
	// use column number as this is the starting row
	for(var i = colNumber; i < this.grid.length - 2; i++) {
		var number = i * this.grid.length + 1 + colNumber;
		this.moveNumberTowards(number, { x : colNumber, y : i});
		this.fixed[i][colNumber] = true;
	}
	var secondToLast = (this.grid.length - 2) * this.grid.length + 1 + colNumber;
	var last = secondToLast + this.grid.length;
	// position second to last number
	this.moveNumberTowards(secondToLast, { x : colNumber, y : this.grid.length - 1 });
	// position last number
	this.moveNumberTowards(last, { x : colNumber + 1, y : this.grid.length - 1});
	
	// double check to make sure they are in the right position
	if(this.numbers[secondToLast].x != colNumber || this.numbers[secondToLast].y != this.grid.length - 1 ||
			this.numbers[last].x != colNumber + 1 || this.numbers[last].y != this.grid.length - 1) {
		// this happens because the ordering of the two numbers is reversed, we have to reverse them
		this.moveNumberTowards(secondToLast, { x : colNumber, y : this.grid.length - 1});
		this.moveNumberTowards(last, { x : colNumber, y : this.grid.length - 2});
		this.moveEmptyTo({ x : colNumber + 1, y : this.grid.length - 2});
		// the numbers will be stacked and the empty should be to the left of the last number
		var pos = { x : colNumber + 1, y : this.grid.length - 1 };
		var moveList = ["ul", "l", "", "u", "ur", "r", "", "u", "ul", "l", "", "u", "ul", "l", "", "r"];
		this.applyRelativeMoveList(pos, moveList);
		// now the order has been officially reversed
	}
	
	// do the special
	this.specialLeftBottomRotation(colNumber);
	// now the column is solved
}

NPuzzleSolver.prototype.applyRelativeMoveList = function(pos, list) {
	for(var i = 0; i < list.length; i++) {
		if(list[i] == "") {
			this.swapE(pos);
		} else {
			this.swapE(this.offsetPosition(pos, list[i]));
		}
	}
}

NPuzzleSolver.prototype.moveNumberTowards = function(num, dest) {
	// dont bother if the piece is in the right place, it can cause odd things to happen with the space
	if(this.numbers[num].x == dest.x && this.numbers[num].y == dest.y) return; // dont bother
	
	// choose where we want the empty square
	this.makeEmptyNeighborTo(num);
	// now empty will be next to our number and thats all we need
	var counter = 1;
	while(this.numbers[num].x != dest.x || this.numbers[num].y != dest.y) {
		var direction = this.getDirectionToProceed(num, dest);
		if(!this.areNeighbors(num, "")) {
			throw "cannot rotate without empty";
		}
		if(direction == "u" || direction == "d") {
			this.rotateVertical(num, (direction == "u"));
		} else {
			this.rotateHorizontal(num, (direction == "l"));
		}
	}
}

NPuzzleSolver.prototype.rotateHorizontal = function(num, leftDirection) {
	var side = (leftDirection) ? "l" : "r";
	var other = (leftDirection) ? "r" : "l";
	var empty = this.numbers[""];
	var pos = this.numbers[num];
	if(empty.y != pos.y) {
		// the empty space is above us
		var location = (empty.y < pos.y) ? "u" : "d";
		if(!this.moveable(this.offsetPosition(pos, location + side)) || !this.moveable(this.offsetPosition(pos, location))) {
			this.swapE(this.offsetPosition(pos, location + other));
			this.swapE(this.offsetPosition(pos, other));
			this.proper3By2RotationHorizontal(pos, leftDirection);
		} else {
			this.swapE(this.offsetPosition(pos, location + side));
			this.swapE(this.offsetPosition(pos, side));
		}
	} else if((empty.x < pos.x && !leftDirection) || (empty.x > pos.x && leftDirection)) {
		// its on the opposite that we want it on
		this.proper3By2RotationHorizontal(pos, leftDirection);
	}
	// now it is in the direction we want to go so just swap
	this.swapE(pos);
}
NPuzzleSolver.prototype.proper3By2RotationHorizontal = function(pos, leftDirection) {
	var side = (leftDirection) ? "l" : "r";
	var other = (leftDirection) ? "r" : "l";
	var location = "u"; // assume up as default
	if(this.moveable(this.offsetPosition(pos, "d" + side)) && this.moveable(this.offsetPosition(pos, "d")) && this.moveable(this.offsetPosition(pos, "d" + other))) {
		location = "d";
	} else if(!this.moveable(this.offsetPosition(pos, "u" + side)) || !this.moveable(this.offsetPosition(pos, "u")) || !this.moveable(this.offsetPosition(pos, "u" + other))) {
		throw "unable to move up all spots fixed";
	}
	this.swapE(this.offsetPosition(pos, location + other));
	this.swapE(this.offsetPosition(pos, location));
	this.swapE(this.offsetPosition(pos, location + side));
	this.swapE(this.offsetPosition(pos, side));
}

NPuzzleSolver.prototype.rotateVertical = function(num, upDirection) {
	var toward = (upDirection) ? "u" : "d";
	var away = (upDirection) ? "d" : "u";
	
	var empty = this.numbers[""];
	var pos = this.numbers[num];
	if(empty.x != pos.x) {
		// its to the right or left