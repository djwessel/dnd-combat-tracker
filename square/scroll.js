var map = {
   cols: 12,
   rows: 12,
   tsize: 64,
   layers: [[
      3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
      3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3,
      3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3,
      3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3,
      3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3,
      3, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 3,
      3, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 3,
      3, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 3,
      3, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 3,
      3, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 3,
      3, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 3,
      3, 3, 3, 1, 1, 2, 3, 3, 3, 3, 3, 3
   ], [
      4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4,
      4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,
      4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,
      4, 0, 0, 5, 0, 0, 0, 0, 0, 5, 0, 4,
      4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,
      4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,
      4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,
      4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,
      4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,
      4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,
      4, 4, 4, 0, 5, 4, 4, 4, 4, 4, 4, 4,
      4, 4, 4, 0, 0, 3, 3, 3, 3, 3, 3, 3
   ]],
   getTile: function (layer, col, row) {
      return this.layers[layer][row * map.cols + col];
   },
   isWallTile: function(layer, col, row) {
      var tile = this.getTile(layer, col, row);
      return tile == 3;
   },
   getMove: function(x1, y1, x2, y2, d, oddDiag) {
      var squares = this.getMovesInDistance(x1, y1, d, oddDiag);
      if (!([x2, y2] in squares))
         return null;
      var steps = [squares[[x2, y2]]];
      
      while (steps[0].addr[0] !== x1 || steps[0].addr[1] !== y1) {
         steps.unshift(squares[[steps[0].sCol, steps[0].sRow]]);
      }
      
      return {steps: steps, dist: steps[steps.length - 1].val, diags: steps[steps.length - 1].diag};
   },
   getMovesInDistance: function(x, y, distance, oddDiag) {
      var that = this;
      
      var squares = Array.apply(null, Array(that.rows)).map(function() {
         return Array.apply(null, Array(that.cols)).map(function() {
            return {val: -1, diag: 0, sRow: -1, sCol: -1};
         });
      });
      squares[y][x].val = 0;
      squares[y][x].addr = [x, y];
      
      var q = [], squaresInDist = {};
      q.push([x, y]);
      squaresInDist[[x, y]] = squares[y][x];
      while (n = q.shift()) {
         var currentRow = n[1];
         var currentCol = n[0];
         var squareInfo = squares[currentRow][currentCol];
         // For each Neighbor
         var nR, nC;
         for (var r = -1; r <= 1; r++) {
            nR = currentRow + r;
            if (nR >= 0 && nR < this.rows) {
               for (var c = -1; c <= 1; c++) {
                  nC = currentCol + c;
                  if (nC >= 0 && nC < this.cols && !(c === 0 && r === 0) && !this.isWallTile(0, nC, nR)) {
                     // nR, nC is neighbor
                     var neighborSquare = squares[nR][nC];
                     var newVal = squareInfo.val;
                     
                     // add 1 if not diag or odd number diag, otherwise 2
                     var diag = !(r === 0 || c === 0);
                     if (!diag)
                        newVal += 1;
                     else {
                        if (oddDiag)
                           newVal += squareInfo.diag % 2 ? 1 : 2;
                        else
                           newVal += squareInfo.diag % 2 ? 2 : 1;
                     }
                     if (newVal <= distance && neighborSquare.val < 0 || newVal < neighborSquare.val) {
                        neighborSquare.val = newVal;
                        neighborSquare.sRow = currentRow;
                        neighborSquare.sCol = currentCol;
                        neighborSquare.diag = diag ? squareInfo.diag + 1 : squareInfo.diag;
                        neighborSquare.addr = [nC, nR];
                        q.push([nC, nR]);
                        squaresInDist[[nC, nR]] = neighborSquare;
                     }
                  }
               }
            }
         }
      }
      return squaresInDist;
   }
};

function Camera(map, width, height) {
   this.x = 0;
   this.y = 0;
   this.width = width;
   this.height = height;
   this.maxX = map.cols * map.tsize - width;
   this.maxY = map.rows * map.tsize - height;
}
Camera.SPEED = 256; // pixels per second
Camera.prototype.move = function (delta, dirx, diry) {
   // move camera
   this.x += dirx * Camera.SPEED * delta;
   this.y += diry * Camera.SPEED * delta;
   // clamp values
   this.x = Math.max(0, Math.min(this.x, this.maxX));
   this.y = Math.max(0, Math.min(this.y, this.maxY));
};


