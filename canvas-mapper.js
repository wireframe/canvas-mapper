
Token = Klass(CanvasNode, {
  defaults: {},
  borderWidth: 5,
  borderColor: '#444444',
  borderHoverColor: '#DD0000',
  isToken: true,
  bringToFront: function() {
    var maxZIndex = 0;
    $.each(this.parent.childNodes, function() {
      if (this.isToken && this.zIndex > maxZIndex) {
        maxZIndex = this.zIndex;
      }
    });
    this.zIndex = maxZIndex + 1;
  },
  highlight: function() {
    this.border.stroke = this.borderHoverColor;
  },
  removeHighlight: function() {
    this.border.stroke = this.borderColor;
  },
  select: function() {
    this.bringToFront();
    this.parent.selection.clearSelection();
    this.highlight();
    this.parent.selection.selectedTokens = [this];
  },

  initialize: function(options) {
    CanvasNode.initialize.call(this);
    $.extend(this, this.defaults, options);

    var gridWidth = 64;
    var radius = gridWidth / 2;
    this.border = new Circle(radius - this.borderWidth, {
      x: radius,
      y: radius,
      stroke: this.borderColor,
      strokeOpacity: 0.9,
      strokeWidth: this.borderWidth,
      clip: true
    });
    this.border.makeDraggable();
    var self = this;
    this.border.when('focus', function(e){
      self.select();
    });
    this.append(this.border);

    var token = ImageNode.load(this.image);
    token.dX = -radius,
    token.dY = -radius;
    token.dWidth = gridWidth;
    token.dHeight = gridWidth;
    this.border.append(token);
  },

  initiativeMarkup: function() {
    return $('<li />').append($('<img width="30"/>').attr('src', this.image)).append($('<h3>').text(this.name));
  }
});

MouseSelection = Klass(Rectangle, {
  stroke : 1,
  strokeOpacity : 0.6,
  stroke : '#00ff00',
  fillOpacity : 0.2,
  fill : '#00ff00',
  visible : false,
  zIndex : 999,

  minSelectionDrag: 81,
  selectedTokens: [],
  selectTokens: function() {
    var left = Math.min(this.cx, this.x2);
    var right = Math.max(this.cx, this.x2);
    var top = Math.min(this.cy, this.y2);
    var bottom = Math.max(this.cy, this.y2);
    this.selectedTokens = this.parent.parent.childNodes.filter(function(s) {
      return s.isToken && (s.border.x >= left && s.border.x <= right && s.border.y >= top && s.border.y <= bottom);
    });
  },
  clearSelection: function() {
    _.each(this.selectedTokens, function(t) {
      t.removeHighlight();
    });
  },
  startDrag: function() {
    var point = CanvasSupport.tMatrixMultiplyPoint(
      CanvasSupport.tInvertMatrix(this.currentMatrix),
      this.root.mouseX, this.root.mouseY
    );
    this.startX = this.root.mouseX;
    this.startY = this.root.mouseY;
    this.selectionStart = point;
    this.x2 = this.cx = point[0];
    this.y2 = this.cy = point[1];
  },
  drag: function() {
    var point = CanvasSupport.tMatrixMultiplyPoint(
      CanvasSupport.tInvertMatrix(this.currentMatrix),
      this.root.mouseX, this.root.mouseY
    )
    if (this.selectionStart && !this.visible) {
      var dx = this.startX - this.root.mouseX;
      var dy = this.startY - this.root.mouseY;
      var sqd = dx * dx + dy * dy;
      this.visible = sqd > this.minSelectionDrag;
    }
    if (this.visible) {
      this.x2 = point[0];
      this.y2 = point[1];
    }
    this.clearSelection();
    this.selectTokens();
    _.each(this.selectedTokens, function(s) {
      s.highlight();
    });
  },
  endDrag: function(ev) {
    var point = CanvasSupport.tMatrixMultiplyPoint(
      CanvasSupport.tInvertMatrix(this.currentMatrix),
      this.root.mouseX, this.root.mouseY
    );
    if (this.selectionStart && this.visible) {
      this.visible = false;
      this.selectionStart = null;

      this.selectTokens();
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
    } else if (this.selectionStart && (ev.canvasTarget == this || ev.canvasTarget == this.parent)) {
      this.clearSelection();
      this.visible = false;
      this.selectionStart = null;
    }
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

    this.selection = new MouseSelection();
    this.background.append(this.selection);

    var self = this;
    this.addEventListener('mousedown', function(ev) {
      ev.preventDefault();
      self.selection.startDrag();
    });
    this.addEventListener('drag', function(ev) {
      self.selection.drag();
    });
    this.addEventListener('mouseup', function(ev) {
      self.selection.endDrag(ev);
    });
  }
});
