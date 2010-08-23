$(function() {
  var canvas = $('#map');
  var grid = new Grid('map.jpg');
  var viewport = new Viewport(canvas, grid);

  $('#settings').submit(function() {
    grid.squareSize = $('#squareSize').val();
    grid.showGridLines = $('#showGridLines').is(':checked');

    return false;
  });

  $('#squareSize').val(grid.squareSize);
  if (grid.showGridLines) {
    $('#showGridLines').attr('checked', 'checked');
  }

  setInterval(function() { viewport.draw(); }, 100);
});

Viewport = function(canvas, grid) {
  this.width = canvas.width();
  this.height = canvas.height();

  this.pointerX = 0;
  this.pointerY = 0;
  this.grid = grid;
  this.context = canvas[0].getContext("2d");

  var self = this;
  canvas.mousemove(function(e) {
    self.pointerX = e.pageX - canvas.position().left;
    self.pointerY = e.pageY - canvas.position().top;
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
    var hoverSquare = this.grid.squareAt(this.pointerX, this.pointerY, this);
    this.context.fillRect(hoverSquare.x, hoverSquare.y, this.grid.squareSize, this.grid.squareSize);

    this.token.draw(this.context);
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

Token = function(image, grid) {
  this.image = new Image();
  this.image.src = image;

  this.isBloodied = true;
  this.positionX = 0;
  this.positionY = 0;
  this.grid = grid;
};
Token.prototype = {
  draw: function(context) {
    context.save();
    //setup clipping to make image rounded
    context.beginPath();
    context.arc(this.tokenCenterpoint().x, this.tokenCenterpoint().y, this.tokenRadius(), 0, Math.PI * 2, true);
    context.clip();

    context.drawImage(this.image, this.positionX, this.positionY, this.grid.squareSize, this.grid.squareSize);

    //draw border around token
    context.beginPath();
    context.strokeStyle = this.borderColor();
    context.lineWidth = this.borderWidth;
    context.arc(this.tokenCenterpoint().x, this.tokenCenterpoint().y, this.tokenRadius(), 0, Math.PI * 2, true);
    context.stroke();

    context.restore();
  },
  borderWidth: 4,
  borderColor: function() {
    return 'rgba(' + (this.isBloodied ? 255 : 0) + ', 0, 0, 0.7)';
  },
  tokenCenterpoint: function() {
    return {
      x: this.positionX + this.tokenRadius(),
      y: this.positionY + this.tokenRadius()
    };
  },
  tokenRadius: function() {
    return this.grid.squareSize / 2;
  }
};
