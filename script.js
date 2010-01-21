$(function() {

  var canvas = $('#map');
  var ctx = canvas[0].getContext("2d");

  var pointerX = 0;
  var pointerY = 0;
  canvas.mousemove(function(e) {
    pointerX = e.pageX - canvas.position().left;
    pointerY = e.pageY - canvas.position().top;
  });
  var viewport = new Viewport(canvas);
  var grid = new Grid('map.jpg');
  
  $('#settings').submit(function() {
    viewport.zoom = $('#zoom').val();
    grid.squareSize = $('#squareSize').val();

    return false;
  });

  setInterval(draw, 100);

  function draw() {
    ctx.clearRect(0, 0, viewport.width, viewport.height);
    grid.draw(ctx, viewport);

    ctx.fillStyle = "rgba(255, 165, 0, 0.4)";
    var hoverSquare = grid.squareAt(pointerX, pointerY, viewport);
    ctx.fillRect(hoverSquare.x, hoverSquare.y, grid.squareSize * viewport.zoom, grid.squareSize * viewport.zoom);
  }
});

Viewport = function(canvas) {
  this.zoom = 2.7;
  this.width = canvas.width();
  this.height = canvas.height();
  
  $('#zoom').val(this.zoom);
  var self = this;
  canvas.mousewheel(function(e, delta) {
    var sensitivity = 0.01;
    self.zoom += delta * sensitivity;
    $('#zoom').val(self.zoom);
    return false;
  });
};

Grid = function(image) {
  this.background = new Image();
  this.background.src = image;

  this.squareSize = 40;
  this.lineWidth = 1;

  $('#squareSize').val(this.squareSize);
};

Grid.prototype.draw = function(ctx, viewport) {
  ctx.drawImage(this.background, 0, 0, viewport.width / viewport.zoom, viewport.height / viewport.zoom, 0, 0, viewport.width, viewport.height);

  ctx.lineWidth = this.lineWidth;
  ctx.strokeStyle = "rgba(100, 100, 100, 1)";
  for (var column = 0; column < this.visibleColumns(viewport); column++) {
    for (var row = 0; row < this.visibleRows(viewport); row++) {
      var square = this.coordinatesForSquare(column, row, viewport);
      ctx.strokeRect(square.x, square.y, this.squareSize * viewport.zoom, this.squareSize * viewport.zoom);
    }
  }
};

Grid.prototype.maxColumns = function() {
  return Math.floor(this.background.width / this.squareSize);
};
Grid.prototype.maxRows = function() {
  return Math.floor(this.background.height / this.squareSize);
};
Grid.prototype.visibleColumns = function(viewport) {
  return Math.min((viewport.width / this.squareSize), this.maxColumns());
};
Grid.prototype.visibleRows = function(viewport) {
  return Math.min((viewport.height / this.squareSize), this.maxRows());
};
Grid.prototype.coordinatesForSquare = function(column, row, viewport) {
  return {
    x: column * this.squareSize * viewport.zoom,
    y: row * this.squareSize * viewport.zoom
  };
};
Grid.prototype.squareAt = function(x, y, viewport) {
  var col = Math.floor(x / (this.squareSize * viewport.zoom));
  var row = Math.floor(y / (this.squareSize * viewport.zoom));
  return this.coordinatesForSquare(col, row, viewport);
};
