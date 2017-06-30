
function API()
{
    this.apikey   = "api2demo";
    this.pageSize = 20;
}

API.prototype.searchItems = function(uri, page, handler)
{
    var start = ((page-1) * this.pageSize) + 1;
    var f = function(result) {
        var items = result.items;
		var list  = [];
        for ( var i in items )
        {
            list.push(new Item(uri, items[i]));
        }
		handler(new ResultSet(start, result.totalResults, page, list));
    };
    var url   = "http://www.europeana.eu/api/v2/search.json?wskey=" + this.apikey + "&query=edm_place:\"" + encodeURIComponent(uri)
              + "\"&rows=" + this.pageSize + "&start=" + start + "&profile=rich";

    $.ajax({ 'url': url, 'success': f });
}

API.prototype.getAgent = function(uri, handler)
{
	var url = uri.replace("http://data.europeana.eu/", "http://test-entity.europeana.eu/entity/") + "?wskey=apidemo";
	$.ajax({ 'url': url, 'success': function(result) { handler(new Agent(result)); } });
}

function ResultSet(start, total, page, items)
{
	this.start = start;
	this.total = total;
	this.page  = page;
    this.items = items;
}

ResultSet.prototype.getStart = function() { return this.start; }
ResultSet.prototype.getEnd   = function() { return this.start + this.items.length - 1; }
ResultSet.prototype.getTotal = function() { return this.total; }
ResultSet.prototype.getItems = function() { return this.items; }

function Item(place, data)
{
	this.place = place;
	this.data  = data;
}

Item.prototype.getClass = function() { return "Item"; }

Item.prototype.getURI = function()
{
	return "http://data.europeana.eu/item" + this.data.id;
};

Item.prototype.getTitle = function()
{
	var title = this.data.title;
	if (title.constructor === Array) { return title[0]; }
	return title;
};

Item.prototype.getYear = function()
{
	return this.data.year;
};

Item.prototype.getThumbnail = function()
{
	var edmPreview = this.data.edmPreview;
	if (edmPreview === undefined) { return ""; }
	if (edmPreview.constructor === Array) { return edmPreview[0]; }
	return edmPreview;
};

Item.prototype.getAgent = function()
{
	var edmAgentLabel = this.data.edmAgentLabel;
	if (edmAgentLabel === undefined) { return ""; }
	if (edmAgentLabel.constructor === Array)
	{ 
		var label = edmAgentLabel[0];
		for (var e in label) { return label[e]; }
	}
	return "";
};

Item.prototype.getAgents = function(handler)
{
	var edmAgent = this.data.edmAgent;
	if (edmAgent === undefined        ) { return; }
	if (edmAgent.constructor !== Array) { return; }

	for (var i in edmAgent)
	{ 
		var obj = edmAgent[i];
		if (!obj.startsWith("http://data.europeana.eu/agent/")) { continue; }

		api.getAgent(obj, handler);
	}
}

Item.prototype.getPlaces = function()
{
	var edmPlace = this.data.edmPlace;
	if (edmPlace === undefined) { return []; }
	return edmPlace;
};

Item.prototype.getType = function()
{
	return this.data.type;
};


/* AGENT CLASS */

function Agent(data)
{
	this.data  = data;
}

Agent.prototype.getURI   = function() { return this.data.id; }
Agent.prototype.getLabel = function()
{
	var prefLabel = this.data.prefLabel;
	if (prefLabel === undefined) { return ""; }

	var label = prefLabel["en"];
	if (label !== undefined) { return label }

	for (var i in label) { return label[i]; }
	return "";
}

Agent.prototype.getDateOfBirth = function()
{
	var dateOfBirth = this.data.dateOfBirth;
	if (dateOfBirth === undefined) { return "?"; }
	if (dateOfBirth.constructor !== Array) { return dateOfBirth; }
	for (var i in dateOfBirth) { return dateOfBirth[i]; }
	return "?";
}

Agent.prototype.getDateOfDeath = function()
{
	var dateOfDeath = this.data.dateOfDeath;
	if (dateOfDeath === undefined) { return "?"; }
	if (dateOfDeath.constructor !== Array) { return dateOfDeath; }
	for (var i in dateOfDeath) { return dateOfDeath[i]; }
	return "?";
}

Agent.prototype.getDepiction = function()
{
	return this.data.depiction;
}

Agent.prototype.getProfession = function()
{
	var def  = "Unknown Profession";
	var prof = this.data.professionOrOccupation;
	if (prof === undefined) { return def; }

	if (prof.constructor !== Array)
	{
		var id = prof['@id'];
		if (id !== undefined) { return def; }
		
		var en = prof["en"];
		if (en !== undefined) { return en; }

		return def;
	}

	var ret = null;
	for (var i in prof)
	{
		var en = prof[i]["en"];
		if (en === undefined) { contine; }

		ret = (ret == null ? "" : ret + ", ") + en;
	}
	return (ret == null ? def : ret);
}

Agent.prototype.getClass = function() { return "Agent"; }

Agent.prototype.getBirthCoord = function()
{
	return this._getCoords(this.data.placeOfBirth);
}

Agent.prototype.getDeathCoord = function()
{
	return this._getCoords(this.data.placeOfDeath);
}

Agent.prototype._getCoords = function(value)
{
	var coords = [];
	if (value === undefined) { return coords; }

	for ( var i in value )
	{
		var id = value[i]['@id'];
		if (id === undefined) { continue; }

		var coord = placesAgents[id];
		if (coord === undefined) { console.log(id); continue; }

		coords.push([coord[1],coord[0]]);
	}
	return coords;
}