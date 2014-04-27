function ajaxRequest(typ,uri,sdata,aSync,dtype,loading,hiding){
	$(loading).ajaxStart(function () {
        $(this).show();
    });

    $(loading).ajaxStop(function () {
        $(this).hide();
    });
	var ajaxResponse;
	var response;
	$('#waiting_img').show();
	$.ajax({
		type : typ,
		url : uri,
		data : sdata,
		async: aSync,
		dataType: dtype,
		cache : false,
		success : function(response)
        {
            ajaxResponse = response;
            $('#waiting_img').hide();
        },
        error:function(){
        	//$('#waiting_img').hide();
        },
        complete: function(response){
        	
        }
	});
	return ajaxResponse;
}

function saveform(form){
	console.log($('button#submit').text());
	$('<p class="thanx" id="thanx">Danke</p>').prependTo('form#add_form #dialogContent');
        var str = $("form#"+form).serialize();
        var response = ajaxRequest('POST','ajax/ajax.php',{func:'insert',formdata:str},false,'html','#waiting_img','.ui-btn');
        reset(form);
        //$('#'+form).hide();
        //moreRows();
   // $('button#submitSuggestion').text('speichern');
        setTimeout(function() {
        	$('#thanx').remove();
        }, 2500);
}

function saveopinion(form,id){
	 var str = $("form#"+form).serialize();
	 str += "&id="+id;
     var response = ajaxRequest('POST','ajax/ajax.php',{func:'insertOpinion',data:str},false,'html','#waiting_img','.ui-btn');
     reset(form);
     $('#'+form).show();
}

function reset(form){
	//$('article[id*="article-"]').remove();
	$('#'+form)[0].reset();
	//$('#btn_more').parent('div').show();
	//moreRows();
}

function reload(){
	$('article[id*="article-"]').remove();
	$('#btn_more').parent('div').show();
	getRows(0);
}

function add(form){
	$('article[id*="article-"]').remove();
	$('#'+form).show();
	$('#btn_more').parent('div').show();
}

function moreRows(){
	$('#waiting_img').show();
	setTimeout(function() {
	var last = $('article').last().attr('data-count');
	getRows(last);
	}, 250);
}

