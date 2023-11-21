var swiper = new Swiper(".mySwiper", {
  slidesPerView: 3.6,
  spaceBetween: 10,
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
});

var collaporator;
var userDetails;
var userId;

var myForm = document.getElementById("form");

// Add a submit event listener to the form
myForm.addEventListener("submit", async function (event) {
  // Prevent the default form submission behavior
  event.preventDefault();
  const fixedExpense = +document.getElementById("fixedExpense").value;
  const income = +document.getElementById("incomeInput").value;
  const amount = +document.getElementById("amount").innerHTML;
  
  //check if all the values in the form are filled
  if (fixedExpense > 0 && income > 0 && collaporator && amount > 0) { 
    const userRef = db.collection("users").doc(userId);
   await userRef.update({
      fixedExpense,
      income,
      spendingMax: income - fixedExpense,
    });

    await makeGoalsInactive();

    const obj = {
      name: document.getElementById("goalName").value,
      duration: document.getElementById("durationInput").value,
      target: amount,
      userIds: [userId, collaporator],
      winnerId: "",
      date: new Date(),
      isActive: true,
    };

    db.collection("goals")
      .add(obj)
      .then(() => {
        Swal.fire({
          title: "Success!",
          text: "A New Goal Is Successfully Added",
          icon: "success",
        }).then((ele) => {
          window.location.href = "main.html";
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }
});

function makeGoalsInactive() {
  // Use a batch to perform multiple writes as a single atomic operation
  var batch = db.batch();

  // Query for goals associated with the user

  return db
    .collection("goals")
    .where("userIds", "array-contains", userId)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        // For each goal document, update the 'active' field to false
        var goalRef = db.collection("goals").doc(doc.id);
        batch.update(goalRef, { isActive: false });
      });

      // Commit the batch update
      return batch.commit();
    })
    .then(() => {
      console.log("All goals made inactive for user:", userId);
    })
    .catch((error) => {
      console.error("Error making goals inactive:", error);
    });
}

const getAllUsers = () => {
  const query = db.collection("users");

  query
    .get()
    .then((querySnapshot) => {
      const listDiv = document.getElementById("sliders");
      querySnapshot.forEach((doc) => {
        userId = firebase.auth().currentUser.uid;
        if (doc.id !== userId) {
          const slide = document.createElement("div");

          slide.className =
            "swiper-slide d-flex flex-column align-items-center";
          const img = document.createElement("img");
          const p = document.createElement("p");
          p.style.fontSize = "10pt";
          p.innerText = doc?.data()?.name;
          img.src = "/assets/images/avatar.jpg";
          img.id = doc?.id;

          img.className = "avatar";
          p.className = "avatar-name";
          slide.appendChild(img);
          slide.appendChild(p);

          listDiv.appendChild(slide);
        } else {
          document.getElementById("fixedExpense").value =
            doc.data()?.fixedExpense;
          document.getElementById("incomeInput").value = doc.data()?.income;
        }
      });
    })
    .catch((error) => {
      console.error("Error querying Firestore:", error);
    });
};

getAllUsers();

document.addEventListener("click", (e) => {
  const target = e.target.closest(".avatar");
  if (target) {
    var element = document.getElementsByClassName("avatar-clicked");

    // Remove the specific class
    element[0]?.classList?.remove("avatar-clicked");
    collaporator = target?.id;
    target.className = "avatar avatar-clicked";
  }
});

const generate = () => {
  document.getElementById("amount").innerText = 100;
};

generate();

const onClickMore = () => {
  const amount = document.getElementById("amount");
  amount.innerText = +amount.innerHTML + 1;
};

const onClickLess = () => {
  const amount = document.getElementById("amount");
  amount.innerText = +amount.innerHTML !== 0 ? +amount.innerHTML - 1 : 0;
};

const onChangeAmount = (number) => {
  const amount = document.getElementById("amount");
  amount.innerText = number;
  var element = document.getElementsByClassName("amount-clicked");

  // Remove the specific class
  element[0]?.classList?.remove("amount-clicked");

  document.getElementById(number).className = "btns amount-clicked";
};
