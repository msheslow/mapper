$('document').on('onresize', doResize);


let $el = $("#leftUpperBox");
let elHeight = $el.outerHeight();
let elWidth = $el.outerWidth();

let $wrapper = $("#leftUpperWrapper");

$wrapper.resizable({
  resize: doResize
});

function doResize(event) {
  
  let scale;
    
  scale = Math.min(
    ui.size.width / elWidth,    
    ui.size.height / elHeight
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