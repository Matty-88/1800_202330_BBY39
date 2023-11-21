var goal;
var goalID;
var userId;
var userView = true;
var userDetails;

// Function to handle click on the "Friends" button
const onClickFriends = async () => {
  // Obtain necessary DOM elements
  if (goalID) {
    const avatar = document.getElementById("avatar");
    const avatarText = document.getElementById("avatar-text");
    const background = document.getElementsByClassName("card-img-overlay")[0];
    const text = document.getElementById("progress-text");
    const image = document.getElementsByClassName("avatar-container")[0];

    // Modify styles based on userView
    text.style.fontWeight = 600;
    image.style.pointerEvents = "none";

    // Toggle between "Me" and "Other" views
    if (userView) {
      // Show "Me" view
      avatar.src = "/assets/images/me.jpg";
      avatarText.innerText = "Me:";
      background.style.backgroundColor = "rgb(170 180 237 / 69%)";
      text.innerText = "Your Friend saved:";
    } else {
      // Show "Other" view
      avatar.src = "/assets/images/avatar.jpg";
      avatarText.innerText = "Other:";
      background.style.backgroundColor = "#fbcee396";
      text.innerText = "You saved:";
    }

    // Reset progress container
    var progressContainer = document.getElementById("progress-container");
    progressContainer.innerHTML = "";

    // Determine friendId based on userView
    const friendid = userView
      ? goal?.userIds?.find((ele) => ele !== userId)
      : userId;

    console.log(
      goal?.userIds?.find((ele) => ele !== userId),
      userId
    );
    console.log(friendid);
    console.log(goalID);

    try {
      // Fetch spendings data for the friend
      db.collection("spendings")
        .where("userID", "==", friendid)
        .where("goalID", "==", goalID)
        // .limit(1)
        .get()
        .then((querySnapshot) => {
          if (querySnapshot) {
            console.log(querySnapshot?.docs[0]?.data()?.runningTotal ?? 0);
            // Update progress bar based on friend's spending data
            getGoalPersentage(
              querySnapshot?.docs[0]?.data()?.runningTotal
                ? querySnapshot?.docs[0]?.data()?.runningTotal
                : userId === friendid &&
                  !querySnapshot?.docs[0]?.data()?.runningTotal
                ? userDetails?.spendingMax * goal?.duration
                : 0,

              (persentage) => {
                if (
                  persentage === 100 ||
                  (persentage > 100 && userId === friendid)
                ) {
                  return "You have enough money for your goal, dont spend it!";
                } else if (persentage < 100 && userId === friendid) {
                  return "Try to spend less money, so you can achieve your goal";
                } else if (
                  persentage === 100 ||
                  (persentage > 100 && userId !== friendid)
                ) {
                  return "Your friend is saving enough money to win the goal";
                }
              }
            );

            // Toggle userView for the next click
            userView = !userView;
          }
        });
    } catch (error) {
      console.error("Error getting documents:", error);
    }
  }
};

// Function to fetch user's spendings data
function getSpendings() {
  if (goalID) {
    db.collection("spendings")
      .where("userID", "==", userId)
      .where("goalID", "==", goalID)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot) {
          // Update progress bar based on user's spending data
          getGoalPersentage(
            querySnapshot?.docs[0]?.data()?.runningTotal ??
              userDetails?.spendingMax * goal?.duration,

            (persentage) => {
              if (persentage === 100 || persentage > 100) {
                return "You have enough money for your goal, don't spend it!";
              } else if (persentage < 100) {
                return "Try to spend less money, so you can achieve your goal";
              }
            }
          );
          const list = document.getElementsByClassName("list-group")[0];
          list.innerHTML = "";

          if (querySnapshot?.docs[0]?.data()) {
            querySnapshot.docs.forEach((doc) => {
              // Handle each spending document
              const div = document.createElement("div");
              div.className =
                "list-group-item list-group-item-action d-flex flex-row align-items-center justify-content-between";
              const p1 = document.createElement("p");
              const p2 = document.createElement("p");

              p1.innerText = doc.data().description;
              p2.innerText = doc.data().amount + "$";
              p2.style.color = "red";

              div.appendChild(p1);
              div.appendChild(p2);

              list.appendChild(div);
              // Use spendingData as needed
            });
          } else {
            const list = document.getElementsByClassName("list-group")[0];

            const p = document.createElement("p");
            p.innerText = "No Spendings Yet!";
            p.className = "text-center text-secondary mt-3";
            list.appendChild(p);
          }
        }
      });
  }
}

// Function to fetch the user's active goal
const getGoal = async () => {
  const querySnapshot = await db
    .collection("goals")
    .where("userIds", "array-contains", userId)
    .where("isActive", "==", true)
    .get();
  goal = querySnapshot.docs[0]?.data();
  goalID = querySnapshot.docs[0]?.id;

  if (goal) {
    // <img src="" alt="User Avatar" class="avatar-image" id="avatar" />
    document.getElementById("avatar").src = "/assets/images/avatar.jpg";
    document.getElementById("avatar-text").innerText = "Others:";
    const text = document.getElementById("progress-text");

    text.innerText = "You've saved:";
    text.style.fontWeight = 600;

    // Update goal-related DOM elements
    const goalName = document.getElementById("goalName");
    goalName.innerText = goal?.name;
    goalName.style.fontSize = "22pt";
    var targetDate = new Date(goal?.date);
    targetDate.setMonth(targetDate.getMonth() + goal?.duration);

    // Get the current date
    var currentDate = new Date();

    // Check if today is beyond the target date
    if (currentDate > targetDate) {
      document.getElementById("total").innerText =
        "Unfortunately, your set duration has passed.";
    } else {
      document.getElementById("total").innerText = goal?.target + "$";
    }
  } else {
    document.getElementById("avatar").src = "/assets/images/avatar.jpg";

    const div = document.getElementById("progress-container");
    const btn = document.createElement("a");
    btn.href = "add.html";
    btn.className = "btn btn-light btn-lg bold";
    btn.setAttribute("role", "button");
    btn.innerText = "Add Goal";
    div.appendChild(btn);
  }
};

