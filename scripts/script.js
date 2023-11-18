var goal;
var goalID;
var userId;
var userView = true;
var user;

function logout() {
  firebase
    .auth()
    .signOut()
    .then(() => {
      // Sign-out successful.
      console.log("Logging out user");
    })
    .catch((error) => {
      // An error happened.
      console.error("Error during logout:", error);
    });
}

// Function to handle click on the "Friends" button
const onClickFriends = async () => {
  // Obtain necessary DOM elements
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
    text.innerText = "Your Partner saved:";
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

  try {
    // Fetch spendings data for the friend
    db.collection("spendings")
      .where("userId", "==", friendid)
      .where("goalID", "==", goalID)
      .limit(1)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot) {
          // Update progress bar based on friend's spending data
          getGoalPersentage(querySnapshot?.docs[0]?.data()?.runningTotal ?? 0);
         
          // Toggle userView for the next click
          userView = !userView;
        }
      });
  } catch (error) {
    console.error("Error getting documents:", error);
  }
};

// Function to fetch user's spendings data
function getSpendings() {
  db.collection("spendings")
    .where("userId", "==", userId)
    .where("goalID", "==", goalID)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot) {
        // Update progress bar based on user's spending data
        getGoalPersentage(querySnapshot?.docs[0]?.data()?.runningTotal);

        querySnapshot.forEach((doc) => {
          // Handle each spending document
          const spendingData = doc.data();
          // Use spendingData as needed
        });
      }
    });
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
    // Update goal-related DOM elements
    const goalName = document.getElementById("goalName");
    goalName.innerText = goal?.name;
    goalName.style.fontSize = "22pt";
    document.getElementById("total").innerText = goal?.target + "$";
  }
};

// Function to update the circular progress bar
const getGoalPersentage = (latestSpending) => {
  const target = goal?.target;
  const runningTotal = latestSpending;

  if (target && runningTotal !== undefined) {
    // Calculate percentage
    const percentage = (runningTotal / target) * 100;

    // Create a new circular progress bar instance
    var bar = new ProgressBar.Circle("#progress-container", {
      color: "#191a24",
      strokeWidth: 2,
      trailWidth: 10,
      easing: "easeInOut",
      duration: 1400,
      text: {},
      from: { color: "#fbcee3", width: 10 },
      to: { color: "#fbcee3", width: 2 },
      step: function (state, circle) {
        // Update the appearance of the progress bar during animation
        circle.path.setAttribute("stroke", state.color);
        circle.path.setAttribute("stroke-width", state.width);

        // Update the text inside the progress bar based on the current value
        var value = Math.round(circle.value() * 100);
        circle.setText(value + "%");
      },
    });

    // Set style for the progress bar text
    bar.text.style.fontSize = "2rem";

    // Animate the progress bar to the calculated percentage
    bar.animate(percentage / 100);

    // Re-enable click events on the avatar container
    document.getElementsByClassName("avatar-container")[0].style.pointerEvents =
      "auto";

    // Trigger confetti if the goal is reached
    if (percentage === 100) {
      triggerConfetti();
    }
  }
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
      user = user;
      userId = user.uid;
      document.getElementById("avatar").src = "/assets/images/avatar.jpg";
      document.getElementById("avatar-text").innerText = "Others:";
      const text = document.getElementById("progress-text");

      text.innerText = "You've saved:";
      text.style.fontWeight = 600;

      // Fetch user's goal and spendings data
      await getGoal();
      await getSpendings();
    } else {
      window.location.href = "login.html";
    }
  });
}

// Initialize the page by getting user details
getDetails();