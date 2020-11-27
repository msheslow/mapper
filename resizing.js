$('document').on('onresize', doResize);


let $el = $("#leftUpperBox");
let elHeight = $el.outerHeight();
let elWidth = $el.outerWidth();
let top_background = document.getElementsByClassName('upper');

let $wrapper = $("#leftUpperWrapper");

$wrapper.css({
  resize: doResize
});

function doResize(event) {
  
  let scale, origin;
    
  scale = Math.min(
    top_background.outerWidth() / elWidth,    
    top_background.outerHeight() / elHeight
  );
  
  $el.css({
    transform: "translate(-50%, -50%) " + "scale(" + scale + ")"
  });
  
}

let starterData = { 
  size: {
    width: $wrapper.width(),
    height: $wrapper.height()
  }
}
doResize(null, starterData);