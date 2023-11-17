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

function getNameFromAuth() {
  firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/v8/firebase.User
      var uid = user.uid;
      console.log("uid", uid);
      const querySnapshot = await db
        .collection("goals")
        .where("userIds", "array-contains", uid).get()

      if (querySnapshot.size > 0) {
        console.log(querySnapshot.docs());
      }
      // ...
    } else {
      // User is signed out
      // ...
    }
  });
}

getNameFromAuth();
