// JavaScript for mapper app

function loadPage(){
    return $(`
    <div id="root">
        <div class="pageHeader" id="fixedHeader">
            <a href="#index" class="titleLogo title">Mapper&nbsp&nbsp<i class="fas fa-map-pin"></i></a>
                <div class="header-right">
                    <button class="about button is-rounded"> About</button>
                    <button class="login button is-rounded"> Get started</button>
                </div>
        </div>
        <div class="content">
            <div class="columns">
                <div class="column is-two-thirds" id="left">
                    <div class="box">
                    Content to go in the left box, explain who we are on this side
                    </div>
                </div>
                <div class="column" id="right">
                    <div class="box">
                    Content to go in the right box, dynamically build list of stops on this side
                    </div>
                </div>
            </div>
            <div class="" id="attractions">
                <div class="box">
                An attraction box
                </div>
                <div class="box">
                An attraction box
                </div>
        </div>       
    </div>`);
}


export async function renderPage(){
    let main = $('main');
    main.empty();
    main.append(loadPage());

    main.on('click', '.create', newTweetHandler); // this works
}

function headerScroll() {
    let header = document.getElementById("fixedHeader");
    let offset = header.offsetTop;
  if (window.pageYOffset > offset) {
    header.classList.add("headerMove");
  } else {
    header.classList.remove("headerMove");
  }
}

$(window).on("load", renderPage); // Renders the home page

// For responsive header with scroll
window.onscroll = function() {headerScroll()};
