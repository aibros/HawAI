$("#image-selector").change(function () {
  let reader = new FileReader();
  reader.onload = function () {
    const dataURL = reader.result;
    $("#selected-image").attr("src", dataURL);
    $("#prediction-list").empty();
  };

  const file = $("#image-selector").prop("files")[0];
  reader.readAsDataURL(file);
});

let model;
$(document).ready(async function () {
  $(".progress-bar").show();
  console.log("Loading model...");
  model = await tf.loadGraphModel("model/model.json");
  console.log("Model loaded.");
  $(".progress-bar").hide();
});

$("#predict-button").click(async function () {
  let image = $("#selected-image").get(0); //get the image from the form
  if (image.src !== "") {
    // Pre-process the image
    console.log("Loading image...");
    let tensor = tf.browser
      .fromPixels(image, 3)
      .resizeNearestNeighbor([224, 224]) // change the image size
      .expandDims()
      .toFloat()
      .reverse(-1); // RGB -> BGR
    tensor.expandDims().print();
    let predictions = await model.predict(tensor).data();
    console.log(predictions);
    let top5 = Array.from(predictions)
      .map(function (p, i) {
        // this is Array.map
        return {
          probability: p,
          className: TARGET_CLASSES[i], // we are selecting the value from the obj
        };
      })
      .sort(function (a, b) {
        return b.probability - a.probability; // sort classes by probability
      })
      .slice(0, 2);
    $("#prediction-list").empty();

    top5.forEach(function (p) {
      console.log(`${p.className}: ${100 * p.probability.toFixed(2)}%`);
      if (p.probability === top5[0].probability) {
        $("#prediction-list").append(
          `<div>That's ${p.className}: ${100 * p.probability.toFixed(2)}%</div>`
        );
      }
    });
  } else {
    $("#prediction-list").empty();
    $("#prediction-list").append(
      `<strong class="select-err">Select an image pretty please</strong>`
    );
    $(".select-err").css("color", "red");
    setTimeout(() => {
      $(".select-err").css("color", "black");
    }, 500);
  }
});