// Function to update the circular progress bar
const getGoalPersentage = (latestSpending, func) => {
  const target = goal?.target;
  const runningTotal = latestSpending;
  document.getElementById("progress-container").innerHTML = "";

  if (target) {
    // Calculate percentage
    document.getElementById("line").innerHTML = "";
    console.log((runningTotal / target) * 100, runningTotal, target);
    const percentage = (runningTotal / target) * 100;

    // Create a new circular progress bar instance
    var bar = new ProgressBar.Circle("#progress-container", {
      color: "#191a24",
      strokeWidth: 2,
      trailWidth: 10,
      easing: "easeInOut",
      duration: 1400,
      text: {},
      from: { color: "#ff8cc2", width: 10 },
      to: { color: "#ff8cc2", width: 2 },
      step: function (state, circle) {
        // Update the appearance of the progress bar during animation
        circle.path.setAttribute("stroke", state?.color);
        circle.path.setAttribute("stroke-width", state?.width);

        // Update the text inside the progress bar based on the current value
        var value = Math.round(circle?.value() * 100);
        circle.setText(value + "%");
      },
    });

    // Set style for the progress bar text
    bar.text.style.fontSize = "2rem";

    // Animate the progress bar to the calculated percentage
    bar.animate(
      percentage > 100 ? 100 / 100 : percentage < 0 ? 0 / 100 : percentage / 100
    );
    const line = func(percentage);
    line ? (document.getElementById("line").innerText = line) : "";
    // Re-enable click events on the avatar container
    document.getElementsByClassName("avatar-container")[0].style.pointerEvents =
      "auto";

    // Trigger confetti if the goal is reached
    if (percentage === 100 && hasSpendings) {
      triggerConfetti();
    }
  }
};

const getUserDetails = () => {
  db.collection("users")
    .doc(userId)
    .get()
    .then(function (doc) {
      if (doc.exists) {
        userDetails = doc.data();
      } else {
        console.log("No such document!");
      }
    })
    .catch(function (error) {
      console.log("Error getting document:", error);
    });
};

// Function to trigger confetti animation
function triggerConfetti() {
  var duration = 3 * 1000; // 3 seconds
  var animationEnd = Date.now() + duration;

  // Use the canvas-confetti library
  var canvas = document.getElementById("confetti-canvas");
  canvas.style.display = "block";

  var myConfetti = confetti.create(canvas, {
    resize: true,
    useWorker: true,
  });

  function runAnimation() {
    var timeLeft = animationEnd - Date.now();

    var opacity = Math.min(1, timeLeft / duration);

    myConfetti({
      particleCount: 20,
      spread: 160,
      origin: { y: 1 },
      start_velocity: 30,
      opacity: opacity,
    });

    if (timeLeft > 0) {
      requestAnimationFrame(runAnimation);
    } else {
      canvas.style.display = "none";
    }
  }

  runAnimation();
}

// Function to get user details and initialize the page
function getDetails() {
  firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      userId = user.uid;

      // Fetch user's goal and spendings data
      await getUserDetails();
      await getGoal();
      await getSpendings();
      if (goalID) {
        document.getElementById("conatiner").classList.remove("d-none");
        document.getElementById("placeholder").classList.add("d-none");
      } else {
        document.getElementById("conatiner").classList.add("d-none");
        document.getElementById("placeholder").classList.remove("d-none");
      }
      document.getElementById("loader").classList.add("d-none");
    } else {
      window.location.href = "login.html";
    }
  });
}

async function addSpending() {
  // Get the Dollar amount
  var dollarAmount = document.getElementById("dollar-amount").value;
  // Get the item description
  var itemDescription = document.getElementById("item-description").value;

  var spendingsRef = db.collection("spendings");

  try {
    // Fetch spendings data for the friend

    var runningTotal;

    await db
      .collection("spendings")
      .where("userID", "==", userId)
      .where("goalID", "==", goalID)
      .limit(1)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot && querySnapshot?.docs[0]?.data()) {
          runningTotal =
            +querySnapshot?.docs[0]?.data()?.runningTotal - +dollarAmount;
        } else {
          runningTotal =
            +userDetails?.spendingMax * +goal?.duration - +dollarAmount;
        }
      });
  } catch (error) {
    console.error("Error getting documents:", error);
  }

  spendingsRef
    .add({
      amount: +dollarAmount,
      description: itemDescription,
      goalID: goalID,
      userID: userId,
      date: new Date(),
      runningTotal: runningTotal,
    })
    .then((ele) => {
      var modal = document.getElementById("exampleModalCenter");
      // modal.style.display = "none";

      var modalBackdrop = document.getElementsByClassName("modal-backdrop");
      console.log(modalBackdrop);
      for (var i = 0; i < modalBackdrop.length; i++) {
        modalBackdrop[i].classList.remove("show");

        modalBackdrop[i].classList.add("hide");
      }

      getSpendings();
    });
}

// Initialize the page by getting user details
getDetails();
