
function getView(argument, data) {
	switch (argument) {
		// ссылка в постах
		case 'post_link':
			return '<div class="post_share post_later fl_r"><span class="post_share_link fl_l" >Послушать позже</span><span class="post_later_plus fl_l" ></span></div>';
		// ссылка в отдельно открытом посте
		case 'post_link_separate':
			return '<a class="post_later reply_link" >Послушать позже<span class="post_later_plus" ></span></a>\
						<span class="divide">|</span>';
		
		// ссылка в правом меню и портативном плеере
		case 'load_links':
			return '<div class="listen_later_wrap audio_filter"><div id="listen_later" class="audio_filter" onmouseover="if (Audio.listOver) Audio.listOver(this)" onmouseout="if (Audio.listOut) Audio.listOut(this)" ><div class="label">Послушать позже</div></div></div>';
		
		// будет внутри ссылки на пост, удаляет ссылку
		case 'remove_link':
			return '<div class="audio_remove_wrap fl_r"><div class="audio_remove"></div></div>';
		
		// контейнер для всех ссылок на посты
		case 'main':
			return '<div id="initial_list_2"></div>';

		//ссылка на пост
		case 'later_element':
			var date = new Date(parseInt(data.date));
			var options = {
			  year: 'numeric', month: 'long',
			  day: 'numeric', hour: 'numeric',
			  minute: 'numeric', second: 'numeric'
			};
			var countText = '(и еще '+(data.count-1) + ')';
			if(data.count == 1) countText = '';

			var originalSpan = '<span class="user"><small>'+countText+'</small></span>',
			longSpan = '', long = '';
			if(data.artist.length+data.name.length > 54) {
				longSpan = originalSpan;
				originalSpan = '';
				long = 'long';
			};

			return '<div class="audios fl_l link_elem '+long+'" onmouseover="addClass(this, \'over\');" onmouseout="removeClass(this, \'over\');" onclick="return showWiki({w: \''+data.link+'\'}, false, event);" >\
						<div class="area clear_fix">\
							<div class="play_btn fl_l">\
							  <div class="play_btn_wrap"><div class="play_new"></div></div>\
							</div>\
							<div class="info fl_l">\
								<div class="title_wrap fl_l"><a><b>'+data.artist+'</b></a> – <span class="title">'+data.name+'</span>'+originalSpan+'</div>'+longSpan+'\
								\
								<div class="data_info"><b>добавлено: </b><span>'+date.toLocaleString("ru", options)+'</span></div>\
								<div class="actions">\
								</div>\
								<div class="duration fl_r">'+data.duration+'</div>\
							</div>\
						</div>\
					</div>'; //<span class="title"><a onclick="return cancelEvent(event);" class="lyrics_link"> ...</a> </span>

		case 'search_link':
		return "<a id=\"search_link\" href=''><span class=\"right_link fl_r\"  >поиск</span></a>"
	}
}

function tester(argument) {
	alert('tester');
}

