
$('main').on('click', '#logout', logoutHandler)


async function logoutHandler() {
    let result= await axios.get('https://mapper-project.herokuapp.com/logout', { headers: {'Access-Control-Allow-Origin': '*'}});
    document.cookie = "username=guest";
    window.location.replace("https://mapper-project.herokuapp.com/index.html");
}