/* A JavaScript program for solving sudoku. To be embedded in an html file containing a div element 'grid', and a button whose onclick action is 'solution(getArray())'.
The program runs three checks for solving:
1) For every cell, check if there is only one number allowed to go into that cell. If that's the case, then enter it into the grid;
2) For every number, check if there's only one place in a row, column or block that it can go. If this is true, then enter it into the grid;
3) If the above two fail, find the cell with the fewest options and 'guess' at one of the options. Follow through with the solution (guessing again if needs be) until either the grid is solved, or there's a contradiction. If there's a contradiction, then rollback the grid to before the guess and try another of the options for that cell.
NOTES: This is most likely a very inefficient way of doing things. I converted this code from some C++ code I made a year back, and I'm not sure that was anywhere near efficient either.
*/
// Set up the initial (empty) grid.
var input = "<center><table cellspacing='0' cellpadding='0'>";
for (i=0; i<9; i++)
{
	// Some CSS for the block styling of the grid
	var styling = "font-size: 20px; text-align: center;";
	if (i%3==0)
		styling += "border-top: 3px solid black;";
	else if (i==8)
		styling += "border-bottom: 3px solid black;";
	else
		styling += "border-top: 1px solid black; border-bottom: 1px solid black;";
	input += "<tr>";
	for (j=0; j<9; j++)
	{
		if (j%3==0)
			styling += "border-left: 3px solid black;";
		else if (j==8)
			styling += "border-right: 3px solid black;";
		else
			styling += "border-right: 1px solid black; border-left: 1px solid black;";
		// The ident is for later reference, when we pull an array from the grid
		var ident = ("number"+i)+j;
		input += "<td><input type='text' style='"+styling+"' maxlength='1' size='1' height='1em' id='" + ident + "'></td>";
	}
	input += "</tr>";
}
input += "</table></center>";
document.getElementById("grid").innerHTML = input;
// Retrieves the grid from the user input, and outputs an array (if there is input not in the range 1-9, the array gains a 0 in that cell).
function getArray()
{
	var gridinput = [];
	for (i=0; i<9; i++)
	{
		var tempArray = [];
		for (j=0; j<9; j++)
		{
			var ident = ("number"+i)+j;
			var entry = document.getElementById(ident).value;
			// Try to avoid user error in input (obviously a checking mechanism would help to make sure the user has entered the desired grid, but meh).
			if (entry == "" || parseInt(entry) == NaN || parseInt(entry) > 9 || parseInt(entry)<1)
			{
				tempArray.push(0);
			}
			else
			{
				tempArray.push(parseInt(entry));
			}
		}
		gridinput.push(tempArray);
	}
	return gridinput;
}
// Updates the visible grid on the page.
function updateInput(arr)
{
	// Much of this is the same as the initial grid set-up...
	var finalinput = "<center><table cellspacing='0' cellpadding='0'>";
	for (i=0; i<9; i++)
	{
		var styling = "font-size: 20px; text-align: center;";
		if (i%3==0)
			styling += "border-top: 3px solid black;";
		else if (i==8)
			styling += "border-bottom: 3px solid black;";
		else
			styling += "border-top: 1px solid black; border-bottom: 1px solid black;";
		finalinput += "<tr>";
		for (j=0; j<9; j++)
		{
			if (j%3==0)
				styling += "border-left: 3px solid black;";
			else if (j==8)
				styling += "border-right: 3px solid black;";
			else
				styling += "border-right: 1px solid black; border-left: 1px solid black;";
			var ident = ("number"+i)+j;
			// ...except for in the 'value' section, where we add the result of the solving.
			finalinput += "<td><input type='text' size='1' style='"+styling+"' id='" + ident + "' value='" + arr[i][j] + "'></td>";
		}
		finalinput += "</tr>";
	}
	finalinput += "</table></center>";
	document.getElementById("grid").innerHTML = finalinput;
}
/* CONSISTENCY CHECKS
These are the checks to make sure that a number is allowed to go into a cell. Check for column, row and block consistency.*/
function columnTest(gridarr, row, col)
{
	for (ii=0; ii<9; ii++)
	{
		if (ii==row){}
		else if (gridarr[row][col]==gridarr[ii][col])
			return false;
	}
	return true;
}
function rowTest (gridarr, row, col)
{
	for (ii=0; ii<9; ii++)
	{
		if (ii==col){}
		else if (gridarr[row][col]==gridarr[row][ii])
			return false;
	}
	return true;
}
function blockTest(gridarr, row, col)
{
	for (ii=(row-row%3); ii<(row+3-row%3); ii++)
	{
		for (jj=(col-col%3); jj<(col+3-col%3); jj++)
		{
			if (ii==row && jj==col){}
			else if (gridarr[row][col] == gridarr[ii][jj])
				return false;
		}
	}
	return true;
}
// This tells us whether a grid entry is consistent with everything.
function fullTest(gridarr, row, col)
{
	return columnTest(gridarr,row,col)&&rowTest(gridarr,row,col)&&blockTest(gridarr,row,col);
}
/* UNIQUENESS TESTS
These check whether there's only one place a digit can go in a row, column or block. They use the consistency checks above to verify digit compatibility. */
function rowUnique(gridarr, digit, row)
{
	var rowpositions = 0;
	for (i=0; i<9; i++)
	{
		if (gridarr[row][i]==0)
		{
			gridarr[row][i] = digit;
			if (fullTest(gridarr,row,i))
				rowpositions++;
			gridarr[row][i] = 0;
		}
	}
	if (rowpositions == 1)
		return true;
	return false;
}
function colUnique(gridarr, digit, col)
{
	var colpositions = 0;
	for (i=0; i<9; i++)
	{
		if (gridarr[i][col] == 0)
		{
			gridarr[i][col] = digit;
			if (fullTest(gridarr, i, col))
				colpositions++;
			gridarr[i][col] = 0;
		}
	}
	if (colpositions == 1)
		return true;
	return false;
}
function blockUnique(gridarr, digit, row, col)
{
	var blockpositions = 0;
	for (i=(row-row%3); i<(row+3-row%3); i++)
	{
		for (j=(col-col%3); j<(col+3-col%3); j++)
		{
			if (gridarr[i][j]==0)
			{
				gridarr[i][j] = digit;
				if (fullTest(gridarr,i,j))
					blockpositions++;
				gridarr[i][j]=0;
			}
		}
	}
	if (blockpositions == 1)
		return true;
	return false;
}

