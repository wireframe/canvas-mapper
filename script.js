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

  $('#tokenList').sortable({
    placeholder: 'placeholder'
  });

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
  $('#panUp').click(function() {
    grid.y += 25;
    return false;
  });
  $('#panDown').click(function() {
    grid.y -= 25;
    return false;
  });
  $('#panLeft').click(function() {
    grid.x += 25;
    return false;
  });
  $('#panRight').click(function() {
    grid.x -= 25;
    return false;
  });
  
});