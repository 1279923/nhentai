var targetTabs = []; //array of tab ids used by proccesses
var etnState = ""; //the state the extension is in
var targetTabId; //tab id to look for to load
var checkPos; //need to be set with var because it needs to save data outside of blocks

var pageNum; //the page number of the target page

var lastCheckedAW;
var checkNew;
var CNcheckNum;
var totalChecked;

chrome.contextMenus.create({id: "followTag", title: "follow this tag", documentUrlPatterns: ["https://nhentai.net/g/*"], contexts: ["link"], targetUrlPatterns: ["https://nhentai.net/category/*", "https://nhentai.net/language/*", "https://nhentai.net/group/*", "https://nhentai.net/artist/*", "https://nhentai.net/tag/*", "https://nhentai.net/character/*", "https://nhentai.net/parody/*"]});

chrome.contextMenus.onClicked.addListener(function(info,tabs){
	if(info.menuItemId == "followTag"){
		if(tabs.url.includes("nhentai.net/g")) chrome.tabs.sendMessage(tabs.id, {saveTag: info.linkUrl.split("/")[4]});
	}
});

chrome.tabs.onReplaced.addListener(function(addedTabId, removedTabId){
	targetTabs[targetTabs.indexOf(removedTabId)] = addedTabId;
});

chrome.tabs.onRemoved.addListener(function(tabId){
	if(targetTabs.includes(tabId)) chrome.storage.local.set({etnState:"idle"});
});

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse){
	if(msg.search == ""){
		chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
			chrome.tabs.sendMessage(tabs[0].id, {getTitlePretty: ""}, function(info){
				chrome.tabs.update(tabs[0].id, {url: "https://nhentai.net/search/?q=" + info.title});
			});
		})
	}
	
	if(msg.tabLoaded == "" && sender.tab.id == targetTabId){
		if(etnState == "saveAllFav"){
			
			function SAFmain(){
				if(pageNum == "start"){
					chrome.tabs.get(targetTabs[0], function(tab){
						if(tab.url == "https://nhentai.net/favorites/"){
							chrome.tabs.sendMessage(targetTabs[0], {getPageNum: ""}, function(rtn){
								pageNum = rtn.page;
								chrome.tabs.update(targetTabs[0], {url: "https://nhentai.net/favorites/?page=" + String(pageNum)});
							})
						}else{
							chrome.windows.remove(targetTabs[2]);
							chrome.storage.local.set({etnState: "idle"});
							chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
								chrome.tabs.sendMessage(tabs[0].id, {alertUser: "please sign in first!"});
								chrome.runtime.sendMessage({alertUser: "please sign in first!"});	
								return;
							})
						}
					})
				}else{
					if(targetTabId == targetTabs[1]){
						SAFsaveAW();
					}else{
						SAFsub();
					}
				}
			}
			
			function SAFsaveAW(){
				chrome.tabs.sendMessage(targetTabs[1] ,{saveArtwork: totalChecked}, function(rtn){
					if(rtn.msg !== "error"){
						chrome.storage.onChanged.addListener(function SAFwait(changes){
							if(changes.savedAW){
								totalChecked++;
								SAFsub();
								chrome.storage.onChanged.removeListener(SAFwait)
							}
						})
					}else{
						setTimeout(function(){
							//start SAFsaveAW after the tab loads by using listeners?
							chrome.tabs.reload(targetTabs[1], function(){ SAFsaveAW() });
						}, 30000);
					}
				});
			}
			
			function SAFsub(){
				chrome.tabs.sendMessage(targetTabs[0], {saveAllFav: ""}, function(rtn){
					if(rtn.data !== "error"){
						if(rtn.data !== "done"){
							chrome.storage.local.get("savedAW", function(data){
								console.log(totalChecked);
								let a = data.savedAW.findIndex(x => x[0] == rtn.data);
								if(a == -1){
									targetTabId  = targetTabs[1];
									chrome.tabs.update(targetTabs[1], {url: "https://nhentai.net/g/" + String(rtn.data)});
								}else{
									data.savedAW[a][7] = totalChecked;
									data.savedAW.splice(totalChecked, 0, data.savedAW.splice(a,1)[0]);
									data.savedAW = data.savedAW.map(function(item, index){
										item.splice(7, 1, index);
										return item;
									})
									chrome.storage.local.set({savedAW: data.savedAW});
									totalChecked++;
									SAFsub();
								}
							})
						}else if(pageNum !== 1){
							targetTabId = targetTabs[0];
							pageNum--;
							chrome.tabs.update(targetTabs[0], {url: "https://nhentai.net/favorites/?page=" + String(pageNum)});
							console.log("page updated to " + pageNum);
						}else{
							console.log("save all fav finished");
							chrome.storage.local.set({etnState: "idle"});
							chrome.windows.remove(targetTabs[2]);
						}
					}else{
						setTimeout(function(){
							chrome.tabs.reload(targetTabs[0], function(){ SAFmain() });
						}, 30000);
					}
				})
			}
			
			SAFmain();
		}
		if(etnState == "checkNew"){
			function CNmain(){
				chrome.tabs.sendMessage(targetTabs[0], {checkNew: ""}, function(rtn){
					if(rtn.list !== "error"){
						chrome.storage.local.get(["followingTags","newAW","lastCheckedAW","language"], function(data){
							if(pageNum == 1){
								lastCheckedAW = rtn.list[0][0];
								if(CNcheckNum == "new"){
									if(lastCheckedAW-data.lastCheckedAW > 2500) data.lastCheckedAW = lastCheckedAW - 2500;
									chrome.storage.local.set({lastCheckedAW: data.lastCheckedAW});
									CNcheckNum = data.lastCheckedAW;
								}else{
									CNcheckNum = lastCheckedAW - CNcheckNum;
								}
							}
							for(let i=0; i<rtn.list.length; i++){
								if(rtn.list[i][0]<CNcheckNum){
									console.log("check new finished");
									chrome.windows.remove(targetTabs[1]);
									console.log(data.newAW);
									chrome.storage.local.set({lastCheckedAW: lastCheckedAW, newAW: data.newAW, etnState: "idle"})
									break;
								}
								if(rtn.list[i].some(x => data.followingTags.includes(parseInt(x))) && !data.newAW.some(x => x[0] == parseInt(rtn.list[i][0]))){
									if(data.language == "any" || rtn.list[i].includes(String(data.language))){
										let a = data.newAW.findIndex(x => x[0] == rtn.list[i][0]);
										if(a == -1){
											data.newAW.push([parseInt(rtn.list[i][0]), rtn.list[i][1], rtn.list[i][2]]);
										}else{
											data.newAW.splice(0, 0, data.newAW.splice(a,1)[0]);
										}
									}
								}
							}
							chrome.storage.local.set({newAW: data.newAW})
							pageNum++;
							chrome.tabs.update(targetTabs[0], {url: "https://nhentai.net/?page=" + String(pageNum)});
							console.log("page updated to " + pageNum);
						});
					}else{
						setTimeout(function(){
							chrome.tabs.reload(targetTabs[0], function(){ CNmain() });
						}, 30000);
					}
				})
			}
			
			CNmain();
		}
	}
	
	if(msg.saveAllFav == ""){
		console.log("saveAllFav started")
		etnState = "saveAllFav";
		targetTabs = [];
		totalChecked = 0;
		chrome.storage.local.get("savedAW", function(data){
			data.savedAW.sort((a,b) => a[7]-b[7]);
			chrome.storage.local.set({savedAW: data.savedAW, etnState: "saveAllFav"})
		})
		chrome.windows.create({url: "https://nhentai.net/favorites", state: "minimized"}, function(Window){
			chrome.tabs.create({windowId: Window.id}, function(tab){
				targetTabs.push(Window.tabs[0].id);
				targetTabs.push(tab.id);
				targetTabs.push(Window.id);
				targetTabId = targetTabs[0];
				checkPos = 0;
				pageNum = "start";
			})
		})
	}
	
	if(msg.checkNew !== undefined){
		console.log("checkNew started")
		chrome.storage.local.set({etnState: "checkNew"});
		etnState = "checkNew";
		targetTabs = [];
		checkNew = [];
		if(msg.checkNew == "new"){
			CNcheckNum = "new";
		}else{
			CNcheckNum = msg.checkNew;
		}
		chrome.windows.create({url: "https://nhentai.net", state: "minimized"}, function(Window){
			targetTabs.push(Window.tabs[0].id);
			targetTabs.push(Window.id);
			targetTabId = targetTabs[0];
			pageNum = 1
		})
	}
});

chrome.runtime.onInstalled.addListener(function(details){
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function(){
		chrome.declarativeContent.onPageChanged.addRules([{
		conditions: [new chrome.declarativeContent.PageStateMatcher({
			pageUrl: {hostEquals: 'nhentai.net'},
		})
		],
			actions: [new chrome.declarativeContent.ShowPageAction()]
		}]);
	});
	if(details.reason == "install"){
		chrome.storage.local.set({savedAW: []});
		chrome.storage.local.set({tagIndex: []});
		chrome.storage.local.set({followingTags: []});
		chrome.storage.local.set({browsingHistory: []});
		chrome.storage.local.set({newlyUnfollowedTags: []});
		chrome.storage.local.set({newlyRemovedAW: []});
		chrome.storage.local.set({newAW: []});
		chrome.storage.local.set({language: 12227});
		chrome.storage.local.set({itemPerPage: 30});
		chrome.storage.local.set({lastCheckedAW: 0});
		console.log("extension installed");
	}else{
		console.log("extension updated");
	}	
});

//chrome.storage.local.get(null, function(data){console.log(data)})
chrome.storage.local.set({etnState: "idle"});
console.log("background loaded");