// The full uniqueness test.
//Note that we have ||, rather than &&, as we only need uniqueness in ONE of the row, column or block.
function fullUnique(gridarr, digit, row, col)
{
	return rowUnique(gridarr, digit, row)||colUnique(gridarr, digit, col)||blockUnique(gridarr, digit, row, col);
}

// A solving step for a single entry of the grid.
// For a given entry, run through each digit: if it passes consistency, and is the only possible digit, enter it. If not, check each consistent digit for uniqueness.
function solve(grid, row, col)
{
	var possible = [];
	if (grid[row][col]!=0)
		return;
	if (grid[row][col]==0)
	{
		for (n=1; n<10; n++)
		{
			grid[row][col] = n;
			if(fullTest(grid,row,col))
				possible.push(n);
			grid[row][col] = 0;
		}
	}
	if (possible.length == 1)
	{
		grid[row][col] = possible[0];
		return;
	}
	for (m=0; m<possible.length; m++)
	{
		if (fullUnique(grid, possible[m], row, col))
		{
			grid[row][col]=possible[m];
			return;
		}
	}
}

// Check if zeros are in the grid (used in solution()).
function hasZeros(grid)
{
	for (i=0; i<9; i++)
	{
		if (grid[i].some(function(x) {return x==0;}))
			return true;
	}
	return false;
}

