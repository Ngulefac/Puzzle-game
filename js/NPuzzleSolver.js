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
