function EuropeanaMap()
{
	this.map = null;
	this.markers = null;
}

EuropeanaMap.prototype.install = function()
{
	var tile_url = 'https://api.tiles.mapbox.com/v4/mapbox.light/{z}/{x}/{y}.png?access_token=' + token;
	var tiles = L.tileLayer(tile_url, { attribution: 'Europeana Geoexplore', maxZoom: 18 });
    this.map = L.map('map', {center: [20, -10], zoom: 2, layers: [tiles]});

	var bounds = L.latLngBounds(L.latLng(-95, -180), L.latLng(95, 180));
	this.map.setMaxBounds(bounds);

	var _this = this;
	this.markers = L.markerClusterGroup(
	{
		polygonOptions: { weight: 1.5, color: '#85837B', opacity: 0.5 },
		iconCreateFunction: function(cluster) {
			// iterate all markers and count
			var markers = cluster.getAllChildMarkers();
			var weight = 0;
			for (var i = 0; i < markers.length; i++)
			{
				if(markers[i].options.hasOwnProperty('density'))
				{
					weight += markers[i].options.density;
				}
			}

			var ms = _this.getRadius(weight);
			// create the icon with the "weight" count, instead of marker count
			return L.divIcon({
				html: '<div><span>' + weight.toLocaleString('en-US', { minimumFractionDigits: 0 }) + '</span></div>',
				className: 'marker-cluster marker-cluster-small', iconSize: new L.Point(ms, ms)
			});
		}
	});

	this.map.on("moveend", function () {
		var transform_matrix = $(".leaflet-map-pane").css('transform');
		var x = parseInt(transform_matrix.split(',')[4])
		var y = parseInt(transform_matrix.split(',')[5])
		$("#overlay").css('transform', 'translate3d(-' + x + 'px, -' + y + 'px, 0px)');
	});
}

EuropeanaMap.prototype.getMap = function() { return this.map; }


EuropeanaMap.prototype.getRadius = function (density)
{
	return (20 + Math.trunc(Math.log10(density) * 10));
}

EuropeanaMap.prototype.addMarker = function(coord, uri, density)
{
    var ms = this.getRadius(density);

	var scaledIcon = L.divIcon({
		html: '<div><span>' + density.toLocaleString('en-US', { minimumFractionDigits: 0 }) + '</span></div>'
	  , className: 'marker-cluster marker-cluster-small'
	  , iconSize: new L.Point(ms, ms)
	});

	marker = L.marker(coord, { 'title': uri, 'density': density, 'uri': uri, 'icon': scaledIcon });
	marker.on('click', function(e)
	{
		map.getMap().panTo(e.target.getLatLng());

		var showRight = document.getElementById( 'showRight' ),
            overlay = document.getElementById( 'overlay' ),
            clickedMarker = e.target._icon,
            widthWindow = window.innerWidth,
            heightWindow = window.innerHeight;

		classie.toggle( clickedMarker, 'zIndex' );
        classie.toggle( overlay, 'opak' );
 
        $( overlay ).css({  "width": widthWindow, "height": heightWindow });

		api.searchItems(e.target.options.uri, 1, function(rs) { listResults.renderResultSet(rs); } );
	});

	this.markers.addLayer(marker);
}
