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