/*
** file: js/options.js
** description: javascript code for "html/options.html" page
*/

function init_options () {
    console.log("function: init_options");

    var api_key = localStorage['ff-api-key'];
    document.getElementById('ff-api-key').value = api_key;

    //load currently stored options configuration
    var favorite_movie = localStorage['favorite_movie'];

    //set the current state of the options form elements to match the stored options values
    //favorite_movie
    if (favorite_movie) {
        var favorite_movie_dropdown = document.getElementById('favorite-movie-dropdown');
        for (var i=0; i < favorite_movie_dropdown.children.length; i++) {
            var option = favorite_movie_dropdown.children[i];
            if (option.value == favorite_movie) {
                option.selected = 'true';
                break;
            }
        }
    }
}

function save_options () {
    console.log("function: save_options");

    var api_key = document.getElementById('ff-api-key').value
    localStorage['ff-api-key'] = api_key;
    chrome.storage.sync.set({'ff-api-key': api_key}, function() {});
}

//bind events to dom elements
document.addEventListener('DOMContentLoaded', init_options);
document.querySelector('#save-options-button').addEventListener('click', save_options);
