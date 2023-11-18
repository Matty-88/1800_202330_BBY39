var swiper = new Swiper(".mySwiper", {
  slidesPerView: 3.6,
  spaceBetween: 10,
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
});
const onAddGoal = () => {
  // console.log(firebase.auth().currentUser.uid)
  const obj = {
    name: document.getElementById("goalName").value,
    duration: document.getElementById("durationInput").value,
    target: document.getElementById("target").value,
    userId: firebase.auth().currentUser.uid,
    winnerId: "",
    isActive: true,
  };
};

const getAllUsers = () => {
  const query = db.collection("users");

  query
    .get()
    .then((querySnapshot) => {
      const listDiv = document.getElementById("list");
      querySnapshot.forEach((doc) => {
        const data = doc.data();

        if (
          doc.id !== user.uid &&
          !friendsList?.find((ele) => ele?.id === doc.id)
        ) {
          const para = document.createElement("p");
          para.innerText = data?.name;
          listDiv.appendChild(para);
        }
      });
    })
    .catch((error) => {
      console.error("Error querying Firestore:", error);
    });
};
