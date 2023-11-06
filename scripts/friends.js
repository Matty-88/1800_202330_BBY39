firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    var friendsList = [];
    await getFriends(user);
    getAllUsers(user);
  }
});
const getFriends = async (user) => {
  try {
    const userRef = await db.collection("users").doc(user.uid);
    const querySnapshot = await db
      .collection("friends")
      .where("user", "==", userRef)
      .get();

    if (querySnapshot.size > 0) {
      const userFriendDoc = querySnapshot.docs[0];
      friendsList = userFriendDoc.data().friends_list;
      const listDiv = document.getElementById("friends_list");

      for (const friendReference of friendsList) {
        const friendDoc = await friendReference.get();
        if (friendDoc.exists) {
          const friendData = friendDoc.data();
          const para = document.createElement("p");
          para.innerText = friendData.name;
          listDiv.appendChild(para);
        }
      }
    } else {
      console.log("User not found in friends collection or has no friends.");
    }
  } catch (error) {
    console.error("Error querying or fetching friends:", error);
  }

};

function getAllUsers(user) {
  const query = db.collection("users");

  query
    .get()
    .then((querySnapshot) => {
      const listDiv = document.getElementById("list");
      querySnapshot.forEach((doc) => {
        const data = doc.data();

        if (doc.id !== user.uid && !friendsList?.find((ele) => ele?.id === doc.id)) {
          const para = document.createElement("p");
          para.innerText = data?.name;
          listDiv.appendChild(para);
        }
      });
    })
    .catch((error) => {
      console.error("Error querying Firestore:", error);
    });
}
