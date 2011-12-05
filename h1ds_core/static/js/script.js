﻿// Custom javascript code for H1 data system
// David Pretty, 2010


// Populate next level of mds tree navigation.



function populateMDSNav(tree, shot, current_node) {
	    if (current_node.hasClass("unpopulated")) {
		var nid=current_node.children(".mds-node-id").text();
		var node_tree=current_node.children(".mds-node-tree").text();
		var fetch_url='/mdsplus/mds_nav_subtree/'+node_tree+'/'+shot+'/'+nid+'/';
		$.getJSON(fetch_url, function(d){
			current_node.append('<ul class="mds-tree hidden"></ul>');
			var sub_node = current_node.children(".mds-tree");
			$.each(d.nodes, function(){
				sub_node.append('<li class="mds-node-item unpopulated"><span class="mds-node-name"><a href="'+this.url+'">'+this.name+'</a></span><span class="mds-node-id">'+this.nid+'</span><span class="mds-node-tree">'+this.tree+"</span></li>")
			    });
			if (sub_node.children(".mds-node-item").length > 0){
			    current_node.children(".mds-node-name").append(' \u00bb');
			}
		    }); // end getJSON
		current_node.removeClass("unpopulated");
		
		if (current_node.children(".mds-tree").children(".mds-node-item").length > 0) {
		    current_node.children(".mds-node-name").append(">");
		    
		}
		current_node.children(".mds-node-name").hover(function() {
			$(this).parent().children(".mds-tree").each(function() {
				$(this).removeClass("hidden");
				$(this).children(".mds-node-item").each(function() {
					populateMDSNav(tree, shot, $(this));
				    });
			    }); // each
		    });
	    } // if

    

} // function

function updateEvents() {
 $.getJSON('/dashboard/', function(data){
  $.each(data, function(eventID) {
   var topRowId=parseInt($(".event-id").eq(1).text());
   if (parseInt(data[eventID].pk) > topRowId) {
    $("tr").eq(0).after('<tr><td class="event-id">'+data[eventID].pk+'</td><td class="name">'+data[eventID].fields.signal+'</td><td class="time">'+data[eventID].fields.time+'</td></tr>');
    $("tr").eq(1).effect("highlight", {color:"#ff6600"}, 300000);
   } // end if
  }); // end each
 }); // end getJSON
} // end function

function autoUpdateEvents() {
    setInterval(updateEvents, 2000);
}

function updateLatestShot() {
 $.getJSON('/mdsplus/latest_shot/{{input_tree}}/', function(d){
 $(".latest_shot").text(d.latest_shot);
 }); // end getJSON
} // end function

function autoUpdateLatestShot() {
    setInterval(updateLatestShot, 2000);
}

function formatDataForPlots(data) {
    // If we have min and max signals, then we fill the area between them.
    if (($.inArray("min", data.labels) > -1) && ($.inArray("max", data.labels) > -1) && (data.labels.length == 2)) {
	var d = {"signalmin":{"data": Array(data.data[0].length)},
		 "signalmax":{"data": Array(data.data[1].length)}};

	for( i=0; i < d.signalmin.data.length; i++){
            d.signalmin.data[i]=[data.dim[i],data.data[0][i]];
            d.signalmax.data[i]=[data.dim[i],data.data[1][i]];
	}
	var dataset = [{id: 'sigmin', data:d.signalmin.data, lines:{show:true, lineWidth:0.3, fill:false, shadowSize:0}, color:"rgba(50,50,255,0.5)"},
		       {id: 'sigmax', data:d.signalmax.data, lines:{show:true, lineWidth:0.3, fill:0.5, shadowSize:0}, color:"rgba(50,50,255,0.5)", fillBetween: 'sigmin'}];
	return dataset;	
    }
    
    else {
	var d = Array(data.data.length);
	for( i=0; i < d.length; i++){
            d[i]=[data.dim[i],data.data[i]];
	}
	var dataset = [{data:d, color:"rgb(50,50,255)"}];
	return dataset;
    }
} // end formatDataForPlots

function plotSignal1D() {
    var query_char = window.location.search.length ? '&' : '?';
    var placeholder = $("#signal-1d-placeholder");
    var overview = $("#signal-1d-overview");    
    var plot_width = placeholder.width();    
    var trace_query = window.location.search + query_char + 'view=json&f999_name=resample_minmax&f999_arg1='+plot_width;
    $.get(
	trace_query,
	function (data) {
	    var dataset = formatDataForPlots(data);
	    var options = {selection:{mode:"x"}};
	    var sigplot = $.plot(placeholder,  dataset, options  );
	    var overviewplot = $.plot(overview,  dataset , options  );
	    
	    placeholder.bind("plotselected", function (event, ranges) {
		// do the zooming
		var new_query = window.location.search + query_char + 'view=json&f980_name=dim_range&f980_arg1='+ranges.xaxis.from+'&f980_arg2='+ranges.xaxis.to+'&f990_name=resample_minmax&f990_arg1='+plot_width;
		$.get(new_query, function(newdata) {
		    var new_d = formatDataForPlots(newdata);
		    
		    sigplot = $.plot(placeholder, new_d, options);
		    
		});
		
		// don't fire event on the overview to prevent eternal loop
		overviewplot.setSelection(ranges, true);
	    });
	    
	    overview.bind("plotselected", function (event, ranges) {
		sigplot.setSelection(ranges);
	    });
	},
	'json'
    );
}

