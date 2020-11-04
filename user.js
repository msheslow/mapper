class user {
    constructor(userName, password, preferences){
        this.userName = userName
        this.password = password
        this.preferences = preferences
    }

    updatePreferences(preferences){
        this.preferences = preferences
    }

    updatePassword(password) {
        this.password = password
    }
}

class preferences{
    constructor(nature= false, historical = false, restaurant = false){
        this.nature = nature 
        this.historical = historical
        this.restaurant = restaurant
    }
}