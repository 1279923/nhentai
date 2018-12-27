var data = gallery;
data.title.english = (data.title.english == null) ? data.title.english = "not set" : data.title.english.replace(new RegExp("&quot;", 'g'), "");
data.title.japanese = (data.title.japanese == null) ? data.title.japanese = "not set" : data.title.japanese.replace(new RegExp("&quot;", 'g'), "");
data.title.pretty = (data.title.pretty == null) ? data.title.pretty = "not set" : data.title.pretty.replace(new RegExp("&quot;", 'g'), "");
document.getElementById("data").setAttribute("data", JSON.stringify(data));
//save the title data to a local variable first, then edit that data to see if that works