(function (){
// 	chrome.tabs.query({currentWindow: true, active: true}, function (tab) {
//       chrome.tabs.update(tab.id, {url: 'https://vk.com/audios1098393?act=later&w=wall-43308987_424649'});
// });

chrome.tabs.query({active: true, currentWindow: true}, function(tab) {
		    // chrome.tabs.executeScript(tab.id, {code:"$('#head_music').click(); alert('t1est');"});
		});

})()