// JavaScript for mapper app

function loadPage(){
    return $(`
    <div id="root">
        <div class="pageHeader" id="fixedHeader">
            <a href="#index" class="titleLogo title">Mapper&nbsp&nbsp<i class="fas fa-route"></i></a>
                <div class="header-right">
                    <button class="headerButton button is-rounded"> About</button>
                    <button class="headerButton button is-rounded"> Get started</button>
                    <a href="#" class="userIcon"><i class="fas fa-user"></i></a>
                </div>
        </div>
        <div class="content">
            <div class="upper columns box" style="height: 600px; margin: 10px;">
                <div class="column is-two-thirds" id="leftUpper">
                    <div class="leftUpperBox box">
                        <div class="leftUpperText">
                        <text style="font-size: 80px;">Plan your ultimate road trip.</text><br>
                        <text style="font-size: 20px;">Tell us where you're starting and where you're heading. We'll help you plan everything in between.</text>
                        <br>
                        <br>
                        <div class="columns box" style="max-width: 70%; background-color: #235789;">
                            <div class="column is-one-half">
                                <text style="font-size: 20px; color: white;">Start</text></br>
                                <input class="input is-medium" id="start" type="text" placeholder="Enter a start location"/>
                            </div>
                            <div class="column is-one-half">
                            <text style="font-size: 20px; color: white;">Destination</text></br>
                            <input class="input is-medium" id="end" type="text" placeholder="Enter an end location"/>
                            </div>
                            <br>
                            <br>
                        </div>
                            <button class="button is-rounded" id="generate-map">Plan route</button>
                        </div>
                    </div>
                </div>
            </div>
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
