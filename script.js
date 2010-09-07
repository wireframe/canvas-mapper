Viewport = function(canvas, grid) {
  this.width = canvas.width();
  this.height = canvas.height();

  this.mouseX = 0;
  this.mouseY = 0;
  this.grid = grid;
  this.context = canvas[0].getContext("2d");

  var self = this;
  canvas.mousemove(function(e) {
    self.mouseX = e.pageX - canvas.position().left;
    self.mouseY = e.pageY - canvas.position().top;
  });
  canvas.mousedown(function(e) {
    if (self.token.isWithinBounds(self.mouseX, self.mouseY)) {
      alert('here');
    }
  });
  var scale = 1;
  var originx = 0;
  var originy = 0;
  canvas.mousewheel(function(event, delta) {
    var mousex = event.clientX - canvas.offsetLeft;
    var mousey = event.clientY - canvas.offsetTop;
    var zoom = 1 + delta/2;

    self.context.translate(originx, originy);
    self.context.scale(zoom, zoom);
    self.context.translate(
        -( mousex / scale + originx - mousex / ( scale * zoom ) ),
        -( mousey / scale + originy - mousey / ( scale * zoom ) )
    );

    originx = ( mousex / scale + originx - mousex / ( scale * zoom ) );
    originy = ( mousey / scale + originy - mousey / ( scale * zoom ) );
    scale *= zoom;
  });

  this.token = new Token('token.jpg', grid);
};
Viewport.prototype = {
  draw: function() {
    this.context.clearRect(0, 0, this.width, this.height);
    this.grid.draw(this.context, this);

    this.context.fillStyle = "rgba(255, 165, 0, 0.4)";
    var hoverSquare = this.grid.squareAt(this.mouseX, this.mouseY, this);
    this.context.fillRect(hoverSquare.x, hoverSquare.y, this.grid.squareSize, this.grid.squareSize);

    this.token.draw(this.context, this);
    this.token.positionX += 1;
    this.token.positionY += 1;
  }
};

Grid = function(image) {
  this.background = new Image();
  this.background.src = image;

  this.squareSize = 32;
  this.lineWidth = 1;
  this.showGridLines = true;
};
Grid.prototype = {
  draw: function(context, viewport) {
    context.drawImage(this.background, 0, 0, viewport.width, viewport.height, 0, 0, viewport.width, viewport.height);

    if (this.showGridLines) {
      context.lineWidth = this.lineWidth;
      context.strokeStyle = "rgba(100, 100, 100, 1)";
      for (var column = 0; column < this.visibleColumns(viewport); column++) {
        for (var row = 0; row < this.visibleRows(viewport); row++) {
          var square = this.coordinatesForSquare(column, row, viewport);
          context.strokeRect(square.x, square.y, this.squareSize, this.squareSize);
        }
      }
    }
  },
  maxColumns: function() {
    return Math.floor(this.background.width / this.squareSize);
  },
  maxRows: function() {
    return Math.floor(this.background.height / this.squareSize);
  },
  visibleColumns: function(viewport) {
    return Math.min((viewport.width / this.squareSize), this.maxColumns());
  },
  visibleRows: function(viewport) {
    return Math.min((viewport.height / this.squareSize), this.maxRows());
  },
  coordinatesForSquare: function(column, row, viewport) {
    return {
      x: column * this.squareSize,
      y: row * this.squareSize
    };
  },
  squareAt: function(x, y, viewport) {
    var col = Math.floor(x / this.squareSize);
    var row = Math.floor(y / this.squareSize);
    return this.coordinatesForSquare(col, row, viewport);
  }
};

Token = function(options) {
  var image = options.image;
  this.name = options.name;

  var gridWidth = 64;
  var radius = gridWidth / 2;
  var circle = new Circle(radius - this.borderWidth);
  circle.x = radius;
  circle.y = radius;
  circle.stroke = 'red';
  circle.strokeWidth = this.borderWidth;
  circle.clip = true;
  circle.makeDraggable();

  var token = ImageNode.load(image);
  token.dX = -radius,
  token.dY = -radius;
  token.dWidth = gridWidth;
  token.dHeight = gridWidth;
  circle.append(token);

  circle.when('mousemove', function(e){
    // this.stroke = 'black';
    // console.log(e);
  });
  circle.when('focus', function(e){
    // console.log(e);
  });
  circle.when('blur', function(){
  });
  circle.when('mouseover', function() {
    circle.stroke = 'blue';
  });
  circle.when('mouseout', function() {
    circle.stroke = 'red';
  });
  this.canvasElement = circle;
  this.tokenElement = $('<li />').append($('<img width="30"/>').attr('src', image)).append($('<h3>').text(this.name));
};
Token.prototype = {
  borderWidth: 4,
};


$(function() {
  var canvas = new Canvas($('#mapWrapper')[0], 600, 600);
  var background = new Image();
  background.src = 'map.jpg';
  canvas.fill = new Pattern(background, 'no-repeat');

  var token = new Token({image: 'token.jpg', name: 'Thorn Lighthammer'});
  canvas.append(token.canvasElement);
  $('#tokenList').append(token.tokenElement);

  var token2 = new Token({image: 'token2.png', name: 'Ur Dragort'});
  canvas.append(token2.canvasElement);
  $('#tokenList').append(token2.tokenElement);

  $('#tokenList').sortable();
});