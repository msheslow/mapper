const cookieValue = document.cookie
.split('; ')
.find(row => row.startsWith('username'))
.split('=')[1]
if (cookieValue != "guest") {
    $('#login').hide();
    $('.header-right').append(`<button class="button top is-rounded" id="logout">Logout</button>`);
    document.getElementById('mytrips').innerHTML = `My trips: <b>${cookieValue}</b>`
    console.log('cookie value not guest: ')
    console.log(cookieValue)
} else {
    $('#login').show();
    console.log('cookie value guest: ')
    console.log(cookieValue);
    $('#logout').empty();
}