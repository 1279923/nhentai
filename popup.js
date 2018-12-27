var activeTabId; //the current tab that the user is on

chrome.storage.local.get("language", function(data){ document.getElementById("language").value = data.language });

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	activeTabId = tabs[0].id;
	
	buttons("checkNew");
	buttons("search");
	
	console.log("popup loaded");
});

document.getElementById("language").addEventListener("change", function(){ chrome.storage.local.set({language: this.value}) });

function buttons(id){
	let elmnt = document.getElementById(id);
	
	elmnt.addEventListener("dblclick", function(){
		if(id == "checkNew"){
			chrome.storage.local.get("etnState", function(data){
				if(data.etnState == "idle"){
					chrome.runtime.sendMessage({checkNew: "new"});
					window.close();
				}else{
					chrome.tabs.sendMessage(activeTabId, {alertUser: "Another process is taking place at the moment. Please wait until the process is complete, then try again!"});
				}
			})
		}
	});
	
	elmnt.addEventListener("click", function(){
		if(id == "checkNew"){
			elmnt.innerHTML = "click twice!";
			setTimeout(function(){ elmnt.innerHTML = "check new artworks" },800);
		}else{
			chrome.runtime.sendMessage({search: ""});
		}
	});
}