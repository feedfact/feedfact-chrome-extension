//function used to inject styles into the dom
var style_injector = function(s) {

  var style = ""
  Object.keys(s).forEach(function(k) {
    style += k+" {"
    Object.keys(s[k]).forEach(function(k2) {
      style += k2+":"+s[k][k2]+";"
    });
    style += "} ";

  });

  var style_el = document.createElement("style");
  style_el.innerHTML = style;
  document.body.appendChild(style_el);
}

style_injector({
  ".ff-title": {
    "position" : "absolute",
    "top" : "-255px",
    "z-index" : "999",
    "padding" : "5px",
    "font-size" : "12px",
    "line-height" : "1.5",
    "background-color" : "rgba(0,0,0,0.8)",
    "color" : "#fff",
    "border-radius" : "5px",
    "width" : "100px",
    "left" : "-7px"
  },
  ".ff-title a" : {
    "color" :"white",
    "text-decoration" : "underline",
    "font-weight" : "500",
  },
  ".ff-title a:hover" : {
    "color" :"#ff2e88",
  },
  ".ff-row" : {
    "margin-bottom" : "2px",
    "display" : "block",
    "background-color" : "#ff2e88",
    "text-align" : "right",
    "font-weight" : "300"
  },
  ".ff-row span" : {
    "position" : "absolute",
    "left" : "0px",
    "padding-left" : "7px"
  }
});






var ffQueue = [];

setInterval(function() {
  if (ffQueue.length) {
  r = ffQueue[0];
  r.send();
  ffQueue.shift();
  console.log(ffQueue);
  }
},1000);


const facebook_clickbait = function(node) {

  const images = [...node.getElementsByClassName('mbs _6m6 _2cnj _5s6c')];

  images.forEach(function(el) {
    var links = el.getElementsByTagName('a');
    for (var i = 0; i < links.length; i++) {
    var link = (links[i].innerHTML).replace("|"," ");
  }

  chrome.storage.sync.get(['ff-api-key'], function(items) {
var request = new XMLHttpRequest();
  request.onreadystatechange = function() {
      if (request.readyState === 4) {
          if (request.status === 200) {
              var data = JSON.parse(request.responseText);
              if  (data && !data.Item) {
                let html = "<ul class=\"ff-title\">No ratings yet on Feedfact.org</ul>";
                el.insertAdjacentHTML('afterend', html);
              } else {
                let html = "<ul class=\"ff-title\"><a href=\"https://feedfact.org/\">Feedfact.org</a>";

                Object.keys(data.Item.rankings).forEach(function(a) {
                  html += "<div class=\"ff-row\" style=\"width:"+(data.Item.rankings[a].avg*100)+"%\">&nbsp;<span>"+(Math.round(data.Item.rankings[a].avg * 100)) +"% "+a+"</span></div>"
                });
                el.insertAdjacentHTML('afterend', html);
              }
          }
      }
  };

  request.open("GET", "https://api.feedfact.org/feedfact?TableName=Articles&url="+link,true);
  request.setRequestHeader("x-api-key",items['ff-api-key'])
  //
  ffQueue.push(request);
    //request.send();
  });
  });

};

const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) { // ELEMENT_NODE
                facebook_clickbait(node);
            }
        });
    });
});

const config = { attributes: false, childList: true, characterData: false, subtree: true }

observer.observe(document.body, config);

facebook_clickbait(document.body);
