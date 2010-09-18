
Token = Klass(CanvasNode, {
  defaults: {},
  borderWidth: 4,
  borderColor: '#990000',
  borderHoverColor: '#ff0000',
  bringToFront: function() {
    var maxZIndex = 0;
    $.each(this.parent.childNodes, function() {
      console.log(this.zIndex);
      if (this.zIndex > maxZIndex) {
        maxZIndex = this.zIndex;
      }
    });
    this.zIndex = maxZIndex + 1;
  },

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
      self.bringToFront();
    });
    border.when('mouseover', function() {
      border.stroke = self.borderHoverColor;
    });
    border.when('mouseout', function() {
      border.stroke = self.borderColor;
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

    // this.fog = new Rectangle(600, 600, {
    //   cx: 0,
    //   cy: 0,
    //   fillOpacity: 0.3,
    //   fill: '#999999',
    //   zIndex: 100
    // });
    // this.background.append(this.fog);

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
        
        // var fogReveal = new Rectangle(100, 100, {
        //   cx: 0,
        //   cy: 0,
        //   crop: true
        // });
        // self.fog.append(fogReveal);
        
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

  $('#newToken').submit(function() {
    var newToken = new Token({image: $(this).find('option:selected').val(), name: $(this).find('input').val()});
    grid.append(newToken);
    $('#tokenList').append(newToken.initiativeMarkup());
    return false;
  });
  $('#zoomOut').click(function() {
    grid.scale -= 0.1;
    return false;
  });
  $('#zoomIn').click(function() {
    grid.scale += 0.1;
    return false;
  });
  
});