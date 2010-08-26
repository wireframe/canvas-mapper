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

Token = function(image, grid) {
  this.image = new Image();
  this.image.src = image;

  this.isBloodied = true;
  this.positionX = 0;
  this.positionY = 0;
  this.grid = grid;
};
Token.prototype = {
  draw: function(context, viewport) {
    context.save();
    context.translate(this.positionX, this.positionY);

    //setup clipping to make image rounded
    context.beginPath();
    context.arc(this.tokenRadius(), this.tokenRadius(), this.tokenRadius(), 0, Math.PI * 2, true);
    context.clip();

    context.drawImage(this.image, 0, 0, this.grid.squareSize, this.grid.squareSize);

    //draw border around token
    var isMouseHover = context.isPointInPath(viewport.mouseX, viewport.mouseY);
    context.strokeStyle = isMouseHover ? 'rgba(255, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.7)';
    context.lineWidth = this.borderWidth;
    context.stroke();

    context.restore();
  },
  borderWidth: 4,
  borderColor: function() {
    return 'rgba(' + (this.isBloodied ? 255 : 0) + ', 0, 0, 0.7)';
  },
  tokenRadius: function() {
    return this.grid.squareSize / 2;
  },
  isWithinBounds: function(x, y) {
    return false;
    // this.context.beginPath();
    // this.context.arc(this.tokenCenterpoint().x, this.tokenCenterpoint().y, this.tokenRadius(), 0, Math.PI * 2, true);
    // return this.context.isPointInPath(x, y);
  }
};


//cake.js version
$(function() {
  var c = E.canvas(500, 500);          // create a new canvas element
  var canvas = new Canvas(c);         // create a CAKE [Canvas] for the element
  var background = new Image();
  background.src = 'map.jpg';
  canvas.fill = new Pattern(background, 'no-repeat');

  var rect = new Rectangle(100, 100);  // create a CAKE [Rectangle] object
  rect.x = 250;                        // move the Rectangle to (250, 250)
  rect.y = 250;
  rect.fill = 'green';                 // fill the Rectangle with green color
  // rotate the Rectangle on every frame
  rect.addFrameListener(function(t) {
    this.rotation = ((t / 3000) % 1) * Math.PI * 2; 
  });
  canvas.append(rect);                 // append the Rectangle to the Canvas

  var circle = new Circle(16);
  circle.x = 16;
  circle.y = 16;
  circle.stroke = 'red';
  circle.strokeWidth = 2;
  circle.clip = true;

  var token = ImageNode.load('token.jpg');
  token.dX = -16,
  token.dY = -16;
  token.dWidth = 32;
  token.dHeight = 32;
  circle.append(token);

  circle.when('mousemove', function(){
    alert('here');
    this.stroke = 'blue';
  });

  circle.when('mouseover', function() {
    alert('here');
    circle.stroke = 'blue';
  });

  canvas.append(circle);
  // circle.fillStyle = 'red'
  
  
  document.body.appendChild(c);
});