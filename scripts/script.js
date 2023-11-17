function sayHello() {}
//sayHello();

function logout() {
  firebase
    .auth()
    .signOut()
    .then(() => {
      // Sign-out successful.
      console.log("logging out user");
    })
    .catch((error) => {
      // An error happened.
    });
}

function getSpendings(userID){
    db.collections('spendings')
  
}

function getNameFromAuth() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      
      var uid = user.uid;
      getSpendings(uid)

      // ...
    } else {
      // User is signed out
      // ...
    }
  });
}


getNameFromAuth();