Game.load = function () {
   return [
      Loader.loadImage('tiles', '../assets/tiles.png'),
      Loader.loadImage('hero', '../assets/character.png')
   ];
};
Game.init = function () {
   var that = this;
   Keyboard.listenForEvents(
      [Keyboard.LEFT, Keyboard.RIGHT, Keyboard.UP, Keyboard.DOWN]);
   this.ctx.canvas.addEventListener('click', function(e) {
      var x = e.pageX - this.offsetLeft,
          y = e.pageY - this.offsetTop;
      var square = that.getSquareFromCanvas(x, y);
      that.hero.move(square.col, square.row);
   }, false);
   this.ctx.canvas.addEventListener('mousemove', function(e) {
      var x = e.pageX - this.offsetLeft,
          y = e.pageY - this.offsetTop;
      var square = that.getSquareFromCanvas(x, y);
      that.mouseX = square.col;
      that.mouseY = square.row;
   }, false);
   this.ctx.canvas.addEventListener('mouseout', function() {
      that.mouseX = null;
      that.mouseY = null;
   })
   document.getElementById('nextTurnBtn').addEventListener('click', function() {
      that.nextTurn();
   }, false);
   
   this.tileAtlas = Loader.getImage('tiles');
   this.camera = new Camera(map, 512, 512);
   this.hero = new Hero(map, 2, 1);
};
Game.getSquareFromCanvas = function(x, y) {
   var startCol = Math.floor(this.camera.x / map.tsize);
   var endCol = startCol + (this.camera.width / map.tsize);
   var startRow = Math.floor(this.camera.y / map.tsize);
   var endRow = startRow + (this.camera.height / map.tsize);
   var offsetX = -this.camera.x + startCol * map.tsize;
   var offsetY = -this.camera.y + startRow * map.tsize;
   
   var c = Math.floor((x - offsetX) / map.tsize) + startCol;
   var r = Math.floor((y - offsetY) / map.tsize) + startRow;
   return {row: r, col: c}
};
Game.nextTurn = function() {
   this.hero.nextTurn();
};
Game.update = function (delta) {
   // handle camera movement with arrow keys
   var dirx = 0;
   var diry = 0;
   if (Keyboard.isDown(Keyboard.LEFT)) { dirx = -1; }
   if (Keyboard.isDown(Keyboard.RIGHT)) { dirx = 1; }
   if (Keyboard.isDown(Keyboard.UP)) { diry = -1; }
   if (Keyboard.isDown(Keyboard.DOWN)) { diry = 1; }

   this.camera.move(delta, dirx, diry);
};
Game._drawLayer = function (layer) {
   var startCol = Math.floor(this.camera.x / map.tsize);
   var endCol = startCol + (this.camera.width / map.tsize);
   var startRow = Math.floor(this.camera.y / map.tsize);
   var endRow = startRow + (this.camera.height / map.tsize);
   var offsetX = -this.camera.x + startCol * map.tsize;
   var offsetY = -this.camera.y + startRow * map.tsize;

   for (var c = startCol; c <= endCol; c++) {
      for (var r = startRow; r <= endRow; r++) {
         var tile = map.getTile(layer, c, r);
         var x = (c - startCol) * map.tsize + offsetX;
         var y = (r - startRow) * map.tsize + offsetY;
         if (tile !== 0) { // 0 => empty tile
            this.ctx.drawImage(
               this.tileAtlas, // image
               (tile - 1) * map.tsize, // source x
               0, // source y
               map.tsize, // source width
               map.tsize, // source height
               Math.round(x),  // target x
               Math.round(y), // target y
               map.tsize, // target width
               map.tsize // target height
            );
         }
      }
   }
};
Game._drawGrid = function() {
   var startCol = Math.floor(this.camera.x / map.tsize);
   var endCol = startCol + (this.camera.width / map.tsize);
   var startRow = Math.floor(this.camera.y / map.tsize);
   var endRow = startRow + (this.camera.height / map.tsize);
   var offsetX = -this.camera.x + startCol * map.tsize;
   var offsetY = -this.camera.y + startRow * map.tsize;
    
   this.ctx.strokeStyle = 'black';
   for (var c = startCol; c <= endCol; c++) {
      for (var r = startRow; r <= endRow; r++) {
         var x = (c - startCol) * map.tsize + offsetX;
         var y = (r - startRow) * map.tsize + offsetY;
            
         this.ctx.strokeRect(Math.round(x),
            Math.round(y),
            map.tsize,
            map.tsize);
      }
   }
};
Game._drawHero = function() {
   var startCol = Math.floor(this.camera.x / map.tsize);
   var endCol = startCol + (this.camera.width / map.tsize);
   var startRow = Math.floor(this.camera.y / map.tsize);
   var endRow = startRow + (this.camera.height / map.tsize);
   var offsetX = -this.camera.x + startCol * map.tsize;
   var offsetY = -this.camera.y + startRow * map.tsize;
   
   this.ctx.drawImage(
      this.hero.image,
      Math.round((this.hero.x - startCol) * map.tsize + offsetX),
      Math.round((this.hero.y - startRow) * map.tsize + offsetY),
      map.tsize,
      map.tsize);
   
};
Game._drawCurrentHero = function() {
   var startCol = Math.floor(this.camera.x / map.tsize);
   var endCol = startCol + (this.camera.width / map.tsize);
   var startRow = Math.floor(this.camera.y / map.tsize);
   var endRow = startRow + (this.camera.height / map.tsize);
   var offsetX = -this.camera.x + startCol * map.tsize;
   var offsetY = -this.camera.y + startRow * map.tsize;
   
   this.ctx.strokeStyle = 'yellow';
   this.ctx.strokeRect(Math.round((this.hero.x - startCol) * map.tsize + offsetX),
      Math.round((this.hero.y - startRow) * map.tsize + offsetY),
      map.tsize,
      map.tsize);
}
Game._drawMovementSquares = function() {
   var startCol = Math.floor(this.camera.x / map.tsize);
   var endCol = startCol + (this.camera.width / map.tsize);
   var startRow = Math.floor(this.camera.y / map.tsize);
   var endRow = startRow + (this.camera.height / map.tsize);
   var offsetX = -this.camera.x + startCol * map.tsize;
   var offsetY = -this.camera.y + startRow * map.tsize;
   
   var that = this;
   var oldAlpha = this.ctx.globalAlpha;
   this.ctx.globalAlpha = 0.5;
   this.ctx.fillStyle = 'blue'
   this.hero.getMovementSquares().forEach(function(square) {
      col = square[0];
      row = square[1];
      
      var x = (col - startCol) * map.tsize + offsetX;
      var y = (row - startRow) * map.tsize + offsetY;
      
      that.ctx.fillRect(Math.round(x),
         Math.round(y),
         map.tsize,
         map.tsize)
   });
   this.ctx.globalAlpha = oldAlpha;
};
Game._drawMove = function() {
   var x = this.mouseX;
   var y = this.mouseY;
   if (x == null || y == null)
      return;
   
   var move = this.hero.getMove(x, y);
   if (!move)
      return;
   
   var startCol = Math.floor(this.camera.x / map.tsize);
   var endCol = startCol + (this.camera.width / map.tsize);
   var startRow = Math.floor(this.camera.y / map.tsize);
   var endRow = startRow + (this.camera.height / map.tsize);
   var offsetX = -this.camera.x + startCol * map.tsize;
   var offsetY = -this.camera.y + startRow * map.tsize;
   
   this.ctx.strokeStyle = 'black';
   this.ctx.beginPath();
   for (var i = 0; i < move.steps.length; i++) {
      var x = (move.steps[i].addr[0] - startCol) * map.tsize + offsetX + map.tsize / 2;
      var y = (move.steps[i].addr[1] - startRow) * map.tsize + offsetY + map.tsize / 2;
      if (i == 0)
         this.ctx.moveTo(x, y);
      else
         this.ctx.lineTo(x, y);
   }
   this.ctx.stroke();
};
Game.render = function () {
   // draw map background layer
   this._drawLayer(0);
   // draw map top layer
   this._drawLayer(1);
   // draw grid
   this._drawGrid();
   // draw hero
   this._drawHero();
   // draw possible movement
   this._drawMovementSquares();
   // draw current hero
   this._drawCurrentHero();
   // draw move
   this._drawMove();
};

function Hero(map, x, y) {
   this.map = map;
   this.x = x;
   this.y = y;
   this.width = map.tsize;
   this.height = map.tsize;
   this.speed = 6;
   this.currentSpeedLeft = this.speed;
   this.currentDiagCount = 0;
   
   this.image = Loader.getImage('hero');
}
Hero.prototype.getMove = function(x, y) {
   return this.map.getMove(this.x, this.y, x, y, this.currentSpeedLeft, this.currentDiagCount % 2 == 1);
};
Hero.prototype.move = function(x, y) {
   var move = this.getMove(x, y)
   if (move && move.dist <= this.currentSpeedLeft) {
      this.x = x;
      this.y = y;
      this.currentSpeedLeft -= move.dist;
      this.currentDiagCount += move.diags;
   }
};
Hero.prototype.getMovementSquares = function() {
   var moves = this.map.getMovesInDistance(this.x, this.y, this.currentSpeedLeft, this.currentDiagCount % 2 == 1);
   return Object.values(moves).map(function(val) { return val.addr; });
};
Hero.prototype.nextTurn = function() {
   this.currentSpeedLeft = this.speed;
   this.currentDiagCount = 0;
};