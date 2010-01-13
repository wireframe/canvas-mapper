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
    grid.offsetX = $('#offsetX').val();
    grid.offsetY = $('#offsetY').val();
    grid.lineWidth = $('#lineWidth').val();

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
  this.zoom = 1;
  this.width = canvas.width();
  this.height = canvas.height();
  
  var self = this;
  canvas.mousewheel(function(e, delta) {
    var sensitivity = 0.01;
    self.zoom += delta * sensitivity;
  });
};

Grid = function(image) {
  this.background = new Image();
  this.background.src = image;

  this.squareSize = 73;
  this.offsetX = 19;
  this.offsetY = 2;
  this.lineWidth = 2;
};

Grid.prototype.draw = function(ctx, viewport) {
  ctx.drawImage(this.background, 0, 0,  viewport.zoom * viewport.width, viewport.zoom * viewport.height);

  ctx.lineWidth = this.lineWidth;
  ctx.strokeStyle = "rgba(100, 100, 100, 1)";
  for (var column = 0; column < this.columns(viewport); column++) {
    for (var row = 0; row < this.rows(viewport); row++) {
      var square = this.coordinatesForSquare(column, row, viewport);
      ctx.strokeRect(square.x, square.y, this.squareSize * viewport.zoom, this.squareSize * viewport.zoom);
    }
  }
};

Grid.prototype.columns = function(viewport) {
  return viewport.width / this.squareSize;
};
Grid.prototype.rows = function(viewport) {
  return viewport.height / this.squareSize;
};
Grid.prototype.coordinatesForSquare = function(column, row, viewport) {
  return {
    x: column * this.squareSize * viewport.zoom + this.offsetX * viewport.zoom,
    y: row * this.squareSize * viewport.zoom + this.offsetY * viewport.zoom
  };
};
Grid.prototype.squareAt = function(x, y, viewport) {
  var col = Math.floor((x - this.offsetX) / (this.squareSize * viewport.zoom));
  var row = Math.floor((y - this.offsetY) / (this.squareSize * viewport.zoom));
  return this.coordinatesForSquare(col, row, viewport);
};
