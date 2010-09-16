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

Token = Klass(CanvasNode, {
  defaults: {},
  borderWidth: 4,
  borderColor: '#990000',
  borderHoverColor: '#ff0000',

  initialize: function(options) {
    CanvasNode.initialize.call(this);
    $.extend(this, this.defaults, options);

    var gridWidth = 64;
    var radius = gridWidth / 2;
    var border = new Circle(radius - this.borderWidth, {
      x: radius,
      y: radius,
      stroke: this.borderColor,
      strokeOpacity: 0.9,
      strokeWidth: this.borderWidth,
      clip: true
    });
    border.makeDraggable();
    var self = this;
    border.when('focus', function(e){
      this.zIndex += 1;
    });
    border.when('blur', function(){
      this.zIndex -= 1;
    });
    border.when('mouseover', function() {
      this.stroke = self.borderHoverColor;
    });
    border.when('mouseout', function() {
      this.stroke = self.borderColor;
    });
    this.append(border);

    var token = ImageNode.load(this.image);
    token.dX = -radius,
    token.dY = -radius;
    token.dWidth = gridWidth;
    token.dHeight = gridWidth;
    border.append(token);
  },

  initiativeMarkup: function() {
    return $('<li />').append($('<img width="30"/>').attr('src', this.image)).append($('<h3>').text(this.name));
  }
});

Grid = Klass(CanvasNode, {
  initialize: function(image) {
    CanvasNode.initialize.call(this);
    this.background = ImageNode.load(image);
    this.append(this.background);

    this.selection = new Rectangle(0,0, {
      stroke : 1,
      strokeOpacity : 0.6,
      stroke : '#00ff00',
      fillOpacity : 0.2,
      fill : '#00ff00',
      visible : false,
      zIndex : 999
    });
    this.background.append(this.selection);

    var self = this;
    this.addEventListener('mousedown', function(ev) {
      ev.preventDefault();

      var point = CanvasSupport.tMatrixMultiplyPoint(
        CanvasSupport.tInvertMatrix(this.currentMatrix),
        this.root.mouseX, this.root.mouseY
      );
      startX = this.root.mouseX;
      startY = this.root.mouseY;
      self.selectionStart = point;
      self.selection.x2 = self.selection.cx = point[0]
      self.selection.y2 = self.selection.cy = point[1]
    }, false)
    this.addEventListener('drag', function(ev) {
      var point = CanvasSupport.tMatrixMultiplyPoint(
        CanvasSupport.tInvertMatrix(this.currentMatrix),
        this.root.mouseX, this.root.mouseY
      )
      if (self.selectionStart && !self.selection.visible) {
        var dx = startX - this.root.mouseX;
        var dy = startY - this.root.mouseY;
        var sqd = dx * dx + dy * dy;
        self.selection.visible = sqd > 81;
      }
      if (self.selection.visible) {
        self.selection.x2 = point[0];
        self.selection.y2 = point[1];
      }
    }, false);
    this.addEventListener('mouseup', function(ev) {
      var point = CanvasSupport.tMatrixMultiplyPoint(
        CanvasSupport.tInvertMatrix(this.currentMatrix),
        this.root.mouseX, this.root.mouseY
      );
      if (self.selectionStart && self.selection.visible) {
        self.selection.visible = false;
        self.selectionStart = null;
        // var selection = playerShipsInside(th.selectRect)
        // if (ev.shiftKey) {
        //   selection.forEach(Player.select.bind(Player))
        // } else if (ev.altKey) {
        //   selection.forEach(Player.deselect.bind(Player))
        // } else {
        //   Player.clearSelection()
        //   selection.forEach(Player.select.bind(Player))
        // }
      } else if (self.selectionStart && (ev.canvasTarget == self.selection || ev.canvasTarget == self.background)) {
        // Player.setWaypoint(point)
        self.selection.visible = false;
        self.selectionStart = null;
      }
    }, false);
  }
});


$(function() {
  var canvas = new Canvas($('#mapWrapper')[0], 600, 600);

  var grid = new Grid('map.jpg');
  canvas.append(grid);
  
  var token = new Token({image: 'token.jpg', name: 'Thorn Lighthammer'});
  grid.append(token);
  $('#tokenList').append(token.initiativeMarkup());

  var token2 = new Token({image: 'token2.png', name: 'Ur Dragort'});
  grid.append(token2);
  $('#tokenList').append(token2.initiativeMarkup());

  $('#tokenList').sortable();
});