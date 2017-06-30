function ItemSpider(map)
{
	this.item   = null;
	this.map    = map;
	this.icons  = {
	    'Item' : L.icon({'iconUrl': 'img/marker_icon_items.png'  , 'iconSize': [26, 38], 'iconAnchor': [13, 38] })
	  , 'Agent': L.icon({'iconUrl': 'img/marker_icon_persons.png', 'iconSize': [26, 38], 'iconAnchor': [13, 38] })
	};
	this.group  = L.featureGroup();
	this.group.setZIndex(2000);
	this.master = null;
	map.addLayer(this.group);
}

ItemSpider.prototype.setItem = function(item)
{
	this.item  = item;
}

ItemSpider.prototype.render = function()
{
	var _this = this;

	this.master = null;

	var itemPlaces = this.item.getPlaces();
	for (var e in itemPlaces)
	{
		var uri = itemPlaces[e];
		var geo = places[uri];
		if (geo === undefined ) { continue; }

		console.log(uri);
		var longitude = geo[0];
		var latitude  = geo[1];

		var icon = this.icons[this.item.getClass()];
		marker = L.marker([latitude, longitude], { 'title': uri, 'icon': icon });
		this.renderItemPopup(marker);
		this.group.addLayer(marker);

		if (this.master === null) { this.master = marker; continue; }

		L.Polyline.Arc(this.master.getLatLng(), marker.getLatLng()).addTo(this.group);
	}

	this.map.fitBounds(this.group.getBounds());

	this.item.getAgents(function(o) { _this.renderAgent(o); });
}

ItemSpider.prototype.destroy = function()
{
	this.group.clearLayers();
	//map.removeLayer(this.group);
}

ItemSpider.prototype.renderMarker = function(object, coord)
{
//	var marker = L.marker(coord, { 'title': object.getURI(), 'icon': this.icons[object.getClass()] });
//	this.group.addLayer(marker);
//	L.Polyline.Arc(this.master.getLatLng(), marker.getLatLng()).addTo(this.group);

    var marker = L.marker(coord, { 'title': object.getURI(), 'icon': this.icons[object.getClass()] });
	this.group.addLayer(marker);
	if (this.master === null) { this.master = marker; return marker; }

	L.Polyline.Arc(this.master.getLatLng(), marker.getLatLng()).addTo(this.group);
	return marker;
}

ItemSpider.prototype.renderAgent = function(agent)
{
	var coords = agent.getBirthCoord();
	for (var i in coords)
	{
		var marker = this.renderMarker(agent, coords[i]);
		this.renderAgentPopup(agent, 'Birth Place', marker)
	}
	var coords = agent.getDeathCoord();
	for (var i in coords)
	{
		this.renderMarker(agent, coords[i]);
		this.renderAgentPopup(agent, 'Death Place', marker)
	}
}

ItemSpider.prototype.renderItemPopup = function(marker)
{
	var item  = this.item; 
	var uri   = item.getURI();
	var title = item.getTitle();
	var date  = item.getYear();
	var agent = item.getAgent();
	var thumb = item.getThumbnail();
	var type  = item.getType();

	var titleHTML = title + (date === undefined ? '' : ' <span class="date">(' + date + ')</span>');


	var html  = '\
		<article class="search-list-item cf " style="">\
		  <div class="item-preview">\
			<div class="item-image">\
			  <div class="inner">\
				<a class="link" target="" href="' + uri + '" tabindex="-1">\
				  <img src="' + thumb + '" alt="' + title + '">\
				</a>\
			  </div>\
			</div>\
		  </div>\
		  <div class="item-info ">\
			<h2><a href="' + uri + '">' + titleHTML + '</a></h2>\
			<h5 class=""><a href="' + uri + '">' + agent + '</a></h5>\
			<div class="item-concepts">Relationship placeholder</div>\
			<footer>\
			  <div class="item-metadata">\
				<span data-href=" " class="item-type">\
				  <span class="svg-icon ' + getTypeImage(type) + '"></span>\
				</span>\
				<span class="highlight-text">' + getTypeName(type) + '</span>\
			  </div>\
			</footer>\
		  </div>\
		</article>';

	//var popup = L.popup().setContent(html);
	var spider = this;
	var popup = marker.bindPopup(html, {'offset':L.point(0, -30)});
	popup.openPopup();
	popup.on('popupclose', function(e) {
        spider.destroy();
		map.getMap().addLayer(map.markers);
	});
}

ItemSpider.prototype.renderAgentPopup = function(agent, relation, marker)
{
	var uri    = agent.getURI();
	var label  = agent.getLabel();
	var dBirth = agent.getDateOfBirth();
	var dDeath = agent.getDateOfDeath();
	var thumb  = agent.getDepiction();
	var prof   = agent.getProfession();

	var titleHTML = label + ' <span class="date">(' + dBirth + '-' + dDeath + ')</span>';

	var html  = '\
		<article class="search-list-item cf " style="">\
		  <div class="item-preview">\
			<div class="item-image">\
			  <div class="inner">\
				<a class="link" target="" href="' + uri + '" tabindex="-1">\
				  <img src="' + thumb + '" alt="' + label + '">\
				</a>\
			  </div>\
			</div>\
		  </div>\
		  <div class="item-info">\
			<h2><a href="' + uri + '">' + titleHTML + '</a></h2>\
			<h5 class=""><a href="' + uri + '">' + prof + '</a></h5>\
			<div class="item-concepts">' + relation + '</div>\
		  </div>\
		</article>';

	//var popup = L.popup().setContent(html);
	var popup = marker.bindPopup(html, {'offset':L.point(0, -30)});
}