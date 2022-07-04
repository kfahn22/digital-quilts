// Taken from https://github.com/BalenDezai/sudokusolver/blob/master/lib/solver.js

 class Solver {
    constructor() {
      this.digits = '123456789';
      this.rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
      this.cols = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
      this.rRows = [['A', 'B', 'C'], ['D', 'E', 'F'], ['G', 'H', 'I']];
      this.cCols = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
      this.squares = this.cross(this.rows, this.cols);
      this.verticalUnits = [];
      this.horizontalUnits = [];
      this.squarePeers = [];
      this.units = {};
      this.peers = {};
      this.filledBoard = {};
      this.initializeBoard();
    }
  
    /**
     * will add together each item in both arrays together into one array
     * @param {Array} X 
     * @param {Array} Y 
     */
    
    cross(X, Y) {
      const tempArr = [];
      for (const x of X) {
        for (const y of Y) {
          tempArr.push(x + y);
        }
      }
      return tempArr;
    }
  
    /**
     * will initialize the board,
     * set up tile with associated vertical and horizontal line and in-square tiles
     */
    initializeBoard() {
      // create an array with all individual field and its associated vertical field
      // using *2 as example:
      //    A2   |         |         
      //    B2   |         |         
      //    C2   |         |         
      //---------+---------+---------
      //    D2   |         |         
      //    E2   |         |         
      //    F2   |         |         
      //---------+---------+---------
      //    G2   |         |         
      //    H2   |         |         
      //    I2   |         |         
      for (const c of this.cols) {
        this.verticalUnits.push(this.cross(this.rows, c));
      }
  
      // create an array with all individual fields and its associated horizontal field
      // using c* as an example
      //         |         |         
      //         |         |         
      // C1 C2 C3| C4 C5 C6| C7 C8 C9
      //---------+---------+---------
      //         |         |         
      //         |         |         
      //         |         |         
      //---------+---------+---------
      //         |         |         
      //         |         |         
      //         |         |         
      for (const r of this.rows) {
        this.horizontalUnits.push(this.cross(r, this.cols));
      }
      // create an array for a fields associated square
      // using ABC* as an example:
      // A1 A2 A3|         |         
      // B1 B2 B3|         |         
      // C1 C2 C3|         |          
      // --------+---------+---------
      //         |         |         
      //         |         |         
      //         |         |         
      // --------+---------+---------
      //         |         |         
      //         |         |         
      //         |         |         
      for (const rs of this.rRows) {
        for (const cs of this.cCols) {
          this.squarePeers.push(this.cross(rs, cs));
        }
      }
  
      // for each field, create an object that contains
      for (const s of this.squares) {
        this.units[s] = [];
  
        // the associated vertical fields
        for (const vu of this.verticalUnits) {
          if (vu.includes(s)) {
            this.units[s].push(vu);
          }
        }
  
        // the associated horizontal fields
        for (const hu of this.horizontalUnits) {
          if (hu.includes(s)) {
            this.units[s].push(hu)
          }
        }
  
        // the associated square peers
        for (const sqp of this.squarePeers) {
          if (sqp.includes(s)) {
            this.units[s].push(sqp);
          }
        }
  
      }
  
      // creates an object for each field and all its associated vertical, horizontal and square peer fields (itself not included);
      // for example for the value property (field) c2
      // A1 A2 A3|         |         
      // B1 B2 B3|         |         
      // C1    C3| C4 C5 C6| C7 C8 C9
      //---------+---------+---------
      //    D2   |         |         
      //    E2   |         |         
      //    F2   |         |         
      //---------+---------+---------
      //    G2   |         |         
      //    H2   |         |         
      //    I2   |         |         
      for (const s of this.squares) {
        this.peers[s] = [];
        for (const u of this.units[s]) {
          for (const s2 of u) {
            if (s2 !== s) {
              this.peers[s].push(s2);
            }
          }
        }
      }
  
      // created a board with every number from 1 to 9 on every field
      for (const s of this.squares) {
        this.filledBoard[s] = this.digits;
      }
  
    }
  
    /**
     * solves the given grid
     * @param {Array} grid 
     */
    solve(grid) {
      const values = { ...this.filledBoard };
  
      for (let i = 0; i < this.squares.length; i++) {
  
        if (this.digits.includes(grid[i]) && !this.assign(values, this.squares[i], grid[i])) {
          return false;
        }
      }
      return values;
    }
  
    /**
     * assigns a number to a tile using an elimination process
     * 
     * @param {object} values the grid
     * @param {string} tile the tile (field)
     * @param {string} digit eliminate all values from tile except digit
     */
    assign(values, tile, digit) {
      const tileValues = values[tile];
      let result = true;
  
      for (let i = 0; i < tileValues.length; i++) {
        if (tileValues[i] !== digit) {
          result = this.eliminate(values, tile, tileValues[i]);
        }
      }
      return (result ? values : false);
    }
  
    /**
     * uses the process of elimination to eliminate numbers from a tile(field)
     * @param {array} values grid
     * @param {string} tile tile to remove digit from
     * @param {string} digit digit to remove from tile and associated peer fields
     */
    eliminate(values, tile, digit) {
      if (!values[tile].includes(digit)) return values;
  
      // eliminate the number from the available values
      values[tile] = values[tile].replace(digit, '');
  
      if (values[tile].length === 0) return false;
  
      if (values[tile].length === 1) {
        let result = true;
        // for (let [key] of Object.entries(this.peers[tile])) {
        //   result = this.eliminate(values, key, values[tile]);
        //   if (!result) return false;
        // 
        for (const key of this.peers[tile]) {
          result = this.eliminate(values, key, values[tile]);
          if (!result) return false;
        }
      }
  
      // for each associated tile (field) of the tile
      for (const u of this.units[tile]) {
        const fieldsWithSameNum = [];
  
        // check if each associated field has the same number
        for (const s of u) {
          if (values[s].includes(digit)) {
            fieldsWithSameNum.push(s);
          }
          if (fieldsWithSameNum.length > 2) break;
        }
  
        if (fieldsWithSameNum.length === 0) return false;
  
        // if there is only one associated field with the same number
        // eliminate 
        if (fieldsWithSameNum.length === 1) {
          if (!this.assign(values, fieldsWithSameNum[0], digit)) {
            return false;
          }
        }
      }
  
      return true;
    }
  
    /**
     * finds any field with more than 1 number, and initiates the elimination process on that field
     * @param {array} values grid
     */
    search(values) {
      if (!values) return null;
  
      let max = 1, sq = null;
  
      for (const s of this.squares) {
        if (values[s].length > max) {
          max = values[s].length;
          sq = s;
          break;
        }
      }
  
      if (max === 1) return values;
  
      for (let i = 0; i < values[sq].length; i++) {
        const res = this.search(this.assign({ ...values }, sq, values[sq][i]));
        if (res) return res;
      }
      return null;
    }
  }