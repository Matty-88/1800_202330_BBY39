let userDetails;
let userId;
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // User logged in already or has just logged in.
    userId = user?.uid;
    db.collection("users")
      .doc(user?.uid)
      .get()
      .then(function (doc) {
        if (doc.exists) {
          userDetails = doc.data();

          document.getElementById("name").innerText = userDetails?.name;
          document.getElementById("email").innerText = userDetails?.email;
          document.getElementById("income").value = userDetails?.income;
          document.getElementById("expense").value = userDetails?.fixedExpense;
        } else {
          window.location.href = "index.html";
        }
      })
      .catch(function (error) {
        console.log();
        window.location.href = "index.html";
      });
  } else {
    window.location.href = "index.html";
  }
});

const onEdit = () => {
  document.getElementById("submit").classList.remove("d-none");
  document.getElementById("cancel").classList.remove("d-none");
  document.getElementById("edit").disabled = true;
  document.getElementById("income").disabled = false;
  document.getElementById("expense").disabled = false;
};

var myForm = document.getElementById("form");

// Add a submit event listener to the form
myForm.addEventListener("submit", function (event) {
  // Prevent the default form submission behavior (page refresh)
  event.preventDefault();

  var userRef = db.collection("users").doc(userId);

  const obj = {
    ...userDetails,
    income: document.getElementById("income").value,
    fixedExpense: document.getElementById("expense").value,
    spendingMax: document.getElementById("income").value - document.getElementById("expense").value
  };
  userRef
    .update(obj)
    .then(function () {

      document.getElementById("submit").classList.add("d-none");
      document.getElementById("cancel").classList.add("d-none");
      document.getElementById("edit").disabled = false;
      document.getElementById("income").disabled = true;
      document.getElementById("expense").disabled = true;
      Swal.fire({
        title: "Success!",
        text: "User Profile Successfully updated",
        icon: "success"
      });
    })
    .catch(function (error) {
      console.error("Error updating user: ", error);
    });
});


const onCancel = () => {
  document.getElementById("submit").classList.add("d-none");
  document.getElementById("cancel").classList.add("d-none");
  document.getElementById("edit").disabled = false;
  document.getElementById("income").value = userDetails?.income;
  document.getElementById("expense").value = userDetails?.fixedExpense;
  document.getElementById("income").disabled = true;
  document.getElementById("expense").disabled = true;
}


const logout = () => {
  firebase
    .auth()
    .signOut()
    .then(() => {
      // Sign-out successful.
      window.location.href = "index.html";

    })
    .catch((error) => {
      // An error happened.
      console.error("Error during logout:", error);
    });
}