function formatResult(response,ii,lmax){
	$.each(response, function(i,ii) {
		var ii = i + parseInt(lmax) + 1;
		//console.log(i2);
		//ii = this.pfuscher_id;
		var pid = this.pfuscher_id;
			if(ii){
				$('<article id="article-'+pid+'" data-count="'+pid+'" class="articles"><figure id="article-img-'+pid+'"><object data="src/images/no_image.svg" type="image/svg+xml"></object></figure><header>'+this.title+'</header><p class="desc">'+this.description+'</p><div id="awards-'+pid+'"></div><div id="nominate-'+pid+'"></div><div id="opinion-'+pid+'"></div></article>').appendTo('section');
				//$('article#article-'+pid+'"').effect( 'drop', '', 500, callback );
				$.each(this.award, function(i, a) {
					var votes = 0;
					var pro = 0;
					var con = 0;
					var neu = 0;
					var h = 0;
					if(typeof(a.votes) != "undefined" || a.votes) votes = a.votes;
					
					if(typeof(a.opinion) != "undefined"){ 
						if(a.opinion.pro) pro = a.opinion.pro;
						if(a.opinion.con) con = a.opinion.con;
						if(a.opinion.neu) neu = a.opinion.neu;
						var b = 30;
						var p = pro;
						var v = votes;
						var awarded = false;
						var rpro = b * ((p / v) * 100) / 100;
						rpro = Math.ceil(rpro * 1);
						if(rpro == 0) rpro = 1;
						if(rpro > b) rpro = b;
						
						var rcon = b * ((con / v) * 100) / 100;
						rcon = Math.ceil(rcon * 1);
						if(rcon == 0) rcon = 1;
						if(rcon > b) rcon = b;
						
						var crpro = votes / pro;
						var crcon = votes / con;
						
						if(crpro <= 2 && crcon <= 2){
							awarded = false;
						}else if(crpro <= 2){
							awarded = true;
						}else if(crpro <= 2){
							awarded = false;
						}else{
							awarded = false;
						}
					}
					//console.log(pro+' '+con+' '+neu);
					var text = '<figure id="awn-'+pid+'-'+a.award_id+'"><span class="opinion-bar"><span class="opinion-bar-wrapper" >'
					+'<span title="JA '+pro+' Stimmen" id="oppro-'+pid+'-'+a.award_id+'" class="opinion-bar-value" style="height:'+rpro+'px"></span>'
					+'<span title="NEIN '+con+' Stimmen" id="opcon-'+pid+'-'+a.award_id+'" class="opinion-bar-value con" style="height:'+rcon+'px"></span>'
					+'</span></span><img id="img-'+pid+'-'+a.award_id+'" data-value="'+votes+'" class="nominate-this" title="'+a.title+' Stand: '+pro+'/'+con+' Stimmen (Nominierungen: '+votes+')" alt="'+a.title+'" id="aw-'+pid+'-'+a.award_id+'" src="src/images/no_award.png">'
					+'<p id="votes-'+pid+'-'+a.award_id+'">'+votes+'</p>'
					+'<div id="desc-'+pid+'-'+a.award_id+'">'+a.description+'</div></figure>';
					  $(text).appendTo('div#awards-'+pid);
				  if(awarded){
						$('#img-'+pid+'-'+a.award_id).addClass('awarded');
						$('#img-'+pid+'-'+a.award_id).attr('title',a.title+' GEWONNEN mit '+pro+'/'+con+' Stimmen (Nominierungen: '+votes+')');
					}
				});
				nominateDialog();
			}
		});
}