function plotSignal2D() {
    var query_char = window.location.search.length ? '&' : '?';
    var placeholder = $("#signal-2d-placeholder");
    var plot_width = placeholder.width();    
    var plot_height = placeholder.height();    
    var image_query = window.location.search + query_char + 'view=png';
    var shape_query = window.location.search + query_char + 'view=json&f999_name=shape';

    $.getJSON(shape_query, dataReady);

    function dataReady(signal_shape) {
	var aspect = (signal_shape.columns / signal_shape.rows);
	placeholder.height( plot_width * aspect );
	var data = [ [ [image_query, 0, 0, signal_shape.columns, signal_shape.rows] ] ];
	var options = {
	    series: { images: { show: true } },
	    xaxis: { min: 0, max: signal_shape.columns },
	    yaxis: { min: 0, max: signal_shape.rows }
	};
	
	$.plot.image.loadDataImages(data, options, function () {
	    $.plot(placeholder, data, options);
	});
    }
}

$('#masonry-container').masonry({
     itemSelector: '.mbox',
     columnWidth: 384
 });


// start: adapted from http://jqueryui.com/demos/sortable/#portlets

$(function() {

    $(".column").each(function(i) {
	var thisColumn = this;
	$(thisColumn).sortable({
	    connectWith: ".column",
	    handle: ".portlet-header",
	    update: function(e,ui) {
		$.cookie("sortorder"+thisColumn.id, 
			 $(thisColumn).sortable("toArray").join(), 
			 {path:'/'});
	    }
	});
	// this breaks input forms in firefox..
	// $(thisColumn).disableSelection();
    });

    $( ".portlet" ).addClass( "ui-widget ui-widget-content ui-helper-clearfix ui-corner-all" )
	.find( ".portlet-header" )
	.addClass( "ui-widget-header ui-corner-all" )
	.prepend( "<span class='ui-icon ui-icon-minusthick'></span>")
	.end()
	.find( ".portlet-content" );

    $( ".portlet-header .ui-icon" ).click(function() {
	$( this ).toggleClass( "ui-icon-minusthick" ).toggleClass( "ui-icon-plusthick" );
	$( this ).parents( ".portlet:first" ).find( ".portlet-content" ).toggle(
	    $.cookie($(this).parents(".portlet:first")[0].id, 
		     $(this).parents(".portlet:first").find(".portlet-content").is(":hidden") ? 'expanded' : 'collapsed', 
		     {path:'/'})
	);
    });

});

// end: adapted from http://jqueryui.com/demos/sortable/#portlets


function loadCookie() {

    // loop through all columns...
    $('.column').each(function(i) {
	var cookieItem = $.cookie("sortorder"+this.id);
	var thisColumn = this;
	if (cookieItem) {
	    $(cookieItem.split(',')).each(function (i, id) {
		$("#"+id).appendTo(thisColumn);
	    });
	}
	$(this).sortable('options');
    });

    // also load toggle states

    // find all portlet ids...
    $('.portlet').each(function(i) {
	var thisCookie = $.cookie(this.id);
	if (thisCookie) {
	    if (thisCookie === 'collapsed') {
		$( this ).find('.ui-icon').toggleClass( "ui-icon-minusthick" ).toggleClass( "ui-icon-plusthick" );
		$(this).find(".portlet-content").hide();
	    }
	}
    });

}


function newplotSignal2D() {
    // custom image manipulation for mds
    var container  = $("#signal-2d-placeholder");
    var query_char = window.location.search.length ? '&' : '?';
    var image_query = window.location.search + query_char + 'view=json';

    $.getJSON(image_query, dataReady);

    function dataReady(signal_data) {
	console.log(signal_data);
	var canvas = document.createElement("canvas");
	canvas.width = signal_data.dim[0].length;
	canvas.height = signal_data.dim[1].length;
	container.height(canvas.height);
	var context = canvas.getContext('2d');
	var imageData = context.getImageData(0,0,canvas.width, canvas.height);

	for (var x = 0; x < imageData.width; x++) {
	    for (var y = 0; y < imageData.height; y++) {
		var index = 4 * (y * imageData.width + x);
		var imval = 255*(signal_data.data[x][y] - signal_data.min)/(signal_data.max-signal_data.min);
		imageData.data[index] = imval;
		imageData.data[index + 1] = imval;
		imageData.data[index + 2] = imval;
		imageData.data[index + 3] = 255;
	    }
	}
	context.putImageData(imageData, 0, 0);
	container.append(canvas);
    } // end: dataReady
}

$(document).ready(function() {
    // updateLatestShot();
    // autoUpdateLatestShot();
    // autoUpdateEvents();
    loadCookie();
    var shot=$('#mds-nav-shot').text();
    var tree=$('#mds-nav-treename').text();
    $(".mds-node-item").each(function() {
	populateMDSNav(tree, shot, $(this));
    });
    if ($("#signal-1d-placeholder").length) {
	data = plotSignal1D();
    }
    if ($("#signal-2d-placeholder").length) {
	// data = plotSignal2D();
	newplotSignal2D();
    }
    if ($("#signal-3d-placeholder").length) {
	data = plotSignal3D();
    }

});


