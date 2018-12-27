var gallery = ""; //the gallery data of the page
var favCheckPos;

if(document.getElementById("info-block")){
	//creates the element in html to access the variable data from the page
	let a = document.createElement('script');	
	a.setAttribute('type', 'text/javascript');
	a.setAttribute('src', chrome.extension.getURL('dataAccess.js'));
	a.setAttribute('id', 'data');
	a.setAttribute('data', '');
	a.setAttribute('style', "visibility:hidden");
	document.body.appendChild(a);
	
	a = document.getElementById("data").getAttribute("data");
	function initialize(){
		if(document.getElementById("data").getAttribute("data") !== ""){
			//sets the internal variable to the transfered data
			gallery = JSON.parse(document.getElementById("data").getAttribute("data"));
			//adds to browsing history
			chrome.storage.local.get(["etnState", "browsingHistory"], function(data){
				if(data.etnState == "idle"){
					let a = data.browsingHistory.findIndex(x => x[0] == gallery.id);
					if(a == -1){
						data.browsingHistory.push([gallery.id, gallery.media_id, gallery.title.english]);	
					}else{
						data.browsingHistory.splice(data.browsingHistory.length-1, 0, data.browsingHistory.splice(a,1)[0]);
					}
					if(data.browsingHistory.length > 600) data.browsingHistory.shift();
					chrome.storage.local.set({browsingHistory: data.browsingHistory});
				}
			})
			//actions to take when the favorite button is clicked
			document.getElementById("favorite").children[1].addEventListener("DOMSubtreeModified", function(){
				if(this.innerHTML == "Unfavorite"){
					chrome.storage.local.get(["savedAW", "newlyRemovedAW", "etnState"], function(data){
						if(data.etnState == "idle"){
							console.log("favorited");
							if(!data.savedAW.some(x => x[0] == gallery.id)) saveArtwork();
							a = data.newlyRemovedAW.findIndex(x => x[0] == gallery.id);
							if(a !== -1){
								data.newlyRemovedAW.splice(a,1);
								chrome.storage.local.set({newlyRemovedAW: data.newlyRemovedAW});
							}
						}
					});
				}else{
					chrome.storage.local.get(["savedAW", "newlyRemovedAW", "etnState"], function(data){
						if(data.etnState == "idle"){
							console.log("unfavorited");
							let a = data.savedAW.findIndex(x => x[0] == gallery.id);
							if(a !== -1) data.savedAW.splice(a,1);
							a = data.newlyRemovedAW.findIndex(x => x[0] == gallery.id);
							if(a == -1){
								let tempArr = [];
								tempArr.push(gallery.id, gallery.media_id, gallery.title.english, gallery.title.japanese, gallery.upload_date, gallery.num_pages, parseInt(document.getElementById("favorite").children[2].children[0].innerHTML), -1);
								gallery.tags.forEach(x => tempArr.push(x.id));
								data.newlyRemovedAW.push(tempArr);
							}else{
								data.newlyRemovedAW.splice(data.newlyRemovedAW.length-1, 0, data.newlyRemovedAW.splice(a,1)[0])
							}
							if(data.newlyRemovedAW.length > 600) data.newlyRemovedAW.shift();
							chrome.storage.local.set({savedAW: data.savedAW, newlyRemovedAW: data.newlyRemovedAW});
						}
					});
				}
			})
			
			chrome.runtime.sendMessage({tabLoaded: ""});
			console.log("content.js loaded");
		}else{
			setTimeout(function(){ initialize() }, 2);
		}
	}
	initialize();
}else{
	if(window.location.href.includes("https://nhentai.net/favorites/")) favCheckPos = document.getElementsByClassName("gallery-favorite").length-1;
	chrome.runtime.sendMessage({tabLoaded: ""});
	console.log("content.js loaded");
}

