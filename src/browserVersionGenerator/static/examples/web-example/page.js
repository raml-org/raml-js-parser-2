
var onClick = function() {

	var url = document.getElementById('inputUrl').value

    RAML.Parser.loadApi(url,{
    		fsResolver: {
    			content: function(path){ return fs.readFileSync(path).toString(); },
    			list: function(path){ return fs.readDirSync(path); }
    		}
    	}).then(function(api){

	    	var titleField = document.getElementById('apiTitle');

	    	titleField.value = api.title();

	    	var str = "";
	    	api.allResources().map(function(x){return x.completeRelativeUri()}).sort().forEach(function(x){
	    		str += x + '\n';
	    	});
	    	var resourcesField = document.getElementById('apiResources')
	    	resourcesField.value = str;
    });
}
document.getElementById('rootButton').addEventListener('click', onClick);

function toResponse(xhr){
	var status = xhr.status;
	if(status>300&&status<400){
		response = { errorMessage: "Redirect is not supported in thes implementation of HttpResolver" }
    }
	else if(status>399){
		var msg = "Network error";
		if(xhr.statusText){
			msg += ": " + xhr.statusText;
		}
		response = { errorMessage: msg }
	}
	else{
		response = { content: xhr.responseText };
	}
	return response;
}
