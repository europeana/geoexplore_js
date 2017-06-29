
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
    var url   = "http://www.europeana.eu/api/v2/search.json?wskey=" + this.apikey + "&query=edm_place:\"" + uri
              + "\"&rows=" + this.pageSize + "&start=" + start + "&profile=rich";

    $.ajax({ 'url': url, 'success': f });
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

Item.prototype.getType = function()
{
	return this.data.type;
};