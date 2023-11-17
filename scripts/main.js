var ImageFile;
function listenFileSelect() {
  // listen for file selection
  var fileInput = document.getElementById("mypic-input"); // pointer #1
  const image = document.getElementById("mypic-goes-here"); // pointer #2

  // When a change happens to the File Chooser Input
  fileInput.addEventListener("change", function (e) {
    ImageFile = e.target.files[0]; //Global variable
    var blob = URL.createObjectURL(ImageFile);
    image.src = blob; // Display this image
  });
}
listenFileSelect();
