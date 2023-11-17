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
      var uid = user.uid;

      const querySnapshot = await db
        .collection("goals")
        .where("userIds", "array-contains", uid)
        .where("isActive", "==", true)
        .get();
      querySnapshot.docs.map((doc) => console.log(doc.data()));

    } else {
      window.location.href = "login.html";
    }
  });
}

getNameFromAuth();


