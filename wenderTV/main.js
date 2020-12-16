/**
 * Copyright (c) 2017 Razeware LLC
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * Notwithstanding the foregoing, you may not use, copy, modify, merge, publish,
 * distribute, sublicense, create a derivative work, and/or sell copies of the
 * Software in any work that is designed, intended, or marketed for pedagogical or
 * instructional purposes related to programming, coding, application development,
 * or information technology.  Permission for such use, copying, modification,
 * merger, publication, distribution, sublicensing, creation of derivative works,
 * or sale is expressly withheld.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

var resourceLoader;


App.onLaunch = function(options) {
  evaluateScripts(options.initialJSDependencies,
    function(success){
      if (success) {
        // 2:
        resourceLoader = new ResourceLoaderJS(NativeResourceLoader.create());
        var initialDoc = loadInitialDocument(resourceLoader);
        initialDoc.addEventListener("select", _handleEvent);
        navigationDocument.pushDocument(initialDoc);
      } else {
        // 3:
        var alert = _createAlert("Evaluate Scripts Error", "Error attempting to evaluate the external JS files.");
        navigationDocument.presentModal(alert);

        throw ("Playback Example: unable to evaluate scripts.");
      }
    });
};


function loadInitialDocument(resourceLoader) {
  var data = resourceLoader.getJSON("identity.json");
  data["images"] = resourceLoader
    .convertNamesToURLs(data["images"]);
  data = resourceLoader
    .recursivelyConvertFieldsToURLs(data, "image");
  data["sharedImages"] = _sharedImageResources(resourceLoader);
  return resourceLoader.getDocument("tabBar.tvml", data);
}

function getResourceData() {
  var data = resourceLoader.getJSON("identity.json");
  data["images"] = resourceLoader
    .convertNamesToURLs(data["images"]);
  data = resourceLoader
    .recursivelyConvertFieldsToURLs(data, "image");
  data["sharedImages"] = _sharedImageResources(resourceLoader);
  return data;
}

function _handleEvent(event) {
  // 1:
  var sender = event.target;
  var action = sender.getAttribute("action");
  // 2:
  switch(action) {
    case "navigate":
      var template = resourceLoader    .getDocument(sender.getAttribute("template"), getResourceData());
      template.addEventListener("select", _handleEvent);
      var menuBarDocument = navigationDocument.documents[0];
      var menuBar = menuBarDocument.getElementById("menuBar");
      var feature = menuBar.getFeature('MenuBarDocument');
      feature.setDocument(template, sender);
      break;
    case "showOverflow":
      // 3:
      var data = {
        text: sender.textContent,
        title: sender.getAttribute("title")
      };
      // 4:
      var expandedText = resourceLoader
        .getDocument("expandedDetailText.tvml", data);
      expandedText.addEventListener("select", _handleEvent);
      navigationDocument.presentModal(expandedText);
      break;
    case "dismiss":
      // 5:
      navigationDocument.dismissModal();
      break;
    case "addRating":
      var ratingDoc = resourceLoader.getDocument("videoRating.tvml",
        {title: "Rate Video"});
      navigationDocument.presentModal(ratingDoc);
      break;
    case "showDetails":
      var details = resourceLoader.getDocument("video.tvml", getResourceData());
      details.addEventListener("select", _handleEvent);
      navigationDocument.pushDocument(details);
      break;
    case "playMovie":
      var loading = resourceLoader.getDocument("loading.tvml", getResourceData());
      navigationDocument.presentModal(loading);
      break;
    case "buy":
      var loading = resourceLoader.getDocument("purchase.tvml", getResourceData());
      navigationDocument.presentModal(loading);
      break;
  }
}



function _sharedImageResources(resourceLoader) {
  var sharedImageNames = {
    heads: "heads.png",
    face: "face.png",
    rock: "rock.png",
    spiderman: "spiderman.jpg",
    background: "tv_background.png"
  };

  return resourceLoader.convertNamesToURLs(sharedImageNames);
}

function _createAlert(title, description) {
  var alertString = `<?xml version="1.0" encoding="UTF-8" ?>
    <document>
      <alertTemplate>
        <title>${title}</title>
        <description>${description}</description>
      </alertTemplate>
    </document>`

  var parser = new DOMParser();
  var alertDoc = parser.parseFromString(alertString, "application/xml");
  return alertDoc
}
