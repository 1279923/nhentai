window.onload = function(){

var exportObj = {};

var getArr

var currentType;
var currentSort;
var sortOrder = true;

var tagIndex;
var savedAW;
var browsingHistory;
var followingTags;
var newlyUnfollowedTags;
var newlyRemovedAW;
var newAW;

var a,b,c;

function onChange(event) {
	var reader = new FileReader();
	reader.onload = onReaderLoad;
	reader.readAsText(event.target.files[0]);
}

function onReaderLoad(event){
	console.log(event.target.result);
	var obj = JSON.parse(event.target.result);
	//console.log(obj.savedAW)
	//console.log(obj.browsingHistory)
}

//document.getElementById("input").addEventListener('change', onChange);
setTitle("[Nhentai Manager]", "none");
setSubTitle("Please navigate using the buttons above");
document.querySelectorAll("h1")[2].innerHTML = "";

function setTitle(string, number){
	if(number !== "none"){
		document.querySelectorAll("h1")[0].innerHTML = String(string) + " (" + number.toLocaleString() + ")";
	}else{
		document.querySelectorAll("h1")[0].innerHTML = String(string);
	}
};

function setSubTitle(string){ document.querySelectorAll("h1")[1].innerHTML = String(string) };

function initialize(data, arr){
	window.scrollTo(0, 240);
	var elmnt = document.getElementById("favcontainer");
	while (elmnt.lastChild) elmnt.removeChild(elmnt.lastChild);
	var elmnt = document.getElementsByClassName("pagination")[0];
	while (elmnt.lastChild) elmnt.removeChild(elmnt.lastChild);
	if(arr.includes("tagIndex")) tagIndex = data.tagIndex;
	if(arr.includes("savedAW")) savedAW = data.savedAW;
	if(arr.includes("browsingHistory")) browsingHistory = data.browsingHistory;
	if(arr.includes("followingTags")) followingTags = data.followingTags;
	if(arr.includes("newlyUnfollowedTags")) newlyUnfollowedTags = data.newlyUnfollowedTags;
	if(arr.includes("newlyRemovedAW")) newlyRemovedAW = data.newlyRemovedAW;
	if(arr.includes("newAW")) newAW = data.newAW;
}

var listLength;
var navNumLen;
var itemPerPage;

function createNavNum(startPos){
	if(currentType == "savedAW") listLength = savedAW.length;
	if(currentType == "browsingHistory") listLength = browsingHistory.length;
	if(currentType == "followingTags") listLength = followingTags.length;
	if(currentType == "allTags") listLength = tagIndex.length;
	if(currentType == "newlyUnfollowedTags") listLength = newlyUnfollowedTags.length;
	if(currentType == "newlyRemovedAW") listLength = newlyRemovedAW.length;
	if(currentType == "newAW") listLength = newAW.length;
	
	document.querySelectorAll("h1")[2].innerHTML = "Page " + ((startPos/itemPerPage)+1).toLocaleString();
	
	if(startPos !== 0){
		a = document.createElement("a");
		a.setAttribute("class", "first");
		
		b = document.createElement("i");
		b.setAttribute("class", "fa fa-chevron-left");
		a.appendChild(b);
		b = document.createElement("i");
		b.setAttribute("class", "fa fa-chevron-left");
		
		a.addEventListener("click", function(){
			fillContainer(currentType, currentSort, 0);
		})
		
		a.appendChild(b);
		
		document.getElementsByClassName("pagination")[0].appendChild(a);
	}
	if(startPos>itemPerPage*6){
		navNumLen = (startPos/itemPerPage)-6;
	}else{
		navNumLen = 0;
	}
	while(navNumLen<Math.ceil(listLength/itemPerPage) && navNumLen<(startPos/itemPerPage)+6){
		a = document.createElement("a");
		if(navNumLen*itemPerPage == startPos){
			a.setAttribute("class", "page current");
		}else{
			a.setAttribute("class", "page");
		}
		a.innerHTML = Math.floor(navNumLen+1);
		
		a.addEventListener("click", function(){
			fillContainer(currentType, currentSort, (this.innerHTML-1)*itemPerPage);
		})
		
		document.getElementsByClassName("pagination")[0].appendChild(a);
		navNumLen++
	}
	if(listLength-startPos > itemPerPage){
		a = document.createElement("a");
		a.setAttribute("class", "last");
		
		b = document.createElement("i");
		b.setAttribute("class", "fa fa-chevron-right");
		a.appendChild(b);
		b = document.createElement("i");
		b.setAttribute("class", "fa fa-chevron-right");
		
		a.addEventListener("click", function(){
			fillContainer(currentType, currentSort, ((Math.floor(listLength/itemPerPage))*itemPerPage));
		})
		
		a.appendChild(b);
		
		document.getElementsByClassName("pagination")[0].appendChild(a);
	}
}

function addBlock(mainType, subType, num){
	
	a = document.createElement("div");
	a.setAttribute("class", "gallery-favorite");
	document.getElementsByClassName("container")[0].appendChild(a);
	
	b = document.createElement("button");
	b.setAttribute("class", "btn btn-primary btn-thin remove-button");
	b.setAttribute("type", "button");
	a.appendChild(b);
	
	if(mainType == "artwork"){		//-----ARTWORK-----//
		
		c = document.createElement("i");
		if(subType == "deleted"){
			c.setAttribute("class", "fa fa-chevron-right");
			c.setAttribute("data-id", newlyRemovedAW[num][0]);
			b.appendChild(c);
	
			c = document.createElement("span");
			c.setAttribute("class", "text");
			c.innerHTML = "Restore";
			b.appendChild(c);
			
			b.addEventListener("click", function(){
				let index = newlyRemovedAW.findIndex(x => x[0] == parseInt(this.children[0].getAttribute("data-id")));
				let x = savedAW.findIndex(x => x[0] == newlyRemovedAW[index][0]);
				if(x == -1){
					newlyRemovedAW[index].splice(7, 1, savedAW.length);
					savedAW.push(newlyRemovedAW[index]);
				}else{
					savedAW.splice(savedAW.length-1, 0, savedAW.splice(x,1)[0]);
				}
				newlyRemovedAW.splice(index,1);
				chrome.storage.local.set({savedAW: savedAW, newlyRemovedAW: newlyRemovedAW})
				this.parentElement.outerHTML = "";
			})
		}else if(subType == "new"){
			c.setAttribute("class", "fa fa-minus");
			c.setAttribute("data-id", newAW[num][0]);
			b.appendChild(c);
		
			c = document.createElement("span");
			c.setAttribute("class", "text");
			c.innerHTML = "Remove";
			b.appendChild(c);
			
			b.addEventListener("click", function(){
				newAW.splice(newAW.length-1, 0, newAW.splice(newAW.findIndex(x => x[0] == parseInt(this.children[0].getAttribute("data-id"))),1)[0]);
				chrome.storage.local.set({newAW: newAW});
				this.parentElement.outerHTML = "";
			})
		}else if(subType == "all"){
			c.setAttribute("class", "fa fa-minus");
			c.setAttribute("data-id", savedAW[num][0]);
			b.appendChild(c);
		
			c = document.createElement("span");
			c.setAttribute("class", "text");
			c.innerHTML = "Remove";
			b.appendChild(c);
			
			b.addEventListener("click", function(){
				let index = savedAW.findIndex(x => x[0] == parseInt(this.children[0].getAttribute("data-id")));
				let x = newlyRemovedAW.findIndex(x => x[0] == savedAW[index][0]);
				if(x == -1){
					newlyRemovedAW.push(savedAW[index]);
				}else{
					newlyRemovedAW.splice(newlyRemovedAW.length-1, 0, newlyRemovedAW.splice(x,1)[0]);
				}
				savedAW.splice(index,1);
				if(newlyRemovedAW.length > 600) newlyRemovedAW.shift();
				chrome.storage.local.set({savedAW: savedAW, newlyRemovedAW: newlyRemovedAW});
				this.parentElement.outerHTML = "";
			})
		}else if(subType == "history"){
			c = document.createElement("i");
			c.setAttribute("class", "fa fa-minus");
			c.setAttribute("data-id", browsingHistory[num][0]);
			b.appendChild(c);

			c = document.createElement("span");
			c.setAttribute("class", "text");
			c.innerHTML = "Remove";
			b.appendChild(c);
		
			b.addEventListener("click", function(){
				browsingHistory.splice(browsingHistory.findIndex(x => x[0] == this.children[0].getAttribute("data-id")),1);
				chrome.storage.local.set({browsingHistory: browsingHistory});
				this.parentElement.outerHTML = "";
			})
		}
	
		b = document.createElement("div");
		b.setAttribute("class", "gallery");
		a.appendChild(b);
		
		a = document.createElement("a")
		if(subType == "deleted"){
			a.setAttribute("href", "https://nhentai.net/g/" + String(newlyRemovedAW[num][0]));
		}else if(subType == "new"){
			a.setAttribute("href", "https://nhentai.net/g/" + String(newAW[num][0]));
		}else if(subType == "all"){
			a.setAttribute("href", "https://nhentai.net/g/" + String(savedAW[num][0]));
		}else if(subType == "history"){
			a.setAttribute("href", "https://nhentai.net/g/" + String(browsingHistory[num][0]));
		}
		a.setAttribute("target", "_blank");
		a.setAttribute("class", "cover");
		a.setAttribute("style", "padding:0 0 142.0% 0");
		b.appendChild(a);
	
		b = document.createElement("img");
		if(subType == "deleted"){
			b.setAttribute("src", "https://t.nhentai.net/galleries/" + String(newlyRemovedAW[num][1]) + "/thumb.jpg");
		}else if(subType == "new"){
			b.setAttribute("src", "https://t.nhentai.net/galleries/" + String(newAW[num][1]) + "/thumb.jpg");
		}else if(subType == "all"){
			b.setAttribute("src", "https://t.nhentai.net/galleries/" + String(savedAW[num][1]) + "/thumb.jpg");
		}else if(subType == "history"){
			b.setAttribute("src", "https://t.nhentai.net/galleries/" + String(browsingHistory[num][1]) + "/thumb.jpg");
		}
		b.setAttribute("style", "z-index: 0; width: 230px; height: 318px; object-fit: contain");
		b.setAttribute("is", "lazy-load-image");
		b.addEventListener("error", function(){this.src = "images/error.png"});
		a.appendChild(b);

		b = document.createElement("div");
		if(subType == "deleted"){
			b.innerHTML = newlyRemovedAW[num][2];
		}else if(subType == "new"){
			b.innerHTML = newAW[num][2];
		}else if(subType == "all"){
			b.innerHTML = savedAW[num][2];
		}else if(subType == "history"){
			b.innerHTML = browsingHistory[num][2];
		}
		b.setAttribute("class", "caption")
		a.appendChild(b);
	}else if(mainType == "tag"){		//-----TAG-----//
		
		c = document.createElement("i");
		if(subType ==("deleted")){
			c.setAttribute("class", "fa fa-chevron-right");
			c.setAttribute("data-id", newlyUnfollowedTags[num]);
			b.appendChild(c);
		
			c = document.createElement("span");
			c.setAttribute("class", "text");
			c.innerHTML = "Follow";
			b.appendChild(c);
			
			b.addEventListener("click", function(){
				let id = parseInt(this.children[0].getAttribute("data-id"));
				newlyUnfollowedTags.splice(newlyUnfollowedTags.indexOf(id),1);
				followingTags.unshift(id);
				chrome.storage.local.set({followingTags: followingTags, newlyUnfollowedTags: newlyUnfollowedTags})
				this.parentElement.outerHTML = "";
			})
		}else if(subType == "following"){
			c.setAttribute("class", "fa fa-minus");
			c.setAttribute("data-id", followingTags[num]);
			b.appendChild(c);
	
			c = document.createElement("span");
			c.setAttribute("class", "text");
			c.innerHTML = "Unfollow";
			b.appendChild(c);
			
			b.addEventListener("click", function(){
				let id = parseInt(this.children[0].getAttribute("data-id"));
				followingTags.splice(followingTags.indexOf(id),1);
				newlyUnfollowedTags.unshift(id);
				if(newlyUnfollowedTags.length > 600) newlyUnfollowedTags.pop();
				chrome.storage.local.set({followingTags: followingTags, newlyUnfollowedTags: newlyUnfollowedTags})
				this.parentElement.outerHTML = "";
			})
		}else if(subType == "all"){
			c.setAttribute("class", "fa fa-chevron-right");
			c.setAttribute("data-id", tagIndex[num][0]);
			b.appendChild(c);
	
			c = document.createElement("span");
			c.setAttribute("class", "text");
			c.innerHTML = "Follow";
			b.appendChild(c);
			
			b.addEventListener("click", function(){
				let id = parseInt(this.children[0].getAttribute("data-id"));
				if(!followingTags.includes(id)){
					followingTags.unshift(id);
					chrome.storage.local.set({followingTags: followingTags})
				}
			})
		}
	
		b = document.createElement("div");
		b.setAttribute("class", "gallery");
		a.appendChild(b);
		
		a = document.createElement("a")
		if(subType == "deleted"){
			a.setAttribute("href", "https://nhentai.net/" + (tagIndex[tagIndex.findIndex(x => x[0] == newlyUnfollowedTags[num])][1] + "/" + tagIndex[tagIndex.findIndex(x => x[0] == newlyUnfollowedTags[num])][2]).replace(new RegExp(" ", 'g'), "-"));
		}else if(subType == "following"){
			a.setAttribute("href", "https://nhentai.net/" + (tagIndex[tagIndex.findIndex(x => x[0] == followingTags[num])][1] + "/" + tagIndex[tagIndex.findIndex(x => x[0] == followingTags[num])][2]).replace(new RegExp(" ", 'g'), "-"));
		}else if(subType == "all"){
			a.setAttribute("href", "https://nhentai.net/" + (tagIndex[num][1] + "/" + tagIndex[num][2]).replace(new RegExp(" ", 'g'), "-"));
		}
		a.setAttribute("target", "_blank");
		a.setAttribute("class", "cover");
		a.setAttribute("style", "padding:0 0 142.0% 0");
		b.appendChild(a);
	
		b = document.createElement("img");
		
			a.setAttribute("src", "images/tag.png");

		if(subType == "deleted"){
			let x = savedAW[savedAW.findIndex(x => x.includes(tagIndex[tagIndex.findIndex(x => x[0] == newlyUnfollowedTags[num])][0]))];
			if(x !== undefined){
				b.setAttribute("src", "https://t.nhentai.net/galleries/" + String(x[1]) + "/thumb.jpg");
			}else{
				b.setAttribute("src", "images/tag.png");
			}
		}else if(subType == "following"){
			x = savedAW[savedAW.findIndex(x => x.includes(tagIndex[tagIndex.findIndex(x => x[0] == followingTags[num])][0]))];
			if(x !== undefined){
				b.setAttribute("src", "https://t.nhentai.net/galleries/" + String(x[1]) + "/thumb.jpg");
			}else{
				b.setAttribute("src", "images/tag.png");
			}
		}else if(subType == "all"){
			x = savedAW[savedAW.findIndex(x => x.includes(tagIndex[num][0]))];
			if(x !== undefined){
				b.setAttribute("src", "https://t.nhentai.net/galleries/" + String(x[1]) + "/thumb.jpg");
			}else{
				b.setAttribute("src", "images/tag.png");
			}
		}
		b.setAttribute("style", "z-index: 0; width: 230px; height: 318px; object-fit: contain");
		b.setAttribute("is", "lazy-load-image");
		b.addEventListener("error", function(){this.src = "images/error.png"});
		a.appendChild(b);

		b = document.createElement("div");
		if(subType == "deleted"){
			b.innerHTML = String(tagIndex[tagIndex.findIndex(x => x[0] == newlyUnfollowedTags[num])][2]);
		}else if(subType == "following"){
			b.innerHTML = String(tagIndex[tagIndex.findIndex(x => x[0] == followingTags[num])][2]);
		}else if(subType == "all"){
			b.innerHTML = String(tagIndex[num][2]);
		}
		b.setAttribute("style", "font-size: 20px; word-break: break-word; bottom: 0px; z-index: 1; position: absolute; background-color: #1F1F1F; border-style: solid; border-color: #444444; text-align: center; width: 225px");
		a.appendChild(b);
	}
}

function countTagNum(){
	tagIndex = tagIndex.map(function(item){
		item.push(0);
		return item;
	})
	savedAW.forEach(function(item){
		let a;
		for(let i = 8; i<item.length; i++){ tagIndex[tagIndex.findIndex(x => x[0] == item[i])][4]++ };
	})
}

function fillContainer(type, sort, startPos){
	chrome.storage.local.get("itemPerPage", function(data){ itemPerPage = data.itemPerPage });
	currentSort = sort;
	currentType = type;
	if(type == "savedAW"){
		getArr = ["savedAW", "newlyRemovedAW", "tagIndex"];
		chrome.storage.local.get(getArr, function(data){
			initialize(data, getArr);
			setTitle("Saved Artworks", savedAW.length);
			
			if(sort == "Added"){
				if(sortOrder){
					savedAW.sort((a,b) => b[7]-a[7]);
					setSubTitle("Sorting by time added : newest to oldest");
				}else{
					savedAW.sort((a,b) => a[7]-b[7]);
					setSubTitle("Sorting by time added : oldest to newest");
				}
			}else if(sort == "Uploaded"){
				if(sortOrder){
					savedAW.sort((a,b) => b[4]-a[4]);
					setSubTitle("Sorting by time uploaded : newest to oldest");
				}else{
					savedAW.sort((a,b) => a[4]-b[4]);
					setSubTitle("Sorting by time uploaded : oldest to newest");
				}
			}else if(sort == "Recommended"){
				countTagNum();
				tagIndex = tagIndex.map(function(x){		
					if(x[3]>8){
						x[1] = (Math.round((x[4]/x[3])*Math.cbrt(x[3])*10000))/itemPerPage;
						return x;
					}else{
						x[1] = 0;
						return x;
					}
				});
				let rating;
				savedAW = savedAW.map(function(item){
					rating = 0;
					for(let i=8; i<item.length; i++){
						rating += tagIndex[tagIndex.findIndex(x => x[0] == item[i])][1];
					}
					rating = rating/Math.sqrt(item.length);
					item.push(Math.round(rating*itemPerPage)/itemPerPage);
					return item;
				})
				if(sortOrder){
					savedAW.sort((a,b) => b[b.length-1]-a[a.length-1]);
					setSubTitle("Recommendation made from your data : highest rated to lowest");
				}else{
					savedAW.sort((a,b) => a[a.length-1]-b[b.length-1]);
					setSubTitle("Recommendation made from your data : lowest to highest");
				}
				savedAW = savedAW.map(function(item){
					item.pop();
					return item;
				})
			}else if(sort == "Fav Amount"){
				if(sortOrder){
					savedAW.sort((a,b) => b[6]-a[6]);
					setSubTitle("Sorted by amounts of favorites : highest to lowest");
				}else{
					savedAW.sort((a,b) => a[6]-b[6]);
					setSubTitle("Sorted by amounts of favorites : lowest to highest");
				}
			}else if(sort == "Page Num"){
				if(sortOrder){
					savedAW.sort((a,b) => b[5]-a[5]);
					setSubTitle("Sorted by number of pages : highest to lowest");
				}else{
					savedAW.sort((a,b) => a[5]-b[5]);
					setSubTitle("Sorted by number of pages : lowest to highest");
				}
			}else if(sort == "Random"){
				setSubTitle("Sorted randomly; reselect random from the drop down again to reshuffle");
			}
			
			createNavNum(startPos);
			for(let i=startPos; i<startPos+itemPerPage && i<savedAW.length; i++){
				addBlock("artwork", "all", i);
			}
		});
	}
	if(type == "newAW"){
		getArr = ["savedAW", "newAW"];
		chrome.storage.local.get(getArr, function(data){
			initialize(data, getArr);
			setTitle("New artwork which includes following tags", newAW.length);
			setSubTitle("[Nhentai Manager]");
			
			createNavNum(startPos);
			for(let i=startPos; i<startPos+itemPerPage && i<newAW.length; i++){
				addBlock("artwork", "new", i);
			}
		});
	}
	if(type == "followingTags"){
		getArr = ["tagIndex", "savedAW", "followingTags", "newlyUnfollowedTags"];
		chrome.storage.local.get(getArr, function(data){
			initialize(data, getArr);
			setTitle("Following Tags", followingTags.length);
			
			if(sort == "Alphabetical"){
				followingTags = followingTags.map(x => [x, tagIndex[tagIndex.findIndex(y => y[0] == x)][2]]);
				if(sortOrder){
					followingTags.sort(function(a, b){
						var nameA = a[1].toLowerCase(), nameB = b[1].toLowerCase();
						if(nameA < nameB) return -1;
						if(nameA > nameB) return 1;
						return 0;
					})
					setSubTitle("Sorted in alphabetical order");
				}else{
					followingTags.sort(function(a, b){
						var nameA = a[1].toLowerCase(), nameB = b[1].toLowerCase();
						if(nameA < nameB) return 1;
						if(nameA > nameB) return -1;
						return 0;
					})
					setSubTitle("Sorted in reverse alphabetical order");
				}
				followingTags = followingTags.map(x => x[0]);
			}else if(sort == "Frequency"){
				countTagNum();
				followingTags = followingTags.map(x => [x, tagIndex[tagIndex.findIndex(y => y[0] == x)][4]]);
				if(sortOrder){
					followingTags.sort((a,b) => b[1]-a[1]);
					setSubTitle("Sorted by frequency : most to least");
				}else{
					followingTags.sort((a,b) => a[1]-b[1]);
					setSubTitle("Sorted by frequency : least to most");
				}
				followingTags = followingTags.map(x => x[0]);
			}else if(sort == "Added"){
				if(sortOrder){
					setSubTitle("Sorted by time added : newest to oldest");
				}else{
					followingTags.reverse();
					setSubTitle("Sorted by time added : oldest to newest");
				}
			}
			
			createNavNum(startPos);
			for(let i=startPos; i<followingTags.length && i<startPos+itemPerPage; i++){
				addBlock("tag", "following", i);
			}
		});
	}
	if(type == "allTags"){
		getArr = ["tagIndex", "savedAW"];
		chrome.storage.local.get(getArr, function(data){
			initialize(data, getArr);
			setTitle("All Tags", tagIndex.length);
			
			if(sort == "Alphabetical"){
				if(sortOrder){
					tagIndex.sort(function(a, b){
						var nameA = a[2].toLowerCase(), nameB = b[2].toLowerCase();
						if(nameA < nameB) return -1;
						if(nameA > nameB) return 1;
						return 0;
					})
					setSubTitle("Sorted in alphabetical order");
				}else{
					tagIndex.sort(function(a, b){
						var nameA = a[2].toLowerCase(), nameB = b[2].toLowerCase();
						if(nameA < nameB) return 1;
						if(nameA > nameB) return -1;
						return 0;
					})
					setSubTitle("Sorted in reverse alphabetical order");
				}
			}else if(sort == "Recommended"){
				countTagNum();
				tagIndex = tagIndex.map(function(x){		
					if(x[3]>8){
						x[5] = (Math.round((x[4]/x[3])*Math.cbrt(x[3])*10000))/itemPerPage;
						return x;
					}else{
						x[5] = 0;
						return x;
					}
				});
				if(sortOrder){
					tagIndex.sort((a,b) => b[5]-a[5]);
					setSubTitle("Recommendation made from your data : highest rated to lowest");
				}else{
					tagIndex.sort((a,b) => a[5]-b[5]);
					setSubTitle("Recommendation made from your data : lowest rated to highest");
				}
			}else if(sort == "Frequency"){
				countTagNum();
				if(sortOrder){
					tagIndex.sort((a,b) => b[4]-a[4]);
					setSubTitle("Sorted by frequency : most to least");
				}else{
					tagIndex.sort((a,b) => a[4]-b[4]);
					setSubTitle("Sorted by frequency : least to most");
				}
			}
			
			createNavNum(startPos);
			for(let i=startPos; i<tagIndex.length && i<startPos+itemPerPage; i++){
				addBlock("tag", "all", i);
			}
		});
	}
	if(type == "browsingHistory"){
		getArr = ["browsingHistory"];
		chrome.storage.local.get(getArr, function(data){
			initialize(data, getArr);
			setTitle("Browsing History", browsingHistory.length);
			setSubTitle("[Nhentai Manager]");
			
			browsingHistory.reverse();
			createNavNum(startPos);
			for(let i=startPos; i<browsingHistory.length && i<startPos+itemPerPage; i++){
				addBlock("artwork", "history", i);
			}
		});
	}
	if(type == "newlyUnfollowedTags"){
		getArr = ["tagIndex", "savedAW", "newlyUnfollowedTags", "followingTags"];
		chrome.storage.local.get(getArr, function(data){
			initialize(data, getArr);
			setTitle("Recently Unfollowed Tags", newlyUnfollowedTags.length);
			setSubTitle("[Nhentai Manager]");
			
			createNavNum(startPos);
			for(let i=startPos; i<newlyUnfollowedTags.length && i<startPos+itemPerPage; i++){
				addBlock("tag", "deleted", i);
			}
		});
	}
	if(type == "newlyRemovedAW"){
		getArr = ["newlyRemovedAW", "savedAW"];
		chrome.storage.local.get(getArr, function(data){
			initialize(data, getArr);
			setTitle("Recently Removed Favorites", newlyRemovedAW.length);
			setSubTitle("[Nhentai Manager]");
			
			newlyRemovedAW.reverse();
			createNavNum(startPos);
			for(let i=startPos; i<newlyRemovedAW.length && i<startPos+itemPerPage; i++){
				addBlock("artwork", "deleted", i);
			}
			newlyRemovedAW.reverse();
		});
	}
	if(type == ""){
		setTitle("Empty", 0);
		var container = document.getElementById("favcontainer");
		while(container.firstChild) container.removeChild(container.lastChild);
	}
}

document.addEventListener("keydown", function(e){
    e = e || window.event;
    if(currentType !== ""){
		if(e.keyCode == 37 && document.getElementsByClassName("first").length == 1){
			fillContainer(currentType, currentSort, (document.getElementsByClassName("current")[0].innerHTML-2)*itemPerPage);
		}
		if(e.keyCode == 39 && document.getElementsByClassName("last").length == 1){
			fillContainer(currentType, currentSort, document.getElementsByClassName("current")[0].innerHTML*itemPerPage);
		}
	}
});

//handles all the actions done by the drop down buttons
document.addEventListener("click", function(e){
	e = e.target;
	const views = ["savedAW","newAW","followingTags","allTags","browsingHistory","newlyUnfollowedTags","newlyRemovedAW"];
	//const actions = ["saveAllFav","checkNew","deleteData"];
	chrome.storage.local.get("etnState", function(data){
		if(views.includes(e.className)){
			sortOrder = (e.className ==  currentType && e.innerText == currentSort) ? !sortOrder : true;
			if(e.innerText == "Random"){
				chrome.storage.local.get("savedAW", function(data){
					var currentIndex = data.savedAW.length, temporaryValue, randomIndex;	
					while(0 !== currentIndex){
						randomIndex = Math.floor(Math.random() * currentIndex);
						currentIndex -= 1;

						temporaryValue = data.savedAW[currentIndex];
						data.savedAW[currentIndex] = data.savedAW[randomIndex];
						data.savedAW[randomIndex] = temporaryValue;
					}
					chrome.storage.local.set({savedAW: data.savedAW});
				})
			}
			fillContainer(e.className, e.innerText, 0);
		}
		
		if(e.id == "saveAllFav"){
			if(data.etnState == "idle"){
				if(confirm("Do you want to save all of your favorites? This will take time depending on the amount of favorites you have, and your internet speed.")){
					chrome.runtime.sendMessage({saveAllFav: ""});
					alert("save all favorites started");
				}
			}else{
				alert("Another process is taking place at the moment. Please wait until the process is complete, then try again!");
			}
		}
		if(e.id == "checkNew"){
			if(data.etnState == "idle"){
				chrome.runtime.sendMessage({checkNew: "new"});
				alert("check new started");
			}else{
				alert("Another process is taking place at the moment. Please wait until the process is complete, then try again!");
			}
		}
		if(e.id == "checkNum"){
			if(data.etnState == "idle"){
				chrome.runtime.sendMessage({checkNew: document.getElementById("checkNumInput").value});
				alert("checking latest " + document.getElementById("checkNumInput").value + " artworks");
			}else{
				alert("Another process is taking place at the moment. Please wait until the process is complete, then try again!");
			}
		}
		if(e.className == "deleteData"){
			if(e.innerHTML == "Browsing History" && confirm("Are you sure you want to delete all of your browsing history? This action CANNOT be undone.")) chrome.storage.local.set({browsingHistory: []});
			if(e.innerHTML == "Following Tags" && confirm("Are you sure you want to unfollow all tags? This action CANNOT be undone. This action will ALSO delete your data about recently unfollowed tags.")) chrome.storage.local.set({followingTags: []});
			if(e.innerHTML == "Saved Artworks" && confirm("Are you sure you want to delete all of your artwork data? This action CANNOT be undone. This action will ASLO delete your data about recently removed artworks.")) chrome.storage.local.set({savedAW: [], newlyRemovedAW: []});
		}
		
		if(e.className == "language"){
			chrome.storage.local.set({language: e.getAttribute("data-language")})
			alert("language preference changed to " + e.innerHTML);
		}
		
		if(e.id == "test"){
			chrome.storage.local.get(["followingTags","tagIndex","savedAW"], function(data){
				followingTags = data.followingTags;
				tagIndex = data.tagIndex;
				savedAW = data.savedAW;
				setSubTitle("");
				countTagNum();
				tagIndex.sort(function(a, b){
						var nameA = a[2].toLowerCase(), nameB = b[2].toLowerCase();
						if(nameA < nameB) return -1;
						if(nameA > nameB) return 1;
						return 0;
				}).filter(x => (x[1] == "artist" || x[1] == "group") && followingTags.includes(x[0])).forEach(x => setSubTitle(document.querySelectorAll("h1")[1].innerHTML + "<br>" + x[2]));
			})
		}
		
		if(e.className == "export"){
			let dataType = (e.getAttribute("data-type") == "null") ? null : e.getAttribute("data-type");
			console.log(dataType);
			chrome.storage.local.get(dataType, function(data){
				exportObj = data;
				var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
				var downloadAnchorNode = document.createElement('a');
				downloadAnchorNode.setAttribute("href", dataStr);
				downloadAnchorNode.setAttribute("download", e.getAttribute("data-exportName") + ".json");
				document.body.appendChild(downloadAnchorNode); // required for firefox
				downloadAnchorNode.click();
				downloadAnchorNode.remove();
			})
		}
	})
})

//item per page
chrome.storage.local.get("itemPerPage", function(data){
	document.getElementById("IPP").innerHTML = data.itemPerPage
	document.getElementById("IPPinput").value = (data.itemPerPage-10)/5;
});
document.getElementById("IPPinput").addEventListener("input", function(){ document.getElementById("IPP").innerHTML = this.value*5+10 });
document.getElementById("IPPinput").addEventListener("change", function(){ chrome.storage.local.set({itemPerPage: this.value*5+10}) });

//check lastest number of artwork
document.getElementById("checkNumInput").addEventListener("input", function(){ document.getElementById("checkNum").innerHTML = "Check Last  " + this.value });

chrome.runtime.onMessage.addListener(function(msg){
	if(msg.alertUser !== undefined) alert(msg.alertUser)
})



}