function getRows(lmax){
	var ii;
	if(!lmax){ 
		var lmax = 0;
	}else{
		//var lmax = $('article').last().attr('data-count');
		var lmax = $('.articles').length;
		if($('article').last().attr('data-count') == 'end')	var lmax = 'end';
	}
	if(lmax != 'end'){ 
	 var response = ajaxRequest('GET','ajax/ajax.php',{func:'getRows',table:'pfuscher',field:'',pk:'',id:'',last:lmax},false,'json','.ui-loader','.ui-btn');
	}
	if(response){
		if(!response.status){
			formatResult(response,ii,lmax);
			/*
			$.each(response, function(i,ii) {
				var ii = i + parseInt(lmax) + 1;
				//console.log(i2);
				//ii = this.pfuscher_id;
				var pid = this.pfuscher_id;
					if(ii){
						$('<article id="article-'+pid+'" data-count="'+pid+'" class="articles"><figure id="article-img-'+pid+'"><object data="src/images/no_image.svg" type="image/svg+xml"></object></figure><header>'+this.title+'</header><p>'+this.description+'</p><div id="awards-'+pid+'"></div><div id="nominate-'+pid+'"></div><div id="opinion-'+pid+'"></div></article>').appendTo('section');
						//$('article#article-'+pid+'"').effect( 'drop', '', 500, callback );
						$.each(this.award, function(i, a) {
							var votes = 0;
							var pro = 0;
							var con = 0;
							var neu = 0;
							var h = 0;
							if(typeof(a.votes) != "undefined" || a.votes) votes = a.votes;
							
							if(typeof(a.opinion) != "undefined"){ 
								if(a.opinion.pro) pro = a.opinion.pro;
								if(a.opinion.con) con = a.opinion.con;
								if(a.opinion.neu) neu = a.opinion.neu;
								var b = 30;
								var p = pro;
								var v = votes;
								var awarded = false;
								var rpro = b * ((p / v) * 100) / 100;
								rpro = Math.ceil(rpro * 1);
								if(rpro == 0) rpro = 1;
								if(rpro > b) rpro = b;
								
								var rcon = b * ((con / v) * 100) / 100;
								rcon = Math.ceil(rcon * 1);
								if(rcon == 0) rcon = 1;
								if(rcon > b) rcon = b;
								
								var crpro = votes / pro;
								var crcon = votes / con;
								
								if(crpro <= 2 && crcon <= 2){
									awarded = false;
								}else if(crpro <= 2){
									awarded = true;
								}else if(crpro <= 2){
									awarded = false;
								}else{
									awarded = false;
								}
							}
							//console.log(pro+' '+con+' '+neu);
							var text = '<figure id="awn-'+pid+'-'+a.award_id+'"><span class="opinion-bar"><span class="opinion-bar-wrapper" >'
							+'<span title="JA '+pro+' Stimmen" id="oppro-'+pid+'-'+a.award_id+'" class="opinion-bar-value" style="height:'+rpro+'px"></span>'
							+'<span title="NEIN '+con+' Stimmen" id="opcon-'+pid+'-'+a.award_id+'" class="opinion-bar-value con" style="height:'+rcon+'px"></span>'
							+'</span></span><img id="img-'+pid+'-'+a.award_id+'" data-value="'+votes+'" class="nominate-this" title="'+a.title+' Stand: '+pro+'/'+con+' Stimmen (Nominierungen: '+votes+')" alt="'+a.title+'" id="aw-'+pid+'-'+a.award_id+'" src="src/images/no_award.png">'
							+'<p id="votes-'+pid+'-'+a.award_id+'">'+votes+'</p>'
							+'<div id="desc-'+pid+'-'+a.award_id+'">'+a.description+'</div></figure>';
							  $(text).appendTo('div#awards-'+pid);
						  if(awarded){
								$('#img-'+pid+'-'+a.award_id).addClass('awarded');
								$('#img-'+pid+'-'+a.award_id).attr('title',a.title+' GEWONNEN mit '+pro+'/'+con+' Stimmen (Nominierungen: '+votes+')');
							}
						});
						nominateDialog();
					}
				});
				*/
		}else{
			$('#btn_more').parent('div').hide();
			$('<article id="article-end" data-count="end" class="articles">'+response.message+'</article>').appendTo('section');
			end = true;
		}
	}else{
		$('#waiting_img').hide();
		//console.log('no response?');
	}

}

function showChanges(element) {
	 $('p#'+ element).animate({
		    opacity:'0.0',
		    fontSize:'0.1em'
		  });
	var votes = $('p#'+ element).text();
	setTimeout(function() {
	var addvote = parseInt(votes) +1;
	$("#" + element).prev('img').attr('data-value',addvote);
	$("#" + element).addClass('valuesReCalc').text(addvote).animate({
	    opacity:'0.5',
	    fontSize:'1em'
	  });
	}, 750);
}

function nominateDialog(){
	$('img.nominate-this').off('click');
    $('img.nominate-this').on('click', function(e) {
    	e.preventDefault();

    	var dv = $(this).attr('data-value');
    	if(dv < 1) $('#dialogOpinionNow').hide();
    	else $('#dialogOpinionNow').show();
    	$('a#dialogNominateNow').removeClass('ui-disabled');
    	$('a#dialogNominateNow span.ui-btn-text').text('Submit');
    	$('a#dialogOpinionForm').removeClass('ui-disabled');
    	$('a#dialogNominateNow span.ui-btn-text').text('Jetzt nominieren');
    	var name = $('#'+this.id).parent().parent().parent().children('header').text();
    	var img = $('#'+this.id).clone();
    	var desc = $('#'+this.id).next().next().clone();
    	desc = $(desc).show();
    	var nid = this.id;
    	$.mobile.changePage('#dialogPage', 'dialog', true, true);
    	$("div#dialogHeader h2").text(name);
    	$('form#opinion_form div#dialogContent').children().first('h3').html(this.alt).append(img).append(desc);
    	$('a#dialogNominateNow').off('click');
    	$('a#dialogNominateNow').on('click',function(e){
    		e.preventDefault();
    		nominate(nid);
    		$('a#dialogNominateNow').addClass('ui-disabled');
    		$('a#dialogNominateNow span.ui-btn-text').text('Danke');
    	});
    	$('a#dialogOpinionForm').off('click');
    	$('a#dialogOpinionForm').on('click',function(e){
    		e.preventDefault();
    		saveopinion('opinion_form',nid);
    		$('a#dialogOpinionForm').addClass('ui-disabled');
    		$('a#dialogOpinionForm span.ui-btn-text').text('Danke');
    	});
    	delete nid;
    });
}

