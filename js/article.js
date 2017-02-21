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


//simple way to determine if webpage is an article or not
var metas = document.getElementsByTagName("meta");
got_article = false;
for (var i=0; i<metas.length; i++) {

    if (metas[i].getAttribute("content") == "article") {
      got_article = true;
    }
}
if (window.location.hostname.match("facebook.com")) { got_article = false }

//used this is used to identify an article
//mainly done by title and not urls because
//url shorteners screw up being able to identify articles on feeds
var getTitle = function() {
  var ogtitle, twittertitle;
  var metas = document.getElementsByTagName("meta")

  for (var m in metas) {
      if (metas[m].getAttribute) {
        var m_prop = metas[m].getAttribute("property");
            m_val  = metas[m].getAttribute("content");
        if (m_prop == "og:title") {
          ogtitle = m_val;
        }
        else if (m_prop == "twitter:title") {
          twittertitle = m_val;
        }
      }
  }

  if (ogtitle) { return ogtitle }
  else if (twittertitle) { return twittertitle }
  else { return document.title }
}

var rating = false;
var rate = function() {
  if (!rating) {
    rating = true;
    var base = {"TableName" : "Rankings",
        "Item" : {
            "title" : decodeURIComponent(getTitle()).replace("|"," "),
            "url" : document.location.href,
            "ranking" : {
                "misconstrued" : {
                    "value": document.querySelector("#ff_misconstrued").value/100
                },
                "clickbait" : {
                    "value" :document.querySelector("#ff_clickbait").value/100

                },
                "opinionated" : {
                    "value" : document.querySelector("#ff_opinionated").value/100

                },
                "cited" : {
                    "value" : document.querySelector("#ff_cited").value/100

                },
                "informative" : {
                    "value" : document.querySelector("#ff_informative").value/100
                }
            }
        }
    };


    chrome.storage.sync.get(['ff-api-key'], function(items) {
      $.ajax({
          url : "https://api.feedfact.org/feedfact",
          data : JSON.stringify(base),
          type : "POST",
          dataType: "json",
          headers : { "x-api-key" : items['ff-api-key'],"Content-Type" :"application/json"}
      }).done(function(data) {
        alert("Thanks for ranking, and keep them comming!");
      });
    });
    rating=false;
  }
}



//create the rating widget
function createRater(score) {
  var container = document.createElement("div");
  container.setAttribute("id","ff_form");
  style_injector({
    "#ff_form": {
      "position":"fixed",
      "bottom":"10px",
      "right":"10px",
      "z-index":"999999",
      "background-color":"rgba(0,0,0,.9)",
      "text-align":"right",
      "color":"white",
      "font-size":"12px",
      "line-height":"1.8",
      "font-family":"\"Helvetica Neue\", Helvetica, Arial, sans-serif",
      "padding":"5px",
      "border-radius":"5px"
    },
    "#ff_form .head" : {
      "text-align":"left"
    },
    "#ff_form .head a" : {
      "color" : "white",
      "text-decoration":"underline"
    },
    "#ff_form .head a:hover" : {
      "color":"#ff2e88"
    },
  });
  var str = "<div>misconstrued :<input id=\"ff_misconstrued\"  type=\"range\" min=\"0\" max=\"100\"></div>";
  str += "<div>opinionated :<input id=\"ff_opinionated\" type=\"range\" min=\"0\" max=\"100\"></div>";
  str += "<div>clickbait :<input id=\"ff_clickbait\" type=\"range\" min=\"0\" max=\"100\"></div>";
  str += "<div>informative :<input id=\"ff_informative\" type=\"range\" min=\"0\" max=\"100\"></div>";
  str += "<div>cited :<input id=\"ff_cited\" type=\"range\" min=\"0\" max=\"100\"></div>";
  str += "<input id=\"ff_rate\" type=\"button\" value=\"rate\">";
  container.innerHTML = str;
  document.body.appendChild(container);
  document.getElementById("ff_rate").addEventListener("click", rate);
}

//lazy hack
if (got_article) {
  setTimeout(function() {
    createRater();
  },100);
}

var renderResults = function(data) {
  //var container = document.createElement("div");
  //container.setAttribute("id","ff_results");
  container = document.getElementById("ff_form")

    /*
  style_injector({
    "#ff_rate" : {
      "position":"fixed",
      "bottom":"10px",
      "left":"10px",
      "z-index":"999999",
      "background-color":"rgba(0,0,0,.9)",
      "text-align":"right",
      "color":"white",
      "font-size":"12px",
      "line-height":"1.8",
      "font-family":"\"Helvetica Neue\", Helvetica, Arial, sans-serif",
      "padding":"5px",
      "border-radius":"5px"
    }
  })*/


  var str = "<div class=\"head\"><a href=\"feedfact.org\">FeedFact.org</a></div>";
  //str += "<ul>Feedfact.org ranked this "+data.Item.rankings.cited.samples+" times";

  Object.keys(data.Item.rankings).forEach(function(a) {
    str += "<div style=\"margin-bottom:2px;display:block;background-color:#ff2e88;text-align:right;width:"+(data.Item.rankings[a].avg*100)+"%\">&nbsp;<span style=\"position:absolute;left:0px;padding-left:7px;\">"+(Math.round(data.Item.rankings[a].avg * 100)) +"% "+a+"</span></div>"
  });


  container.innerHTML = str + container.innerHTML;

  document.getElementById("ff_rate").addEventListener("click", rate);
}


chrome.storage.sync.get(['ff-api-key'], function(items) {
  var request = new XMLHttpRequest();
  request.onreadystatechange = function() {
      if (request.readyState === 4) {
          if (request.status === 200) {
              var data = JSON.parse(request.responseText);
              console.log(data);
              if (data && data.Item) {
                renderResults(data);
              }
          }
      }
  };

  request.open("GET", "https://api.feedfact.org/feedfact?TableName=Articles&title="+decodeURIComponent(getTitle()).replace("|"," "),true);
  request.setRequestHeader("x-api-key",items['ff-api-key'])
  request.send();
});
