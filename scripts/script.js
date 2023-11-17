function sayHello() { }
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

function getSpendings(userID, goalID) {
  db.collection('spendings')
    .where('userId', '==', userID).where('goalID', '==', goalID).get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        // Handle each spending document
        const spendingData = doc.data();
        console.log('Spending Data:', spendingData);
      });
    })


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
      //querySnapshot.docs[0]
      const goalID = querySnapshot.docs[0].id;
      console.log(uid);
      getSpendings(uid, goalID)

    } else {
      window.location.href = "login.html";
    }
  });
}

getNameFromAuth();