// Check if two grids are identical (used in solution()).
function matches(gridone, gridtwo)
{
	for (i=0; i<9; i++)
	{
		for (j=0; j<9; j++)
		{
			if (gridone[i][j] != gridtwo[i][j])
				return false;
		}
	}
	return true;
}

// TESTING FUNCTION: Prints an array out to a div specified by 'ident'.
function printArray(ingrid,ident)
{
	var res = "<div>";
	for (i=0; i<9; i++)
	{
		for (j=0; j<9; j++)
		{
			res += ingrid[i][j];
		}
		res += "<br />";
	}
	res += "</div>";
	document.getElementById(ident).innerHTML = res;
}

// Collate the number of options in a given cell (used for the guessing process).
function options(gridarr,row,col)
{
	var total = 0;
	if (gridarr[row][col]!=0)
	{
		total = 1;
	}
	else
	{
		for (ans=1; ans<10; ans++)
		{
			gridarr[row][col] = ans;
			if (fullTest(gridarr, row, col))
				total++;
			gridarr[row][col] = 0;
		}
	}
	return total;
}

// Make a grid of the above options (these two functions could probably sit together, but I split them up when debugging and never got around to recombining them.
function optgrid(gridarr)
{
	var optigrid = [];
	for (r=0; r<9; r++)
	{
		var tempopti = [];
		for (c=0; c<9; c++)
		{
			tempopti.push(options(gridarr,r,c));
		}
		optigrid.push(tempopti);
	}
	return optigrid;
}

// Find minimum number in a grid.
// Note that we ignore the entries where there is only 1 option: these have already been solved and won't benefit from guessing at.
function findmin(opgrid)
{
	var minimum = 10;
	var mini, minj;
	for (inti=0; inti<9; inti++)
	{
		for (intj=0; intj<9; intj++)
		{
			if (opgrid[inti][intj] < minimum && opgrid[inti][intj]!=1)
			{
				mini = inti;
				minj = intj;
				minimum = opgrid[inti][intj];
			}
		}
	}
	var retArr = [mini, minj];
	return retArr;
}

// Collate the possibilities in a given cell (coords given by the findmin() function above)
function possibilities(gridarr, coords)
{
	var poss = [];
	for (pi=1; pi<10; pi++)
	{
		gridarr[coords[0]][coords[1]] = pi;
		if (fullTest(gridarr,coords[0],coords[1]))
		{
			poss.push(pi);
		}
		gridarr[coords[0]][coords[1]] = 0;
	}
	return poss;
}

// An array copier, 'cause I was worried about passing things by reference if I was going to use recursion.
function copyArr(arrone)
{
	tempArr = [];
	for (t=0; t<9; t++)
	{
		tempArr.push(arrone[t].slice(0,9));
	}
	return tempArr;
}

/* The solution() function. This runs through the grid entries, trying to solve if necessary, until there are no more zeros in the grid.
If, after a pass, no more changes have been made to the grid, then the naive methods are no use, and we have to guess. Make a guess, and call solution() recursively on the guessed grid.
*/
function solution(gridarr)
{
	do
	{
		if (hasZeros(optgrid(gridarr)))
		{
			return;
		}
		var temparr = copyArr(gridarr);
		for (row=0; row<9; row++)
		{
			for (col=0; col<9; col++)
			{
				solve(gridarr, row, col);
			}
		}
		if (matches(gridarr,temparr)&&hasZeros(gridarr))
		{
			var coords = findmin(optgrid(gridarr));
			var poss = possibilities(gridarr, coords);
			for (l=0; l<poss.length; l++)
			{
				newgrid = copyArr(gridarr);
				newgrid[coords[0]][coords[1]] = poss[l];
				solution(newgrid);
			}
			gridarr = copyArr(newgrid);
			updateInput(gridarr);
		}
	} while (hasZeros(gridarr));
	updateInput(gridarr);

	//This is a comment to see if I can use github with Atom.
}
