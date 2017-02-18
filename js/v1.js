function extractDomain(url) {
    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];

    return domain;
}


var PseudoGuid = new (function() {
    this.empty = "00000000-0000-0000-0000-000000000000";
    this.GetNew = function() {
        var fourChars = function() {
            return (((1 + Math.random()) * 0x10000)|0).toString(16).substring(1).toUpperCase();
        }
        return (fourChars() + fourChars() + "-" + fourChars() + "-" + fourChars() + "-" + fourChars() + "-" + fourChars() + fourChars() + fourChars());
    };
})();


var hmm = {};

var score = {
  attributes : {
    "misconstrued" : ".8",
    "cited" : ".3",
    "opinonated" : ".8",
    "clickbait" : ".3",
    "informative" : ".6",
  },
  "meta" : {
    "rankers" : 23456,
  }
}

function createOverLay(score) {
  var container = document.createElement("div");
  var str = "<div>"+score.rankings.cited.samples+" people think</div>";
  Object.keys(score.rankings).forEach(function(a) {
     str += "<div style=\"text-align:right\">"+a+":"+(Math.round(score.rankings[a].avg * 100) / 100) +"</div>"
  });
  container.innerHTML = str;
  container.setAttribute("style","position:absolute;z-index:1;background-color:rgba(255,255,255,.6)");
  return container;
}

var doStuff = function() {



  document.querySelectorAll(".userContentWrapper a")
    .forEach(function(a) {
      var h = a.getAttribute("href");
      if (h && !extractDomain(h).match("facebook") && h != "#" && h[0] != "/") {
        var url = h.split("://")[1];


        if (!a.getAttribute("id")) {
          a.setAttribute("id", PseudoGuid.GetNew());
          chrome.storage.sync.get(['ff-api-key'], function(items) {
            $.ajax({
                url : "https://api.feedfact.org/feedfact?TableName=Articles&url="+url,
                type : "GET",
                dataType: "json",
                headers : { "x-api-key" : items['ff-api-key'],"Content-Type" :"application/json"}
            }).done(function(data) {
              console.log(data);
              if (data.Item){
                var testnode = createOverLay(data.Item);
                var p = a.parentNode
                 .parentNode
                 .parentNode
                 .parentNode
                 .parentNode
                 .parentNode
                 .parentNode
                 .parentNode;

                if (!p.getAttribute("id")) {
                  p.setAttribute("id", PseudoGuid.GetNew());
                  p.insertBefore(testnode,p.childNodes[0]);

                  hmm[a.getAttribute("id")] = {
                    "el" : a,
                    "url" : h,
                    "node" : testnode
                  }
                }
              }

            });
          });

        }
      }
    });


}
setInterval(doStuff,1000);
