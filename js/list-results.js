var getTypeImage = function(type)
{
	switch (type)
	{
		case 'IMAGE': return 'svg-icon-image';
		case 'TEXT' : return 'svg-icon-openbook';
		case 'VIDEO': return 'svg-icon-tv';
		case 'SOUND': return 'svg-icon-music';
	}
	return '';
}

var getTypeName = function(type)
{
	switch (type)
	{
		case 'IMAGE': return 'Image';
		case 'TEXT' : return 'Text';
		case 'VIDEO': return 'Video';
		case 'SOUND': return 'Sound';
	}
	return '';
}

function ListResults()
{
}

ListResults.prototype.renderItem = function(item, jq)
{
	var uri   = item.getURI();
	var title = item.getTitle();
	var date  = item.getYear();
	var agent = item.getAgent();
	var thumb = item.getThumbnail();
	var type  = item.getType();

	var titleHTML = title + (date === undefined ? '' : ' <span class="date">(' + date + ')</span>');

	var handler = function(e)
	{
		map.getMap().removeLayer(map.markers);
		var item = $(e.currentTarget).data('item');
		spider.setItem(item);
		spider.render();
	};

	var html  = $('\
<a><li>\
	<article class="search-list-item cf " style="">\
	  <div class="item-preview">\
		<div class="item-image">\
		  <div class="inner">\
			<span class="link" tabindex="-1">\
			  <img src="' + thumb + '" alt="' + title + '">\
			</span>\
		  </div>\
		</div>\
	  </div>\
	  <div class="item-info ">\
		<h2><span class="disableTitle">' + titleHTML + '</span></h2>\
		<h5 class=""><span class="disableCreator">' + agent + '</span></h5>\
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
	</article>\
  </li></a>').data('item',item).on( "click", handler );

  

  jq.append(html);
};

ListResults.prototype.renderResultSet = function(rs)
{
	var menuRight = document.getElementById( 'lateral-menu' );
	classie.toggle( menuRight, 'cbp-spmenu-open' );
	
	$(".result-info").text(rs.getStart() + " - " + rs.getEnd() + " of " + rs.getTotal() + " results");
	var jq = $("#item-list");
	jq.empty();
	var items = rs.getItems();
	for ( var i in items ) { this.renderItem(items[i], jq); }
};