function search(term){
	$('#waiting_img').show();
	var n = term.length;
	if(n > 2){
		setTimeout(function() {
			var response = ajaxRequest('GET','ajax/ajax.php',{func:'search',data:term},false,'json','#waiting_img','.ui-btn');
		if(response){
			if(!response.status){
				document.onscroll = function(){};
				$('#btn_more').parent('div').hide();
				$('article[id*="article-"]').remove();
				formatResult(response,0,0);
			}
		}
		}, 250);
	}
	if(n == 0){
		reload();
		document.onscroll = function(){
			$('#waiting_img').show();
			setTimeout(function() {
				var last = $('article').last().attr('data-count');
				getRows(last);
			}, 250);
		}
	}
}

/* unused
function nominateClick(){
	$('img.nominate-this').off('click');
	    $('img.nominate-this').on('click', function(e) {
	    	var response = ajaxRequest('POST','ajax/ajax.php',{func:'nominate',data:this.id},false,'html','#waiting_img','.ui-btn');
	    	showChanges(response);
	    }); 
}
*/

function nominate(id){
	var response = ajaxRequest('POST','ajax/ajax.php',{func:'nominate',data:id},false,'html','#waiting_img','.ui-btn');
	showChanges(response);
}

function navshowhide(){
    $('nav').animate(
            function() {
                $('nav ul').slideDown("fast");
            },
            function() {
                $('nav ul').slideUp("fast");
            }
        );
}

function navhide(){
	$('nav').show("slide", { direction: "right" }, 1000);
}

$(document).ready(function(){
	$(getRows(0));
	document.onscroll = function(){
		$('#waiting_img').show();
		setTimeout(function() {
			var last = $('article').last().attr('data-count');
			getRows(last);
		}, 250);
	}
});

$(document.body).
on('tap', 'a',function (e) {
  var href = this.getAttribute('href');
  if (e.defaultPrevented || !href) { return; }
  e.preventDefault();
  location.href= href;
}).
on('click', 'a', function (e) {
  e.preventDefault();
});
/*
$(window).scroll(function(e){
	e.preventDefault();
	if ($(window).scrollTop() + $(window).height() == $(document).height()) {
		$('#waiting_img').show();
		setTimeout(function() {
			var last = $('article').last().attr('data-count');
			getRows(last);
		}, 250);
	}

});
*/


/*
$(document).on("scrollstart", function (e) {
	  var active = $.mobile.activePage[0].id;
	  if (active == "page1") {
			$('#waiting_img').show();
			setTimeout(function() {
				var last = $('article').last().attr('data-count');
				getRows(last);
			}, 250);
	  } else {
		  
	  }
});


$(document).bind("scrollstart", function() {
    $(this).bind("touchmove", function() {
        if($(window).scrollTop() + $(window).height() == $(document).height()) {
        	var active = $.mobile.activePage[0].id;
      	  if (active == "page1") {
      			$('#waiting_img').show();
      			setTimeout(function() {
      				var last = $('article').last().attr('data-count');
      				getRows(last);
      			}, 250);
      	  }
        }
    });
}).bind("scrollend", function() {
    $(this).unbind("touchmove");
});
*/