function saveArtwork(insertPos){
	if(document.querySelector("h1").innerHTML !== "503 Service Temporarily Unavailable"){
		if(document.querySelectorAll("a[href='/favorites/']").length == 1){
			chrome.storage.local.get(["savedAW", "tagIndex"], function(data){
				let tempArr = [];
				tempArr.push(gallery.id, gallery.media_id, gallery.title.english, gallery.title.japanese, gallery.upload_date, gallery.num_pages, parseInt(document.getElementById("favorite").children[2].children[0].innerHTML));
				if(insertPos !== undefined){
					tempArr.push(insertPos);
				}else{
					tempArr.push(data.savedAW.length);
				}
				gallery.tags.forEach(function(item){
					tempArr.push(item.id);
				})
				let tagIndexPos;
				gallery.tags.forEach(function(item){
					tagIndexPos = data.tagIndex.findIndex(x => x[0] == item.id);
					if( tagIndexPos == -1 ){
						data.tagIndex.push([item.id, item.type, item.name, item.count]);
					}else{
						data.tagIndex[tagIndexPos][3] = item.count;
					}
				})
				if(insertPos !== undefined){
					data.savedAW.splice(insertPos, 0, tempArr);
				}else{
					data.savedAW.push(tempArr);
				}
				chrome.storage.local.set({savedAW: data.savedAW, tagIndex: data.tagIndex});
			});
		}else{
			alert("please sign in first!");
			chrome.storage.get("etnState", function(data){
				if(data.etnState == "saveAllFav") chrome.storage.local.set({etnState: "idle"});
			})
		}
		return "done";
	}else{
		document.querySelector("h1").innerHTML = "please wait until the process can resume...";
		return "error";
	}
}

function saveTag(tag){
	if(gallery !== ""){
		let a = gallery.tags.findIndex(x => x.name.replace(new RegExp(" ", 'g'), "-") == tag.replace(new RegExp(" ", 'g'), "-"));
		if(a == -1){
			return "error";
		}else{
			a = gallery.tags[a];
			chrome.storage.local.get(["tagIndex", "followingTags"], function(data){
				if(!data.tagIndex.some(x => x[0] == a.id)){
					data.tagIndex.push([a.id, a.type, a.name, a.count]);
					chrome.storage.local.set({tagIndex : data.tagIndex});
				}
				if(!data.followingTags.includes(a.id)){
					data.followingTags.unshift(a.id);
					chrome.storage.local.set({followingTags: data.followingTags});
				}
			})
		}
	}else{
		return "error";
	}
}

if(!window.location.href.includes("https://nhentai.net/g")){
	document.addEventListener("keydown", function(e){
		e = e || window.event;
		if(e.keyCode == 37){
			document.getElementsByClassName("previous")[0].click();
		}
		if(e.keyCode == 39){
			document.getElementsByClassName("next")[0].click();
		}
	});
};

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse){
	if(msg.checkLogIn == ""){
		if(document.querySelectorAll("a[href='/favorites/']").length == 1){
			sendResponse({check: true});
		}else{
			sendResponse({check: false});
		}
	}
	
	if(msg.alertUser !== undefined) alert(msg.alertUser);
	
	if(msg.saveTag !== undefined) sendResponse({tagName: saveTag(msg.saveTag)});
	
	if(msg.saveArtworkPopup == ""){
		chrome.storage.local.get("savedAW", function(data){
			if(!data.savedAW.some(x => x[0] == gallery.id)) sendResponse({msg: saveArtwork()});
		})
	}
	
	if(msg.getTitlePretty == "") sendResponse({title: gallery.title.pretty});
	
	if(msg.saveAllFav == ""){
		if(document.querySelector("h1").innerHTML !== "503 Service Temporarily Unavailable"){
			if(favCheckPos < 0){
				sendResponse({data: "done"});
			}else{
				sendResponse({data: document.getElementsByClassName("gallery-favorite")[favCheckPos].getAttribute("data-id")})
				favCheckPos--;
			}
		}else{
			document.querySelector("h1").innerHTML = "please wait until the process can resume...";
			sendResponse({data: "error"});
		}
	}
	
	if(msg.checkNew == ""){
		if(!document.querySelector("h1")){
			let tempArr = [];
			let elmnt = document.getElementsByClassName("gallery");
			for(let i=0; i<elmnt.length; i++){
				tempArr.push(elmnt[i].getAttribute("data-tags").split(" "));
				tempArr[tempArr.length-1].unshift(elmnt[i].children[0].children[2].innerHTML)
				tempArr[tempArr.length-1].unshift(elmnt[i].children[0].children[0].getAttribute("data-src").split("/")[4])
				tempArr[tempArr.length-1].unshift(elmnt[i].children[0].href.split("/")[4]);
			}
			sendResponse({list: tempArr})
		}else{
			document.querySelector("h1").innerHTML = "please wait until the process can resume...";
			sendResponse({list: "error"});
		}
	}
	
	if(msg.saveArtwork !== undefined) sendResponse({msg: saveArtwork(msg.saveArtwork)});
	
	if(msg.getPageNum == "") sendResponse({page: Math.ceil(document.getElementsByClassName("count")[0].innerHTML.replace(/\D/g, "")/25)});
});